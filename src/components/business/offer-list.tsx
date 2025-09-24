
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Trash2, IndianRupee, Video, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteOffer } from "@/app/actions";
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
import Link from "next/link";

interface Offer {
    id: string;
    title: string;
    description: string;
    pointsRequired: number;
    promoLinkUrl?: string;
    introVideoUrl?: string;
    promoVideoUrl?: string;
}

interface OfferListProps {
    offers: Offer[];
    onOfferDeleted: () => void;
}

export function OfferList({ offers, onOfferDeleted }: OfferListProps) {
    const { toast } = useToast();

    const handleDelete = async (offerId: string) => {
        const result = await deleteOffer(offerId);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            onOfferDeleted();
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Offers</CardTitle>
                <CardDescription>A list of offers you've created for customers.</CardDescription>
            </CardHeader>
            <CardContent>
                {offers && offers.length > 0 ? (
                    <ul className="space-y-4">
                        {offers.map(offer => (
                            <li key={offer.id} className="flex items-start gap-4 rounded-md border p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                                    <Gift className="h-5 w-5 text-accent-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{offer.title}</p>
                                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                                    <div className="mt-1 flex items-center text-xs font-medium text-primary">
                                        <IndianRupee className="mr-1 h-3 w-3" />
                                        <span>Price: ₹{offer.pointsRequired}</span>
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        {offer.promoLinkUrl && (
                                            <Button asChild variant="link" size="sm" className="p-0 h-auto text-xs">
                                                <Link href={offer.promoLinkUrl} target="_blank" rel="noopener noreferrer">
                                                    <LinkIcon className="h-3 w-3 mr-1"/> Promo Link
                                                </Link>
                                            </Button>
                                        )}
                                        {offer.introVideoUrl && (
                                            <Button asChild variant="link" size="sm" className="p-0 h-auto text-xs">
                                                <Link href={offer.introVideoUrl} target="_blank" rel="noopener noreferrer">
                                                    <Video className="h-3 w-3 mr-1"/> Intro Video
                                                </Link>
                                            </Button>
                                        )}
                                         {offer.promoVideoUrl && (
                                            <Button asChild variant="link" size="sm" className="p-0 h-auto text-xs">
                                                <Link href={offer.promoVideoUrl} target="_blank" rel="noopener noreferrer">
                                                    <Video className="h-3 w-3 mr-1"/> Promo Video
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
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
                                            <AlertDialogDescription>This will permanently delete the offer.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(offer.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No offers created yet.</p>
                )}
            </CardContent>
        </Card>
    )
}
