

'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Trash2, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteChallenge, runLuckyDraw } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from "../ui/badge";
import { useState } from "react";

interface Challenge {
    id: string;
    title: string;
    description: string;
    reward: string;
    status: 'active' | 'completed';
    winnerName?: string;
    businessId: string;
}

interface ChallengeListProps {
    challenges: Challenge[];
    onAction: () => void; // Generic callback for any action that requires a refresh
}

export function ChallengeList({ challenges, onAction }: ChallengeListProps) {
    const { toast } = useToast();
    const [isDrawing, setIsDrawing] = useState<string | null>(null);

    const handleDelete = async (challengeId: string) => {
        const result = await deleteChallenge(challengeId);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            onAction();
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
    }

    const handleRunDraw = async (challenge: Challenge) => {
        setIsDrawing(challenge.id);
        const result = await runLuckyDraw(challenge.id, challenge.businessId);
        if (result.success) {
            toast({ 
                title: "We have a winner!", 
                description: `${result.winnerName} has won the "${challenge.title}" campaign.`
            });
            onAction();
        } else {
            toast({ title: "Draw Error", description: result.error, variant: 'destructive' });
        }
        setIsDrawing(null);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Lucky Draw Campaigns</CardTitle>
                <CardDescription>A list of your active and completed campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
                {challenges && challenges.length > 0 ? (
                    <ul className="space-y-4">
                        {challenges.map(challenge => (
                            <li key={challenge.id} className="flex items-start gap-4 rounded-md border p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                                    <Trophy className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <p className="font-semibold">{challenge.title}</p>
                                        <Badge variant={challenge.status === 'completed' ? 'secondary' : 'default'}>{challenge.status}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                                    <p className="text-xs text-primary font-medium">Prize: {challenge.reward}</p>
                                    
                                    {challenge.status === 'completed' && challenge.winnerName ? (
                                        <div className="mt-2 flex items-center gap-2 rounded-md bg-green-100 p-2 text-green-800">
                                            <PartyPopper className="h-5 w-5 flex-shrink-0" />
                                            <p className="text-sm font-semibold">Winner: {challenge.winnerName}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-3 flex gap-2">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" disabled={isDrawing === challenge.id}>
                                                        {isDrawing === challenge.id ? 'Running Draw...' : 'Run Draw'}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Run Lucky Draw?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will randomly select a winner from all verified entries and conclude the campaign. This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRunDraw(challenge)}>
                                                            Yes, run the draw
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the campaign.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(challenge.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No campaigns created yet.</p>
                )}
            </CardContent>
        </Card>
    )
}
