
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User, KeyRound, UserPlus } from 'lucide-react';
import { CustomerSignupForm } from '@/components/auth/customer-signup-form';
import { BusinessSignupForm } from '@/components/auth/business-signup-form';
import { getIndustries } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { GuestSignupForm } from './guest-signup-form';

type View = 'options' | 'customer' | 'business' | 'guest';

interface Industry {
    id: string;
    name: string;
}

export function SignupFlow() {
    const [view, setView] = useState<View>('options');
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [loadingIndustries, setLoadingIndustries] = useState(false);

    // This function can be re-enabled later
    const handleSelectBusinessType = async () => {
        setLoadingIndustries(true);
        const result = await getIndustries();
        if (result.industries) {
            setIndustries(result.industries);
        }
        // Handle error case if needed
        setLoadingIndustries(false);
        setView('business');
    }

    const renderContent = () => {
        switch (view) {
            case 'guest':
                return <GuestSignupForm onBack={() => setView('options')} />;
            case 'customer':
                return <CustomerSignupForm onBack={() => setView('options')} />;
            case 'business':
                // The business form is kept in the code but is not reachable through the UI for now.
                return <BusinessSignupForm industries={industries} onBack={() => setView('options')} isLoading={loadingIndustries} />;
            case 'options':
            default:
                return (
                    <>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Join QREngage</CardTitle>
                            <CardDescription>How would you like to sign up?</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <Button size="lg" className="w-full justify-start h-auto p-4 flex items-start gap-4" onClick={() => setView('guest')}>
                                <KeyRound className="h-6 w-6 flex-shrink-0 mt-1" />
                                <div className="text-left">
                                    <p className="font-semibold">Guest Sign In</p>
                                    <p className="text-sm font-normal text-primary-foreground/80">Easiest way to get started. No password needed.</p>
                                </div>
                            </Button>

                            <Button variant="outline" size="lg" className="w-full justify-start h-auto p-4 flex items-start gap-4" onClick={() => setView('customer')}>
                                <UserPlus className="h-6 w-6 flex-shrink-0 mt-1" />
                                <div className="text-left">
                                    <p className="font-semibold">Create Full Account</p>
                                    <p className="text-sm text-muted-foreground">Sign up with OTP, email, and password.</p>
                                </div>
                            </Button>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="outline" size="lg" className="w-full justify-start h-auto p-4 flex items-start gap-4">
                                        <Building2 className="h-6 w-6 flex-shrink-0 mt-1" />
                                        <div className="text-left">
                                            <p className="font-semibold">As a Business Owner</p>
                                            <p className="text-sm text-muted-foreground">Register your venue and track customer visits.</p>
                                        </div>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Business Registration</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            We're excited to have you on board! To ensure a personalized setup, we are currently handling business registrations manually.
                                            <br/><br/>
                                            Please contact us directly for quick and easy registration.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="my-4 p-4 bg-secondary rounded-lg text-center">
                                        <p className="text-sm text-muted-foreground">Contact us at:</p>
                                        <p className="text-lg font-bold text-primary">+91 98451 80066</p>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Close</AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                           <a href="tel:+919845180066">
                                                Call Now
                                           </a>
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                             <p className="text-center text-sm text-muted-foreground pt-2">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium text-primary hover:underline">
                                    Log in
                                </Link>
                            </p>

                        </CardContent>
                    </>
                );
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                {renderContent()}
            </Card>
        </div>
    );
}
