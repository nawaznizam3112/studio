
'use server';

import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      return urlObj.searchParams.get('v');
    }
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
  } catch (e) {
    // Fallback for non-URL strings or different formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
  }
  return null;
}

export async function getVideoDetails(videoUrl: string): Promise<{ title: string; durationSeconds: number; thumbnailUrl: string; } | null> {
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    console.warn(`Could not extract YouTube video ID from URL: ${videoUrl}`);
    return null;
  }

  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: [videoId],
    });

    const item = response.data.items?.[0];
    if (!item || !item.snippet?.title || !item.contentDetails?.duration || !item.snippet.thumbnails) {
      console.warn(`No valid details found for YouTube video ID: ${videoId}`);
      return null;
    }

    const title = item.snippet.title;
    const durationSeconds = parseDuration(item.contentDetails.duration);
    const thumbnailUrl = item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '';

    return { title, durationSeconds, thumbnailUrl };
  } catch (error) {
    console.error(`Error fetching YouTube video details for ID ${videoId}:`, error);
    return null;
  }
}
