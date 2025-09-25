
'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends ImageProps {
  fallback?: React.ReactNode;
}

export function ImageWithFallback({
  src,
  alt,
  fallback,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  const fallbackContent = fallback || (
    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
      <ImageIcon className="w-8 h-8" />
    </div>
  );

  if (error || !src) {
    return fallbackContent;
  }

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
