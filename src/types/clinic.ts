

import type { LucideIcon } from 'lucide-react';
import type { AnalyzeSkinTypeOutput } from '@/ai/flows/analyze-skin-type-flow';

export const HEALTH_TOOL_IDS = {
  BMI_CALCULATOR: "bmiCalculator",
  SKIN_ANALYZER: "skinAnalyzer",
  IBW_CALCULATOR: "ibwCalculator",
  BMR_CALCULATOR: "bmrCalculator",
  TDEE_CALCULATOR: "tdeeCalculator",
  DUE_DATE_CALCULATOR: "dueDateCalculator",
  OVULATION_CALCULATOR: "ovulationCalculator",
  WATER_INTAKE_CALCULATOR: "waterIntakeCalculator",
  TARGET_HEART_RATE_CALCULATOR: "targetHeartRateCalculator",
  FIRST_AID_TIPS: "firstAidTips",
  BODY_FAT_PERCENTAGE_CALCULATOR: "bodyFatPercentageCalculator",
  SLEEP_CYCLE_CALCULATOR: "sleepCycleCalculator",
  MACROS_CALCULATOR: "macrosCalculator",
  HEALTH_MEMORY_GAME: "healthMemoryGame",
  SPIN_THE_WHEEL_GAME: "spinTheWheelGame",
  MOLE_CHECKLIST: "moleChecklist",
  STRESS_SCREENER: "stressScreener",
  DENTAL_TREATMENT_TRACKER: "dentalTreatmentTracker",
} as const;

export type HealthToolId = typeof HEALTH_TOOL_IDS[keyof typeof HEALTH_TOOL_IDS];

export const AVAILABLE_HEALTH_TOOLS: { id: HealthToolId; name: string; description: string }[] = [
  { id: HEALTH_TOOL_IDS.BMI_CALCULATOR, name: "BMI Calculator", description: "Calculate Body Mass Index." },
  { id: HEALTH_TOOL_IDS.IBW_CALCULATOR, name: "Ideal Body Weight Calculator", description: "Estimate ideal body weight." },
  { id: HEALTH_TOOL_IDS.BMR_CALCULATOR, name: "Basal Metabolic Rate (BMR) Calculator", description: "Estimate calories burned at rest." },
  { id: HEALTH_TOOL_IDS.TDEE_CALCULATOR, name: "Total Daily Energy Expenditure (TDEE)", description: "Estimate total daily calorie needs." },
  { id: HEALTH_TOOL_IDS.BODY_FAT_PERCENTAGE_CALCULATOR, name: "Body Fat % Estimator", description: "Estimate body fat percentage (YMCA)." },
  { id: HEALTH_TOOL_IDS.WATER_INTAKE_CALCULATOR, name: "Daily Water Intake Calculator", description: "Estimate daily water needs." },
  { id: HEALTH_TOOL_IDS.TARGET_HEART_RATE_CALCULATOR, name: "Target Heart Rate Calculator", description: "Estimate exercise heart rate zones." },
  { id: HEALTH_TOOL_IDS.SLEEP_CYCLE_CALCULATOR, name: "Sleep Cycle Calculator", description: "Calculate optimal bedtimes for better sleep." },
  { id: HEALTH_TOOL_IDS.DUE_DATE_CALCULATOR, name: "Pregnancy Due Date Calculator", description: "Estimate pregnancy due date." },
  { id: HEALTH_TOOL_IDS.OVULATION_CALCULATOR, name: "Ovulation Calculator", description: "Estimate fertile window." },
  { id: HEALTH_TOOL_IDS.MACROS_CALCULATOR, name: "Simple Macros Calculator", description: "Estimate daily macronutrients (P/C/F)." },
  { id: HEALTH_TOOL_IDS.FIRST_AID_TIPS, name: "Quick First Aid Tips", description: "Basic guidance for minor incidents." },
  { id: HEALTH_TOOL_IDS.DENTAL_TREATMENT_TRACKER, name: "Dental Treatment Tracker", description: "Track progress for multi-visit treatments." },
  { id: HEALTH_TOOL_IDS.MOLE_CHECKLIST, name: "Mole Concerning Checklist", description: "Educational ABCDE mole self-check." },
  { id: HEALTH_TOOL_IDS.STRESS_SCREENER, name: "Stress & Anxiety Screener", description: "A confidential self-assessment quiz." },
  { id: HEALTH_TOOL_IDS.HEALTH_MEMORY_GAME, name: "Health Memory Game", description: "A fun card matching game." },
  { id: HEALTH_TOOL_IDS.SPIN_THE_WHEEL_GAME, name: "Spin the Wheel Game", description: "An interactive prize wheel." },
  { id: HEALTH_TOOL_IDS.SKIN_ANALYZER, name: "AI Skin Type Analyzer", description: "Get a basic skin type analysis." },
];

