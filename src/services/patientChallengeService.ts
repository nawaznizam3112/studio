

'use server';

import { adminDb as db } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { PatientChallengeState, HealthChallenge, PatientInteraction, TreatmentTrackerState } from '@/types/clinic';
import { unstable_noStore as noStore } from 'next/cache';

const PATIENTS_COLLECTION = 'patients';
const INTERACTIONS_COLLECTION = 'interactions';

const toClientSafeState = (state: any): PatientChallengeState | null => {
    if (!state) return null;

    const startDateTimestamp = state.startDate;
    let startDateISO: string | null = null;

    if (startDateTimestamp instanceof Timestamp) {
        startDateISO = startDateTimestamp.toDate().toISOString();
    } else if (typeof startDateTimestamp === 'string') {
        // Attempt to parse the string to ensure it's a valid ISO date string
        try {
            const parsedDate = new Date(startDateTimestamp);
            if (!isNaN(parsedDate.getTime())) {
                 startDateISO = parsedDate.toISOString();
            }
        } catch(e) {
            // Ignore parse errors, will be caught by null check below
        }
    }

    if (!startDateISO) {
        // This can happen if a challenge document is malformed.
        // Instead of crashing, we should return null and log the issue.
        console.warn(`Patient challenge state is missing a valid startDate. State data:`, JSON.stringify(state));
        return null;
    }

    return {
        challengeId: state.challengeId,
        challengeTitle: state.challengeTitle,
        startDate: startDateISO,
        durationDays: state.durationDays,
        completedDays: state.completedDays,
        isCompleted: state.isCompleted,
        lastCheckinDate: state.lastCheckinDate || null,
    };
};


// This function retrieves the active challenge state for a specific patient.
export async function getPatientChallengeState(clinicId: string, patientId: string): Promise<PatientChallengeState | null> {
  noStore();
  if (!clinicId || !patientId) return null;

  try {
    const docRef = db.collection('clinics').doc(clinicId).collection(PATIENTS_COLLECTION).doc(patientId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      // Use the safe conversion function here. It will return null if the data is invalid.
      return toClientSafeState(data?.activeChallenge);
    }
    // If the document doesn't exist, it's not an error, it just means no challenge has been started.
    return null;
  } catch (error) {
    // Log the error but return null to prevent crashing the client.
    console.error(`Error getting patient challenge state for patient ${patientId}:`, error);
    return null;
  }
}

// This function starts a new challenge for a patient, overwriting any existing one.
export async function startPatientChallenge(clinicId: string, patientId: string, challenge: HealthChallenge): Promise<PatientChallengeState> {
  if (!clinicId || !patientId || !challenge) {
    throw new Error("Clinic ID, Patient ID, and challenge data are required.");
  }
  
  const newState: PatientChallengeState = {
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    startDate: new Date().toISOString(),
    durationDays: challenge.durationDays,
    completedDays: 0,
    isCompleted: false,
    lastCheckinDate: null,
  };

  const patientDocRef = db.collection('clinics').doc(clinicId).collection(PATIENTS_COLLECTION).doc(patientId);
  
  try {
    await db.runTransaction(async (transaction) => {
        transaction.set(patientDocRef, { activeChallenge: newState }, { merge: true });
        
        const interaction: Omit<PatientInteraction, 'timestamp'> & { timestamp: FieldValue } = {
            type: 'challenge',
            text: `Started challenge: "${challenge.title}"`,
            timestamp: FieldValue.serverTimestamp(),
        };
        const interactionRef = patientDocRef.collection(INTERACTIONS_COLLECTION).doc();
        transaction.set(interactionRef, interaction);
    });
    
    return newState;
  } catch (error: any) {
    console.error(`Error starting challenge for patient ${patientId}:`, error);
    throw new Error("Could not start the challenge.");
  }
}

// This function records a daily check-in for the patient's active challenge.
export async function updatePatientChallengeProgress(clinicId: string, patientId: string): Promise<PatientChallengeState> {
    if (!clinicId || !patientId) {
        throw new Error("Clinic ID and Patient ID are required.");
    }
    const patientDocRef = db.collection('clinics').doc(clinicId).collection(PATIENTS_COLLECTION).doc(patientId);

    // FIX: Read from DB before transaction to avoid non-transactional reads inside
    const patientDocForChallenge = await patientDocRef.get();
    if (!patientDocForChallenge.exists || !patientDocForChallenge.data()?.activeChallenge) {
        throw new Error("No active challenge found for this patient.");
    }
    const activeChallengeId = patientDocForChallenge.data()!.activeChallenge.challengeId;
    const challengeDocRef = db.collection('global_challenges').doc(activeChallengeId);
    const challengeDoc = await challengeDocRef.get();
    const starRewardOnCompletion = challengeDoc.exists ? (challengeDoc.data()!.starReward || 5) : 5;


    return await db.runTransaction(async (transaction) => {
        const patientDoc = await transaction.get(patientDocRef);
        // This check is now slightly redundant but safe
        if (!patientDoc.exists || !patientDoc.data()?.activeChallenge) {
            throw new Error("No active challenge found for this patient.");
        }

        const currentState: PatientChallengeState = patientDoc.data()!.activeChallenge;

        if (currentState.isCompleted) {
            throw new Error("This challenge is already completed.");
        }

        const today = new Date().toISOString().split('T')[0];
        if (currentState.lastCheckinDate === today) {
            throw new Error("You have already checked in for this challenge today.");
        }

        const newCompletedDays = (currentState.completedDays || 0) + 1;
        const isNowCompleted = newCompletedDays >= currentState.durationDays;
        
        // Use pre-fetched value
        const starsToAward = isNowCompleted ? starRewardOnCompletion : 1;
        
        const newState: PatientChallengeState = {
            ...currentState,
            completedDays: newCompletedDays,
            lastCheckinDate: today,
            isCompleted: isNowCompleted,
        };
        
        transaction.set(patientDocRef, { activeChallenge: newState }, { merge: true });

        // Log the interaction
        const interactionText = isNowCompleted 
            ? `Completed challenge: "${newState.challengeTitle}"`
            : `Completed day ${newCompletedDays} of challenge: "${newState.challengeTitle}"`;

        const interaction: Omit<PatientInteraction, 'timestamp'> & { timestamp: FieldValue } = {
            type: 'challenge',
            text: interactionText,
            timestamp: FieldValue.serverTimestamp(),
        };
        const interactionRef = patientDocRef.collection(INTERACTIONS_COLLECTION).doc();
        transaction.set(interactionRef, interaction);

        // The toClientSafeState conversion is crucial here before returning to the client.
        const clientSafeState = toClientSafeState(newState);
        if (!clientSafeState) {
            throw new Error("Failed to process challenge state after update.");
        }
        return clientSafeState;
    });
}

