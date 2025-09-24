
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { registerBusiness } from '@/app/actions';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface Industry {
    id: string;
    name: string;
}

interface BusinessSignupFormProps {
    industries: Industry[];
    onBack: () => void;
    isLoading: boolean;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Registering...' : 'Create Business Account'}
        </Button>
    );
}

export function BusinessSignupForm({ industries, onBack, isLoading }: BusinessSignupFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    async function handleAction(formData: FormData) {
        const result = await registerBusiness(formData);
        if (result.success) {
            toast({
                title: "Registration Successful!",
                description: "Your business account has been created.",
            });
            router.push('/login');
        } else {
            toast({
                title: "Registration Failed",
                description: result.error,
                variant: 'destructive',
            });
        }
    }
    
    if (isLoading) {
        return <CardContent>Loading industries...</CardContent>
    }

    return (
        <form ref={formRef} action={handleAction}>
            <CardHeader>
                 <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <CardTitle className="text-center">Register Your Business</CardTitle>
                <CardDescription className="text-center">Fill in the details to get your business on QREngage.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[50vh] pr-4">
                    <div className="space-y-4">
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
                            <Label htmlFor="owner-name">Your Full Name</Label>
                            <Input name="owner-name" id="owner-name" placeholder="e.g., Alex Doe" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="owner-email">Your Email</Label>
                            <Input name="owner-email" id="owner-email" type="email" placeholder="owner@example.com" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input name="phone" id="phone" type="tel" placeholder="(123) 456-7890" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input name="password" id="password" type="password" required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="promoLinkUrl">Promotional Link URL (Optional)</Label>
                            <Input name="promoLinkUrl" id="promoLinkUrl" type="url" placeholder="https://example.com/your-page" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="introVideoUrl">Intro Video URL (Optional)</Label>
                            <Input name="introVideoUrl" id="introVideoUrl" type="url" placeholder="https://youtube.com/watch?v=..." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="promoVideoUrl">Promotional Video URL (Optional)</Label>
                            <Input name="promoVideoUrl" id="promoVideoUrl" type="url" placeholder="https://youtube.com/watch?v=..." />
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                 <SubmitButton />
            </CardFooter>
        </form>
    );
}

    