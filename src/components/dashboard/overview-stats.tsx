import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, Target, TrendingUp, Users } from "lucide-react";

const stats = [
    { title: "Leads Generated", value: "132", icon: Users, change: "+20% from last month", hint: "Total patients who showed interest." },
    { title: "Qualified Leads", value: "95", icon: Target, change: "72% of total leads", hint: "Leads verified by your team." },
    { title: "Conversion Rate", value: "48%", icon: Handshake, change: "+5% from last month", hint: "Percentage of leads that booked." },
    { title: "Estimated ROI", value: "3.2x", icon: TrendingUp, change: "Based on your commission.", hint: "Return on your investment." },
];

export function OverviewStats() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-headline">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
