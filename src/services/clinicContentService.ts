

'use server';

import { adminDb as db } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { ContentItem, AddContentItemFormValues } from '@/types/clinic';
import { unstable_noStore as noStore } from 'next/cache';
import { sendContentNotificationForClinic } from './notificationService';

const convertTimestampToISO = (timestamp: any, itemIdForLog?: string, fieldNameForLog?: string): string | null => {
  try {
    if (timestamp === null || timestamp === undefined) return null;

    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toISOString();
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
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

    console.warn(`convertTimestampToISO (clinicContentService): Unhandled or invalid timestamp for item ${itemIdForLog || 'N/A'}, field ${fieldNameForLog || 'N/A'}. Received type: ${typeof timestamp}, value:`, JSON.stringify(timestamp));
    return null;
  } catch (e: any) {
    console.error(`convertTimestampToISO (clinicContentService): Error converting for item ${itemIdForLog || 'N/A'}, field ${fieldNameForLog || 'N/A'}. Value:`, JSON.stringify(timestamp), "Error:", e.message);
    return null;
  }
};

// Centralized function to handle sending notifications for new or updated content
async function _triggerContentNotification(clinicId: string, contentId: string, contentTitle: string) {
  try {
    const clinicDoc = await db.collection('managed_clinics').doc(clinicId).get();
    if (clinicDoc.exists) {
      const clinicData = clinicDoc.data();
      if (!clinicData?.pushNotificationsEnabled) {
          console.log(`[Notification Skip] Notifications are disabled for clinic: ${clinicId}.`);
          return;
      }
      const clinicName = clinicData.clientName || 'your clinic';
      
      await sendContentNotificationForClinic(clinicId, {
        clinicName: clinicName,
        contentTitle: contentTitle,
        contentId: contentId,
      });
    } else {
        console.log(`[Notification Skip] Clinic not found for clinic ID: ${clinicId}.`);
    }
  } catch (notificationError) {
    console.error(`[Content Service] Notification could not be sent for clinic ${clinicId}, content ${contentId}. This does NOT affect the content being saved. Error:`, notificationError);
  }
}

export async function getClinicContent(clinicId: string): Promise<ContentItem[]> {
  noStore();
  try {
    if (!clinicId) {
      console.warn("getClinicContent called with no clinicId");
      return [];
    }
    const contentItems: ContentItem[] = [];
    const contentCollectionRef = db.collection('clinics').doc(clinicId).collection('content');
    const q = contentCollectionRef.orderBy('createdAt', 'desc');
    const querySnapshot = await q.get();

    querySnapshot.forEach((docSnap) => {
      try {
        const data = docSnap.data();

        const createdAtISO = convertTimestampToISO(data.createdAt, docSnap.id, 'createdAt');
        const updatedAtISO = convertTimestampToISO(data.updatedAt, docSnap.id, 'updatedAt');
        const expiresAtISO = convertTimestampToISO(data.expiresAt, docSnap.id, 'expiresAt');

        contentItems.push({
          id: docSnap.id,
          type: data.type as 'offer' | 'ad' | 'tip' | 'partner_offer',
          title: data.title || '',
          description: data.description || '',
          department: data.department || null,
          imageUrls: data.imageUrls || [],
          imageHint: data.imageHint || null,
          videoUrl: data.videoUrl || null,
          fileUrl: data.fileUrl || null,
          fileName: data.fileName || null,
          ctaText: data.ctaText || null,
          ctaLink: data.ctaLink || null,
          isClaimable: data.isClaimable || false,
          likeCount: data.likeCount || 0,
          shareCount: data.shareCount || 0,
          icon: data.icon,
          createdAt: createdAtISO,
          updatedAt: updatedAtISO,
          expiresAt: expiresAtISO,
          campaignId: data.campaignId || null,
          isReferral: data.isReferral || false,
          referralDetails: data.referralDetails || undefined,
          isFeatured: data.isFeatured || false,
        });
      } catch (itemError) {
        console.error(`getClinicContent: Error processing content item ${docSnap.id} for clinic ${clinicId}. Skipping this item.`, itemError, "Raw data:", docSnap.data());
      }
    });
    return contentItems;
  } catch (error: any) {
    console.error(`[EMERGENCY_CATCH] getClinicContent: Critical error for clinicId ${clinicId} during overall fetch:`, error);
    throw new Error(`Failed to retrieve clinic content: ${error.message || 'Unknown server error'}`);
  }
}

