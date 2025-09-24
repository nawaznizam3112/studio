
'use client';
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createNudge } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Service {
    id: string;
    name: string;
}

interface CreateNudgeFormProps {
    businessId: string;
    services: Service[];
    onNudgeCreated: () => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating...' : 'Create Nudge'}
        </Button>
    )
}

export function CreateNudgeForm({ businessId, services, onNudgeCreated }: CreateNudgeFormProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    async function handleAction(formData: FormData) {
        formData.append('businessId', businessId);
        const result = await createNudge(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset();
            onNudgeCreated();
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
                <CardTitle>New Nudge</CardTitle>
                <CardDescription>Create a predictive upsell recommendation.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="triggerService">Trigger Service</Label>
                        <Select name="triggerService" required>
                            <SelectTrigger id="triggerService">
                                <SelectValue placeholder="Select a service..." />
                            </SelectTrigger>
                            <SelectContent>
                                {services.length > 0 ? (
                                    services.map(service => (
                                        <SelectItem key={service.id} value={service.name}>{service.name}</SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="-" disabled>Create a service first</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">When a customer selects this service, the nudge will appear.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recommendationText">Recommendation Text</Label>
                        <Textarea name="recommendationText" id="recommendationText" placeholder="e.g., We recommend adding a conditioning treatment..." required rows={3} />
                        <p className="text-xs text-muted-foreground">This text will be shown to the customer.</p>
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}

    