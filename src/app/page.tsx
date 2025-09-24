import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { ActiveCampaignCard } from "@/components/dashboard/active-campaign-card";
import { RecentWinnersList } from "@/components/dashboard/recent-winners-list";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { GrandDrawCard } from "@/components/dashboard/grand-draw-card";
import { LeadFunnel } from "@/components/dashboard/lead-funnel";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="flex-1">
      <PageHeader 
        title="Performance Dashboard" 
        description="Track your lead generation and patient conversion metrics."
      >
        <Button asChild>
          <Link href="/campaigns">
            <PlusCircle className="mr-2 h-4 w-4" />
            Manage Campaigns
          </Link>
        </Button>
      </PageHeader>
      <div className="p-6 pt-0 grid gap-6">
        <OverviewStats />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
             <EngagementChart />
          </div>
          <div className="lg:col-span-2">
            <LeadFunnel />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GrandDrawCard />
          </div>
          <div className="lg:col-span-1">
            <ActiveCampaignCard />
          </div>
        </div>
      </div>
    </div>
  );
}
