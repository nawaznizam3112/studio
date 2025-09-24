

'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Users, Star, ScanLine, Trophy, Gift, MessageSquare, HandCoins, DollarSign, StarHalf, List, Phone, LogOut, FileText, ClipboardCheck, HelpCircle, BookOpen, Lightbulb, Mail, AlertTriangle, ShoppingCart, Gem, Share2, User, Repeat, Megaphone, AlertCircle, CheckCircle, Hourglass, HelpCircleIcon, UserCheck, UserX, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QRCodeDialog } from "@/components/admin/qr-code-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCampaignForm } from "@/components/business/create-campaign-form";
import { CampaignList } from "@/components/business/campaign-list";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/hooks/use-session.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCampaignsForBusiness, getBusinessById, getBusinessCustomerHistory, sendBroadcastMessage } from "@/app/actions";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { ProfileEditor } from "./profile-editor";
import { useToast } from "@/hooks/use-toast";
import { RealtimeNotifications } from "../features/realtimenotifications";
import { RealtimeStatus } from "../features/realtimestatus";
import { RealtimeActivityStream } from "../features/realtime-activity-stream";
import { CustomerChart } from "./customer-chart";
import { Textarea } from "../ui/textarea";
import { UpdateVisitDialog } from "./update-visit-dialog";
import { LeadList } from "./lead-list";

interface Business {
    id: string;
    name: string;
    industry: string;
    qrStatus: 'active' | 'inactive';
    phone?: string;
    introVideoUrl?: string;
    promoVideoUrl?: string;
    promoLinkUrl?: string;
    welcomeJourneyActive: boolean;
    message_credits?: number;
}

interface DashboardClientProps {
    business: Business;
    initialHistory: any[];
    initialCampaigns: any[];
    initialOffers: any[];
    initialServices: any[];
    initialQuizzes: any[];
    initialStories: any[];
    initialNudges: any[];
    initialProducts: any[];
}


const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Ongoing':
            return <Badge variant="secondary" className="bg-blue-100 text-blue-700"><Hourglass className="mr-1 h-3 w-3" />Ongoing</Badge>;
        case 'Pending Customer Confirmation':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700"><HelpCircleIcon className="mr-1 h-3 w-3" />Pending</Badge>;
        case 'Verified':
            return <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>;
        case 'Disputed':
            return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Disputed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};