export type Theme = 'default' | 'festive' | 'health-day' | 'environmental';

export const AVAILABLE_THEMES: { id: Theme; name: string }[] = [
    { id: 'default', name: 'Default Green' },
    { id: 'festive', name: 'Festive (Red & Gold)' },
    { id: 'health-day', name: 'Health Day (Blue & White)' },
    { id: 'environmental', name: 'Earthy Tones' },
];

export interface ContentItem {
  id: string;
  type: 'offer' | 'ad' | 'tip' | 'partner_offer';
  title: string;
  description: string;
  department?: string;
  imageUrls?: string[] | null;
  imageHint?: string | null;
  videoUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  isClaimable?: boolean;
  likeCount?: number;
  shareCount?: number;
  icon?: 'offer' | 'ad' | 'tip' | string;
  createdAt?: string | null;
  updatedAt?: string | null;
  expiresAt?: string | null;
  campaignId?: string | null;
  isReferral?: boolean;
  referralDetails?: {
    recipientClinicId: string;
    recipientClinicName: string;
    recipientClinicPhone?: string | null;
  };
  isFeatured?: boolean;
}

export interface MedicodeCentralPost extends ContentItem {
    originalClinicId: string;
    originalClinicName: string;
    originalContentId: string;
}

export interface AddContentItemFormValues {
  type: 'offer' | 'ad' | 'tip';
  title: string;
  description: string;
  department?: string;
  imageUrls?: string[];
  imageHint?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  ctaText?: string;
  ctaLink?: string;
  isClaimable?: boolean;
  expiresAt?: string;
  campaignId?: string;
  isReferral?: boolean;
  referralDetails?: {
    recipientClinicId: string;
    recipientClinicName: string;
    recipientClinicPhone?: string | null;
  };
  isFeatured?: boolean;
}

export interface ClinicAnalyticsData {
  clinicId: string;
  clinicName?: string;
  scanCount: number;
  firstScanAt: string | null;
  lastScanAt: string | null;
  adminUid?: string;
  subscriptionStatus?: 'active' | 'pending_payment' | 'inactive';
  subscriptionTier?: string;
  subscribedAt?: string | null;
  profileCreatedAt?: string | null;
  healthToolUsageCounts?: Record<HealthToolId, number>;
  shareCounts?: Record<string, number>;
  averageRating?: number;
  reviewCount?: number;
  subscriberCount?: number;
  lastContentNotificationSentAt?: string | null;
}

export interface RegionalAnalytics {
    city: string;
    activeClinics: number;
    totalScans: number;
    toolInteractions: number;
    leadsGenerated: number;
    engagementScore: number;
}


export interface ManagedClinic {
  id: string; // Firestore document ID
  clinicId: string; // Unique Clinic Identifier (UUID)
  clientName: string;
  ownerName?: string;
  ownerUid?: string | null; // UID of the Firebase user who owns this clinic
  locationCity?: string;
  address?: string | null;
  specialty?: string; // Legacy field, will be superseded by departments
  departments?: string[]; // New field for multiple specialties/departments
  phoneNumber?: string;
  heroImageUrl?: string | null;
  status: 'active' | 'inactive';
  addedAt?: string | null;
  lastStatusChangeAt?: string | null;
  isUpdating?: boolean;
  scanCount?: number;
  lastScanAt?: string | null;
  enabledTools?: HealthToolId[];
  loyaltyProgramEnabled?: boolean;
  referralProgramEnabled?: boolean;
  referralsNeededForReward?: number;
  referralRewardDescription?: string;
  aiContentGenerationEnabled?: boolean;
  leadGenerationEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  theme?: Theme;
  healthToolUsageCounts?: Record<HealthToolId, number>;
  searchKeywords?: string[];
  serviceOfferings?: string[];
  webhookUrl?: string | null;
  isSearchEngineIndexed?: boolean;
  liveTvChannelIds?: string[];
  subscriptionStatus?: 'active' | 'inactive' | 'pending_payment';
  razorpayPlanId?: string | null;
  razorpaySubscriptionId?: string | null;
}

