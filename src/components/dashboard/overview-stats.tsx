import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Megaphone, Target, Users } from "lucide-react";

const stats = [
    { title: "Total Entries", value: "1,482", icon: Users, change: "+15.2% from last month" },
    { title: "Active Campaigns", value: "2", icon: Megaphone, change: "Running now" },
    { title: "Engagement Rate", value: "27.5%", icon: Activity, change: "+3.1% from last week" },
    { title: "New Leads", value: "45", icon: Target, change: "Generated this month" },
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
