
'use client';
import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createStory } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating...' : 'Create Story'}
        </Button>
    )
}

interface CreateStoryFormProps {
    businessId: string;
    onStoryCreated: () => void;
}

export function CreateStoryForm({ businessId, onStoryCreated }: CreateStoryFormProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    async function handleAction(formData: FormData) {
        formData.append('businessId', businessId);
        const result = await createStory(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset();
            onStoryCreated();
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
                <CardTitle>New Story</CardTitle>
                <CardDescription>Share a success story or health tip.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Story Title</Label>
                        <Input name="title" id="title" placeholder="e.g., How We Helped Mr. A" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea name="content" id="content" placeholder="Write the story here..." required rows={5} />
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
