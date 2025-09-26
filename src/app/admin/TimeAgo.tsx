
"use client";

import { useState, useEffect } from 'react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';

interface TimeAgoProps {
  timestamp: string | null;
}

export default function TimeAgo({ timestamp }: TimeAgoProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setIsMounted(true);
  }, []);

  if (!timestamp) {
    return null;
  }

  // While the component has not mounted yet (i.e., on the server or during initial client render),
  // render a placeholder to ensure the server and client HTML match.
  if (!isMounted) {
    return (
      <p className="text-xs text-muted-foreground">
        &nbsp;
      </p>
    );
  }

  // Once mounted on the client, we can safely calculate and render the dynamic time.
  let timeAgoText = '';
  try {
    const date = parseISO(timestamp);
    if (isValid(date)) {
      timeAgoText = formatDistanceToNow(date, { addSuffix: true });
    } else {
      timeAgoText = 'Invalid date';
    }
  } catch (e) {
    console.error("Invalid timestamp for TimeAgo", e);
    timeAgoText = 'Invalid date';
  }

  return (
    <p className="text-xs text-muted-foreground">
      {timeAgoText}
    </p>
  );
}
