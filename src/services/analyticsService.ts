

'use server';

import { adminDb as db } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { ClinicAnalyticsData, HealthToolId, AddReviewData, TreatmentTrackerState, Review, RegionalAnalytics } from '@/types/clinic';
import { unstable_noStore as noStore } from 'next/cache';

const ANALYTICS_COLLECTION = 'clinic_analytics';
const MANAGED_CLINICS_COLLECTION = 'managed_clinics';
const CLINICS_COLLECTION = 'clinics';
const LEADS_COLLECTION = 'leads';


const convertTimestampToISO = (timestamp: any, docIdForLog?: string, fieldNameForLog?: string): string | null => {
  try {
    if (!timestamp) return null; // FIX: Handle null or undefined timestamps gracefully.

    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (typeof timestamp === 'object' && timestamp !== null && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      if (date instanceof Date && !isNaN(date.valueOf())) {
        return date.toISOString();
      }
    }
    if (typeof timestamp === 'string') {
      const parsedDate = new Date(timestamp);
      if (!isNaN(parsedDate.valueOf())) {
        return parsedDate.toISOString();
      }
    }
    if (typeof timestamp === 'number') {
      const dateFromNumber = new Date(timestamp);
      if (!isNaN(dateFromNumber.valueOf())) {
        return dateFromNumber.toISOString();
      }
    }
    if (timestamp instanceof Date && !isNaN(timestamp.valueOf())) {
      return timestamp.toISOString();
    }
    console.warn(`convertTimestampToISO (analyticsService): Unhandled or invalid timestamp format for doc ${docIdForLog || 'N/A'}, field ${fieldNameForLog || 'N/A'}. Received type ${typeof timestamp}, value:`, JSON.stringify(timestamp));
    return null;
  } catch (e: any) {
    console.error(`convertTimestampToISO (analyticsService): Error converting for doc ${docIdForLog || 'N/A'}, field ${fieldNameForLog || 'N/A'}. Value:`, JSON.stringify(timestamp), "Error:", e.message);
    return null;
  }
};

export async function incrementClinicScanCount(clinicId: string): Promise<void> {
  console.log(`[INFO] incrementClinicScanCount: Service action called for clinicId: "${clinicId}"`);

  if (!clinicId || typeof clinicId !== 'string' || clinicId.trim() === "") {
    const errorMsg = "Clinic ID is required and must be a non-empty string to increment scan count.";
    console.error(`[VALIDATION_ERROR] incrementClinicScanCount: ${errorMsg} Received: "${clinicId}"`);
    throw new Error(errorMsg);
  }

  const analyticsDocRef = db.collection(ANALYTICS_COLLECTION).doc(clinicId);
  const scanEventRef = analyticsDocRef.collection('scan_events').doc(); // Create a new document for the scan event

  try {
    await db.runTransaction(async (transaction) => {
      console.log(`[INFO] incrementClinicScanCount: Transaction started for clinicId: "${clinicId}"`);
      const analyticsDoc = await transaction.get(analyticsDocRef);

      // Log the individual scan event with a timestamp
      transaction.set(scanEventRef, { timestamp: FieldValue.serverTimestamp() });
      console.log(`[INFO] incrementClinicScanCount: Queued new scan_event for clinic "${clinicId}".`);

      if (!analyticsDoc.exists) {
        console.log(`[INFO] incrementClinicScanCount: Analytics document for "${clinicId}" does not exist. Creating new one.`);
        const now = new Date();
        transaction.set(analyticsDocRef, {
          clinicId: clinicId,
          scanCount: 1,
          firstScanAt: now,
          lastScanAt: now,
          healthToolUsageCounts: {},
          shareCounts: {},
          averageRating: 0,
          reviewCount: 0,
          subscriberCount: 0,
          lastContentNotificationSentAt: null,
        });
        console.log(`[SUCCESS] incrementClinicScanCount: Successfully queued SET for new analytics for "${clinicId}"`);
      } else {
        const dataToUpdate: any = { 
            scanCount: FieldValue.increment(1),
            lastScanAt: FieldValue.serverTimestamp(),
        };

        if (typeof analyticsDoc.data()!.firstScanAt === 'undefined') {
            dataToUpdate.firstScanAt = FieldValue.serverTimestamp();
            console.log(`[INFO] incrementClinicScanCount: Existing document for "${clinicId}" was missing firstScanAt. Setting it now.`);
        }
        
        transaction.update(analyticsDocRef, dataToUpdate);
        console.log(`[SUCCESS] incrementClinicScanCount: Successfully queued UPDATE for "${clinicId}" scanCount.`);
      }
    });
    console.log(`[SUCCESS] incrementClinicScanCount: Transaction committed successfully for clinicId: "${clinicId}"`);
  } catch (e: any) {
    const errorCode = (e as any).code || "UNKNOWN_FIRESTORE_CODE";
    const errorMessage = e.message || 'Transaction failed or an unknown error occurred.';
    console.error(`[CRITICAL_ERROR] analyticsService.incrementClinicScanCount: Transaction error for clinicId: "${clinicId}". Firestore Error Code: "${errorCode}". Message: "${errorMessage}". Full Error Details:`, e);
    throw e;
  }
}

