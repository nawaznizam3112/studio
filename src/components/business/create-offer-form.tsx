
'use client';
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createOffer } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating...' : 'Create Bookable Offer'}
        </Button>
    )
}

interface CreateOfferFormProps {
    businessId: string;
    onOfferCreated: () => void;
}

export function CreateOfferForm({ businessId, onOfferCreated }: CreateOfferFormProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    async function handleAction(formData: FormData) {
        formData.append('businessId', businessId);
        const result = await createOffer(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset();
            onOfferCreated();
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: 'destructive',
            });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Bookable Offer</CardTitle>
                <CardDescription>Post an ad or a discounted consultation that customers can book.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Offer Title</Label>
                        <Input name="title" id="title" placeholder="e.g., Discounted Dental Consultation" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea name="description" id="description" placeholder="Describe the offer or ad..." required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pointsRequired">Offer Price (₹)</Label>
                        <Input name="pointsRequired" id="pointsRequired" type="number" placeholder="e.g., 499" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="promoLinkUrl">External Link (Optional)</Label>
                        <Input name="promoLinkUrl" id="promoLinkUrl" type="url" placeholder="https://example.com/your-page" />
                         <p className="text-xs text-muted-foreground">Link to a payment page or more details.</p>
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
