'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

interface BusinessVideo {
  businessName: string;
  promoVideoUrl: string;
}

interface VideoReelPlayerProps {
  videos: BusinessVideo[];
}

function getYouTubeEmbedUrl(url: string | undefined): string | null {
    if (!url) return null;
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        console.error("Invalid URL:", e);
        return null;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&rel=0&loop=1&playlist=${videoId}&mute=1` : null;
}

export function VideoReelPlayer({ videos }: VideoReelPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const currentVideo = videos[currentIndex];
  const embedUrl = getYouTubeEmbedUrl(currentVideo?.promoVideoUrl);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
    setProgress(0);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
     setProgress(0);
  };

  const togglePlay = () => {
    const player = iframeRef.current?.contentWindow;
    if (player) {
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      player.postMessage(`{"event":"command","func":"${command}","args":""}`, '*');
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
      const player = iframeRef.current?.contentWindow;
      if (player) {
          const command = isMuted ? 'unMute' : 'mute';
          player.postMessage(`{"event":"command","func":"${command}","args":""}`, '*');
          setIsMuted(!isMuted);
      }
  };

  useEffect(() => {
    setIsPlaying(true); // Always start playing on new video
    const interval = setInterval(() => {
        if(isPlaying) {
            setProgress(prev => {
                if (prev >= 100) {
                    goToNext();
                    return 0;
                }
                return prev + (100 / 15); // Assume 15s video length for progress
            });
        }
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isPlaying]);


  if (!currentVideo || !embedUrl) {
    return null;
  }

  return (
    <Card className="w-full overflow-hidden aspect-[9/16] max-h-[75vh] relative">
      <CardContent className="p-0 h-full">
        <div className="h-full">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={currentVideo.businessName}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 h-full w-full"
          />
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
             <div className="flex items-center gap-2">
                {videos.map((_, index) => (
                    <div key={index} className="flex-1 h-1 bg-white/30 rounded-full">
                        <div 
                            className="h-full bg-white rounded-full"
                            style={{ width: `${index === currentIndex ? progress : (index < currentIndex ? 100 : 0)}%`}}
                         />
                    </div>
                ))}
             </div>
             <div className="mt-2 text-white">
                <p className="font-bold">{currentVideo.businessName}</p>
             </div>
          </div>
           <div className="absolute inset-0 flex items-center justify-between px-2">
             <Button variant="ghost" size="icon" onClick={goToPrevious} className="text-white hover:bg-white/20 hover:text-white h-auto p-2 rounded-full">
                <SkipBack className="h-8 w-8" />
             </Button>
             <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 hover:text-white h-auto p-2 rounded-full">
                {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10" />}
             </Button>
             <Button variant="ghost" size="icon" onClick={goToNext} className="text-white hover:bg-white/20 hover:text-white h-auto p-2 rounded-full">
                <SkipForward className="h-8 w-8" />
             </Button>
          </div>
          <div className="absolute bottom-4 right-4">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 hover:text-white rounded-full">
                {isMuted ? <VolumeX /> : <Volume2 />}
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
