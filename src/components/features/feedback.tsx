

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, DollarSign, Building, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { getServiceHistory, submitFeedback } from '@/app/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { useSession } from '@/hooks/use-session.tsx';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface VisitedBusiness {
    id: string;
    name: string;
}

export function Feedback() {
  const { session } = useSession();
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [visitedBusinesses, setVisitedBusinesses] = useState<VisitedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchHistory() {
        if (!session?.userId) {
          setLoading(false);
          return;
        }
        const { history } = await getServiceHistory(session.userId);
        const uniqueBusinesses = history.reduce((acc, visit) => {
            if (!acc.some((b: VisitedBusiness) => b.id === visit.businessId)) {
                acc.push({ id: visit.businessId, name: visit.businessName });
            }
            return acc;
        }, [] as VisitedBusiness[]);
        setVisitedBusinesses(uniqueBusinesses);
        setLoading(false);
    }
    fetchHistory();
  }, [session]);

  const handleFeedbackSubmit = async () => {
    if (!selectedBusiness) {
      toast({ title: "Error", description: "Please select a business.", variant: 'destructive' });
      return;
    }
    if (rating === 0) {
      toast({ title: "Error", description: "Please provide a rating.", variant: 'destructive' });
      return;
    }
    if (!session?.userId) {
      toast({ title: "Error", description: "You must be logged in to submit feedback.", variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    const feedbackData: any = {
        userId: session.userId,
        businessId: selectedBusiness,
        rating,
        tip,
        comment,
    };
    
    const result = await submitFeedback(feedbackData);
    setIsSubmitting(false);

    if (result.success) {
      toast({
          title: "Feedback Submitted!",
          description: "Thank you for your valuable feedback.",
      });
      setRating(0);
      setTip(0);
      setComment("");
      setSelectedBusiness(null);
    } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
    }
  };
  
  const renderLoading = () => (
    <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-8" />)}
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-16" />)}
        </div>
        <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Feedback</CardTitle>
        <CardDescription>Rate a business you visited and optionally leave a tip.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? renderLoading() : (
            visitedBusinesses.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                    Visit a business to leave feedback.
                </p>
            ) : (
                <>
                    <div>
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Building className="h-4 w-4" />
                            Select Business
                        </h3>
                         <Select onValueChange={setSelectedBusiness} value={selectedBusiness || undefined} disabled={isSubmitting}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a business..." />
                            </SelectTrigger>
                            <SelectContent>
                                {visitedBusinesses.map(business => (
                                    <SelectItem key={business.id} value={business.id}>
                                        {business.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className={!selectedBusiness ? 'opacity-50 pointer-events-none' : ''}>
                        <div>
                          <h3 className="mb-2 text-sm font-medium">Your Rating</h3>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} onClick={() => setRating(star)} aria-label={`Rate ${star} out of 5 stars`} disabled={isSubmitting}>
                                <Star
                                  className={cn(
                                    "h-8 w-8 cursor-pointer transition-colors",
                                    rating >= star ? "text-primary fill-primary" : "text-muted-foreground/50"
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                            <h3 className="mb-2 text-sm font-medium">Leave a comment (optional)</h3>
                            <Textarea 
                                placeholder="Tell us more about your experience..." 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={isSubmitting}
                             />
                        </div>
                         
                        <div>
                          <h3 className="mb-2 text-sm font-medium">Digital Tip Jar (optional)</h3>
                          <div className="flex gap-2">
                            {[5, 10, 15].map((amount) => (
                              <Button key={amount} variant={tip === amount ? 'default' : 'outline'} onClick={() => setTip(amount)} disabled={isSubmitting}>
                                <IndianRupee className="mr-1 h-3 w-3" /> {amount}
                              </Button>
                            ))}
                          </div>
                        </div>
                    </div>
                    <Button className="w-full" onClick={handleFeedbackSubmit} disabled={!selectedBusiness || rating === 0 || isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </>
            )
        )}
      </CardContent>
    </Card>
  );
}
