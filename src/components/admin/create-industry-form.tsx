
'use client';

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createIndustry } from "@/app/actions";
import { useRouter } from "next/navigation";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating...' : 'Create Industry'}
        </Button>
    )
}

export function CreateIndustryForm() {
    const { toast } = useToast();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    async function handleAction(formData: FormData) {
        const result = await createIndustry(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset(); // Reset the form
            router.refresh(); // Refresh the page to show the new industry
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
                <CardTitle>Create New Industry</CardTitle>
                <CardDescription>Add a new category for businesses.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="industry-name">Industry Name</Label>
                        <Input name="industry-name" id="industry-name" placeholder="e.g., Wellness" required />
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
