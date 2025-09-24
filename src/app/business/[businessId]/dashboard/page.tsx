

'use client';

import { getBusinessCustomerHistory, getBusinessById, getCampaignsForBusiness, getServicesForBusiness } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { DashboardClient } from "@/components/business/dashboard-client";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";


function DashboardSkeleton() {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
                <Skeleton className="h-6 w-32 sm:w-48" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                    <div>
                        <Skeleton className="h-8 w-48 sm:w-64 mb-2" />
                        <Skeleton className="h-4 w-64 sm:w-96" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </main>
        </div>
    );
}

function ErrorDisplay({ error }: { error: string }) {
    const router = useRouter();
    return (
         <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Business Dashboard</h1>
            <Button variant="outline" onClick={() => router.push('/login')}><LogOut className="mr-2" /> Logout</Button>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-destructive">An Error Occurred</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                    <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
                </CardContent>
            </Card>
            </main>
      </div>
    )
}

export default function BusinessDashboardPage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
        if (!businessId) {
            // This check prevents fetching when businessId is not yet available.
            return;
        }

        try {
            const [businessResult, historyResult, campaignsResult, servicesResult] = await Promise.all([
                getBusinessById(businessId),
                getBusinessCustomerHistory(businessId),
                getCampaignsForBusiness(businessId),
                getServicesForBusiness(businessId),
            ]);

            if (businessResult.error || !businessResult.business) {
                throw new Error(businessResult.error || "Could not load business information.");
            }

            setData({
                business: businessResult.business,
                initialHistory: historyResult.history || [],
                initialCampaigns: campaignsResult.campaigns || [],
                initialServices: servicesResult.services || [],
                // Pass empty arrays for removed features
                initialOffers: [],
                initialQuizzes: [],
                initialStories: [],
                initialNudges: [],
                initialProducts: [],
            });
        } catch(e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    fetchData();
  }, [businessId]);


  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return <ErrorDisplay error={error || "Could not load business information."} />
  }

  // Pass all fetched data as props to the client component
  return (
    <DashboardClient 
      business={data.business}
      initialHistory={data.initialHistory}
      initialCampaigns={data.initialCampaigns}
      initialOffers={data.initialOffers}
      initialServices={data.initialServices}
      initialQuizzes={data.initialQuizzes}
      initialStories={data.initialStories}
      initialNudges={data.initialNudges}
      initialProducts={data.initialProducts}
    />
  );
}