export async function incrementHealthToolUsageCount(clinicId: string, toolId: HealthToolId): Promise<void> {
  console.log(`[INFO] incrementHealthToolUsageCount: Service action called for clinicId: "${clinicId}", toolId: "${toolId}"`);

  if (!clinicId || typeof clinicId !== 'string' || clinicId.trim() === "") {
    const errorMsg = "Clinic ID is required and must be a non-empty string.";
    console.error(`[VALIDATION_ERROR] incrementHealthToolUsageCount: ${errorMsg} Received clinicId: "${clinicId}"`);
    throw new Error(errorMsg);
  }
  if (!toolId || typeof toolId !== 'string' || toolId.trim() === "") {
    const errorMsg = "Tool ID is required and must be a non-empty string.";
    console.error(`[VALIDATION_ERROR] incrementHealthToolUsageCount: ${errorMsg} Received toolId: "${toolId}"`);
    throw new Error(errorMsg);
  }

  const analyticsDocRef = db.collection(ANALYTICS_COLLECTION).doc(clinicId);

  try {
    await db.runTransaction(async (transaction) => {
      const analyticsDoc = await transaction.get(analyticsDocRef);

      if (!analyticsDoc.exists) {
        console.warn(`[WARN] incrementHealthToolUsageCount: Analytics document for clinic "${clinicId}" does not exist. Creating it now.`);
         transaction.set(analyticsDocRef, {
          clinicId: clinicId,
          scanCount: 0,
          firstScanAt: FieldValue.serverTimestamp(),
          lastScanAt: FieldValue.serverTimestamp(), 
          healthToolUsageCounts: { [toolId]: 1 },
          shareCounts: {},
          averageRating: 0,
          reviewCount: 0,
          subscriberCount: 0,
          lastContentNotificationSentAt: null,
        });
        console.log(`[INFO] incrementHealthToolUsageCount: Created analytics doc for "${clinicId}" and set initial count for tool "${toolId}".`);
        return;
      }

      const currentData = analyticsDoc.data()!;
      const healthToolCounts = currentData.healthToolUsageCounts || {};
      const currentToolCount = healthToolCounts[toolId] || 0;
      const newToolCount = currentToolCount + 1;

      healthToolCounts[toolId] = newToolCount;

      transaction.update(analyticsDocRef, {
        healthToolUsageCounts: healthToolCounts,
        lastScanAt: FieldValue.serverTimestamp(),
      });
      console.log(`[SUCCESS] incrementHealthToolUsageCount: Updated tool "${toolId}" count to ${newToolCount} for clinic "${clinicId}".`);
    });
  } catch (e: any) {
    const errorCode = (e as any).code || "UNKNOWN_FIRESTORE_CODE";
    const errorMessage = e.message || 'Transaction failed or an unknown error occurred.';
    console.error(`[CRITICAL_ERROR] analyticsService.incrementHealthToolUsageCount: Transaction error for clinicId: "${clinicId}", toolId: "${toolId}". Firestore Error Code: "${errorCode}". Message: "${errorMessage}". Full Error Details:`, e);
    console.warn(`Tool usage logging failed for clinic ${clinicId}, tool ${toolId}. Error: ${errorMessage}`);
  }
}


