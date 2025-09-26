
"use client";

// This component now receives all its initial data as props, simplifying its logic.

import * as React from "react";
import { useEffect, useState, useCallback, type FormEvent, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, QrCode, ExternalLink, PackageOpen, FileText as DefaultIconLucide, Video as VideoIconLucide, Tag, Megaphone, Lightbulb, ListFilter, Eye, Phone, MessageSquare, ThumbsUp, Send, ImageIcon, Store, DollarSign, Zap, Clock, Settings2 as HealthToolsIcon, Star as StarIcon, Gift, Info as InfoIcon, Users, UserPlus, Share2, Badge, Gamepad2, HandHeart, Puzzle, CalendarCheck, Building, Fingerprint, Plus, Minus, ClipboardCheck, BellOff, Bell, CalendarDays, Bot, Search, Presentation, Flame, MapPin, Tv2, PlayCircle, X, Globe, Newspaper, BookOpen, Camera } from "lucide-react";
import type { ContentItem, ClinicAnalyticsData, ManagedClinic, HealthToolId, Sponsorship, Reward, PatientHistoryDataType, RedemptionCode, LiveTvChannel, Review, AdCampaign, AnalyzeSkinTypeOutput } from "@/types/clinic";
import { HEALTH_TOOL_IDS, AVAILABLE_HEALTH_TOOLS } from "@/types/clinic";
import { updateClinicContentItemLikeCount, incrementContentItemShareCount } from "@/services/clinicContentService";
import { getChannel as getTvChannel } from "@/services/liveTvService";
import { addLead } from "@/services/leadService";
import { incrementClinicScanCount, incrementShareClickCount, getShareStats, addClinicReview, getPatientChallengeState, incrementPatientShareCount } from "@/services/analyticsService";
import { getActiveRewards, redeemRewardAndGenerateCode } from "@/services/rewardService";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Textarea } from "@/components/ui/textarea";
import { format, formatDistanceToNow, addDays, parseISO as dateFnsParseISO } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import OfferCountdown from '@/components/OfferCountdown';
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { useNotifications } from "@/hooks/useNotifications";
import { saveSmsSubscription, removeSmsSubscription } from "@/services/notificationService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import QRCode from "qrcode.react";
import InformationTicker from './InformationTicker';
import type { TickerItem } from './InformationTicker';
import SponsorshipCard from './SponsorshipCard';
import AutoPlayVideo from './AutoPlayVideo';
import { analyzeSkinType } from "@/ai/flows/analyze-skin-type-flow";
import { Skeleton } from "./ui/skeleton";
import TimeAgo from './TimeAgo';

const getPatientId = (clinicId: string): string => {
  if (typeof window === 'undefined' || !clinicId) {
    return 'server_or_no_clinic_id';
  }
  const masterKey = 'mediCodeConnectProfiles';
  let profiles: Record<string, string> = {};
  try {
    const storedProfiles = localStorage.getItem(masterKey);
    if (storedProfiles) {
      profiles = JSON.parse(storedProfiles);
    }
  } catch (e) {
    console.error("Could not parse patient profiles from localStorage", e);
    profiles = {};
  }
  if (profiles[clinicId]) {
    return profiles[clinicId];
  } else {
    const newPatientId = `patient_${uuidv4()}`;
    profiles[clinicId] = newPatientId;
    try {
      localStorage.setItem(masterKey, JSON.stringify(profiles));
    } catch (e) {
      console.error("Failed to save new patient profile to localStorage", e);
    }
    return newPatientId;
  }
};


// Dynamic Imports for Tools
const BmiCalculatorTool = dynamic(() => import('@/components/tools/BmiCalculatorTool'));
const SkinTypeAnalyzerTool = dynamic(() => import('@/components/tools/SkinTypeAnalyzerTool'));
const IdealBodyWeightCalculatorTool = dynamic(() => import('@/components/tools/IdealBodyWeightCalculatorTool'));
const BasalMetabolicRateCalculatorTool = dynamic(() => import('@/components/tools/BasalMetabolicRateCalculatorTool'));
const TotalDailyEnergyExpenditureTool = dynamic(() => import('@/components/tools/TotalDailyEnergyExpenditureTool'));
const PregnancyDueDateCalculatorTool = dynamic(() => import('@/components/tools/PregnancyDueDateCalculatorTool'));
const OvulationCalculatorTool = dynamic(() => import('@/components/tools/OvulationCalculatorTool'));
const DailyWaterIntakeCalculatorTool = dynamic(() => import('@/components/tools/DailyWaterIntakeCalculatorTool'));
const TargetHeartRateCalculatorTool = dynamic(() => import('@/components/tools/TargetHeartRateCalculatorTool'));
const QuickFirstAidTipsTool = dynamic(() => import('@/components/tools/QuickFirstAidTipsTool'));
const BodyFatPercentageCalculatorTool = dynamic(() => import('@/components/tools/BodyFatPercentageCalculatorTool'));
const SleepCycleCalculatorTool = dynamic(() => import('@/components/tools/SleepCycleCalculatorTool'));
const MacrosCalculatorTool = dynamic(() => import('@/components/tools/MacrosCalculatorTool'));
const MoleChecklistTool = dynamic(() => import('@/components/tools/MoleChecklistTool'));
const StressScreenerTool = dynamic(() => import('@/components/tools/StressScreenerTool'));
const DentalTreatmentComplianceTracker = dynamic(() => import('@/components/challenges/PatientChallengeTracker'));
const PatientChallengeTracker = dynamic(() => import('@/components/challenges/PatientChallengeTracker'));
const HealthMemoryMatch = dynamic(() => import('@/components/games/HealthMemoryMatch'));
const SpinTheWheelGame = dynamic(() => import('@/components/games/SpinTheWheelGame'));


