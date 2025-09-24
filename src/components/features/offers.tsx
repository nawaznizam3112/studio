
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift, Clock, IndianRupee, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllActiveOffers, redeemOffer } from "@/app/actions";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useSession } from "@/hooks/use-session.tsx";
import { useToast } from "@/hooks/use-toast";
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
import { format } from "date-fns";
import Link from "next/link";

interface Offer {
  id: string;
  title: string;
  description: string;
  businessName: string;
  businessId: string;
  pointsRequired: number; // This field now represents price
  expiresAt: string;
}

export function Offers() {
  const { session } = useSession();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchOffers() {
      setLoading(true);
      const { offers: fetchedOffers, error: fetchError } = await getAllActiveOffers();
      if (fetchError) {
        setError(fetchError);
      } else {
        const sortedOffers = (fetchedOffers || []).sort((a, b) => a.pointsRequired - b.pointsRequired);
        setOffers(sortedOffers);
      }
      setLoading(false);
    }
    fetchOffers();
  }, []);

  const handleBooking = async (offer: Offer) => {
    if (!session?.userId) {
        toast({ title: "Not logged in", description: "Please log in to book an offer.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    const result = await redeemOffer({
        userId: session.userId,
        offerId: offer.id,
        businessId: offer.businessId,
        title: offer.title,
        price: offer.pointsRequired,
    });
    setIsSubmitting(false);

    if (result.success) {
        toast({
            title: "Booking Successful!",
            description: `Your interest in "${offer.title}" has been sent to ${offer.businessName}. They will contact you shortly.`,
        });
    } else {
        toast({
            title: "Booking Failed",
            description: result.error,
            variant: 'destructive',
        });
    }
  }

  const renderLoading = () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4 mt-1" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Special Offers & Consultations</CardTitle>
        <CardDescription>Book discounted services and special offers from our partner clinics.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? renderLoading() : error ? (
          <p className="text-destructive text-center">{error}</p>
        ) : offers.length > 0 ? (
          <div className="space-y-4">
            {offers.map((offer) => {
              const expiresDate = new Date(offer.expiresAt);

              return (
                <div key={offer.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{offer.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      From{' '}
                        <Link href={`/business/${offer.businessId}`} className="font-semibold text-primary hover:underline">
                            {offer.businessName}
                            <ExternalLink className="inline-block ml-1 h-3 w-3" />
                        </Link>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center text-sm font-bold text-primary">
                            <IndianRupee className="mr-1 h-4 w-4" />
                            <span>{offer.pointsRequired}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>Expires on {format(expiresDate, 'MMM d, yyyy')}</span>
                        </div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" disabled={isSubmitting}>
                        Book Now
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will notify <span className="font-bold">{offer.businessName}</span> of your interest in "{offer.title}". They will contact you to schedule and arrange payment. Are you sure you want to proceed?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBooking(offer)} disabled={isSubmitting}>
                          {isSubmitting ? 'Submitting...' : 'Yes, Book Now'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No special offers available at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
}
