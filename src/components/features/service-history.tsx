

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Scissors, Stethoscope, HandHeart, Link as LinkIcon, ExternalLink, IndianRupee, CheckCircle, Hourglass, AlertCircle, HelpCircleIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

interface Service {
    type: string; // This will be the industry name
    service: string;
    date: string;
    businessName: string;
    businessId: string;
    details?: string;
    promoLinkUrl?: string;
    status?: string;
    expense?: {
        amount: number;
        mode: string;
    }
}

interface ServiceHistoryProps {
    serviceHistory: any[];
}


const industryIcons: { [key: string]: React.ReactNode } = {
    'Salon': <Scissors className="mr-2 h-4 w-4" />,
    'Gym': <Dumbbell className="mr-2 h-4 w-4" />,
    'Wellness': <HandHeart className="mr-2 h-4 w-4" />,
    'Physician Clinic': <Stethoscope className="mr-2 h-4 w-4" />
    // Add more mappings as new industries are created
};

const getIconForIndustry = (industry: string) => {
    return industryIcons[industry] || <Dumbbell className="mr-2 h-4 w-4" />; // Default icon
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


export function ServiceHistory({ serviceHistory }: ServiceHistoryProps) {

    const groupedHistory = serviceHistory.reduce((acc, item) => {
        const { type } = item;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(item);
        return acc;
    }, {} as Record<string, Service[]>);

    const industryTabs = Object.keys(groupedHistory);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personalized History</CardTitle>
                <CardDescription>Keep track of your past services and workouts.</CardDescription>
            </CardHeader>
            <CardContent>
                {industryTabs.length > 0 ? (
                    <Tabs defaultValue={industryTabs[0]}>
                        <ScrollArea className="w-full whitespace-nowrap rounded-md">
                            <TabsList className="inline-flex">
                                {industryTabs.map(industry => (
                                    <TabsTrigger key={industry} value={industry}>
                                        {getIconForIndustry(industry)}
                                        {industry}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                        {industryTabs.map(industry => (
                            <TabsContent key={industry} value={industry} className="mt-4">
                                <ul className="space-y-4">
                                    {groupedHistory[industry].map((item, index) => (
                                        <li key={index} className="rounded-md bg-secondary/50 p-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium">{item.service}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        at{' '}
                                                        <Link href={`/business/${item.businessId}`} className="font-semibold text-primary hover:underline">
                                                            {item.businessName}
                                                            <ExternalLink className="inline-block ml-1 h-3 w-3" />
                                                        </Link>
                                                    </p>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{item.date}</p>
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                                {item.status && getStatusBadge(item.status)}
                                                {item.expense && (
                                                    <Badge variant="outline" className="flex items-center">
                                                        <IndianRupee className="mr-1 h-3 w-3" />
                                                        {item.expense.amount.toFixed(2)} ({item.expense.mode})
                                                    </Badge>
                                                )}
                                            </div>
                                            {item.promoLinkUrl && (
                                                <div className="mt-2">
                                                    <Button asChild variant="link" className="p-0 h-auto text-xs">
                                                        <Link href={item.promoLinkUrl} target="_blank" rel="noopener noreferrer">
                                                            <LinkIcon className="mr-1 h-3 w-3" />
                                                            Visit Website
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No service history found. Go scan a QR code!</p>
                )}
            </CardContent>
        </Card>
    );
}
