
'use client';

import { useEffect, useState } from "react";
import { getAllLeads } from "@/app/actions";
import { LeadList } from "@/components/business/lead-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function LeadsPageSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const leadsResult = await getAllLeads();
            if (leadsResult.error) throw new Error(leadsResult.error);
            setLeads(leadsResult.leads || []);
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = () => {
        fetchData();
    };
    
    if (loading) {
        return <LeadsPageSkeleton />;
    }

    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manage Leads</h1>
                <p className="text-muted-foreground">View and qualify all incoming leads from prize draw campaigns.</p>
            </div>
            <LeadList leads={leads} onAction={handleAction} />
        </div>
    );
}
