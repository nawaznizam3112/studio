
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { guestLoginOrSignup } from '@/app/actions';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '@/hooks/use-session.tsx';
import Link from 'next/link';

interface GuestSignupFormProps {
    onBack: () => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Accessing...' : 'Continue as Guest'}
        </Button>
    );
}

export function GuestSignupForm({ onBack }: GuestSignupFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const { setSession } = useSession();

    async function handleAction(formData: FormData) {
        const result = await guestLoginOrSignup(formData);
        
        if (result.success && result.userId && result.role) {
            toast({
                title: "Login Successful!",
                description: `Welcome back, ${result.name}! Redirecting to your dashboard...`,
            });
            setSession({ userId: result.userId, role: result.role, name: result.name, businessId: result.businessId });
            router.push('/dashboard');
        } else {
            toast({
                title: "Access Failed",
                description: result.error || "Could not sign you in. Please try again.",
                variant: 'destructive',
            });
        }
    }

    return (
        <form ref={formRef} action={handleAction}>
            <CardHeader>
                <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <CardTitle className="text-center">Guest Access</CardTitle>
                <CardDescription className="text-center">Enter your details for quick access. No password needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input name="name" id="name" placeholder="e.g., Alex Doe" required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (with country code)</Label>
                    <Input name="phone" id="phone" type="tel" placeholder="e.g., 919876543210" required/>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <SubmitButton />
                <p className="text-center text-sm text-muted-foreground">
                    Already have a full account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Log in here
                    </Link>
                </p>
            </CardFooter>
        </form>
    );
}