export async function getClinicScanAnalytics(clinicId: string): Promise<ClinicAnalyticsData> {
  try {
    if (!clinicId) {
      console.warn("getClinicScanAnalytics called with no clinicId");
      throw new Error("Clinic ID is required to get scan analytics.");
    }
    const analyticsDocRef = db.collection(ANALYTICS_COLLECTION).doc(clinicId);
    const docSnap = await analyticsDocRef.get();

    const defaultAnalytics: ClinicAnalyticsData = {
      clinicId: clinicId,
      scanCount: 0,
      firstScanAt: null,
      lastScanAt: null,
      clinicName: "N/A", 
      healthToolUsageCounts: {},
      shareCounts: {},
      averageRating: 0,
      reviewCount: 0,
      subscriberCount: 0,
      lastContentNotificationSentAt: null,
    };
    
    let clinicName: string | undefined;

    if (docSnap.exists) {
        clinicName = docSnap.data()?.clinicName;
    }

    if (!clinicName) {
        try {
            const managedClinicDocRef = db.collection('managed_clinics').doc(clinicId);
            const managedClinicSnap = await managedClinicDocRef.get();
            if (managedClinicSnap.exists) {
                clinicName = managedClinicSnap.data()!.clientName || "N/A (Registered)";
            } else {
                clinicName = "N/A (Not Registered)";
            }
        } catch (nameError) {
            console.warn(`Could not fetch clientName for ${clinicId} from managed_clinics`, nameError);
            clinicName = "N/A (Error Fetching Name)";
        }
    }


    if (docSnap.exists) {
      const data = docSnap.data()!;
      return {
        clinicId: data.clinicId || clinicId,
        clinicName: clinicName,
        scanCount: typeof data.scanCount === 'number' ? data.scanCount : 0,
        firstScanAt: convertTimestampToISO(data.firstScanAt, clinicId, 'firstScanAt'),
        lastScanAt: convertTimestampToISO(data.lastScanAt, clinicId, 'lastScanAt'),
        healthToolUsageCounts: data.healthToolUsageCounts || {},
        shareCounts: data.shareCounts || {},
        averageRating: data.averageRating || 0,
        reviewCount: data.reviewCount || 0,
        subscriberCount: data.subscriberCount || 0,
        lastContentNotificationSentAt: convertTimestampToISO(data.lastContentNotificationSentAt, clinicId, 'lastContentNotificationSentAt'),
      };
    } else {
      defaultAnalytics.clinicName = clinicName;
      return defaultAnalytics;
    }
  } catch (error: any) {
    console.error(`getClinicScanAnalytics: Critical error for clinic ${clinicId}:`, error);
    throw new Error(`Failed to get clinic scan analytics for ${clinicId}: ${error.message || 'Unknown server error'}`);
  }
}

