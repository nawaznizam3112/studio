// src/app/business/[businessId]/page.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBusinessById, getServicesForBusiness, getQuizzesForBusiness, recordService, guestLoginOrSignup, getProductsForBusiness, getNudgesForBusiness } from '@/app/actions';
import { useSession } from '@/hooks/use-session.tsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CustomerQuiz } from '@/components/features/customer-quiz';
import Image from 'next/image';
import { MessageSquare, ExternalLink, User, UserPlus, Lightbulb, ShoppingCart, Film, Star, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

interface Service {
  id: string;
  name: string;
}
interface Quiz {
    id: string;
    title: string;
    questions: any[];
}
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    productUrl?: string;
    imageUrl?: string;
}
interface Nudge {
    id: string;
    triggerService: string;
    recommendationText: string;
}

function DigitalLoungeSkeleton() {
    return (
        <div className="container mx-auto max-w-2xl py-8 px-4 space-y-8">
            <div className="text-center space-y-3">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2"/>
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

function GuestLoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const { setSession } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleGuestLogin(formData: FormData) {
        setIsSubmitting(true);
        const result = await guestLoginOrSignup(formData);
        if (result.success && result.userId) {
            setSession({ userId: result.userId, role: result.role, name: result.name, businessId: result.businessId });
            toast.success(`Welcome, ${result.name}!`);
            onLoginSuccess();
        } else {
            toast.error(result.error || "Could not sign in as guest.");
        }
        setIsSubmitting(false);
    }
    
    return (
        <form action={handleGuestLogin} className="space-y-4 animate-in fade-in-0">
             <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input name="name" id="name" placeholder="e.g., Alex Doe" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (with country code)</Label>
                <Input name="phone" id="phone" type="tel" placeholder="e.g., 919876543210" required disabled={isSubmitting} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Continue as Guest'}
            </Button>
        </form>
    )
}

function getYouTubeEmbedUrl(url: string | undefined): string | null {
    if (!url) return null;
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        return null;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export default function BusinessCheckinPage() {
    const params = useParams();
    const router = useRouter();
    const { session, loading: sessionLoading } = useSession();
    const businessId = params.businessId as string;

    const [business, setBusiness] = useState<any>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [nudges, setNudges] = useState<Nudge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState('');
    const [preConsultationNotes, setPreConsultationNotes] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [quizResults, setQuizResults] = useState<any[] | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestToken, setRequestToken] = useState(true);
    
    const relevantNudge = useMemo(() => {
        return nudges.find(nudge => nudge.triggerService === selectedService);
    }, [selectedService, nudges]);

    useEffect(() => {
        if (businessId) {
            async function fetchData() {
                setLoading(true);
                const [businessResult, servicesResult, quizzesResult, productsResult, nudgesResult] = await Promise.all([
                    getBusinessById(businessId),
                    getServicesForBusiness(businessId),
                    getQuizzesForBusiness(businessId),
                    getProductsForBusiness(businessId),
                    getNudgesForBusiness(businessId),
                ]);

                if (businessResult.business) {
                    setBusiness(businessResult.business);
                } else {
                    toast.error("Business not found.");
                }

                if (servicesResult.services) setServices(servicesResult.services);
                if (quizzesResult.quizzes) {
                    setQuizzes(quizzesResult.quizzes);
                    if (quizzesResult.quizzes.length > 0) {
                        setSelectedQuiz(quizzesResult.quizzes[0]); // Auto-select the first quiz
                    }
                }
                if (productsResult.products) setProducts(productsResult.products);
                if (nudgesResult.nudges) setNudges(nudgesResult.nudges);

                setLoading(false);
            }
            fetchData();
        }
    }, [businessId]);

    const handleWebCheckIn = async () => {
        if (!session?.userId) {
            toast.error("You must be logged in to check in.");
            return;
        }
        if (!selectedService) {
            toast.error("Please select a service.");
            return;
        }

        setIsSubmitting(true);
        const result = await recordService({
            businessId,
            userId: session.userId,
            service: selectedService,
            preConsultationNotes,
            quizResults,
            requestToken,
        });
        setIsSubmitting(false);

        if (result.success) {
            setShowConfirmation(true); // Show confirmation dialog
        } else {
            toast.error(result.error || "Failed to check in.");
        }
    };
    
    const handleQuizComplete = (results: any[]) => {
        setQuizResults(results);
        toast.success("Quiz completed! Your answers have been saved.");
    }

    if (loading) {
        return <DigitalLoungeSkeleton />;
    }

    if (!business) {
        return <div className="text-center py-10">Business not found.</div>;
    }

    const checkinCode = `CHECKIN-${business.id}-${Date.now()}`;
    const whatsAppMessage = `Hello! I'm checking in at ${business.name}. Code: ${checkinCode}`;
    const businessWhatsappNumber = business.phone || '14155238886'; 
    const whatsappUrl = `https://wa.me/${businessWhatsappNumber}?text=${encodeURIComponent(whatsAppMessage)}`;
    const introVideoUrl = getYouTubeEmbedUrl(business.introVideoUrl);


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto max-w-2xl py-8 px-4 space-y-8">
                <header className="text-center space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                        Welcome to {business.name}
                    </h1>
                    <p className="text-lg text-gray-600">Your digital check-in lounge</p>
                </header>
                
                 {introVideoUrl && (
                    <Card className="shadow-lg animate-in fade-in-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Film className="h-5 w-5 text-primary" /> A Message For You</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="aspect-video w-full rounded-lg overflow-hidden">
                                <iframe
                                    src={introVideoUrl}
                                    title="Business Intro Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Smart Check-in</CardTitle>
                        <CardDescription>The fastest way to check-in and get your token.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button asChild size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white">
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="mr-2" /> Check-in via WhatsApp
                            </a>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">Opens WhatsApp to send an automated check-in message.</p>
                    </CardContent>
                </Card>

                <div className="relative text-center">
                    <Separator className="my-8" />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-4 text-sm text-muted-foreground">
                        OR
                    </span>
                </div>

                <Card className="shadow-lg animate-in fade-in-0">
                    <CardHeader>
                        <CardTitle>In-Browser Check-in</CardTitle>
                        <CardDescription>Let us know you're here. If you're a new guest, please sign in quickly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {sessionLoading ? <DigitalLoungeSkeleton /> : (
                            !session ? (
                                <div className="space-y-4">
                                     <GuestLoginForm onLoginSuccess={() => {}} />
                                    <p className="text-center text-sm text-muted-foreground pt-2">
                                        Have a full account?{' '}
                                        <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/login?redirect=/business/${businessId}`)}>
                                            Log in here
                                        </Button>
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p>Welcome back, <span className="font-semibold">{session.name}!</span></p>
                                    
                                    <div>
                                        <Label htmlFor="service-select">What service are you here for today?</Label>
                                        <Select onValueChange={setSelectedService} value={selectedService}>
                                            <SelectTrigger id="service-select">
                                                <SelectValue placeholder="Select a service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map(service => (
                                                    <SelectItem key={service.id} value={service.name}>{service.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {relevantNudge && (
                                        <Card className="bg-primary/10 border-primary/20">
                                            <CardContent className="pt-6">
                                                <div className="flex items-start gap-3">
                                                    <Lightbulb className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold">A smart suggestion for you:</h4>
                                                        <p className="text-sm text-primary/80">{relevantNudge.recommendationText}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    
                                    {selectedQuiz && (
                                        <CustomerQuiz quiz={selectedQuiz} onQuizComplete={handleQuizComplete} />
                                    )}

                                    <div>
                                        <Label htmlFor="notes">Pre-consultation notes (optional)</Label>
                                        <Textarea 
                                            id="notes" 
                                            value={preConsultationNotes}
                                            onChange={(e) => setPreConsultationNotes(e.target.value)}
                                            placeholder="Anything specific you'd like to address today? e.g., 'Feeling some tension in my left shoulder'"
                                        />
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="request-token" 
                                            checked={requestToken}
                                            onCheckedChange={(checked) => setRequestToken(checked as boolean)}
                                        />
                                        <Label htmlFor="request-token" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Request a service token
                                        </Label>
                                    </div>

                                    <Button onClick={handleWebCheckIn} disabled={!selectedService || isSubmitting} className="w-full">
                                        {isSubmitting ? "Checking In..." : "Complete Check-in"}
                                    </Button>
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>

                {products.length > 0 && (
                     <Card className="shadow-lg animate-in fade-in-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Recommended Products</CardTitle>
                            <CardDescription>Products recommended by our experts.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {products.map(product => (
                                <Link href={product.productUrl || '#'} target="_blank" rel="noopener noreferrer" key={product.id} className="group">
                                    <Card className="overflow-hidden h-full">
                                        <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200/200`} alt={product.name} width={200} height={200} className="w-full h-32 object-cover transition-transform group-hover:scale-105" data-ai-hint="product image" />
                                        <div className="p-3">
                                            <p className="text-sm font-semibold truncate">{product.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                                            <Badge variant="secondary" className="mt-2">₹{product.price.toFixed(2)}</Badge>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
            
            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Check-in Successful!</AlertDialogTitle>
                    <AlertDialogDescription>
                        You're all set! Please take a seat and we'll be with you shortly.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogAction onClick={() => router.push('/dashboard')}>
                        Go to My Dashboard
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
