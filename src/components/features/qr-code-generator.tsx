'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QrCodeGeneratorProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
}

export function QrCodeGenerator({
  value,
  size = 250,
  level = 'M',
}: QrCodeGeneratorProps) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      level={level}
      includeMargin={true}
      className="w-full h-auto"
    />
  );
}
