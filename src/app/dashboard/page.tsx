
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
import { useToast } from '@/hooks/use-toast';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsQR from 'jsqr';
import { ServiceHistory } from '@/components/features/service-history';
import { Feedback } from '@/components/features/feedback';
import { PendingConfirmationCard } from '@/components/features/pending-confirmation-card';
import Image from 'next/image';


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

interface Campaign {
  id: string;
  title: string;
  description: string;
  reward: string;
  businessName: string;
  businessId: string;
  expiresAt: string;
  associatedService?: string;
  prizeImageUrl?: string;
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
  const { toast } = useToast();
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
                           toast({variant: 'destructive', title: 'Invalid QR Code', description: 'This QR code is not for a valid business check-in.' });
                        }
                    } catch (e) {
                        toast({variant: 'destructive', title: 'Invalid QR Code', description: 'The scanned code is not a valid URL.' });
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
      toast({ title: "Failed to load dashboard data." });
    } finally {
        setLoading(false);
    }
  };

  const handleEnterDraw = async (campaign: Campaign) => {
      if (!session?.userId) {
          toast({ title: "Please log in", description: "You need to be logged in to enter a draw.", variant: 'destructive' });
          return;
      }
      setIsSubmittingLead(true);
      const result = await createLeadFromCampaign({
          userId: session.userId,
          campaignId: campaign.id,
          businessId: campaign.businessId,
          associatedService: campaign.associatedService || 'General Interest'
      });
      setIsSubmittingLead(false);

      if (result.success) {
          toast({
              title: "You're in!",
              description: "Your entry is recorded. For queries, contact +919845180066.",
          });
      } else {
          toast({ title: "Error", description: result.error, variant: 'destructive' });
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
      toast({ title: 'Data refreshed' });
    } catch (error) {
      console.warn('Refresh failed:', error);
      toast({ title: 'Could not refresh data.' });
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => router.push('/')}
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20"
            >
              Sign Out
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={refreshUserData}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <RealtimeStatus />
            <RealtimeNotifications userId={user.id} />
            <div className="flex items-center space-x-1">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="font-semibold">{user.visits.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-white/30">
            <AvatarFallback className="text-lg bg-white/20">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl">{user.name}</h2>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Badge className="bg-yellow-500 text-black">{user.visits} Entries</Badge>
            {campaigns.length > 0 && (
              <span className="text-sm opacity-80">
                in {campaigns.length} active campaigns
              </span>
            )}
          </div>
          
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div>
              <div className="font-semibold">{user.visits}</div>
              <div className="opacity-80">Visits</div>
            </div>
            <div>
              <div className="font-semibold">{user.streak}</div>
              <div className="opacity-80">Day Streak</div>
            </div>
            <div>
              <div className="font-semibold">{user.achievements?.length || 0}</div>
              <div className="opacity-80">Badges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="entries">My Entries</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-4">

            {pendingVisits.map(visit => (
                <PendingConfirmationCard 
                    key={visit.id}
                    visit={visit}
                    onAction={() => {
                        toast({ title: "Refreshing your history..." });
                        refreshUserData();
                    }}
                />
            ))}
            
            <PromotionalFeed />
            
            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="mb-3 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-16 bg-blue-600 hover:bg-blue-700">
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
                  className="h-16"
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
            {campaigns.length > 0 && (
              <Card className="p-4 border-primary">
                <h3 className="mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Active Campaigns
                </h3>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="space-y-3 p-3 rounded-lg bg-background border">
                       {campaign.prizeImageUrl && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                            <Image
                              src={campaign.prizeImageUrl}
                              alt={campaign.reward}
                              fill
                              className="object-cover"
                              data-ai-hint="reward prize"
                            />
                          </div>
                       )}
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="font-semibold">{campaign.title}</p>
                            <p className="text-xs text-muted-foreground">From {campaign.businessName}</p>
                         </div>
                        <Badge variant="default" className="text-base">
                          Prize: {campaign.reward}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="default" disabled={isSubmittingLead}>
                              <Send className="mr-2 h-4 w-4"/>
                              {isSubmittingLead ? 'Entering...' : 'Enter Draw'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Enter Lucky Draw: {campaign.title}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    To enter the draw for a <span className="font-bold">{campaign.reward}</span>, you must express interest in the following service:
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="my-2 p-3 font-bold text-center bg-secondary rounded-md">{campaign.associatedService || 'the associated treatment'}</div>
                                <AlertDialogDescription>
                                    This will create a lead for the clinic. Do you want to proceed?
                                </AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleEnterDraw(campaign)} disabled={isSubmittingLead}>
                                    {isSubmittingLead ? 'Submitting...' : 'Yes, Enter Now'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
          </TabsContent>

          <TabsContent value="explore" className="space-y-4">
            <Card className="p-4">
              <h3 className="mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Nearby Clinics
              </h3>
              <div className="space-y-3">
                {nearbyBusinesses.map((business) => (
                  <Button 
                    key={business.id}
                    onClick={() => router.push(`/business/${business.id}`)}
                    variant="outline"
                    className="w-full h-20 flex items-center justify-between p-4"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
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
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                  </Button>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="entries" className="space-y-4">
            <Card className="p-4 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="">{user.visits.toLocaleString()} Entries</h3>
              <p className="text-sm text-muted-foreground">Your total entries in active campaigns.</p>
            </Card>

            {campaigns.length > 0 && (
              <Card className="p-4 border-primary">
                <h3 className="mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Active Campaigns
                </h3>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="space-y-3 p-3 rounded-lg bg-background border">
                      {campaign.prizeImageUrl && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                            <Image
                              src={campaign.prizeImageUrl}
                              alt={campaign.reward}
                              fill
                              className="object-cover"
                              data-ai-hint="reward prize"
                            />
                          </div>
                       )}
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="font-semibold">{campaign.title}</p>
                            <p className="text-xs text-muted-foreground">From {campaign.businessName}</p>
                         </div>
                        <Badge variant="default" className="text-base">
                          Prize: {campaign.reward}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="default" disabled={isSubmittingLead}>
                              <Send className="mr-2 h-4 w-4"/>
                              {isSubmittingLead ? 'Entering...' : 'Enter Draw'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Enter Lucky Draw: {campaign.title}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    To enter the draw for a <span className="font-bold">{campaign.reward}</span>, you must express interest in the following service:
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="my-2 p-3 font-bold text-center bg-secondary rounded-md">{campaign.associatedService || 'the associated treatment'}</div>
                                <AlertDialogDescription>
                                    This will create a lead for the clinic. Do you want to proceed?
                                </AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleEnterDraw(campaign)} disabled={isSubmittingLead}>
                                    {isSubmittingLead ? 'Submitting...' : 'Yes, Enter Now'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <ServiceHistory serviceHistory={serviceHistory} />
            
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="p-4">
              <h3 className="mb-3 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements ({user.achievements?.length || 0})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {user.achievements?.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="justify-center py-2">
                    <Crown className="w-3 h-3 mr-1" />
                    {achievement}
                  </Badge>
                )) || <p className="text-muted-foreground text-sm col-span-2">No achievements yet</p>}
              </div>
            </Card>

            <Feedback />

            <Card className="p-4">
              <h3 className="mb-3 flex items-center">
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
        </Tabs>
      </div>
    </div>
  );
}