type FilterType = 'all' | 'offer' | 'tip';

const filterOptions: { label: string; value: FilterType; icon: React.ElementType }[] = [
  { label: "All Info", value: "all", icon: ListFilter },
  { label: "Offers", value: "offer", icon: Tag },
  { label: "Info/Tips", value: "tip", icon: Lightbulb },
];

const getIconComponent = (iconType?: ContentItem['type'] | string): React.ElementType => {
  if (!iconType) return DefaultIconLucide;
  switch (iconType) {
    case 'offer': return Tag;
    case 'ad': return Megaphone;
    case 'tip': return Lightbulb;
    default: return DefaultIconLucide;
  }
};
interface ItemInteractions {
  liked: boolean;
}
interface LeadFormData {
    name: string;
    phone: string;
}

const StarRatingDisplay = ({ rating, reviewCount }: { rating: number; reviewCount: number }) => {
  if (reviewCount === 0) {
    return <p className="text-xs text-primary/70 mt-1.5 flex items-center gap-1.5"><StarIcon size={14} /> No reviews yet</p>;
  }
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const roundedUpStar = rating % 1 >= 0.75;
  
  let starElements = [];
  for(let i = 0; i < totalStars; i++) {
    if (i < fullStars) {
      starElements.push(<StarIcon key={`full-${i}`} size={14} className="fill-amber-400 text-amber-500" />);
    } else if (i === fullStars && roundedUpStar) {
       starElements.push(<StarIcon key="round-up" size={14} className="fill-amber-400 text-amber-500" />);
    } else if (i === fullStars && hasHalfStar) {
       starElements.push(<StarIcon key="half" size={14} style={{ clipPath: 'inset(0 50% 0 0)' }} className="fill-amber-400 text-amber-500 absolute" />);
       starElements.push(<StarIcon key="half-bg" size={14} className="text-gray-300" />);
    }
    else {
      starElements.push(<StarIcon key={`empty-${i}`} size={14} className="text-gray-300" />);
    }
  }
  return (
      <div role="button" className="text-xs text-amber-500 mt-1.5 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-0.5 relative">{starElements}</div>
        <span className="font-semibold text-primary/80">{rating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
      </div>
  );
};

const StarRatingInput = ({ rating, hoverRating, setRating, setHoverRating }: { rating: number, hoverRating: number, setRating: (r:number) => void, setHoverRating: (r:number) => void }) => {
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          size={24}
          className={cn("cursor-pointer transition-colors", (hoverRating || rating) > i ? 'text-amber-400' : 'text-gray-300')}
          onClick={() => setRating(i + 1)}
          onMouseEnter={() => setHoverRating(i + 1)}
        />
      ))}
    </div>
  );
};


interface PatientDisplayProps {
    initialClinic: ManagedClinic | null;
    initialContent: ContentItem[];
    initialSponsorships: Sponsorship[];
    initialRewards: Reward[];
    initialAnalytics: ClinicAnalyticsData | null;
    initialReviews: Review[];
}


