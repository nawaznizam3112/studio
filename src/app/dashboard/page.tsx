
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@/hooks/use-session.tsx';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  QrCode, 
  Star, 
  Trophy, 
  Gift, 
  Scissors, 
  Dumbbell,
  Share2,
  Users,
  Target,
  Crown,
  Flame,
  Zap,
  Sparkles,
  Bot,
  History,
  Settings,
  ArrowLeft,
  MapPin,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Stethoscope,
  HandHeart,
  ScanLine,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getServiceHistory, recordShare, getAllActiveOffers, redeemOffer, getAllActiveCampaigns, getBusinesses, createLeadFromCampaign } from '@/app/actions';
import { RealtimeNotifications } from '@/components/features/realtimenotifications';
import { RealtimeStatus } from '@/components/features/realtimestatus';
import { VideoReelPlayer } from '@/components/features/video-reel-player';
import { PromotionalFeed } from '@/components/features/promotional-feed';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsQR from 'jsqr';
import { ServiceHistory } from '@/components/features/service-history';
import { Feedback } from '@/components/features/feedback';
import { PendingConfirmationCard } from '@/components/features/pending-confirmation-card';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Toaster, toast } from 'sonner';
import { ActiveCampaigns } from '@/components/business/lucky-draw/ActiveCampaigns';
import { Campaign } from '@/types/campaign';


interface User {
  id: string;
  name: string;
  email?: string;
  points: number;
  level: string;
  visits: number;
  streak: number;
  achievements: string[];
  joinedDate?: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  businessName: string;
  businessId: string;
  pointsRequired: number;
  expiresAt: string;
}

interface BusinessVideo {
  businessName: string;
  promoVideoUrl: string;
}

function getLevelForPoints(points: number): string {
    if (points >= 1000) return 'Platinum';
    if (points >= 500) return 'Gold';
    if (points >= 200) return 'Silver';
    return 'Bronze';
}