// This function clears the active challenge, allowing a new one to be started.
export async function resetPatientChallenge(clinicId: string, patientId: string): Promise<void> {
  if (!clinicId || !patientId) {
    throw new Error("Clinic ID and Patient ID are required.");
  }
  
  const patientDocRef = db.collection('clinics').doc(clinicId).collection(PATIENTS_COLLECTION).doc(patientId);
  try {
    const doc = await patientDocRef.get();
    if (doc.exists) {
      await patientDocRef.update({ activeChallenge: FieldValue.delete() });
    }
  } catch (error: any) {
    console.error(`Error resetting challenge for patient ${patientId}:`, error);
    throw new Error("Could not reset the challenge.");
  }
}

const convertInteractionTimestamp = (timestamp: any): string | null => {
  try {
    if (timestamp === null || timestamp === undefined) return null;
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (typeof timestamp === 'object' && timestamp !== null && typeof timestamp.toDate === 'function') {
        const date = timestamp.toDate();
        if (date instanceof Date && !isNaN(date.valueOf())) {
            return date.toISOString();
        }
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        const d = new Date(timestamp);
        if (!isNaN(d.valueOf())) return d.toISOString();
    }
    console.warn(`patientChallengeService: Could not convert timestamp. Type: ${typeof timestamp}, Value:`, JSON.stringify(timestamp));
    return null;
  } catch (e) {
    console.error("Error converting interaction timestamp", e)
    return null;
  }
}

export async function getPatientInteractionHistory(clinicId: string, patientId: string): Promise<PatientInteraction[]> {
  noStore();
  if (!clinicId || !patientId) return [];

  try {
    const interactions: PatientInteraction[] = [];
    const q = db.collection('clinics').doc(clinicId).collection(PATIENTS_COLLECTION).doc(patientId).collection(INTERACTIONS_COLLECTION).orderBy('timestamp', 'desc').limit(20);
    const querySnapshot = await q.get();
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      interactions.push({
        type: data.type,
        text: data.text,
        timestamp: convertInteractionTimestamp(data.timestamp),
      });
    });
    return interactions;
  } catch(e) {
    console.error(`Error getting interaction history for patient ${patientId}`, e);
    return [];
  }
}

export async function getTreatmentTrackerState(clinicId: string, patientId: string): Promise<TreatmentTrackerState | null> {
  noStore();
  if (!clinicId || !patientId) return null;

  try {
    const docRef = db.collection('clinics').doc(clinicId).collection(PATIENTS_COLLECTION).doc(patientId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      const trackerState = data?.treatmentTracker;
      if (trackerState) {
          return {
              activePlanKey: trackerState.activePlanKey || null,
              completedSteps: trackerState.completedSteps || [],
              starsEarned: trackerState.starsEarned || 0,
              nextAppointmentDate: trackerState.nextAppointmentDate || null,
              shareCount: trackerState.shareCount || 0,
              rewardClaims: trackerState.rewardClaims || 0,
          };
      }
    }
    return null;
  } catch (error) {
    console.error(`Error getting treatment tracker state for patient ${patientId}:`, error);
    return null;
  }
}

export async function updateTreatmentTrackerState(clinicId: string, patientId: string, newState: Partial<TreatmentTrackerState>): Promise<void> {
  if (!clinicId || !patientId) {
    throw new Error("Clinic ID and Patient ID are required.");
  }
  const patientDocRef = db.collection('clinics').doc(clinicId).collection(PATIENTS_COLLECTION).doc(patientId);

  try {
    await db.runTransaction(async (transaction) => {
        const patientDoc = await transaction.get(patientDocRef);
        const existingData = patientDoc.data();
        const existingTrackerState = existingData?.treatmentTracker || {};

        const updatedTrackerState = {
            ...existingTrackerState,
            ...newState
        };
        
        transaction.set(patientDocRef, {
            treatmentTracker: updatedTrackerState
        }, { merge: true });
    });
  } catch (error: any) {
    console.error(`Error updating treatment tracker state for patient ${patientId}:`, error);
    throw new Error("Could not update the treatment tracker.");
  }
}


    
