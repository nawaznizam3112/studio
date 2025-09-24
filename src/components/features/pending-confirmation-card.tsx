
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, X, IndianRupee, Clock } from "lucide-react";
import { confirmOrDisputeVisit } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-session.tsx";

interface Visit {
    id: string;
    businessName: string;
    service: string;
    notes?: string;
    expense: {
        amount: number;
        mode: string;
    };
    date: string;
}

interface PendingConfirmationCardProps {
    visit: Visit;
    onAction: () => void;
}

export function PendingConfirmationCard({ visit, onAction }: PendingConfirmationCardProps) {
    const { session } = useSession();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAction = async (action: 'confirm' | 'dispute') => {
        if (!session?.userId) {
            toast({ variant: 'destructive', title: "Error", description: "You must be logged in." });
            return;
        }

        setIsSubmitting(true);
        const result = await confirmOrDisputeVisit({
            visitId: visit.id,
            userId: session.userId,
            action,
        });

        if (result.success) {
            toast({
                title: action === 'confirm' ? "Expense Confirmed!" : "Visit Disputed",
                description: result.message,
            });
            onAction(); // Trigger a refresh on the parent component
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.error });
        }
        setIsSubmitting(false);
    };

    return (
        <Card className="border-yellow-500 bg-yellow-50/50 animate-in fade-in-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-5 w-5" />
                    Action Required
                </CardTitle>
                <CardDescription>
                    Please confirm the details of your recent visit.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border bg-background p-4 space-y-3">
                    <div>
                        <p className="text-sm font-semibold">{visit.businessName}</p>
                        <p className="text-xs text-muted-foreground">{visit.service}</p>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total Bill:</span>
                        <span className="flex items-center"><IndianRupee className="h-5 w-5" />{visit.expense.amount.toFixed(2)}</span>
                    </div>
                     {visit.notes && <p className="text-sm text-muted-foreground italic">Notes: "{visit.notes}"</p>}
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1.5 h-3 w-3" />
                        <span>On: {visit.date}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => handleAction('dispute')} disabled={isSubmitting}>
                        <X className="mr-2 h-4 w-4" /> Dispute
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('confirm')} disabled={isSubmitting}>
                        <Check className="mr-2 h-4 w-4" /> Confirm
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

