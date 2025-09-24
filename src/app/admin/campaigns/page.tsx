
'use client';

import { useEffect, useState } from "react";
import { getAllCampaigns, getBusinesses } from "@/app/actions";
import { CreateCampaignForm } from "@/components/business/create-campaign-form";
import { CampaignList } from "@/components/business/campaign-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function CampaignsPageSkeleton() {
    return (
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-20 w-full" />
                        </div>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-24" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                           <Skeleton key={i} className="h-24 w-full rounded-md" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function AdminCampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [campaignsResult, businessesResult] = await Promise.all([
                getAllCampaigns(),
                getBusinesses()
            ]);

            if (campaignsResult.error) throw new Error(campaignsResult.error);
            setCampaigns(campaignsResult.campaigns || []);

            if (businessesResult.error) throw new Error(businessesResult.error);
            setBusinesses(businessesResult.businesses || []);
            // Set default selected business if not already set
            if (!selectedBusiness && businessesResult.businesses && businessesResult.businesses.length > 0) {
                setSelectedBusiness(businessesResult.businesses[0].id);
            }

        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = () => {
        // Refetch campaigns after an action
        fetchData();
    };
    
    if (loading) {
        return <CampaignsPageSkeleton />;
    }

    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manage Campaigns</h1>
                <p className="text-muted-foreground">Create and manage lucky draw campaigns for all businesses.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Lucky Draw Campaign</CardTitle>
                            <CardDescription>Create a new lucky draw to engage patients.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-2 mb-4">
                                <Label htmlFor="business-select">Assign to Business</Label>
                                <Select onValueChange={setSelectedBusiness} value={selectedBusiness}>
                                    <SelectTrigger id="business-select">
                                        <SelectValue placeholder="Select a business..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {businesses.map(b => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedBusiness ? (
                                <CreateCampaignForm 
                                    businessId={selectedBusiness} 
                                    onCampaignCreated={handleAction} 
                                />
                            ) : (
                                <p className="text-center text-sm text-muted-foreground pt-4">Please select a business to create a campaign.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <CampaignList campaigns={campaigns} onAction={handleAction} />
                </div>
            </div>
        </div>
    );
}

