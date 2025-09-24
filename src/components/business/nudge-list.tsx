
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteNudge } from "@/app/actions";
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

interface Nudge {
    id: string;
    triggerService: string;
    recommendationText: string;
}

interface NudgeListProps {
    nudges: Nudge[];
    businessId: string;
    onNudgeDeleted: () => void;
}

export function NudgeList({ nudges, businessId, onNudgeDeleted }: NudgeListProps) {
    const { toast } = useToast();

    const handleDelete = async (nudgeId: string) => {
        const result = await deleteNudge(nudgeId, businessId);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            onNudgeDeleted();
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Nudges</CardTitle>
                <CardDescription>A list of your smart recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
                {nudges && nudges.length > 0 ? (
                    <ul className="space-y-4">
                        {nudges.map(nudge => (
                            <li key={nudge.id} className="flex items-start gap-4 rounded-md border p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                                    <Lightbulb className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">When customer selects:</p>
                                    <p className="font-semibold flex items-center gap-2">{nudge.triggerService} <ArrowRight className="h-4 w-4" /></p>
                                    <p className="text-xs text-muted-foreground mt-2">Show this recommendation:</p>
                                    <p className="font-medium text-primary/90">"{nudge.recommendationText}"</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete this nudge.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(nudge.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No nudges created yet.</p>
                )}
            </CardContent>
        </Card>
    )
}

    