export async function addClinicContentItem(clinicId: string, newItemData: AddContentItemFormValues): Promise<ContentItem> {
  if (!clinicId) {
    throw new Error("clinicId is required to add a content item.");
  }
  try {
    const contentCollectionRef = db.collection('clinics').doc(clinicId).collection('content');

    const docData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, likeCount: number, shareCount: number, expiresAt?: any } = {
      type: newItemData.type,
      title: newItemData.title,
      description: newItemData.description,
      department: newItemData.department || null,
      likeCount: 0,
      shareCount: 0,
      isClaimable: newItemData.isReferral ? true : (newItemData.isClaimable || false),
      isReferral: newItemData.isReferral || false,
      referralDetails: newItemData.isReferral ? newItemData.referralDetails : null,
      isFeatured: newItemData.isFeatured || false,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (newItemData.imageUrls) docData.imageUrls = newItemData.imageUrls;
    if (newItemData.imageHint) docData.imageHint = newItemData.imageHint;
    if (newItemData.videoUrl) docData.videoUrl = newItemData.videoUrl;
    if (newItemData.fileUrl) docData.fileUrl = newItemData.fileUrl;
    if (newItemData.fileName) docData.fileName = newItemData.fileName;
    if (newItemData.ctaText) docData.ctaText = newItemData.ctaText;
    if (newItemData.ctaLink) docData.ctaLink = newItemData.ctaLink;
    if (newItemData.expiresAt) docData.expiresAt = Timestamp.fromDate(new Date(newItemData.expiresAt));
    if (newItemData.campaignId) docData.campaignId = newItemData.campaignId;

    const docRef = await contentCollectionRef.add(docData);
    
    // Trigger notification using the centralized function
    await _triggerContentNotification(clinicId, docRef.id, newItemData.title);

    // Feature on Medicode Central if requested
    if (newItemData.isFeatured) {
        const clinicDoc = await db.collection('managed_clinics').doc(clinicId).get();
        const clinicName = clinicDoc.exists ? clinicDoc.data()!.clientName : 'A Clinic';
        const centralPostData = {
            ...docData,
            id: docRef.id,
            originalClinicId: clinicId,
            originalClinicName: clinicName,
            originalContentId: docRef.id,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };
        await db.collection('medicode_central_posts').doc(docRef.id).set(centralPostData);
    }


    const savedDoc = await docRef.get();
    const savedData = savedDoc.data()!;

    const savedItem: ContentItem = {
      id: docRef.id,
      ...newItemData,
      likeCount: 0,
      shareCount: 0,
      createdAt: savedData?.createdAt ? convertTimestampToISO(savedData.createdAt, docRef.id, 'createdAt') : new Date().toISOString(),
      updatedAt: null,
      expiresAt: savedData?.expiresAt ? convertTimestampToISO(savedData.expiresAt, docRef.id, 'expiresAt') : null,
    };
    return savedItem;

  } catch (e: any) {
    console.error(`clinicContentService.addClinicContentItem: Error adding content item to clinic ${clinicId}:`, e);
    throw e;
  }
}

