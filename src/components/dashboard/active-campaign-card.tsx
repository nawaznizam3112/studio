import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { campaigns } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function ActiveCampaignCard() {
    const activeCampaign = campaigns.find(c => c.status === 'active');

    if (!activeCampaign) {
        return (
            <Card className="flex flex-col items-center justify-center h-full text-center p-6 shadow-md">
                <CardHeader>
                    <CardTitle className="font-headline">No Active Campaigns</CardTitle>
                    <CardDescription>Launch a new campaign to engage your patients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/campaigns">Create Campaign</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    // Calculate progress
    const startDate = new Date(activeCampaign.startDate);
    const endDate = new Date(activeCampaign.endDate);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedTime = new Date().getTime() - startDate.getTime();
    const progress = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100));

    return (
        <Card className="shadow-md h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline">Active Campaign</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="relative aspect-video mb-4 rounded-md overflow-hidden">
                    <Image src={activeCampaign.image} alt={activeCampaign.name} layout="fill" objectFit="cover" data-ai-hint={activeCampaign.imageHint} />
                </div>
                <h3 className="font-semibold text-lg">{activeCampaign.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{activeCampaign.entries} entries so far</p>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{activeCampaign.startDate}</span>
                    <span>{activeCampaign.endDate}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href={`/campaigns`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
