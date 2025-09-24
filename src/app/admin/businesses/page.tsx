
'use client';

import { getBusinesses, getIndustries } from "@/app/actions";
import { BusinessList, Business } from "@/components/admin/business-list";
import { RegisterBusinessForm } from "@/components/admin/register-business-form";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface Industry {
    id: string;
    name: string;
}

function BusinessesPageSkeleton() {
    return (
        <div className="space-y-8">
            {/* Skeleton for Register Form */}
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="p-6 border rounded-lg">
                    <div className="grid gap-6 md:grid-cols-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Skeleton for Business List */}
            <div className="p-6 border rounded-lg">
                 <div className="space-y-2 mb-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


export default function BusinessesPage() {
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchAllData = useCallback(async () => {
        // No need to set loading to true here on refetch to avoid flicker
        setError(null);
        try {
            const [industryResult, businessResult] = await Promise.all([
                getIndustries(),
                getBusinesses()
            ]);

            if (industryResult.error) {
                throw new Error(industryResult.error);
            }
            setIndustries(industryResult.industries || []);

            if (businessResult.error) {
                throw new Error(businessResult.error);
            }
            setBusinesses(businessResult.businesses || []);
        } catch (e: any) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        async function loadInitialData() {
            setLoading(true);
            await fetchAllData();
            setLoading(false);
        }
        loadInitialData();
    }, [fetchAllData]);

    const handleAction = () => {
      // Instead of re-fetching all data, just revalidate the page.
      // Next.js will re-run the server component and update the data.
      // For a client component, we still need a state update.
      // A simple page refresh works well here too.
      router.refresh();
      // To ensure state is also updated for any potential client-side filtering in future
      fetchAllData();
    };


    if (loading) {
        return <BusinessesPageSkeleton />
    }

    if (error) {
        return <div>Error: {error}</div>
    }
    
    return (
        <div className="space-y-8">
            <RegisterBusinessForm industries={industries || []} onBusinessRegistered={handleAction} />
            <BusinessList businesses={businesses || []} industries={industries || []} onAction={handleAction} />
        </div>
    );
}