export async function addClinicReview(data: AddReviewData): Promise<{ newAverageRating: number; newReviewCount: number }> {
  if (!data.clinicId || !data.rating || data.rating < 1 || data.rating > 5) {
    throw new Error("Valid Clinic ID and a rating between 1 and 5 are required.");
  }

  const analyticsDocRef = db.collection(ANALYTICS_COLLECTION).doc(data.clinicId);
  const reviewCollectionRef = db.collection('clinics').doc(data.clinicId).collection('reviews');
  const newReviewRef = reviewCollectionRef.doc();

  try {
    const result = await db.runTransaction(async (transaction) => {
      const analyticsDoc = await transaction.get(analyticsDocRef);
      
      let currentAvgRating = 0;
      let currentReviewCount = 0;

      if (analyticsDoc.exists) {
        const docData = analyticsDoc.data()!;
        currentAvgRating = docData.averageRating || 0;
        currentReviewCount = docData.reviewCount || 0;
      }

      const newReviewCount = currentReviewCount + 1;
      const newAverageRating = ((currentAvgRating * currentReviewCount) + data.rating) / newReviewCount;

      const newReviewData: any = {
        rating: data.rating,
        createdAt: FieldValue.serverTimestamp(),
        patientId: data.patientId,
      };
      if (data.text && data.text.trim()) {
        newReviewData.text = data.text.trim();
      }
      
      transaction.set(newReviewRef, newReviewData);
      
      const analyticsUpdateData = {
        averageRating: newAverageRating,
        reviewCount: newReviewCount,
      };

      if (analyticsDoc.exists) {
        transaction.update(analyticsDocRef, analyticsUpdateData);
      } else {
        transaction.set(analyticsDocRef, {
          clinicId: data.clinicId,
          scanCount: 1,
          firstScanAt: FieldValue.serverTimestamp(),
          lastScanAt: FieldValue.serverTimestamp(),
          healthToolUsageCounts: {},
          shareCounts: {},
          averageRating: 0,
          reviewCount: 0,
          subscriberCount: 0,
          lastContentNotificationSentAt: null,
          ...analyticsUpdateData
        });
      }

      return { newAverageRating, newReviewCount };
    });
    
    return result;
  } catch (e: any) {
    console.error(`addClinicReview: Transaction failed for clinic ${data.clinicId}. Error:`, e);
    throw new Error(`Failed to submit review: ${e.message || 'Unknown server error'}`);
  }
}

export async function getClinicReviews(clinicId: string): Promise<Review[]> {
  noStore();
  if (!clinicId) return [];

  try {
    const reviews: Review[] = [];
    const reviewsCollectionRef = db.collection('clinics').doc(clinicId).collection('reviews');
    const q = reviewsCollectionRef.orderBy('createdAt', 'desc').limit(10); // Get latest 10
    const querySnapshot = await q.get();

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reviews.push({
        id: docSnap.id,
        rating: data.rating,
        text: data.text || undefined,
        createdAt: convertTimestampToISO(data.createdAt, docSnap.id, 'createdAt'),
        patientId: data.patientId || undefined,
      });
    });
    return reviews;
  } catch (e: any) {
    console.error(`getClinicReviews: Error fetching reviews for clinic ${clinicId}:`, e);
    // Don't throw, just return empty array on failure.
    return [];
  }
}

export async function incrementShareClickCount(clinicId: string, shareId: string): Promise<void> {
  if (!clinicId || !shareId) {
    console.warn("incrementShareClickCount: Missing clinicId or shareId.");
    return;
  }
  const analyticsDocRef = db.collection(ANALYTICS_COLLECTION).doc(clinicId);
  try {
    await db.runTransaction(async (transaction) => {
      const analyticsDoc = await transaction.get(analyticsDocRef);
      if (!analyticsDoc.exists) {
        console.warn(`incrementShareClickCount: Analytics doc for ${clinicId} doesn't exist. Cannot increment share count for ${shareId}.`);
        return;
      }
      const currentData = analyticsDoc.data()!;
      const shareCounts = currentData.shareCounts || {};
      const currentShareCount = shareCounts[shareId] || 0;
      shareCounts[shareId] = currentShareCount + 1;
      
      transaction.update(analyticsDocRef, { shareCounts });
    });
  } catch (e: any) {
    console.error(`incrementShareClickCount: Transaction failed for clinic ${clinicId}, shareId ${shareId}. Error:`, e.message);
    // Don't throw error to client, just log it.
  }
}

export async function getShareStats(clinicId: string, shareId: string): Promise<{ clickCount: number }> {
    if (!clinicId || !shareId) {
        return { clickCount: 0 };
    }
    try {
        const analyticsDocRef = db.collection(ANALYTICS_COLLECTION).doc(clinicId);
        const docSnap = await analyticsDocRef.get();
        if (docSnap.exists) {
            const data = docSnap.data()!;
            const clickCount = data.shareCounts?.[shareId] || 0;
            return { clickCount };
        }
        return { clickCount: 0 };
    } catch (error) {
        console.error(`getShareStats: Failed to get stats for clinic ${clinicId}, shareId ${shareId}:`, error);
        return { clickCount: 0 };
    }
}


