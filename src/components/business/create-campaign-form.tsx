
'use client';
import { useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createCampaign, getServicesForBusiness } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating...' : 'Create Campaign'}
        </Button>
    )
}

interface CreateCampaignFormProps {
    businessId: string;
    onCampaignCreated: () => void;
}

export function CreateCampaignForm({ businessId, onCampaignCreated }: CreateCampaignFormProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [services, setServices] = useState<{id: string, name: string}[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    
    useEffect(() => {
        if (!businessId) return;

        async function fetchServices() {
            setLoadingServices(true);
            const result = await getServicesForBusiness(businessId);
            if (result.services) {
                setServices(result.services);
            } else {
                console.error("Failed to fetch services for campaign form");
            }
            setLoadingServices(false);
        }
        
        fetchServices();
    }, [businessId]);


    async function handleAction(formData: FormData) {
        formData.append('businessId', businessId);
        const result = await createCampaign(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset();
            onCampaignCreated();
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: 'destructive',
            });
        }
    }

    return (
        <form ref={formRef} action={handleAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input name="title" id="title" placeholder="e.g., Monthly Wellness Draw" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" id="description" placeholder="e.g., Enter to win a free consultation!" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="reward">Prize</Label>
                <Input name="reward" id="reward" placeholder="e.g., Free laser session" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="associatedService">Associated Service (for Lead Gen)</Label>
                <Select name="associatedService">
                    <SelectTrigger id="associatedService" disabled={loadingServices}>
                        <SelectValue placeholder={loadingServices ? "Loading services..." : "Select a service..."} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None (For existing customers)</SelectItem>
                        {services.map(service => (
                            <SelectItem key={service.id} value={service.name}>{service.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select a service to attract new leads for it.</p>
            </div>
            <SubmitButton />
        </form>
    );
}
