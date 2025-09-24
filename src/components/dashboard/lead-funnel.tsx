import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Target, Handshake } from "lucide-react";

const funnelData = [
  {
    stage: "Leads Generated",
    value: 132,
    icon: Users,
    color: "bg-blue-500",
  },
  {
    stage: "Qualified",
    value: 95,
    icon: Target,
    color: "bg-sky-500",
  },
  {
    stage: "Converted",
    value: 46,
    icon: Handshake,
    color: "bg-teal-500",
  },
];

export function LeadFunnel() {
  const maxLeads = funnelData[0].value;
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="font-headline">Lead Funnel</CardTitle>
        <CardDescription>Visualizing your lead-to-conversion process.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((level, index) => {
            const percentage = (level.value / maxLeads) * 100;
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <level.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{level.stage}</span>
                  </div>
                  <span>{level.value}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
