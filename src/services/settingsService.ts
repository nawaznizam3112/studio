

'use server';

import { adminDb as db } from '@/lib/firebase-admin';

const SETTINGS_COLLECTION = 'platform_settings';
const PAYOUT_SETTINGS_DOC = 'payouts';

/**
 * Retrieves the payout rate per scan from Firestore.
 * Defaults to 0.50 if not set.
 */
export async function getPayoutRate(): Promise<number> {
    try {
        const docRef = db.collection(SETTINGS_COLLECTION).doc(PAYOUT_SETTINGS_DOC);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            // Ensure the rate is a number and not negative
            return data && typeof data.ratePerScan === 'number' && data.ratePerScan >= 0 
                ? data.ratePerScan 
                : 0.50;
        }
        // If the document doesn't exist, return the default rate
        return 0.50;
    } catch (error) {
        console.error("Error fetching payout rate:", error);
        // Fallback to default in case of an error
        return 0.50;
    }
}

/**
 * Sets the payout rate per scan in Firestore.
 */
export async function setPayoutRate(rate: number): Promise<void> {
    if (typeof rate !== 'number' || rate < 0) {
        throw new Error("Payout rate must be a non-negative number.");
    }

    try {
        const docRef = db.collection(SETTINGS_COLLECTION).doc(PAYOUT_SETTINGS_DOC);
        await docRef.set({
            ratePerScan: rate,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error: any) {
        console.error("Error setting payout rate:", error);
        throw new Error(`Failed to set payout rate: ${error.message}`);
    }
}
