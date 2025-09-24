
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scissors, Dumbbell, Stethoscope, Dog, Sparkles, Coffee } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Ideal Client Profiles',
    description: 'A guide to the ideal customers for the QREngage platform.',
};

const primaryTargets = [
    {
        icon: <Scissors className="h-8 w-8 text-primary" />,
        name: "Hair Salons & Barbershops",
        description: "High repeat business and clear service menus. Perfect for service history tracking ('what did we do last time?'), AI stylist recommendations, digital tipping, and selling hair care products.",
    },
    {
        icon: <Dumbbell className="h-8 w-8 text-primary" />,
        name: "Gyms & Fitness Studios",
        description: "Membership-based model that thrives on consistent engagement. Ideal for the AI trainer feature, workout logging, class check-ins, fitness challenges, and promoting supplements or merchandise.",
    },
    {
        icon: <Stethoscope className="h-8 w-8 text-primary" />,
        name: "Medical & Wellness Clinics",
        description: "Includes dentists, physios, and chiropractors. Benefits from appointment check-ins, pre-consultation notes (via the Quiz feature), automated reminders, and sharing educational 'Stories' about health.",
    },
];

const secondaryTargets = [
    {
        icon: <Dog className="h-8 w-8 text-accent-foreground" />,
        name: "Pet Groomers & Daycares",
        description: "Extremely high repeat customer base. Owners would love receiving WhatsApp updates with photos. Service history tracks grooming preferences and important pet notes.",
    },
    {
        icon: <Sparkles className="h-8 w-8 text-accent-foreground" />,
        name: "Spas & Massage Centers",
        description: "A natural fit for loyalty and check-in systems. Can use the broadcast feature to fill last-minute appointment slots or promote special 'Wellness Wednesday' packages.",
    },
    {
        icon: <Coffee className="h-8 w-8 text-accent-foreground" />,
        name: "Cafes & Small Restaurants",
        description: "A major upgrade from paper punch cards. QR codes on tables allow customers to check-in to earn points and receive digital coupons for their next visit, driving repeat business.",
    },
];

export default function IdealClientsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Ideal Client Profiles</h1>
                <p className="text-muted-foreground">A guide to the businesses that will get the most value from QREngage.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Primary Targets: The Perfect Fit</CardTitle>
                    <CardDescription>These businesses can leverage almost every feature on the platform, making them your ideal first customers.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {primaryTargets.map(client => (
                        <div key={client.name} className="flex flex-col gap-4 rounded-lg border bg-card p-6">
                           <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                {client.icon}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{client.name}</h3>
                                <p className="text-sm text-muted-foreground">{client.description}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Secondary Targets: High Potential</CardTitle>
                    <CardDescription>These businesses will see great value from the core loyalty and communication features.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {secondaryTargets.map(client => (
                        <div key={client.name} className="flex flex-col gap-4 rounded-lg border bg-card p-6">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                                {client.icon}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{client.name}</h3>
                                <p className="text-sm text-muted-foreground">{client.description}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