export default function PatientDisplay({ initialClinic, initialContent, initialSponsorships, initialRewards, initialAnalytics, initialReviews }: PatientDisplayProps) {
  const [contentItems, setContentItems] = useState(initialContent);
  const [sponsorships, setSponsorships] = useState({ tips: initialSponsorships.filter(s => s.adType === 'tip'), featuredBanner: initialSponsorships.find(s => s.adType === 'banner') || null, otherBanners: initialSponsorships.filter(s => s.adType === 'banner').slice(1), sponsoredTools: initialSponsorships.filter(s => s.sponsoredToolId), postInteractionOffers: new Map(initialSponsorships.filter(s => s.adType === 'post_interaction_offer' && s.sponsoredToolId).map(s => [s.sponsoredToolId!, s])) });
  
  const [isClient, setIsClient] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  
  const [itemInteractions, setItemInteractions] = useState<Record<string, ItemInteractions>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [loyaltyStars, setLoyaltyStars] = useState<number>(0);
  
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [currentItemForLead, setCurrentItemForLead] = useState<ContentItem | Sponsorship | AdCampaign | null>(null);
  const [leadFormData, setLeadFormData] = useState<LeadFormData>({ name: '', phone: '' });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [marketplaceRewards, setMarketplaceRewards] = useState<Reward[]>(initialRewards);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [rewardToConfirm, setRewardToConfirm] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [activeRedemption, setActiveRedemption] = useState<RedemptionCode | null>(null);
  
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [appointmentFormData, setAppointmentFormData] = useState({ name: '', phone: '', reason: '' });
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({ name: '', phone: '', selectedService: '' });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [isPatientQrDialogOpen, setIsPatientQrDialogOpen] = useState(false);
  
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [smsPhoneNumber, setSmsPhoneNumber] = useState('');
  const [isSubmittingSms, setIsSubmittingSms] = useState(false);
  const [smsSubscriptionStatus, setSmsSubscriptionStatus] = useState(false);

  const [liveTvChannel, setLiveTvChannel] = useState<LiveTvChannel | null>(null);
  
  const searchParams = useSearchParams();
  const { isSupported, isSubscribed, subscribe, unsubscribe, isSubscribing } = useNotifications(initialClinic?.id || null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', initialClinic?.theme || 'default');
  }, [initialClinic?.theme]);
  
  const getSmsSubStatusKey = () => initialClinic?.id ? `smsSubStatus_${initialClinic.id}` : null;

  useEffect(() => {
    setIsClient(true);
    if(initialClinic?.id) {
        const id = getPatientId(initialClinic.id);
        setPatientId(id);
        const smsStatusKey = getSmsSubStatusKey();
        if (smsStatusKey) {
            setSmsSubscriptionStatus(localStorage.getItem(smsStatusKey) === 'true');
        }
    }
  }, [initialClinic?.id]);
  
  const updateStars = useCallback(() => {
    if(initialClinic?.id) {
        const currentStars = parseInt(localStorage.getItem(`loyaltyStars_${initialClinic.id}`) || '0', 10);
        setLoyaltyStars(currentStars);
    }
  }, [initialClinic?.id]);

  useEffect(() => {
    updateStars();
    window.addEventListener('loyaltyStarsUpdated', updateStars);
    return () => {
        window.removeEventListener('loyaltyStarsUpdated', updateStars);
    };
  }, [updateStars]);

  useEffect(() => {
    async function fetchTvChannelData() {
        if (initialClinic?.liveTvChannelIds && initialClinic.liveTvChannelIds.length > 0) {
            try {
                const channel = await getTvChannel(initialClinic.liveTvChannelIds[0]);
                setLiveTvChannel(channel);
            } catch (err) {
                console.error("Failed to fetch Live TV Channel", err);
            }
        }
    }
    fetchTvChannelData();
  }, [initialClinic?.liveTvChannelIds]);
  
  useEffect(() => {
    if (isClient && initialClinic?.id) {
      const shareIdFromUrl = searchParams.get('shareId');
      if (shareIdFromUrl) {
        incrementShareClickCount(initialClinic.id, shareIdFromUrl);
      } else {
        const scanCountKey = `scanCountIncremented_${initialClinic.id}`;
        if (sessionStorage.getItem(scanCountKey) !== 'true') {
          incrementClinicScanCount(initialClinic.id);
          sessionStorage.setItem(scanCountKey, 'true');
        }
      }
      
      if (initialClinic.loyaltyProgramEnabled) {
        const loyaltyKey = `loyaltyStars_${initialClinic.id}`;
        const lastScanKey = `lastScan_${initialClinic.id}`;
        const today = new Date().toISOString().split('T')[0];
        
        if (localStorage.getItem(lastScanKey) !== today) {
          const currentStars = parseInt(localStorage.getItem(loyaltyKey) || "0", 10);
          localStorage.setItem(loyaltyKey, (currentStars + 1).toString());
          window.dispatchEvent(new CustomEvent('loyaltyStarsUpdated'));
        }
      }
    }
  }, [isClient, initialClinic, searchParams]);
  
    const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleLike = useCallback(async (itemId: string) => {
    if (!initialClinic?.id || !patientId) return;
    const likedKey = `liked_${patientId}_${itemId}`;

    const isCurrentlyLiked = localStorage.getItem(likedKey) === 'true';
    const newLikedState = !isCurrentlyLiked;
    const incrementValue = newLikedState ? 1 : -1;

    setContentItems(prevItems => prevItems.map(item =>
      item.id === itemId ? { ...item, likeCount: (item.likeCount || 0) + incrementValue } : item
    ));
    setItemInteractions(prev => ({ ...prev, [itemId]: { liked: newLikedState }}));
    localStorage.setItem(likedKey, newLikedState.toString());

    try {
      await updateClinicContentItemLikeCount(initialClinic.id, itemId, incrementValue);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update like count.", variant: "destructive" });
      setContentItems(prevItems => prevItems.map(item =>
        item.id === itemId ? { ...item, likeCount: (item.likeCount || 0) - incrementValue } : item
      ));
      setItemInteractions(prev => ({ ...prev, [itemId]: { liked: isCurrentlyLiked }}));
      localStorage.setItem(likedKey, isCurrentlyLiked.toString());
    }
  }, [contentItems, initialClinic?.id, patientId]);
  
  const getUtmParams = () => {
    const utmString = sessionStorage.getItem('utm_params');
    return utmString ? JSON.parse(utmString) : undefined;
  };

  const handleOpenLeadForm = useCallback((item: ContentItem | Sponsorship | AdCampaign) => {
    setCurrentItemForLead(item);
    setLeadFormData({ name: '', phone: '' });
    setIsLeadDialogOpen(true);
  }, []);

  const handleLeadFormSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!initialClinic?.id || !currentItemForLead || !leadFormData.name.trim() || !leadFormData.phone.trim()) {
        toast({ title: "Validation Error", description: "Please fill out all fields.", variant: "destructive" });
        return;
    }
    setIsSubmittingLead(true);
    try {
        const leadData: any = { 
          clinicId: initialClinic.id,
          name: leadFormData.name,
          phone: leadFormData.phone,
          type: 'offer',
          claimedOfferTitle: 'title' in currentItemForLead ? currentItemForLead.title : ('headline' in currentItemForLead ? currentItemForLead.headline : currentItemForLead.adTitle),
          patientId: patientId || undefined,
          utm: getUtmParams(),
        };

        await addLead(leadData);
        toast({ title: "Offer Claimed!", description: "Thank you! The business will be in touch shortly." });
        setIsLeadDialogOpen(false);
    } catch (error: any) {
        toast({ title: "Submission Error", description: (error as Error).message || "Could not claim offer.", variant: "destructive" });
    } finally {
        setIsSubmittingLead(false);
    }
  }, [initialClinic?.id, currentItemForLead, leadFormData, patientId]);

  const filteredClinicContentItems = contentItems.filter(item => {
    const typeFilterMatch = activeFilter === 'all' || item.type === activeFilter;
    const departmentFilterMatch = departmentFilter === 'all' || item.department === departmentFilter || !item.department;
    return typeFilterMatch && departmentFilterMatch;
  });
  
    const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
        toast({ title: "Please select a star rating.", variant: 'destructive' });
        return;
    }
    if (!patientId || !initialClinic?.id) return;
    setIsSubmittingReview(true);
    try {
        await addClinicReview({
            clinicId: initialClinic.id,
            patientId,
            rating: reviewRating,
            text: reviewText,
        });
        toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
        setHasSubmittedReview(true);
    } catch (error: any) {
        toast({ title: "Submission Failed", description: error.message, variant: 'destructive' });
    } finally {
        setIsSubmittingReview(false);
    }
  };
  
    const handleAppointmentSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!initialClinic?.id || !appointmentFormData.name.trim() || !appointmentFormData.phone.trim()) {
        toast({ title: "Validation Error", description: "Please fill out name and phone number.", variant: "destructive" });
        return;
    }
    setIsSubmittingAppointment(true);
    try {
        await addLead({
            clinicId: initialClinic.id,
            name: appointmentFormData.name,
            phone: appointmentFormData.phone,
            type: 'appointment',
            reason: appointmentFormData.reason || 'General Inquiry',
            patientId: patientId || undefined,
            utm: getUtmParams(),
        });
        toast({ title: "Request Sent!", description: "Thank you! The clinic will contact you shortly to confirm your appointment." });
        setIsAppointmentDialogOpen(false);
    } catch (error: any) {
        toast({ title: "Submission Error", description: (error as Error).message, variant: "destructive" });
    } finally {
        setIsSubmittingAppointment(false);
    }
  }, [initialClinic?.id, appointmentFormData, patientId]);
  
  const handleBookingSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!initialClinic?.id || !bookingFormData.name.trim() || !bookingFormData.phone.trim() || !bookingFormData.selectedService) {
        toast({ title: "Validation Error", description: "Please select a service and fill out name and phone.", variant: "destructive" });
        return;
    }
    setIsSubmittingBooking(true);
    try {
        await addLead({
            clinicId: initialClinic.id,
            name: bookingFormData.name,
            phone: bookingFormData.phone,
            type: 'service_booking',
            selectedService: bookingFormData.selectedService,
            patientId: patientId || undefined,
            utm: getUtmParams(),
        });
        toast({ title: "Booking Request Sent!", description: `Thank you! The clinic will contact you regarding your booking for "${bookingFormData.selectedService}".` });
        setIsBookingDialogOpen(false);
    } catch (error: any) {
        toast({ title: "Submission Error", description: (error as Error).message, variant: "destructive" });
    } finally {
        setIsSubmittingBooking(false);
    }
  }, [initialClinic?.id, bookingFormData, patientId]);
  
  const handleRedeemReward = async () => {
    if (!rewardToConfirm || !initialClinic?.id || !patientId) return;

    if (loyaltyStars < rewardToConfirm.starCost) {
      toast({ title: "Not enough stars!", variant: 'destructive' });
      return;
    }

    setIsRedeeming(true);
    try {
        const redemption = await redeemRewardAndGenerateCode(initialClinic.id, patientId, rewardToConfirm);
        setActiveRedemption(redemption);
        
        const loyaltyKey = `loyaltyStars_${initialClinic.id}`;
        const currentStars = parseInt(localStorage.getItem(loyaltyKey) || "0", 10);
        localStorage.setItem(loyaltyKey, (currentStars - rewardToConfirm.starCost).toString());
        window.dispatchEvent(new CustomEvent('loyaltyStarsUpdated'));

        toast({ title: "Reward Redeemed!", description: "Show the redemption code to the partner." });
    } catch (error: any) {
        toast({ title: "Redemption Failed", description: error.message, variant: 'destructive' });
    } finally {
        setIsRedeeming(false);
        setRewardToConfirm(null);
    }
  };

  const handleFetchRewards = useCallback(async () => {
    setIsLoadingRewards(true);
    try {
        const rewards = await getActiveRewards();
        setMarketplaceRewards(rewards);
    } catch(err: any) {
        toast({ title: "Error", description: err.message, variant: 'destructive' });
    } finally {
        setIsLoadingRewards(false);
    }
  }, []);
  
  const handleShare = async () => {
    if (!initialClinic) return;
    const shareId = patientId || uuidv4();
    const shareUrl = `${window.location.origin}/c/${initialClinic.id}?shareId=${shareId}`;

    const shareData = {
      title: `Check out ${initialClinic.clientName}`,
      text: `I found some interesting health info and offers from ${initialClinic.clientName}. Take a look!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await incrementPatientShareCount(initialClinic.id, shareId);
        toast({ title: "Shared successfully!" });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareUrl);
        await incrementPatientShareCount(initialClinic.id, shareId);
        toast({ title: "Link Copied!", description: "Sharing is not supported on this browser, but the link has been copied to your clipboard." });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({ title: "Could not share", description: "An error occurred while trying to share.", variant: "destructive" });
    }
  };


  const handleSmsSubscription = async (subscribeAction: boolean) => {
    const smsStatusKey = getSmsSubStatusKey();
    if (!smsPhoneNumber || !initialClinic?.id || !smsStatusKey) {
        toast({ title: "Phone number is required", variant: 'destructive' });
        return;
    }
    setIsSubmittingSms(true);
    try {
        let result;
        if (subscribeAction) {
            result = await saveSmsSubscription(smsPhoneNumber, initialClinic.id);
        } else {
            result = await removeSmsSubscription(smsPhoneNumber, initialClinic.id);
        }

        if (result.success) {
            toast({ title: "Success!", description: result.message });
            setSmsSubscriptionStatus(subscribeAction);
            localStorage.setItem(smsStatusKey, String(subscribeAction));
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: 'destructive' });
    } finally {
        setIsSubmittingSms(false);
    }
  }


  useEffect(() => {
    if (isMarketplaceOpen) {
        handleFetchRewards();
    }
  }, [isMarketplaceOpen, handleFetchRewards]);
  
   const tickerItems: TickerItem[] = React.useMemo(() => {
    const items: TickerItem[] = [];
    if(initialClinic?.loyaltyProgramEnabled && marketplaceRewards.length > 0) {
        items.push({ text: `Earn stars and redeem rewards like "${marketplaceRewards[0].rewardDescription}"!`, icon: Gift, onClick: () => setIsMarketplaceOpen(true) });
    }
    if (sponsorships.tips.length > 0) {
        items.push(...sponsorships.tips.map(tip => ({ id: `spon-tip-${tip.id}`, text: tip.adTitle, icon: InfoIcon, onClick: () => document.getElementById(`sponsorship-${tip.id}`)?.scrollIntoView({ behavior: 'smooth' }) })));
    }
    return items;
  }, [initialClinic, marketplaceRewards, sponsorships.tips]);


  if (!initialClinic) {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen p-4">
            <Card className="w-full max-w-md shadow-lg border-destructive bg-destructive/10">
              <CardHeader><CardTitle className="text-destructive flex items-center justify-center gap-2"><AlertCircle size={24} /> Clinic Not Found</CardTitle></CardHeader>
              <CardContent>
                <p className="text-destructive-foreground bg-destructive p-3 rounded-md">The clinic associated with this QR code could not be found.</p>
              </CardContent>
            </Card>
        </div>
    );
  }
  
  if (initialClinic.status === 'inactive') {
      return (
         <div className="flex flex-col items-center justify-center w-full min-h-screen p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center">Temporarily Unavailable</CardTitle>
                    <CardDescription className="text-center">This clinic's page is currently not active. Please check back later.</CardDescription>
                </CardHeader>
            </Card>
        </div>
      )
  }

  const renderToolComponent = (toolId: HealthToolId) => {
    const tool = AVAILABLE_HEALTH_TOOLS.find(t => t.id === toolId);
    if (!tool) return null;
    
    const props = {
      clinicId: initialClinic.id,
      patientId: patientId || undefined,
      sponsorship: sponsorships.sponsoredTools.find(s => s.sponsoredToolId === toolId),
      postInteractionOffer: sponsorships.postInteractionOffers.get(toolId),
      onClaimOffer: handleOpenLeadForm,
      usageCount: initialAnalytics?.healthToolUsageCounts?.[toolId] || 0,
    };

    switch (toolId) {
      case HEALTH_TOOL_IDS.BMI_CALCULATOR: return <BmiCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.SKIN_ANALYZER: return <SkinTypeAnalyzerTool {...props} />;
      case HEALTH_TOOL_IDS.IBW_CALCULATOR: return <IdealBodyWeightCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.BMR_CALCULATOR: return <BasalMetabolicRateCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.TDEE_CALCULATOR: return <TotalDailyEnergyExpenditureTool {...props} />;
      case HEALTH_TOOL_IDS.DUE_DATE_CALCULATOR: return <PregnancyDueDateCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.OVULATION_CALCULATOR: return <OvulationCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.WATER_INTAKE_CALCULATOR: return <DailyWaterIntakeCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.TARGET_HEART_RATE_CALCULATOR: return <TargetHeartRateCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.FIRST_AID_TIPS: return <QuickFirstAidTipsTool {...props} />;
      case HEALTH_TOOL_IDS.BODY_FAT_PERCENTAGE_CALCULATOR: return <BodyFatPercentageCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.SLEEP_CYCLE_CALCULATOR: return <SleepCycleCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.MACROS_CALCULATOR: return <MacrosCalculatorTool {...props} />;
      case HEALTH_TOOL_IDS.MOLE_CHECKLIST: return <MoleChecklistTool {...props} />;
      case HEALTH_TOOL_IDS.STRESS_SCREENER: return <StressScreenerTool {...props} />;
      case HEALTH_TOOL_IDS.DENTAL_TREATMENT_TRACKER: return <PatientChallengeTracker {...props} />;
      case HEALTH_TOOL_IDS.HEALTH_MEMORY_GAME: return <HealthMemoryMatch {...props} />;
      case HEALTH_TOOL_IDS.SPIN_THE_WHEEL_GAME: return <SpinTheWheelGame {...props} />;
      default: return null;
    }
  }
  
  const renderContentItemCard = (item: ContentItem) => {
    const IconToRender = getIconComponent(item.type);
    const isExpanded = !!expandedItems[item.id];
    const showReadMore = item.description.length > 150;
    const isLiked = itemInteractions[item.id]?.liked || (isClient && localStorage.getItem(`liked_${patientId}_${item.id}`) === 'true');

    return (
      <div key={item.id} id={`content-${item.id}`} className="bg-card border-b w-full">
         <div className="flex items-center gap-3 p-4">
            <IconToRender size={32} className="text-accent shrink-0" />
            <div>
              <p className="font-semibold text-foreground">{initialClinic.clientName}</p>
              <TimeAgo timestamp={item.createdAt} />
            </div>
          </div>
          
        {item.imageUrls && item.imageUrls.length > 0 && (
           <div className="grid grid-cols-2 gap-2 px-4 mb-2">
            {item.imageUrls.slice(0, 4).map((url, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity">
                    <Image
                        src={url}
                        alt={`${item.title} - image ${index + 1}`}
                        fill={true}
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 150px"
                        className="object-contain"
                        data-ai-hint={item.imageHint || item.type}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-0">
                    <DialogHeader className="p-4 pb-0">
                      <DialogTitle className="line-clamp-1">{item.title}</DialogTitle>
                    </DialogHeader>
                    <div className="relative aspect-video">
                        <Image src={url} alt={item.title || 'Content image'} fill className="object-contain" />
                    </div>
                </DialogContent>
              </Dialog>
            ))}
           </div>
        )}
        
        {item.videoUrl && (
          <div className="relative w-full aspect-video bg-black mb-2">
            <AutoPlayVideo src={item.videoUrl} />
          </div>
        )}

        <div className="px-4 pb-2 text-foreground/90">
            <h3 className="text-lg font-semibold text-primary mb-2">{item.title}</h3>
            <p className={cn("text-base", !isExpanded && "line-clamp-3")}>{item.description}</p>
            {showReadMore && (
                <Button variant="link" size="sm" className="p-0 h-auto text-primary" onClick={() => toggleExpand(item.id)}>
                    {isExpanded ? "Read Less" : "Read More"}
                </Button>
            )}
        </div>
          
        <div className="p-4 flex flex-col items-start gap-3">
            <div className="w-full flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => handleLike(item.id)} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <ThumbsUp className={cn("h-5 w-5", isLiked && "fill-primary text-primary")} /> 
                    <span>{item.likeCount || 0}</span>
                </Button>
                 {item.isClaimable && initialClinic?.leadGenerationEnabled && (
                    <Button onClick={() => handleOpenLeadForm(item)} size="sm" className="bg-green-600 hover:bg-green-700">
                        <UserPlus size={16} className="mr-2" /> Claim Offer
                    </Button>
                )}
            </div>
        </div>
      </div>
    );
  };
  
  const clinicDisplayName = initialClinic?.clientName || "";
  const clinicAddress = initialClinic?.address || "";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinicAddress)}`;
  const patientHistoryData: PatientHistoryDataType = {
      type: 'patient_history',
      clinicId: initialClinic.id,
      patientId: patientId || '',
  };
  const encodedPatientData = isClient ? btoa(JSON.stringify(patientHistoryData)) : '';
  const patientHistoryUrl = isClient ? `${window.location.origin}/validate-history?data=${encodedPatientData}` : '';


  return (
    <div className="w-full max-w-4xl bg-background">
      <div className="bg-card text-card-foreground border-b">
        {initialClinic?.heroImageUrl && (
            <div className="relative w-full aspect-video bg-muted">
                <Image
                    src={initialClinic.heroImageUrl}
                    alt={clinicDisplayName ? `${clinicDisplayName} cover image` : 'Clinic welcome image'}
                    fill={true}
                    sizes="(max-width: 672px) 100vw, 672px"
                    className="object-cover"
                    data-ai-hint="clinic interior"
                    priority={true}
                />
            </div>
        )}
        <div className="p-4">
          <CardTitle className="text-2xl sm:text-3xl font-headline font-semibold text-primary flex items-center gap-2">
            <>{clinicDisplayName}</>
          </CardTitle>
          <CardDescription className="text-foreground/80 mt-1">Exclusive health offers, announcements, and information powered by MediCode Connect.</CardDescription>
            {clinicAddress && (
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground mt-2 flex items-start gap-2 hover:text-primary hover:underline">
                <MapPin size={16} className="shrink-0 mt-0.5" /> {clinicAddress}
              </a>
            )}
            {initialClinic?.phoneNumber && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Phone size={14} className="shrink-0" />
                <a href={`tel:${initialClinic.phoneNumber}`} className="hover:underline">{initialClinic.phoneNumber}</a>
              </p>
            )}
            {initialAnalytics && (
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <div role="button" className="inline-block">
                      <StarRatingDisplay rating={initialAnalytics.averageRating || 0} reviewCount={initialAnalytics.reviewCount || 0} />
                    </div>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reviews for {clinicDisplayName}</DialogTitle>
                    <DialogDescription>See what other patients are saying.</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-4 pr-6">
                      {initialReviews.length > 0 ? (
                        initialReviews.map(review => (
                          <div key={review.id} className="border-b pb-2">
                            <StarRatingDisplay rating={review.rating} reviewCount={0} />
                            {review.text && <p className="text-sm mt-2 text-foreground">"{review.text}"</p>}
                            <p className="text-xs text-muted-foreground mt-1">Reviewed {review.createdAt ? formatDistanceToNow(new Date(review.createdAt), {addSuffix: true}) : 'recently'}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">No reviews yet. Be the first!</p>
                      )}
                    </div>
                  </ScrollArea>
                   <div className="mt-4 border-t pt-4">
                      {hasSubmittedReview ? (
                        <p className="text-green-600 font-semibold text-center">Thanks for your feedback!</p>
                      ) : (
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <Label>Your Rating</Label>
                                <StarRatingInput rating={reviewRating} hoverRating={reviewHoverRating} setRating={setReviewRating} setHoverRating={setReviewHoverRating} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="review-text">Your Review (Optional)</Label>
                                <Textarea id="review-text" value={reviewText} onChange={e => setReviewText(e.target.value)} />
                            </div>
                            <Button type="submit" disabled={isSubmittingReview || reviewRating === 0}>
                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                            </Button>
                        </form>
                      )}
                   </div>
                </DialogContent>
              </Dialog>
            )}
             {initialAnalytics && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1.5"><Eye size={14}/> {initialAnalytics.scanCount.toLocaleString()} scans</span>
              </div>
            )}
        </div>
        
        <InformationTicker items={tickerItems} />

        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {initialClinic.loyaltyProgramEnabled && (
                <Dialog open={isMarketplaceOpen} onOpenChange={setIsMarketplaceOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex-col h-16">
                            <span className="text-lg font-bold text-amber-500 flex items-center gap-1">{loyaltyStars} <StarIcon size={16} className="fill-amber-400" /></span>
                            <span className="text-xs">Loyalty Stars</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reward Marketplace</DialogTitle>
                            <DialogDescription>Use your stars to redeem rewards from our partners. Your balance: {loyaltyStars} stars.</DialogDescription>
                        </DialogHeader>
                        <div className="max-h-80 overflow-y-auto space-y-2 p-1">
                            {isLoadingRewards ? <p>Loading rewards...</p> : marketplaceRewards.map(reward => (
                                <Card key={reward.id} className="flex items-center p-3">
                                    <div className="flex-grow">
                                        <p className="font-semibold">{reward.rewardDescription}</p>
                                        <p className="text-sm text-muted-foreground">from {reward.partnerName}</p>
                                    </div>
                                    <Button onClick={() => setRewardToConfirm(reward)} disabled={loyaltyStars < reward.starCost} className="ml-4 shrink-0">
                                        <StarIcon size={14} className="mr-2"/> {reward.starCost}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {initialClinic.leadGenerationEnabled && (
                <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline"><CalendarCheck size={16}/>Book Appointment</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Request an Appointment</DialogTitle>
                            <DialogDescription>Fill out your details and the clinic will contact you to confirm.</DialogDescription>
                        </DialogHeader>
                         <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                            <div className="space-y-1"><Label htmlFor="apt-name">Full Name</Label><Input id="apt-name" value={appointmentFormData.name} onChange={e => setAppointmentFormData(p => ({ ...p, name: e.target.value }))} required /></div>
                            <div className="space-y-1"><Label htmlFor="apt-phone">Phone Number</Label><Input id="apt-phone" type="tel" value={appointmentFormData.phone} onChange={e => setAppointmentFormData(p => ({ ...p, phone: e.target.value }))} required /></div>
                            <div className="space-y-1"><Label htmlFor="apt-reason">Reason for Visit (Optional)</Label><Input id="apt-reason" value={appointmentFormData.reason} onChange={e => setAppointmentFormData(p => ({ ...p, reason: e.target.value }))} /></div>
                            <DialogFooter><Button type="submit" disabled={isSubmittingAppointment}>{isSubmittingAppointment ? "Sending..." : "Send Request"}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
            {initialClinic.leadGenerationEnabled && initialClinic.serviceOfferings && initialClinic.serviceOfferings.length > 0 && (
                <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                    <DialogTrigger asChild><Button variant="outline"><ClipboardCheck size={16}/>Book a Service</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Book a Specific Service</DialogTitle>
                            <DialogDescription>Select a service and provide your details to request a booking.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="service-select">Service</Label>
                                <Select onValueChange={value => setBookingFormData(p => ({...p, selectedService: value}))} required><SelectTrigger id="service-select"><SelectValue placeholder="Select a service..." /></SelectTrigger><SelectContent>{initialClinic.serviceOfferings?.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                            </div>
                            <div className="space-y-1"><Label htmlFor="book-name">Full Name</Label><Input id="book-name" value={bookingFormData.name} onChange={e => setBookingFormData(p => ({ ...p, name: e.target.value }))} required /></div>
                            <div className="space-y-1"><Label htmlFor="book-phone">Phone Number</Label><Input id="book-phone" type="tel" value={bookingFormData.phone} onChange={e => setBookingFormData(p => ({ ...p, phone: e.target.value }))} required /></div>
                            <DialogFooter><Button type="submit" disabled={isSubmittingBooking}>{isSubmittingBooking ? "Sending..." : "Request Booking"}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
             <Button variant="outline" className="flex items-center gap-2" onClick={handleShare}>
                <Share2 size={16} /> Share
            </Button>
            <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Bell size={16} /> Subscribe
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Notifications</DialogTitle>
                        <DialogDescription>Stay updated with the latest from {clinicDisplayName}.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-2">
                        {isSupported && (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <h4 className="font-semibold">Push Notifications</h4>
                                    <p className="text-sm text-muted-foreground">Get updates directly on your device.</p>
                                </div>
                                <Button onClick={isSubscribed ? unsubscribe : subscribe} disabled={isSubscribing}>
                                    {isSubscribing ? 'Updating...' : (isSubscribed ? 'Unsubscribe' : 'Subscribe')}
                                </Button>
                            </div>
                        )}
                        <div className="p-3 border rounded-lg space-y-3">
                            <h4 className="font-semibold">SMS Alerts</h4>
                            <p className="text-sm text-muted-foreground">Get updates via text message.</p>
                            <div className="space-y-2">
                                <Label htmlFor="sms-phone">Phone Number (with country code)</Label>
                                <Input 
                                    id="sms-phone" 
                                    type="tel" 
                                    placeholder="+919876543210" 
                                    value={smsPhoneNumber}
                                    onChange={(e) => setSmsPhoneNumber(e.target.value)}
                                    disabled={isSubmittingSms}
                                />
                                <Button 
                                    onClick={() => handleSmsSubscription(!smsSubscriptionStatus)}
                                    disabled={isSubmittingSms || !smsPhoneNumber}
                                    className="w-full"
                                >
                                    {isSubmittingSms ? 'Updating...' : (smsSubscriptionStatus ? 'Unsubscribe from SMS' : 'Subscribe to SMS')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
        
        {liveTvChannel && liveTvChannel.playlist.length > 0 && (
            <div className="w-full aspect-video bg-black">
                <AutoPlayVideo playlist={liveTvChannel.playlist} />
            </div>
        )}

        <div className="p-4 bg-card border-y sticky top-0 z-10">
          <div className="flex flex-wrap gap-2 justify-center">
            {filterOptions.map(option => {
              const FilterIcon = option.icon;
              return <Button key={option.value} variant={activeFilter === option.value ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter(option.value)} className="flex items-center gap-2"><FilterIcon size={16} />{option.label}</Button>;
            })}
            {initialClinic?.departments && initialClinic.departments.length > 0 && (
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="h-9 w-full sm:w-auto text-sm">
                        <div className="flex items-center gap-2">
                          <Building size={16} /> <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {initialClinic.departments.map(dep => (
                            <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
          </div>
        </div>
        <div className="w-full">
            {sponsorships.featuredBanner && <SponsorshipCard ad={sponsorships.featuredBanner} onClaimOffer={handleOpenLeadForm} />}
            {filteredClinicContentItems.map(item => renderContentItemCard(item))}
            
            <div className="p-4 bg-muted/30">
                 {initialClinic.enabledTools && initialClinic.enabledTools.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-center text-primary">Health Tools & Games</h2>
                      {initialClinic.enabledTools.map(toolId => (
                          <div key={toolId}>
                              {renderToolComponent(toolId)}
                          </div>
                      ))}
                    </div>
                 )}
            </div>
        </div>
      </div>
      <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Claim Offer: {currentItemForLead && 'title' in currentItemForLead ? currentItemForLead.title : (currentItemForLead && 'adTitle' in currentItemForLead ? currentItemForLead.adTitle : "")}</DialogTitle>
                <DialogDescription>Please provide your details below. The business will contact you shortly.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLeadFormSubmit} className="space-y-4">
                <div className="space-y-1"><Label htmlFor="name">Full Name</Label><Input id="name" value={leadFormData.name} onChange={e => setLeadFormData(p => ({ ...p, name: e.target.value }))} required /></div>
                <div className="space-y-1"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={leadFormData.phone} onChange={e => setLeadFormData(p => ({ ...p, phone: e.target.value }))} required /></div>
                <DialogFooter><Button type="submit" disabled={isSubmittingLead}>{isSubmittingLead ? "Submitting..." : "Submit Claim"}</Button></DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!rewardToConfirm} onOpenChange={() => !isRedeeming && setRewardToConfirm(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Confirm Redemption</AlertDialogTitle><AlertDialogDescription>This will spend {rewardToConfirm?.starCost} stars. This cannot be undone. Are you sure?</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRedeemReward} disabled={isRedeeming}>{isRedeeming ? "Processing..." : "Yes, Redeem"}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!activeRedemption} onOpenChange={() => setActiveRedemption(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-green-600">Reward Redeemed!</DialogTitle><DialogDescription>Show this code to the partner to claim your reward.</DialogDescription></DialogHeader>
            <div className="text-center p-4 my-4 bg-muted rounded-lg">
                <p className="font-bold text-2xl tracking-widest text-primary">{activeRedemption?.code}</p>
                <p className="text-sm mt-2">{activeRedemption?.rewardDescription} from {activeRedemption?.partnerName}</p>
            </div>
            <DialogFooter><Button onClick={() => setActiveRedemption(null)}>Close</Button></DialogFooter>
          </DialogContent>
      </Dialog>
       <footer className="w-full mt-6 pt-4 border-t border-border/50 text-center text-xs text-muted-foreground space-y-3 p-4 bg-card">
          <Card className="w-full max-w-md mx-auto text-left my-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search size={22} /> ClinDex™</CardTitle>
              <CardDescription>
                The Smart QR Search Engine. Find any clinic QR by name, service, or city.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/search" method="GET" className="flex gap-2">
                <Input name="q" placeholder="Enter clinic name, service, or city..." required minLength={2} />
                <Button type="submit">Search</Button>
              </form>
            </CardContent>
          </Card>

          <Separator className="!my-4" />

           <div>
            <p>Important: Information provided via this service is not a substitute for professional medical advice.
              <Link href="/disclaimer" className="text-primary hover:underline ml-1">Read full disclaimer.</Link>
            </p>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2 items-center justify-center">
              <Dialog open={isPatientQrDialogOpen} onOpenChange={setIsPatientQrDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/5 hover:text-primary">
                        <Fingerprint className="mr-2 h-4 w-4" />
                        My ClinTrax™ ID
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Your ClinTrax™ ID</DialogTitle>
                        <DialogDescription>
                            This QR code represents your anonymous interaction history with {clinicDisplayName}. The clinic can scan this to validate your treatment progress or challenge completions.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center p-4 bg-white rounded-md">
                        <QRCode value={patientHistoryUrl} size={200} level="M" />
                    </div>
                </DialogContent>
              </Dialog>
              <p className="text-xs text-muted-foreground mt-1.5">For business inquiries call +91 98451 80066</p>
          </div>

          <p className="font-medium px-4">
              Unauthorized reproduction or imitation of any platform features or workflows is strictly prohibited and may invite legal action.
          </p>

          <Separator className="!my-4" />
          
          <p>Powered by <strong className="font-semibold text-primary">MediCode Connect™</strong></p>
          <p>&copy; {new Date().getFullYear()} InaraPro MediCode Pvt Ltd. All rights reserved.</p>
        </footer>
    </div>
  );
}
