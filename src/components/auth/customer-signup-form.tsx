
'use client';

import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signupUser } from '@/app/actions';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

interface CustomerSignupFormProps {
    onBack: () => void;
}

export function CustomerSignupForm({ onBack }: CustomerSignupFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    
    // Form fields for the final step
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const recaptchaContainerId = 'recaptcha-container';

    useEffect(() => {
        const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
            'size': 'invisible',
            'callback': () => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
        (window as any).recaptchaVerifier = recaptchaVerifier;

        return () => {
            recaptchaVerifier.clear();
        };
    }, []);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const phoneNumber = `+${phone}`;
            const appVerifier = (window as any).recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(result);
            setStep('otp');
            toast({ title: 'OTP Sent', description: 'An OTP has been sent to your phone.' });
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
        setLoading(false);
    };

    const handleVerifyOtpAndSignup = async () => {
        setLoading(true);
        
        if (!confirmationResult) {
            toast({ title: "Error", description: "No OTP confirmation found. Please try again.", variant: 'destructive' });
            setLoading(false);
            return;
        }

        try {
            await confirmationResult.confirm(otp);
            
            const formData = new FormData();
            formData.append('phone', phone);
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            
            const result = await signupUser(formData);
            if (result.success) {
                toast({
                    title: "Signup Successful!",
                    description: "Your account has been created.",
                });
                router.push('/login');
            } else {
                toast({
                    title: "Signup Failed",
                    description: result.error,
                    variant: 'destructive',
                });
            }
        } catch (error: any) {
             toast({ title: "OTP Verification Failed", description: "The OTP you entered is incorrect. Please try again.", variant: 'destructive' });
        }
        setLoading(false);
    };
    
    return (
        <>
            <CardHeader>
                <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <CardTitle className="text-center">Create Customer Account</CardTitle>
                <CardDescription className="text-center">
                    {step === 'phone' ? 'Enter your phone number to get started.' : 'Enter the OTP and your details.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number (with country code)</Label>
                            <Input 
                                id="phone" 
                                name="phone" 
                                type="tel" 
                                placeholder="919876543210" 
                                required 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || !phone}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone-confirm">Phone Number</Label>
                            <Input id="phone-confirm" type="tel" value={`+${phone}`} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="otp">One-Time Password (OTP)</Label>
                            <Input 
                                id="otp" 
                                name="otp"
                                type="text"
                                placeholder="Enter 6-digit code" 
                                required 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={loading}
                                maxLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="Alex Doe" required value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="name@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <Button type="button" onClick={handleVerifyOtpAndSignup} className="w-full" disabled={loading || otp.length < 6 || !name || !email || !password}>
                            {loading ? 'Verifying & Signing Up...' : 'Create Account'}
                        </Button>
                    </div>
                )}
            </CardContent>
            <CardFooter className="justify-center">
                 <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Log in
                    </Link>
                </p>
            </CardFooter>
            <div id={recaptchaContainerId}></div>
        </>
    );
}