export interface AddManagedClinicData {
  clientName: string;
  ownerName?: string;
  locationCity?: string;
  address?: string;
  specialty?: string; // Legacy field
  departments?: string[]; // New field for multiple specialties
  phoneNumber?: string;
  heroImageUrl?: string | null;
  status: 'active' | 'inactive';
  enabledTools?: HealthToolId[];
  loyaltyProgramEnabled?: boolean;
  referralProgramEnabled?: boolean;
  referralsNeededForReward?: number;
  referralRewardDescription?: string;
  aiContentGenerationEnabled?: boolean;
  leadGenerationEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  theme?: Theme;
  serviceOfferings?: string[];
  webhookUrl?: string | null;
  isSearchEngineIndexed?: boolean;
  liveTvChannelIds?: string[];
}

export interface AddLeadData {
  clinicId: string; // This will be the RECIPIENT's clinic ID
  name: string;
  phone: string;
  type: 'offer' | 'appointment' | 'service_booking' | 'sponsored_offer';
  claimedOfferTitle?: string;
  reason?: string;
  selectedService?: string;
  referringClinicId?: string;
  referringClinicName?: string;
  patientId?: string;
  utm?: Record<string, string>;
  sponsorId?: string;
  sponsorName?: string;
  sponsorPhoneNumber?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  type: 'offer' | 'appointment' | 'service_booking' | 'sponsored_offer';
  claimedOfferTitle?: string;
  reason?: string;
  selectedService?: string;
  claimedAt: string | null;
  referringClinicId?: string;
  referringClinicName?: string;
  patientId?: string;
  utm?: Record<string, string>;
  sponsorId?: string;
  sponsorName?: string;
}

export interface ScanDataType {
  clinicId: string;
}

export interface PatientHistoryDataType {
  type: 'patient_history';
  clinicId: string;
  patientId: string;
}

// ---- Sponsorship Types ----
export type AdType = 'banner' | 'tip' | 'tool_sponsorship' | 'post_interaction_offer';

export interface Sponsorship {
  id: string;
  sponsorName: string;
  adType: AdType;
  adTitle: string;
  adText: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  ctaText: string;
  ctaLink: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string | null;
  viewCount?: number;
  clickCount?: number;
  sponsoredToolId?: HealthToolId | null;
  isClaimable?: boolean;
  sponsorPhoneNumber?: string | null;
}

export interface AddSponsorshipData {
  sponsorName: string;
  adType: AdType;
  adTitle: string;
  adText: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  ctaText: string;
  ctaLink: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sponsoredToolId?: HealthToolId | null;
  isClaimable?: boolean;
  sponsorPhoneNumber?: string | null;
}

// ---- Self-Serve Ad Platform Types ----
export type AdTier = 'tier1_top_banner' | 'tier2_in_feed' | 'tier3_footer';

export interface AdCampaign {
  id: string;
  clinicId: string;
  clinicName: string;
  headline: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  tier: AdTier;
  status: 'draft' | 'pending_payment' | 'active' | 'paused' | 'ended' | 'exhausted';
  createdAt: string | null;
  startDate?: string | null;
  endDate?: string | null;
  viewCount: number;
  clickCount: number;
  razorpayOrderId?: string;
  targetRegions: string[];
  lastShownAt?: string | null;
}

export interface AddAdCampaignData {
  clinicId: string;
  clinicName: string;
  headline: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  tier: AdTier;
  durationDays: number;
  targetRegions: string[];
}


// Props for health tool components
export interface HealthToolProps {
  clinicId?: string;
  patientId?: string;
  usageCount?: number;
  sponsorship?: Sponsorship;
  postInteractionOffer?: Sponsorship;
  onClaimOffer?: (sponsorship: Sponsorship | ContentItem | AdCampaign) => void;
}

export type { AnalyzeSkinTypeOutput };

export interface AddReviewData {
  clinicId: string;
  rating: number;
  text?: string;
  patientId: string;
}

