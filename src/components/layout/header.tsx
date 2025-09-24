
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QrCode, ScanLine, AlertTriangle, User, LogOut } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import jsQR from 'jsqr';
import { useRouter } from 'next/navigation';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useSession } from '@/hooks/use-session.tsx';
import { Skeleton } from '../ui/skeleton';

export function Header() {
  const { toast } = useToast();
  const router = useRouter();
  const { session, clearSession, loading } = useSession();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!dialogOpen) {
       // Stop camera stream when dialog closes
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      return;
    }

    let animationFrameId: number;
    
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          scanQRCode(); // Start scanning
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    
    const scanQRCode = () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if(context) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                });

                if (code) {
                    // QR Code detected
                    setDialogOpen(false);
                    try {
                        const url = new URL(code.data);
                        // The QR code should point to the business check-in page.
                        if(url.pathname.startsWith('/business/')) {
                            router.push(url.pathname);
                        } else {
                           toast({ variant: 'destructive', title: 'Invalid QR Code', description: 'This QR code is not for a valid business check-in.' });
                        }
                    } catch (e) {
                        toast({ variant: 'destructive', title: 'Invalid QR Code', description: 'The scanned code is not a valid URL.' });
                    }
                    return; // Stop scanning
                }
            }
        }
        animationFrameId = requestAnimationFrame(scanQRCode);
    };

    getCameraPermission();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };

  }, [dialogOpen, router, toast]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
    router.refresh();
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const renderButtons = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      );
    }
    if (session) {
      return (
         <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan QR
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Scan QR Code</DialogTitle>
                  <DialogDescription>
                    Point your camera at a QR code to check in.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex h-64 w-full items-center justify-center overflow-hidden rounded-lg bg-secondary/50">
                   <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
                   <canvas ref={canvasRef} style={{ display: 'none' }} />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="h-48 w-48 rounded-lg border-4 border-dashed border-primary/50" />
                   </div>
                </div>
                 {hasCameraPermission === false && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Camera Access Denied</AlertTitle>
                      <AlertDescription>
                        Please allow camera access in your browser settings to scan QR codes.
                      </AlertDescription>
                    </Alert>
                  )}
              </DialogContent>
            </Dialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto rounded-full">
                        <Avatar>
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(session.name)}`} alt="User avatar" data-ai-hint="person face" />
                            <AvatarFallback>{getInitials(session.name)}</AvatarFallback>
                        </Avatar>
                        <span className="hidden text-sm font-medium sm:inline">{session.name || 'User'}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </>
      )
    }
     return (
        <>
            <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
        </>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-2">
        <QrCode className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">QREngage</h1>
      </Link>
      <div className="flex items-center gap-4">
        {renderButtons()}
      </div>
    </header>
  );
}
