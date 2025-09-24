
'use client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Award, Medal, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session.tsx";
import { cn } from "@/lib/utils";

interface LoyaltyData {
  points: number;
}

const tiers = [
  { name: 'Bronze', pointsRequired: 0, reward: 'Basic member benefits', icon: <Medal className="h-6 w-6" /> },
  { name: 'Silver', pointsRequired: 100, reward: '15% off coupon', icon: <Award className="h-6 w-6" /> },
  { name: 'Gold', pointsRequired: 500, reward: 'Free spa treatment', icon: <Trophy className="h-6 w-6" /> },
];

const getTierForPoints = (points: number) => {
  let currentTier = tiers[0];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (points >= tiers[i].pointsRequired) {
      currentTier = tiers[i];
      break;
    }
  }
  return currentTier;
};

const getNextTier = (points: number) => {
    const currentTier = getTierForPoints(points);
    const currentTierIndex = tiers.findIndex(t => t.name === currentTier.name);
    if (currentTierIndex < tiers.length - 1) {
        return tiers[currentTierIndex + 1];
    }
    return null; // Max tier reached
}

export function LoyaltyCard() {
  const { session } = useSession();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLoyaltyData() {
      if (!session?.userId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "loyalty", session.userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as LoyaltyData;
          setLoyaltyData(data);
        } else {
          // If no data, set a default state
          setLoyaltyData({ points: 0 });
        }
      } catch (error) {
        console.error("Error fetching loyalty data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLoyaltyData();
  }, [session]);
  
  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-4 w-full" />
                 <div className="flex justify-between items-center gap-4 pt-4">
                    <Skeleton className="h-16 w-1/3" />
                    <Skeleton className="h-16 w-1/3" />
                    <Skeleton className="h-16 w-1/3" />
                 </div>
            </CardContent>
        </Card>
    )
  }

  if (!loyaltyData) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loyalty Rewards</CardTitle>
                <CardDescription>Start visiting businesses to earn points!</CardDescription>
            </CardHeader>
             <CardContent>
                <div className="text-center text-muted-foreground">
                    No loyalty data found.
                </div>
            </CardContent>
        </Card>
    )
  }

  const { points } = loyaltyData;
  const currentTier = getTierForPoints(points);
  const nextTier = getNextTier(points);

  const progress = nextTier ? ((points - currentTier.pointsRequired) / (nextTier.pointsRequired - currentTier.pointsRequired)) * 100 : 100;
  const progressText = nextTier ? `${points} / ${nextTier.pointsRequired} points` : `${points} points`;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>Loyalty Rewards</CardTitle>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Star className="h-4 w-4" />
                <span>{points} Stars</span>
            </div>
        </div>
        <CardDescription>Earn points with every visit to level up and unlock better rewards.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <p>Your progress to <span className="font-semibold text-foreground">{nextTier ? nextTier.name : 'Max Tier'}</span></p>
                <p className="font-medium text-foreground">{progressText}</p>
            </div>
            <Progress value={progress} aria-label={`${progress.toFixed(0)}% to next tier`} />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
            {tiers.map(tier => {
                const isAchieved = points >= tier.pointsRequired;
                const isCurrent = tier.name === currentTier.name;

                return (
                    <div key={tier.name} className={cn("rounded-lg border p-4 transition-all", isCurrent ? "border-primary shadow-lg scale-105" : "opacity-60", isAchieved && !isCurrent && "opacity-90")}>
                        <div className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-2", isAchieved ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                            {tier.icon}
                        </div>
                        <h3 className="font-semibold">{tier.name}</h3>
                        <p className="text-xs text-muted-foreground">{tier.pointsRequired} points</p>
                        <p className="text-xs font-medium mt-1">{tier.reward}</p>
                    </div>
                );
            })}
        </div>
      </CardContent>
      <CardFooter>
          <p className="text-xs text-muted-foreground">
            Rewards are for demonstration purposes only and cannot be redeemed.
          </p>
      </CardFooter>
    </Card>
  );
}