export async function incrementPatientShareCount(clinicId: string, patientId: string): Promise<void> {
  if (!clinicId || !patientId) return;
  const patientDocRef = db.collection('clinics').doc(clinicId).collection('patients').doc(patientId);

  try {
    await db.runTransaction(async (transaction) => {
      const patientDoc = await transaction.get(patientDocRef);
      
      // Define a default/base state for the tracker
      const tracker: TreatmentTrackerState = {
        activePlanKey: null,
        completedSteps: [],
        starsEarned: 0,
        nextAppointmentDate: null,
        shareCount: 0,
        rewardClaims: 0,
      };

      // If the document exists, merge its tracker data over the default
      if (patientDoc.exists) {
        Object.assign(tracker, patientDoc.data()!.treatmentTracker);
      }
      
      // Now, increment the share count on the complete object
      tracker.shareCount = (tracker.shareCount || 0) + 1;

      // Set the entire, updated tracker object back
      transaction.set(patientDocRef, { 
        treatmentTracker: tracker
      }, { merge: true });
    });
  } catch (error) {
    console.error(`Error incrementing share count for patient ${patientId} in clinic ${clinicId}:`, error);
  }
}

export async function incrementPatientRewardClaimCount(clinicId: string, patientId: string): Promise<void> {
    if (!clinicId || !patientId) return;
    const patientDocRef = db.collection('clinics').doc(clinicId).collection('patients').doc(patientId);
  
    try {
      await db.runTransaction(async (transaction) => {
        const patientDoc = await transaction.get(patientDocRef);
        
        // Define a default/base state for the tracker
        const tracker: TreatmentTrackerState = {
          activePlanKey: null,
          completedSteps: [],
          starsEarned: 0,
          nextAppointmentDate: null,
          shareCount: 0,
          rewardClaims: 0,
        };
  
        // If the document exists, merge its tracker data over the default
        if (patientDoc.exists) {
            Object.assign(tracker, patientDoc.data()!.treatmentTracker);
        }
        
        // Now, increment the reward claim count on the complete object
        tracker.rewardClaims = (tracker.rewardClaims || 0) + 1;
        
        // Set the entire, updated tracker object back
        transaction.set(patientDocRef, { 
          treatmentTracker: tracker
        }, { merge: true });
      });
    } catch (error) {
      console.error(`Error incrementing reward claim count for patient ${patientId} in clinic ${clinicId}:`, error);
    }
  }

export async function getRegionAnalytics(regions: string[]): Promise<{ totalClinics: number, projectedReach: number, engagementScore: number }> {
    noStore();
    if (!regions || regions.length === 0) {
        return { totalClinics: 0, projectedReach: 0, engagementScore: 0 };
    }
    
    const lowerCaseRegions = regions.map(r => r.toLowerCase());

    try {
        const clinicsRef = db.collection('managed_clinics');
        const q = clinicsRef.where('locationCity', 'in', lowerCaseRegions);
        const querySnapshot = await q.get();
        
        const totalClinics = querySnapshot.size;

        if (totalClinics === 0) {
            return { totalClinics: 0, projectedReach: 0, engagementScore: 0 };
        }
        
        const clinicIds = querySnapshot.docs.map(doc => doc.id);
        
        const analyticsPromises = clinicIds.map(id => db.collection(ANALYTICS_COLLECTION).doc(id).get());
        const leadsPromises = clinicIds.map(id => db.collection(CLINICS_COLLECTION).doc(id).collection(LEADS_COLLECTION).count().get());
        
        const [analyticsSnapshots, leadsSnapshots] = await Promise.all([
            Promise.all(analyticsPromises),
            Promise.all(leadsPromises),
        ]);

        let totalScans = 0;
        let totalToolInteractions = 0;
        
        for (const snap of analyticsSnapshots) {
            if (snap.exists) {
                const data = snap.data() as ClinicAnalyticsData;
                totalScans += data.scanCount || 0;
                totalToolInteractions += Object.values(data.healthToolUsageCounts || {}).reduce((sum, count) => sum + count, 0);
            }
        }
        
        const totalLeads = leadsSnapshots.reduce((sum, snap) => sum + snap.data().count, 0);

        const BASELINE_INTERACTIONS_PER_CLINIC = 500;
        const projectedReach = totalClinics * BASELINE_INTERACTIONS_PER_CLINIC;
        
        const scanWeight = 0.5;
        const interactionWeight = 1.0;
        const leadWeight = 2.5;
        const score = (totalScans * scanWeight) + (totalToolInteractions * interactionWeight) + (totalLeads * leadWeight);
        
        return { totalClinics, projectedReach, engagementScore: Math.round(score) };

    } catch (error) {
        console.error("Error fetching region analytics:", error);
        throw new Error("Could not retrieve regional analytics data.");
    }
}


