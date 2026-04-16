
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode } from 'lucide-react';
import Link from 'next/link';
import { loginUser } from '@/app/actions';
import { useSession } from '@/hooks/use-session.tsx';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

export function LoginForm() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setSession } = useSession();
    const requestedAudience = searchParams.get('audience');
    const audience = requestedAudience === 'clinician' ? 'clinician' : 'patient';
    const [step, setStep] = useState<'phone' | 'otp' | 'email_password'>('phone');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const recaptchaContainerId = 'recaptcha-container-login';

    useEffect(() => {
        const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
            'size': 'invisible',
            'callback': () => {}
        });
        (window as any).recaptchaVerifierLogin = recaptchaVerifier;
        return () => recaptchaVerifier.clear();
    }, []);

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            const phoneNumber = `+${phone}`;
            const appVerifier = (window as any).recaptchaVerifierLogin;
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            setConfirmationResult(result);
            setStep('otp');
            toast({ title: 'OTP Sent', description: 'An OTP has been sent to your phone.' });
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            if (error.code === 'auth/too-many-requests') {
                 toast({ title: 'Too Many Requests', description: 'You have requested an OTP too many times. Please try again later.', variant: 'destructive' });
            } else {
                toast({ title: 'OTP Failed', description: 'Could not send OTP. Please check the phone number or try again.', variant: 'destructive' });
            }
        }
        setLoading(false);
    };

    const handleLoginSubmit = async (formData: FormData) => {
        setLoading(true);
        formData.set('audience', audience);
        const result = await loginUser(formData);
        setLoading(false);

        if (result.success && result.userId && result.role) {
            toast({
                title: "Login Successful!",
                description: `Redirecting to your ${result.role} dashboard...`,
            });
            setSession({ userId: result.userId, role: result.role, name: result.name, businessId: result.businessId });
            
            switch (result.role) {
                case 'admin':
                case 'clinician':
                    router.push(audience === 'clinician' ? '/clinician' : '/admin');
                    break;
                case 'business':
                    if (result.businessId) {
                        router.push(`/business/${result.businessId}/dashboard`);
                    } else {
                         toast({
                            title: "Login Failed",
                            description: "Business ID not found for this user.",
                            variant: 'destructive'
                        });
                    }
                    break;
                case 'patient':
                    router.push('/patient');
                    break;
                case 'customer':
                default:
                    router.push('/dashboard');
                    break;
            }
        } else {
            toast({
                title: "Login Failed",
                description: result.error || "Invalid credentials. Please try again.",
                variant: 'destructive'
            });
        }
    }

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (step === 'phone') {
            await handleSendOtp();
            return;
        }

        const formData = new FormData();

        if (step === 'otp') {
            if (!confirmationResult) {
                toast({ title: "Error", description: "No OTP confirmation found. Please try again.", variant: 'destructive' });
                return;
            }
            setLoading(true);
            try {
                await confirmationResult.confirm(otp);
                // OTP is verified, now log the user in using their phone number
                formData.set('phone', phone);
                await handleLoginSubmit(formData);
            } catch (error) {
                toast({ title: "OTP Verification Failed", description: "The OTP you entered is incorrect.", variant: 'destructive' });
                setLoading(false);
            }
        } else if (step === 'email_password') {
            formData.set('email', email);
            formData.set('password', password);
            await handleLoginSubmit(formData);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'otp':
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="otp">One-Time Password (OTP)</Label>
                            <Input 
                                id="otp" 
                                name="otp" 
                                type="text"
                                placeholder="Enter 6-digit code"
                                required 
                                value={otp} 
                                onChange={e => setOtp(e.target.value)} 
                                disabled={loading}
                                maxLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || otp.length < 6}>
                           {loading ? 'Logging in...' : 'Verify OTP & Login'}
                        </Button>
                        <Button type="button" variant="link" onClick={() => setStep('email_password')} className="w-full">Login with Email/Password instead</Button>
                    </>
                );
            case 'email_password':
                 return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                             <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                placeholder="name@example.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                placeholder="••••••••" 
                                required 
                                disabled={loading} 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || !password || !email}>
                           {loading ? 'Logging in...' : 'Login with Email'}
                        </Button>
                         <Button type="button" variant="link" onClick={() => setStep('phone')} className="w-full">Login with Phone/OTP instead</Button>
                    </>
                );
            case 'phone':
            default:
                return (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number (with country code)</Label>
                            <Input 
                                id="phone" 
                                name="phone" 
                                type="tel" 
                                placeholder="919876543210" 
                                required 
                                disabled={loading}
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading || !phone}>
                           {loading ? 'Sending OTP...' : 'Login with OTP'}
                        </Button>
                        <Button type="button" variant="link" onClick={() => setStep('email_password')} className="w-full">Login with Email/Password instead</Button>
                    </>
                );
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex items-center gap-2">
                        <QrCode className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">QREngage</h1>
                    </div>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>
                        {audience === 'clinician' ? 'Clinician login' : 'Patient login'}
                        <br />
                        {step === 'phone' && 'Enter your phone number to sign in.'}
                        {step === 'otp' && `Enter the OTP sent to +${phone}.`}
                        {step === 'email_password' && 'Enter your email and password.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {renderStep()}
                         <p className="text-center text-sm text-muted-foreground">
                            <Link href={`/login?audience=${audience === 'clinician' ? 'patient' : 'clinician'}`} className="font-medium text-primary hover:underline">
                                Switch to {audience === 'clinician' ? 'patient' : 'clinician'} login
                            </Link>
                            <br />
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-medium text-primary hover:underline">
                                Sign up
                            </Link>
                            {audience === 'patient' ? (
                              <>
                                <br />
                                Have an invite token?{' '}
                                <Link href="/patient/enroll" className="font-medium text-primary hover:underline">Enroll as patient</Link>
                              </>
                            ) : null}
                         </p>
                    </form>
                </CardContent>
            </Card>
            <div id={recaptchaContainerId}></div>
        </div>
    );
}