export async function updateClinicContentItem(
  clinicId: string,
  itemId: string,
  updatedData: AddContentItemFormValues
): Promise<void> {
  if (!clinicId || !itemId) {
    throw new Error("clinicId and itemId are required to update a content item.");
  }
  const itemDocRef = db.collection('clinics').doc(clinicId).collection('content').doc(itemId);
  const centralPostDocRef = db.collection('medicode_central_posts').doc(itemId);

  try {
    const itemSnap = await itemDocRef.get();
    if (!itemSnap.exists) {
        throw new Error("Original content item not found to update.");
    }
    const existingData = itemSnap.data()!;
    const wasFeatured = existingData.isFeatured || false;

    const docDataToUpdate: Partial<Omit<ContentItem, 'id' | 'createdAt'>> & { updatedAt?: any, expiresAt?: any } = {
      type: updatedData.type,
      title: updatedData.title,
      description: updatedData.description,
      department: updatedData.department || null,
      isClaimable: updatedData.isReferral ? true : (updatedData.isClaimable || false),
      isReferral: updatedData.isReferral || false,
      referralDetails: updatedData.isReferral ? updatedData.referralDetails : null,
      isFeatured: updatedData.isFeatured || false,
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    // Retain like/share counts
    docDataToUpdate.likeCount = existingData.likeCount || 0;
    docDataToUpdate.shareCount = existingData.shareCount || 0;

    docDataToUpdate.imageUrls = updatedData.imageUrls !== undefined ? updatedData.imageUrls : null;
    docDataToUpdate.imageHint = updatedData.imageHint !== undefined ? updatedData.imageHint : null;
    docDataToUpdate.videoUrl = updatedData.videoUrl !== undefined ? updatedData.videoUrl : null;
    docDataToUpdate.fileUrl = updatedData.fileUrl !== undefined ? updatedData.fileUrl : null;
    docDataToUpdate.fileName = updatedData.fileName !== undefined ? updatedData.fileName : null;
    docDataToUpdate.ctaText = updatedData.ctaText !== undefined ? updatedData.ctaText : null;
    docDataToUpdate.ctaLink = updatedData.ctaLink !== undefined ? updatedData.ctaLink : null;
    docDataToUpdate.expiresAt = updatedData.expiresAt ? Timestamp.fromDate(new Date(updatedData.expiresAt)) : null;
    if (updatedData.campaignId) docDataToUpdate.campaignId = updatedData.campaignId;

    await itemDocRef.update(docDataToUpdate as any);

    // Handle Medicode Central sync
    const isNowFeatured = updatedData.isFeatured || false;

    if (isNowFeatured) {
        const clinicDoc = await db.collection('managed_clinics').doc(clinicId).get();
        const clinicName = clinicDoc.exists ? clinicDoc.data()!.clientName : 'A Clinic';

        const centralPostData = {
            ...existingData, // carry over old data
            ...docDataToUpdate, // overlay new data
            id: itemId,
            originalClinicId: clinicId,
            originalClinicName: clinicName,
            originalContentId: itemId,
            updatedAt: FieldValue.serverTimestamp(),
        };
        await centralPostDocRef.set(centralPostData, { merge: true });
    } else if (wasFeatured && !isNowFeatured) {
        await centralPostDocRef.delete();
    }
    
    // Trigger notification using the centralized function
    await _triggerContentNotification(clinicId, itemId, updatedData.title);

  } catch (e: any) {
    console.error(`updateClinicContentItem (Server Action): ERROR updating item ${itemId} in clinic ${clinicId}. Error:`, e.message, "Code:", e.code, "Stack:", e.stack, e);
    throw e;
  }
}

export async function deleteClinicContentItem(clinicId: string, itemId: string): Promise<void> {
  if (!clinicId || !itemId) {
    throw new Error("clinicId and itemId are required to delete a content item.");
  }
  try {
    const itemDocRef = db.collection('clinics').doc(clinicId).collection('content').doc(itemId);
    const itemSnap = await itemDocRef.get();

    // Delete the original item
    await itemDocRef.delete();
    
    // If it was featured, delete it from central too
    if (itemSnap.exists && itemSnap.data()?.isFeatured) {
        const centralPostDocRef = db.collection('medicode_central_posts').doc(itemId);
        await centralPostDocRef.delete();
    }

  } catch (e: any) {
    console.error(`clinicContentService.deleteClinicContentItem: Error deleting Firestore item ${itemId} from clinic ${clinicId}:`, e);
    throw e;
  }
}

export async function updateClinicContentItemLikeCount(clinicId: string, itemId: string, incrementValue: 1 | -1): Promise<number> {
  if (!clinicId || !itemId) {
    throw new Error("clinicId and itemId are required to update like count.");
  }

  const centralDocRef = db.collection('medicode_central_posts').doc(itemId);
  let newLikeCount = 0;

  // Handle admin-only posts, which don't have an original document in a clinic's subcollection.
  if (clinicId === 'admin') {
    try {
      await db.runTransaction(async (transaction) => {
        const centralSnap = await transaction.get(centralDocRef);
        if (!centralSnap.exists) {
          throw new Error("Central post item not found!");
        }
        const currentLikeCount = centralSnap.data()!.likeCount || 0;
        newLikeCount = Math.max(0, currentLikeCount + incrementValue);
        transaction.update(centralDocRef, { likeCount: newLikeCount });
      });
      return newLikeCount;
    } catch (e: any) {
      console.error(`clinicContentService.updateClinicContentItemLikeCount: Error updating like count for ADMIN post ${itemId}:`, e);
      throw e;
    }
  }
  
  // Handle regular clinic-originated posts
  const itemDocRef = db.collection('clinics').doc(clinicId).collection('content').doc(itemId);
  try {
    await db.runTransaction(async (transaction) => {
      // --- READS FIRST ---
      const itemSnap = await transaction.get(itemDocRef);
      const centralSnap = await transaction.get(centralDocRef);

      // --- WRITES SECOND ---
      if (!itemSnap.exists) {
        throw new Error("Content item not found!");
      }
      const currentLikeCount = itemSnap.data()!.likeCount || 0;
      newLikeCount = Math.max(0, currentLikeCount + incrementValue);
      
      transaction.update(itemDocRef, { likeCount: newLikeCount });

      if (centralSnap.exists) {
        transaction.update(centralDocRef, { likeCount: newLikeCount });
      }
    });
    return newLikeCount;
  } catch (e: any) {
    console.error(`clinicContentService.updateClinicContentItemLikeCount: Error updating like count for item ${itemId} in clinic ${clinicId}:`, e);
    throw e;
  }
}

export async function incrementContentItemShareCount(clinicId: string, itemId: string): Promise<number> {
  if (!clinicId || !itemId) {
    throw new Error("clinicId and itemId are required to update share count.");
  }
  const itemDocRef = db.collection('clinics').doc(clinicId).collection('content').doc(itemId);
  const centralDocRef = db.collection('medicode_central_posts').doc(itemId);

  let newShareCount = 0;
  try {
    await db.runTransaction(async (transaction) => {
      const itemSnap = await transaction.get(itemDocRef);
      if (!itemSnap.exists) {
        console.warn(`Content item ${itemId} not found for share count increment.`);
        newShareCount = 0;
        return;
      }
      const currentShareCount = itemSnap.data()!.shareCount || 0;
      newShareCount = currentShareCount + 1;
      transaction.update(itemDocRef, { shareCount: newShareCount });

      // Also update the central post if it exists
      const centralSnap = await transaction.get(centralDocRef);
      if (centralSnap.exists) {
        transaction.update(centralDocRef, { shareCount: newShareCount });
      }

    });
    return newShareCount;
  } catch (e: any) {
    console.error(`clinicContentService.incrementContentItemShareCount: Error updating share count for item ${itemId} in clinic ${clinicId}:`, e);
    return newShareCount > 0 ? newShareCount : (await itemDocRef.get()).data()?.shareCount || 0;
  }
}

    

    
