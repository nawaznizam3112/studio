import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { winners } from "@/lib/data";
import { Button } from "../ui/button";
import Link from "next/link";
import { Trophy } from "lucide-react";

export function RecentWinnersList() {
    const recentWinners = winners.slice(0, 4);

    return (
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Recent Winners</CardTitle>
                    <CardDescription>From your past campaigns</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/winners">View All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentWinners.map((winner) => (
                        <div key={winner.id} className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={winner.avatar} data-ai-hint={winner.avatarHint} />
                                <AvatarFallback>{winner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                                <p className="font-semibold">{winner.name}</p>
                                <p className="text-sm text-muted-foreground">{winner.campaignName}</p>
                            </div>
                            <Trophy className="h-5 w-5 text-yellow-500" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