export default function CustomerDashboard() {
  const { session, clearSession, loading: sessionLoading } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [scannedFeature, setScannedFeature] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rewards, setRewards] = useState<Offer[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<any[]>([]);
  const [promotionalVideos, setPromotionalVideos] = useState<BusinessVideo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [mostRecentBusinessId, setMostRecentBusinessId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);


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
                           toast.error('Invalid QR Code', { description: 'This QR code is not for a valid business check-in.' });
                        }
                    } catch (e) {
                        toast.error('Invalid QR Code', { description: 'The scanned code is not a valid URL.' });
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

  }, [dialogOpen, router]);

  // Main data loading effect
  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      router.push('/login');
      return;
    }
    initializeDashboard();
  }, [session, sessionLoading, router]);

  const initializeDashboard = async () => {
    if (!session) return;
    setLoading(true);
    try {
      
      await Promise.allSettled([
        fetchCampaigns(),
        fetchRewards(),
        fetchServiceHistory(),
        fetchNearbyBusinesses()
      ]);
      
    } catch (error) {
      console.warn('Dashboard initialization error:', error);
      toast.error("Failed to load dashboard data.");
    } finally {
        setLoading(false);
    }
  };

  const handleEnterDraw = async (campaignId: string) => {
      if (!session?.userId) {
          toast.error("Please log in", { description: "You need to be logged in to enter a draw." });
          return;
      }
      setIsSubmittingLead(true);
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) {
          toast.error("Campaign not found");
          setIsSubmittingLead(false);
          return;
      }
      const result = await createLeadFromCampaign({
          userId: session.userId,
          campaignId: campaignId,
          businessId: campaign.businessId,
          associatedService: campaign.associatedService || 'General Interest'
      });
      setIsSubmittingLead(false);

      if (result.success) {
          toast.success("You're in!", {
              description: "Your entry is recorded. For queries, contact +919845180066.",
          });
      } else {
          toast.error("Error", { description: result.error });
      }
  };

  const fetchCampaigns = async () => {
    try {
      const { campaigns } = await getAllActiveCampaigns();
      setCampaigns(campaigns || []); // Show all campaigns
    } catch (error) {
      console.warn('Failed to fetch campaigns:', error);
    }
  };

  const fetchRewards = async () => {
    try {
        const { offers } = await getAllActiveOffers();
        setRewards(offers || []);
    } catch (error) {
      console.warn('Failed to fetch rewards:', error);
    }
  };

  const fetchServiceHistory = async () => {
    if (!session) return;
    try {
      const { history } = await getServiceHistory(session.userId);
      setServiceHistory(history || []);
      
      // Calculate user stats from history
      const totalVisits = history.length;
      const totalPoints = totalVisits * 10; // 10 points per visit
      const level = getLevelForPoints(totalPoints);

      setUser({
        id: session.userId,
        name: session.name || 'Patient',
        visits: totalVisits,
        points: totalPoints,
        level: level,
        streak: 3, // Mock data
        achievements: ['First Visit', 'Early Bird'], // Mock data
        joinedDate: new Date().toISOString() // Mock data
      });


      if (history && history.length > 0) {
        // Assuming history is sorted by date desc
        setMostRecentBusinessId(history[0].businessId);
      }
    } catch (error) {
      console.warn('Failed to fetch service history:', error);
    }
  };

  const fetchNearbyBusinesses = async () => {
    try {
        const { businesses } = await getBusinesses();
        const mockNearby = (businesses || []).map(b => ({
            ...b,
            distance: `${(Math.random() * 5).toFixed(1)} km`,
            rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
            isOpen: Math.random() > 0.2,
            specialOffer: 'Lucky Draw Campaign Active!'
        }));
        setNearbyBusinesses(mockNearby);
        
        const videos = (businesses || [])
            .filter(b => b.promoVideoUrl)
            .map(b => ({
                businessName: b.name,
                promoVideoUrl: b.promoVideoUrl!,
            }));
        setPromotionalVideos(videos);

    } catch (error) {
         console.warn('Failed to fetch nearby businesses:', error);
    }
  };

  const refreshUserData = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchCampaigns(),
        fetchRewards(),
        fetchServiceHistory(),
      ]);
      toast.info('Data refreshed');
    } catch (error) {
      console.warn('Refresh failed:', error);
      toast.error('Could not refresh data.');
    } finally {
      setIsRefreshing(false);
    }
  };


  if (loading || !user) {
      return (
          <div className="flex min-h-screen items-center justify-center">
              <p>Loading Patient Dashboard...</p>
          </div>
      )
  }

  const handleSignOut = () => {
      clearSession();
      router.push('/');
  }

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'Salon': return <Scissors className="w-6 h-6 text-pink-600" />;
      case 'Gym': return <Dumbbell className="w-6 h-6 text-orange-600" />;
      case 'Wellness': return <HandHeart className="w-6 h-6 text-green-600" />;
      case 'Physician Clinic': return <Stethoscope className="w-6 h-6 text-blue-600" />;
      default: return <Star className="w-6 h-6 text-gray-600" />;
    }
  };

  const pendingVisits = serviceHistory.filter(v => v.status === 'Pending Customer Confirmation');


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Toaster richColors />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-0 sm:space-x-2">
            <Button 
              onClick={() => router.push('/')}
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 sm:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
             <Button 
              onClick={() => router.push('/')}
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20 hidden sm:flex"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              onClick={refreshUserData}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-8 w-8"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <RealtimeStatus />
            <RealtimeNotifications userId={user.id} />
            <div className="flex items-center space-x-2 rounded-full bg-black/20 px-3 py-1">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-sm">{user.visits.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-white/30">
            <AvatarFallback className="text-2xl bg-white/20">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Badge className="bg-yellow-400 text-black shadow-md">{user.visits} Entries</Badge>
            {campaigns.length > 0 && (
              <span className="text-sm opacity-80">
                in {campaigns.length} active campaigns
              </span>
            )}
          </div>
          
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div>
              <div className="font-bold text-lg">{user.visits}</div>
              <div className="opacity-80 text-xs">Visits</div>
            </div>
            <div>
              <div className="font-bold text-lg">{user.streak}</div>
              <div className="opacity-80 text-xs">Day Streak</div>
            </div>
            <div>
              <div className="font-bold text-lg">{user.achievements?.length || 0}</div>
              <div className="opacity-80 text-xs">Badges</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-2 sm:p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:relative md:bg-transparent md:border-none md:backdrop-blur-none">
              <ScrollArea className="md:flex md:justify-center">
                <TabsList className="grid h-16 w-full grid-cols-4 md:h-12 md:w-auto md:max-w-md">
                    <TabsTrigger value="home" className="flex-col gap-1 md:flex-row md:gap-2 h-full rounded-none text-xs md:text-sm">
                      <Zap className="w-5 h-5"/> Home
                    </TabsTrigger>
                    <TabsTrigger value="explore" className="flex-col gap-1 md:flex-row md:gap-2 h-full rounded-none text-xs md:text-sm">
                      <MapPin className="w-5 h-5"/> Explore
                    </TabsTrigger>
                    <TabsTrigger value="entries" className="flex-col gap-1 md:flex-row md:gap-2 h-full rounded-none text-xs md:text-sm">
                      <Trophy className="w-5 h-5"/> My Entries
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex-col gap-1 md:flex-row md:gap-2 h-full rounded-none text-xs md:text-sm">
                      <User className="w-5 h-5"/> Profile
                    </TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" className="hidden"/>
              </ScrollArea>
            </div>

          <div className="pb-20 md:pb-0">
          <TabsContent value="home" className="space-y-4 mt-4">

            {pendingVisits.map(visit => (
                <PendingConfirmationCard 
                    key={visit.id}
                    visit={visit}
                    onAction={() => {
                        toast.info("Refreshing your history...");
                        refreshUserData();
                    }}
                />
            ))}
            
            <PromotionalFeed />
            
            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="mb-3 flex items-center text-base font-semibold">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-base">
                      <QrCode className="w-5 h-5 mr-2" />
                      Clinic Check-in
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Scan Clinic QR Code</DialogTitle>
                      <DialogDescription>
                        Point your camera at a QR code to check in for your visit.
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

                <Button 
                  variant="outline"
                  className="h-16 text-base"
                   onClick={() => setActiveTab('entries')}
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  My Draw Entries
                </Button>
              </div>
            </Card>

            {promotionalVideos.length > 0 && (
                <VideoReelPlayer videos={promotionalVideos} />
            )}

            {/* Active Campaigns */}
            <ActiveCampaigns 
                campaigns={campaigns} 
                businessName="our partners"
                onEnterDraw={(campaignId) => handleEnterDraw(campaignId)}
            />
            
          </TabsContent>

          <TabsContent value="explore" className="space-y-4 mt-4">
            <Card className="p-4">
              <h3 className="mb-3 flex items-center text-base font-semibold">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Nearby Clinics
              </h3>
              <div className="space-y-3">
                {nearbyBusinesses.map((business) => (
                  <Button 
                    key={business.id}
                    onClick={() => router.push(`/business/${business.id}`)}
                    variant="outline"
                    className="w-full h-auto flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                         {getIndustryIcon(business.industry)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{business.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {business.distance} • {business.rating}★ • {business.isOpen ? 'Open' : 'Closed'}
                        </p>
                        {business.specialOffer && (
                          <p className="text-xs text-green-600 font-medium">
                            🎁 {business.specialOffer}
                          </p>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="entries" className="space-y-4 mt-4">
            <Card className="p-4 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{user.visits.toLocaleString()} Entries</h3>
              <p className="text-sm text-muted-foreground">Your total entries in active campaigns.</p>
            </Card>

            <ActiveCampaigns 
                campaigns={campaigns} 
                businessName="our partners"
                onEnterDraw={(campaignId) => handleEnterDraw(campaignId)}
            />

            <ServiceHistory serviceHistory={serviceHistory} />
            
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card className="p-4">
              <h3 className="mb-3 flex items-center font-semibold text-base">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements ({user.achievements?.length || 0})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {user.achievements?.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="justify-center py-2 text-center">
                    <Crown className="w-3 h-3 mr-1" />
                    {achievement}
                  </Badge>
                )) || <p className="text-muted-foreground text-sm col-span-2">No achievements yet</p>}
              </div>
            </Card>

            <Feedback />

            <Card className="p-4">
              <h3 className="mb-3 flex items-center font-semibold text-base">
                <Settings className="w-5 h-5 mr-2 text-gray-500" />
                Account
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Email</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Member Since</span>
                  <span className="text-sm text-muted-foreground">
                    {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>
            </Card>
            
            <Button 
              variant="destructive"
              onClick={handleSignOut}
              className="w-full"
            >
              Sign Out
            </Button>
          </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