export interface Review {
  id: string;
  rating: number;
  text?: string;
  createdAt: string | null;
  patientId?: string;
}

export interface TreatmentTrackerState {
  activePlanKey: string | null;
  completedSteps: number[];
  starsEarned: number;
  nextAppointmentDate: string | null;
  shareCount?: number;
  rewardClaims?: number;
}


// ---- Campaign Types ----
export interface ContentTemplate {
  id: string; // Temporary client-side ID
  type: 'offer' | 'ad' | 'tip';
  title: string;
  description: string;
  imageHint: string;
  videoUrl: string;
  ctaText: string;
  ctaLink: string;
  isClaimable: boolean;
  expiresInDays?: number; // e.g., Offer expires 30 days after deployment
}

export interface Campaign {
  id: string; // Firestore document ID
  name: string;
  description: string;
  createdAt: string | null;
  contentTemplates: Omit<ContentTemplate, 'id'>[];
}

export interface AddCampaignData {
  name: string;
  description: string;
  contentTemplates: Omit<ContentTemplate, 'id'>[];
}

export interface DeployCampaignData {
    campaignId: string;
    clientIds: string[];
}



// ---- Reward Marketplace Types ----
export interface Reward {
  id: string;
  partnerName: string;
  rewardDescription: string;
  starCost: number;
  isActive: boolean;
  createdAt: string | null;
  partnerPhoneNumber?: string | null;
}

export interface AddRewardData {
  partnerName: string;
  rewardDescription: string;
  starCost: number;
  isActive: boolean;
  partnerPhoneNumber?: string | null;
}

export interface RedemptionCode {
  id: string;
  code: string;
  clinicId: string;
  patientId: string;
  rewardId: string;
  rewardDescription: string;
  partnerName: string;
  starCost: number;
  redeemedAt: string; // ISO string
  partnerPhoneNumber?: string | null;
}


// ---- Search Types ----
export interface ClinicSearchResult {
  id: string;
  clientName: string;
  locationCity: string | null;
  specialty: string | null; // This can now show the first department
  scanCount: number;
  reviewCount: number;
  phoneNumber: string | null;
}

// ---- ClinTrax Types ----
export interface PatientInteraction {
  type: 'lead' | 'challenge';
  text: string;
  timestamp: string | null;
}

// ---- Health Challenge Types ----
export interface HealthChallenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  starReward: number;
  isActive: boolean;
  createdAt: string | null;
}

export interface AddHealthChallengeData {
  title: string;
  description: string;
  durationDays: number;
  starReward: number;
  isActive: boolean;
}

export interface PatientChallengeState {
  challengeId: string;
  challengeTitle: string;
  startDate: string; // ISO String
  durationDays: number;
  completedDays: number;
  isCompleted: boolean;
  lastCheckinDate?: string | null;
}

// ---- Live TV Types ----
export interface LiveTvVideo {
  id: string; // uuid
  title: string;
  url: string; // YouTube embed URL, etc.
  thumbnailUrl?: string;
  durationSeconds?: number;
}

export interface LiveTvChannel {
  id: string; // Firestore document ID
  name: string;
  playlist: LiveTvVideo[];
  createdAt: string | null;
}

export interface AddLiveTvChannelData {
  name: string;
  playlist: LiveTvVideo[];
}

// ---- Chatbot types ----
export type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string; // ISO string
};

export type ChatSession = {
  id: string;
  clinicId: string;
  patientId: string;
  messages: ChatMessage[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isResolved: boolean;
};

// ---- Google Places Search Types ----
export interface PlaceSearchResult {
  place_id: string;
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  city?: string;
}

// ---- YouTube Service Types ----
export interface YouTubeVideoDetails {
  title: string;
  durationSeconds: number;
  thumbnailUrl: string;
}

// ---- Subscription Types ----
export interface SubscriptionPlan {
    id: string; // Our Firestore ID
    name: string;
    description: string;
    price: number; // in lowest denomination (e.g., paisa for INR)
    currency: 'INR';
    razorpayPlanId: string;
    features: string[];
    isActive: boolean;
    createdAt: string | null;
}

export interface AddSubscriptionPlanData {
    name: string;
    description: string;
    price: number;
    currency: 'INR';
    razorpayPlanId: string;
    features: string[];
    isActive: boolean;
}
