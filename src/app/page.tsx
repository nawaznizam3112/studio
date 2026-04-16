
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session.tsx';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { ArrowRight, QrCode, Star, Trophy, Gift, Bot, MessageSquare, Megaphone } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <Trophy className="h-8 w-8 text-primary" />,
    title: 'Gamified Lucky Draws',
    description: 'Create "pay for service -> get free draw entry" campaigns to boost patient engagement.',
  },
  {
    icon: <QrCode className="h-8 w-8 text-primary" />,
    title: 'QR Code Check-in',
    description: 'Patients scan a QR code at your clinic to seamlessly check in for their appointment.',
  },
  {
    icon: <Megaphone className="h-8 w-8 text-primary" />,
    title: 'Automated Marketing',
    description: 'Send promotional messages, reminders, and campaign announcements via WhatsApp & SMS.',
  },
  {
    icon: <Star className="h-8 w-8 text-primary" />,
    title: 'Automated Draw System',
    description: 'Our fair and transparent system automatically selects winners for your campaigns.',
  },
  {
    icon: <Gift className="h-8 w-8 text-primary" />,
    title: 'Sponsor Integration',
    description: 'Partner with wellness brands to sponsor prizes and increase campaign appeal.',
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: 'Patient Feedback',
    description: 'Allow patients to rate their experience and leave digital tips after each visit.',
  },
];


export default function LandingPage() {
    const { session, loading } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!loading && session) {
            if (session.role === 'admin' || session.role === 'clinician') {
                router.push('/clinician');
            } else if (session.role === 'business') {
                router.push('/business');
            } else if (session.role === 'patient') {
                router.push('/patient');
            } else {
                router.push('/dashboard');
            }
        }
    }, [session, loading, router]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                The Patient Engagement & Growth Platform
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Turn every patient visit into a growth opportunity. Use our gamified lucky draw campaigns, powered by QR codes, to increase bookings, build loyalty, and automate your marketing.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get Started Free <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                   <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">All-in-One Engagement Platform for Clinics</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    From gamified rewards to automated marketing, we provide everything you need to build a thriving practice.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-lg border bg-card p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Grow Your Clinic?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join hundreds of doctors and clinics modernizing their patient engagement strategy. Sign up today and see the difference.
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Sign Up Now <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
