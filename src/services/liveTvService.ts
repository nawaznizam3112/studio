
'use server';

import { adminDb as db } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { LiveTvChannel, AddLiveTvChannelData, LiveTvVideo } from '@/types/clinic';
import { unstable_noStore as noStore } from 'next/cache';

const CHANNELS_COLLECTION = 'live_tv_channels';

const convertTimestampToISO = (timestamp: any): string | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return new Date(timestamp).toISOString();
};

export async function getChannels(): Promise<LiveTvChannel[]> {
  noStore();
  try {
    const channels: LiveTvChannel[] = [];
    const q = db.collection(CHANNELS_COLLECTION).orderBy('createdAt', 'desc');
    const querySnapshot = await q.get();

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      channels.push({
        id: docSnap.id,
        name: data.name || 'Unnamed Channel',
        playlist: data.playlist || [],
        createdAt: convertTimestampToISO(data.createdAt),
      });
    });
    return channels;
  } catch (error: any) {
    console.error("Error fetching Live TV channels:", error);
    throw new Error(`Failed to retrieve channels: ${error.message}`);
  }
}

export async function getChannel(id: string): Promise<LiveTvChannel | null> {
    noStore();
    if (!id) return null;
    try {
        const docSnap = await db.collection(CHANNELS_COLLECTION).doc(id).get();
        if (!docSnap.exists) {
            return null;
        }
        const data = docSnap.data()!;
        return {
            id: docSnap.id,
            name: data.name || 'Unnamed Channel',
            playlist: data.playlist || [],
            createdAt: convertTimestampToISO(data.createdAt),
        };
    } catch (error: any) {
        console.error(`Error fetching channel ${id}:`, error);
        throw new Error(`Failed to retrieve channel: ${error.message}`);
    }
}

const prepareVideoData = (video: LiveTvVideo): Omit<LiveTvVideo, 'id'> => {
    const { id, ...rest } = video;
    return {
        ...rest,
        durationSeconds: video.durationSeconds && video.durationSeconds > 0 ? video.durationSeconds : 180, // Default to 3 minutes
    };
};

export async function addChannel(data: AddLiveTvChannelData, channelId?: string): Promise<string> {
  if (!data.name || !data.name.trim()) {
    throw new Error('Channel Name is required.');
  }

  try {
    const channelsCollection = db.collection(CHANNELS_COLLECTION);
    const dataToSet = {
        name: data.name,
        playlist: data.playlist.map(prepareVideoData) || [],
        createdAt: FieldValue.serverTimestamp(),
    };

    if (channelId) {
        const docRef = channelsCollection.doc(channelId);
        await docRef.set(dataToSet);
        return channelId;
    } else {
        const docRef = await channelsCollection.add(dataToSet);
        return docRef.id;
    }
  } catch (error: any) {
    console.error("Error adding channel:", error);
    throw new Error(`Failed to add channel: ${error.message}`);
  }
}

export async function updateChannel(channelId: string, data: Partial<AddLiveTvChannelData>): Promise<void> {
  if (!channelId) {
    throw new Error('Channel ID is required to update.');
  }
  try {
    const docRef = db.collection(CHANNELS_COLLECTION).doc(channelId);
    
    // Create a new object for update to avoid directly mutating the input 'data'
    const updateData: Partial<AddLiveTvChannelData> = {};
    if (data.name) {
      updateData.name = data.name;
    }
    // Correctly strip the temporary client-side ID and set default duration before updating
    if (data.playlist) {
      updateData.playlist = data.playlist.map(prepareVideoData);
    }
    
    await docRef.update(updateData);
  } catch (error: any) {
    console.error(`Error updating channel ${channelId}:`, error);
    throw new Error(`Failed to update channel: ${error.message}`);
  }
}

export async function deleteChannel(channelId: string): Promise<void> {
  if (!channelId) {
    throw new Error('Channel ID is required to delete.');
  }
  try {
    const docRef = db.collection(CHANNELS_COLLECTION).doc(channelId);
    await docRef.delete();
    
    // Also find all clinics that use this channel and remove it from their array.
    const clinicsRef = db.collection('managed_clinics');
    const clinicsToUpdateSnapshot = await clinicsRef.where('liveTvChannelIds', 'array-contains', channelId).get();
    
    if (!clinicsToUpdateSnapshot.empty) {
        const batch = db.batch();
        clinicsToUpdateSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { liveTvChannelIds: FieldValue.arrayRemove(channelId) });
        });
        await batch.commit();
    }

  } catch (error: any) {
    console.error(`Error deleting channel ${channelId}:`, error);
    throw new Error(`Failed to delete channel: ${error.message}`);
  }
}