export function DashboardClient({ 
    business: initialBusiness, 
    initialHistory,
    initialCampaigns,
    initialOffers,
    initialServices,
    initialQuizzes,
    initialStories,
    initialNudges,
    initialProducts,
}: DashboardClientProps) {
  const router = useRouter();
  const { session, clearSession } = useSession();
  const { toast } = useToast();
  const businessId = initialBusiness.id;

  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [history, setHistory] = useState<any[]>(initialHistory);
  const [campaigns, setCampaigns] = useState<any[]>(initialCampaigns);
  const [error, setError] = useState<string | null>(null);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const broadcastFormRef = useRef<HTMLFormElement>(null);


  const refreshData = useCallback(async () => {
    if (!session) return;
    setError(null);
    try {
      const [campaignsResult, businessResult, historyResult] = await Promise.all([
        getCampaignsForBusiness(businessId),
        getBusinessById(businessId),
        getBusinessCustomerHistory(businessId),
      ]);

      if (campaignsResult.error) throw new Error(campaignsResult.error);
      setCampaigns(campaignsResult.campaigns || []);
      
      if (businessResult.error) throw new Error(businessResult.error);
      if(businessResult.business) setBusiness(businessResult.business as Business);

      if (historyResult.error) throw new Error(historyResult.error);
      setHistory(historyResult.history || []);


    } catch (e: any) {
      setError(e.message);
    }
  }, [businessId, session]);

  useEffect(() => {
    if (session) {
      refreshData();
    }
  }, [session, refreshData]);
  
  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  const handleBroadcastSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSendingBroadcast(true);
      
      const formData = new FormData(event.currentTarget);
      formData.append('businessId', businessId);
      
      const result = await sendBroadcastMessage(formData);
      
      if (result.success) {
          toast({
              title: "Broadcast Sent!",
              description: result.message,
          });
          broadcastFormRef.current?.reset();
          // Refresh business data to show updated credit count
          const businessResult = await getBusinessById(businessId);
          if(businessResult.business) setBusiness(businessResult.business as Business);
      } else {
          toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
          });
      }
      setIsSendingBroadcast(false);
  }

  const checkInHistory = history?.filter(h => h.activityType === 'Check-in') || [];
  
  const totalVisits = checkInHistory.length;
  const uniqueCustomers = new Set(checkInHistory.map(h => h.userId)).size;
        
    const totalRevenue = history
        .filter(h => h.status === 'Verified' && h.expense && typeof h.expense.amount === 'number')
        .reduce((acc, curr) => acc + curr.expense.amount, 0);
        
    const verifiedVisitsWithExpense = history.filter(h => h.status === 'Verified' && h.expense && typeof h.expense.amount === 'number');
    const avgSpendPerVerifiedVisit = verifiedVisitsWithExpense.length > 0
        ? totalRevenue / verifiedVisitsWithExpense.length
        : 0;

    const loyaltyDistribution = checkInHistory.reduce((acc, visit) => {
        const level = getLevelForPoints(visit.points || 0); // Assuming points are on the visit, otherwise need to calc
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const visitTrendData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return { date: d.toISOString().split('T')[0], visits: 0 };
    }).reverse();

    checkInHistory.forEach(visit => {
        const visitDate = new Date(visit.sortDate).toISOString().split('T')[0];
        const dayData = visitTrendData.find(d => d.date === visitDate);
        if (dayData) {
            dayData.visits++;
        }
    });

    function getLevelForPoints(points: number): string {
        if (points >= 500) return 'Gold';
        if (points >= 100) return 'Silver';
        return 'Bronze';
    }

    const leads = useMemo(() => {
        // This logic correctly identifies leads from the general activity history.
        const leadActivities = history.filter(item => 
            item.activityType === 'Lead' || 
            item.activityType === 'Booking' || // Bookings are also leads
            (item.preConsultationNotes && item.activityType === 'Check-in' && !item.service.toLowerCase().includes('booked'))
        );
        
        // Deduplicate by user to represent unique leads
        const uniqueLeads = new Map();
        leadActivities.forEach(item => {
             // A more specific lead identifier could be a combination of user and campaign/service
            const leadId = `${item.userId}-${item.service}`;
            if (!uniqueLeads.has(leadId)) {
                 uniqueLeads.set(leadId, {
                    id: item.id, // Use the history item id as the lead id
                    name: item.userName,
                    phone: item.userPhone,
                    email: item.userEmail,
                    serviceInterest: item.service,
                    status: item.leadStatus || 'new', // Default to 'new' if not set
                    date: item.date,
                    source: item.campaign || 'Direct Check-in', // Use campaign if available
                });
            }
        });
        
        return Array.from(uniqueLeads.values());
    }, [history]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Clinic Dashboard</h1>
            <div className="flex items-center gap-2 sm:gap-4">
                <RealtimeStatus />
                <RealtimeNotifications businessId={businessId} isBusinessOwner={true} />
                <QRCodeDialog business={business} />
                <Button variant="outline" onClick={handleLogout} size="sm"><LogOut className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Logout</span></Button>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome, {business.name}!</h2>
                <p className="text-muted-foreground">Here's an overview of your patient engagement and campaigns.</p>
              </div>

               <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Legal Notice</AlertTitle>
                  <AlertDescription>
                    You are strictly prohibited from collecting, storing, or sharing any sensitive medical history or personal health information of your patients on this platform. This platform is intended for engagement and loyalty purposes only.
                  </AlertDescription>
                </Alert>

              <Tabs defaultValue="overview">
                <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="inline-flex w-max">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
                        <TabsTrigger value="campaigns">Lucky Draw</TabsTrigger>
                        <TabsTrigger value="profile">Clinic Profile</TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <TabsContent value="overview" className="mt-6 space-y-6">
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                     <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <DollarSign className="h-8 w-8 text-green-500" />
                                <div>
                                    <CardTitle>Total Revenue</CardTitle>
                                    <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Users className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Unique Patients</CardTitle>
                                    <p className="text-2xl font-bold">{uniqueCustomers}</p>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <BarChart className="h-8 w-8 text-accent-foreground" />
                                <div>
                                    <CardTitle>Total Visits</CardTitle>
                                    <p className="text-2xl font-bold">{totalVisits}</p>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <HandCoins className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <CardTitle>Avg. Spend</CardTitle>
                                    <p className="text-2xl font-bold">₹{avgSpendPerVerifiedVisit.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                  </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                         <CustomerChart 
                            loyaltyData={loyaltyDistribution}
                            visitData={visitTrendData}
                         />
                         <div className="lg:col-span-2">
                             <RealtimeActivityStream businessId={businessId} />
                         </div>
                    </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>Patient Activity</CardTitle>
                            <CardDescription>A complete log of all patient check-ins and payments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Token</TableHead>
                                        <TableHead>Activity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.length > 0 ? history.map((h: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback>{getInitials(h.userName)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{h.userName}</p>
                                                        <p className="text-xs text-muted-foreground">{h.userPhone || h.userEmail}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{h.token ? `#${h.token}` : '-'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={h.activityType === 'Feedback' ? 'secondary' : 'default'}>
                                                    {h.activityType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(h.status || 'Completed')}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                <p>{h.service}</p>
                                                {h.notes && <p className="text-xs text-muted-foreground italic">"{h.notes}"</p>}
                                                {h.quizResults && <p className="text-xs text-muted-foreground">Quiz completed</p>}
                                            </TableCell>
                                            <TableCell>
                                                {h.expense && h.expense.amount ? `₹${h.expense.amount.toFixed(2)}` : '-'}
                                            </TableCell>
                                            <TableCell>{h.date}</TableCell>
                                            <TableCell className="text-right">
                                                 {h.status === 'Ongoing' && (
                                                    <UpdateVisitDialog 
                                                        visitId={h.id} 
                                                        userId={h.userId} 
                                                        onVisitUpdated={refreshData} 
                                                    />
                                                 )}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                No patient activity yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="leads" className="mt-6 space-y-6">
                    <LeadList leads={leads} onAction={refreshData} />
                </TabsContent>
                <TabsContent value="profile" className="mt-6">
                    <ProfileEditor business={business} onProfileUpdated={refreshData} />
                </TabsContent>
                <TabsContent value="campaigns" className="mt-6">
                   <div className="grid gap-8 md:grid-cols-3">
                        <div className="md:col-span-1">
                           <CreateCampaignForm businessId={businessId} onCampaignCreated={refreshData} />
                        </div>
                        <div className="md:col-span-2">
                            <CampaignList campaigns={campaigns} onAction={refreshData} />
                        </div>
                    </div>
                </TabsContent>
              </Tabs>
            </div>
        </main>
    </div>
  );
}
