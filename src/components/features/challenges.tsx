
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, ExternalLink, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllActiveCampaigns } from "@/app/actions";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { format } from "date-fns";


interface Campaign {
  id: string;
  title: string;
  description: string;
  reward: string;
  businessName: string;
  businessId: string;
  expiresAt: string;
}

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      const { campaigns: fetchedCampaigns, error: fetchError } = await getAllActiveCampaigns();
      if (fetchError) {
        setError(fetchError);
      } else {
        setCampaigns(fetchedCampaigns || []);
      }
      setLoading(false);
    }
    fetchCampaigns();
  }, []);

  const renderLoading = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gamified Campaigns</CardTitle>
        <CardDescription>Complete campaigns from various businesses to unlock rewards.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? renderLoading() : error ? (
          <p className="text-destructive text-center">{error}</p>
        ) : campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const expiresDate = new Date(campaign.expiresAt);
              return (
               <Dialog key={campaign.id}>
                <div className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="font-medium">{campaign.title}</p>
                        <p className="text-xs text-muted-foreground">
                            From{' '}
                            <Link href={`/business/${campaign.businessId}`} className="font-semibold text-primary hover:underline">
                                {campaign.businessName}
                                <ExternalLink className="inline-block ml-1 h-3 w-3" />
                            </Link>
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{campaign.description}</p>
                        <p className="text-xs font-medium text-accent-foreground">Reward: {campaign.reward}</p>
                        <div className="flex items-center text-xs text-muted-foreground pt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>Expires on {format(expiresDate, 'MMM d, yyyy')}</span>
                        </div>
                    </div>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="mt-2 sm:mt-0">View Campaign</Button>
                    </DialogTrigger>
                </div>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                           <Trophy className="h-5 w-5 text-primary" /> {campaign.title}
                        </DialogTitle>
                        <DialogDescription>
                            Complete this campaign from <span className="font-semibold text-primary">{campaign.businessName}</span> to earn a reward.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <h3 className="font-semibold">Description</h3>
                        <p className="text-muted-foreground">{campaign.description}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold">Reward</h3>
                        <p className="text-muted-foreground">{campaign.reward}</p>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground pt-2">
                        <Clock className="mr-1.5 h-4 w-4" />
                        <span>Expires on {format(expiresDate, 'MMM d, yyyy')}</span>
                    </div>
                </DialogContent>
               </Dialog>
            )})}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No active campaigns right now. Check back soon!</p>
        )}
      </CardContent>
    </Card>
  );
}
