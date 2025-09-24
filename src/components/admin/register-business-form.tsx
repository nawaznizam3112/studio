
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { registerBusiness } from "@/app/actions";
import { useFormStatus } from "react-dom";
import { useRef } from "react";

interface Industry {
    id: string;
    name: string;
}

interface RegisterBusinessFormProps {
    industries: Industry[];
    onBusinessRegistered: () => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full md:w-auto" disabled={pending}>
            {pending ? 'Registering...' : 'Register Business'}
        </Button>
    )
}

export function RegisterBusinessForm({ industries, onBusinessRegistered }: RegisterBusinessFormProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    async function handleAction(formData: FormData) {
        const result = await registerBusiness(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset();
            onBusinessRegistered();
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive"
            });
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Register a New Business</h1>
                <p className="text-muted-foreground">Fill out the form below to add a new business to the platform.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Business Details</CardTitle>
                    <CardDescription>Provide information about the business you are registering.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={handleAction} className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="business-name">Business Name</Label>
                            <Input name="business-name" id="business-name" placeholder="e.g., The Grand Salon" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Select name="industry" required>
                                <SelectTrigger id="industry">
                                    <SelectValue placeholder="Select an industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    {industries.length === 0 && <SelectItem value="-" disabled>No industries found</SelectItem>}
                                    {industries.map(industry => (
                                        <SelectItem key={industry.id} value={industry.name}>{industry.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="owner-email">Owner's Email</Label>
                            <Input name="owner-email" id="owner-email" type="email" placeholder="owner@example.com" required/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="owner-name">Owner's Full Name</Label>
                            <Input name="owner-name" id="owner-name" placeholder="e.g., Alex Doe" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input name="phone" id="phone" type="tel" placeholder="(123) 456-7890" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input name="password" id="password" type="password" placeholder="Set a strong password" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="promoLinkUrl">Promotional Link URL (Optional)</Label>
                            <Input name="promoLinkUrl" id="promoLinkUrl" type="url" placeholder="https://example.com/your-page" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="introVideoUrl">Intro Video URL (Optional)</Label>
                            <Input name="introVideoUrl" id="introVideoUrl" type="url" placeholder="https://youtube.com/watch?v=..." />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="promoVideoUrl">Promotional Video URL (Optional)</Label>
                            <Input name="promoVideoUrl" id="promoVideoUrl" type="url" placeholder="https://youtube.com/watch?v=..." />
                        </div>
                        <div className="md:col-span-2">
                             <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

    