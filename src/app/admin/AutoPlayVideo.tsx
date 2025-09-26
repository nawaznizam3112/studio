
"use client";

import { useRef, useEffect, useState, useMemo } from 'react';
import { VolumeX, Volume2 } from 'lucide-react';
import type { LiveTvVideo } from '@/types/clinic';

interface AutoPlayVideoProps {
  playlist?: LiveTvVideo[];
  src?: string; // Allow a single source URL
}

const AutoPlayVideo = ({ playlist, src }: AutoPlayVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Create a unified playlist from either prop
  const effectivePlaylist = useMemo(() => {
    if (src) {
      return [{ id: 'single', url: src, title: 'Video', durationSeconds: 0 }];
    }
    return playlist || [];
  }, [src, playlist]);

  const currentVideoSrc = effectivePlaylist[currentVideoIndex]?.url;
  
  // This is the critical check. If there's no valid source, don't render the video element.
  if (!currentVideoSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white/50 text-xs">
        <p>No video available.</p>
      </div>
    );
  }


  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const playVideo = () => {
      // Don't try to play if there's no source
      if (videoElement.currentSrc) {
        videoElement.play().catch((error) => console.log("Autoplay was prevented:", error));
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playVideo();
          } else {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(videoElement);
    
    videoElement.addEventListener('loadeddata', playVideo);

    return () => {
        if (videoElement) {
            observer.unobserve(videoElement);
            videoElement.removeEventListener('loadeddata', playVideo);
        }
    };
  }, [currentVideoIndex, effectivePlaylist]);

  const handleVideoEnded = () => {
    // Only advance if there's more than one video (i.e., it's a real playlist)
    if (effectivePlaylist.length > 1) {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % effectivePlaylist.length);
    }
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        key={currentVideoIndex} // Force re-render when video index changes
        src={currentVideoSrc}
        loop={effectivePlaylist.length === 1} // Loop only if it's a single video
        onEnded={handleVideoEnded}
        muted={isMuted}
        playsInline
        className="w-full h-full object-contain"
        controls={false} // Hide default controls
      >
        Your browser does not support the video tag.
      </video>
      <button
        onClick={() => setIsMuted((prev) => !prev)}
        className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-2 z-10 transition-opacity hover:opacity-80"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
};

export default AutoPlayVideo;
