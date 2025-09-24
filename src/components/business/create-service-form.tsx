
'use client';
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createService } from "@/app/actions";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Adding...' : 'Add Service'}
        </Button>
    )
}

interface CreateServiceFormProps {
    businessId: string;
    onServiceCreated: () => void;
}

export function CreateServiceForm({ businessId, onServiceCreated }: CreateServiceFormProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    async function handleAction(formData: FormData) {
        formData.append('businessId', businessId);
        const result = await createService(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset();
            onServiceCreated();
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
                <CardTitle>New Service</CardTitle>
                <CardDescription>Add a new service to your business offerings.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Service Name</Label>
                        <Input name="name" id="name" placeholder="e.g., Haircut" required />
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
