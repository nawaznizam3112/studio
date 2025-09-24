
'use client';
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createChallenge } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating...' : 'Create Campaign'}
        </Button>
    )
}

interface CreateChallengeFormProps {
    businessId: string;
    onChallengeCreated: () => void;
}

export function CreateChallengeForm({ businessId, onChallengeCreated }: CreateChallengeFormProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    async function handleAction(formData: FormData) {
        formData.append('businessId', businessId);
        const result = await createChallenge(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset();
            onChallengeCreated();
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
                <CardTitle>New Lucky Draw Campaign</CardTitle>
                <CardDescription>Create a new lucky draw to engage your patients.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Campaign Title</Label>
                        <Input name="title" id="title" placeholder="e.g., Monthly Wellness Draw" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea name="description" id="description" placeholder="e.g., Pay for any service this month to enter!" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="reward">Prize</Label>
                        <Input name="reward" id="reward" placeholder="e.g., Free laser session" required />
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
