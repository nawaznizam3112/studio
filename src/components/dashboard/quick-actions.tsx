import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brush, Users, QrCode } from "lucide-react";

const actions = [
  {
    href: "/marketing",
    label: "Generate Marketing",
    description: "Create posters, WhatsApp & SMS copy.",
    icon: Brush,
  },
  {
    href: "/patients",
    label: "Patient Follow-ups",
    description: "Get AI suggestions for empty slots.",
    icon: Users,
  },
  {
    href: "/campaigns",
    label: "Get QR Code",
    description: "Share QR codes for campaign check-ins.",
    icon: QrCode,
  },
];

export function QuickActions() {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="h-auto w-full justify-start p-4 text-left"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="mr-4 h-6 w-6 text-primary" />
                <div className="flex flex-col">
                  <span className="font-semibold">{action.label}</span>
                  <span className="text-sm text-muted-foreground">{action.description}</span>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