export async function getRegionalAnalytics(): Promise<RegionalAnalytics[]> {
    noStore();
    try {
        const clinicsSnapshot = await db.collection(MANAGED_CLINICS_COLLECTION).where('status', '==', 'active').get();
        const clinics = clinicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string, locationCity?: string }));

        const clinicIds = clinics.map(c => c.id);
        if (clinicIds.length === 0) return [];

        const analyticsSnapshot = await db.collection(ANALYTICS_COLLECTION).where('clinicId', 'in', clinicIds).get();
        const analyticsDataMap = new Map<string, ClinicAnalyticsData>(analyticsSnapshot.docs.map(doc => [doc.id, doc.data() as ClinicAnalyticsData]));
        
        const leadsPromises = clinics.map(clinic => db.collection(CLINICS_COLLECTION).doc(clinic.id).collection(LEADS_COLLECTION).count().get());
        const leadsSnapshots = await Promise.all(leadsPromises);
        const leadsCountMap = new Map<string, number>(leadsSnapshots.map((snap, index) => [clinicIds[index], snap.data().count]));
        
        const regionalData: { [city: string]: RegionalAnalytics } = {};

        for (const clinic of clinics) {
            const city = clinic.locationCity?.trim() || 'Uncategorized';
            if (!regionalData[city]) {
                regionalData[city] = { city, activeClinics: 0, totalScans: 0, toolInteractions: 0, leadsGenerated: 0, engagementScore: 0 };
            }
            regionalData[city].activeClinics++;

            const analytics = analyticsDataMap.get(clinic.id);
            if (analytics) {
                regionalData[city].totalScans += analytics.scanCount || 0;
                regionalData[city].toolInteractions += Object.values(analytics.healthToolUsageCounts || {}).reduce((sum, count) => sum + count, 0);
            }
            
            regionalData[city].leadsGenerated += leadsCountMap.get(clinic.id) || 0;
        }
        
        // Calculate Engagement Score and convert to array
        const result = Object.values(regionalData).map(region => {
            // Weights can be adjusted based on business priorities
            const scanWeight = 0.5;
            const interactionWeight = 1.0;
            const leadWeight = 2.5;

            const score = (region.totalScans * scanWeight) + (region.toolInteractions * interactionWeight) + (region.leadsGenerated * leadWeight);
            return { ...region, engagementScore: Math.round(score) };
        });
        
        // Sort by engagement score descending
        result.sort((a, b) => b.engagementScore - a.engagementScore);

        return result;

    } catch (error: any) {
        if ((error as any).code === 'FAILED_PRECONDITION') {
            console.error("CRITICAL: Firestore index missing for getRegionalAnalytics. A composite index on 'clinic_analytics' collection with fields 'clinicId' and any other field may be required.");
        }
        console.error("Error calculating regional analytics:", error);
        throw new Error("Failed to process regional analytics data.");
    }
}
    
