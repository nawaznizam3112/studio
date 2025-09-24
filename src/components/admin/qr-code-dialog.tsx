
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode, MessageSquare, ScanLine } from 'lucide-react';
import type { Business } from './business-list';
import { Slot } from '@radix-ui/react-slot';
import { QrCodeGenerator } from '../features/qr-code-generator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

interface QRCodeDialogProps {
  business: Business;
  asChild?: boolean;
  children?: React.ReactNode;
}

export function QRCodeDialog({ business, asChild = false, children }: QRCodeDialogProps) {
  const Comp = asChild ? Slot : Button;

  // This single QR code will always point to the Digital Lounge page.
  // The page itself will handle the logic to offer WhatsApp or in-browser check-in.
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inVenueQrCodeData = `${siteUrl}/business/${business.id}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        { asChild ? <Comp>{children}</Comp> :
        <Button variant="outline" size="sm">
            <QrCode className="mr-2 h-4 w-4" />
            View QR Code
        </Button> }
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Smart QR Code for {business.name}</DialogTitle>
          <DialogDescription>
            Use this single QR code for all your check-in needs. Customers can choose to check in via WhatsApp or directly in their browser.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 gap-4">
            <div className="p-4 bg-white rounded-lg border">
                 <QrCodeGenerator value={inVenueQrCodeData} size={250} />
            </div>
            <div className="text-center text-xs text-muted-foreground break-all">
                <p className="font-semibold">Unified Check-in</p>
                <p>Links to your Digital Lounge which supports WhatsApp & Web check-ins.</p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
