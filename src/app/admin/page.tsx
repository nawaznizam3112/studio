
import { getDashboardStats } from "@/app/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, Factory, User } from "lucide-react";
import Link from "next/link";
import { AnalyticsChart } from "@/components/admin/analytics-chart";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  if (stats.error) {
    return <div>Error loading dashboard: {stats.error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your platform's activity.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
                <Factory className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>Total Industries</CardTitle>
                    <p className="text-2xl font-bold">{stats.industryCount ?? 0}</p>
                </div>
            </div>
          </CardHeader>
        </Card>
         <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
                <Building2 className="h-8 w-8 text-accent-foreground" />
                <div>
                    <CardTitle>Total Businesses</CardTitle>
                    <p className="text-2xl font-bold">{stats.businessCount ?? 0}</p>
                </div>
            </div>
          </CardHeader>
        </Card>
         <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-green-500" />
                <div>
                    <CardTitle>Total Customers</CardTitle>
                    <p className="text-2xl font-bold">{stats.customerCount ?? 0}</p>
                </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Business Registration Growth</CardTitle>
          <CardDescription>
            A chart showing the number of new businesses registered over the last 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsChart data={stats.businessGrowth || []} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
             <Link href="/admin/industries" className="flex items-center gap-3 rounded-md p-3 hover:bg-muted/50 transition-colors border">
                <Factory className="h-6 w-6 text-primary" />
                <div>
                    <p className="font-semibold">Manage Industries</p>
                    <p className="text-sm text-muted-foreground">Create and view business industries.</p>
                </div>
             </Link>
             <Link href="/admin/businesses" className="flex items-center gap-3 rounded-md p-3 hover:bg-muted/50 transition-colors border">
                <Building2 className="h-6 w-6 text-accent-foreground" />
                 <div>
                    <p className="font-semibold">Register a Business</p>
                    <p className="text-sm text-muted-foreground">Add a new business to the platform.</p>
                </div>
             </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
