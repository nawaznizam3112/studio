import { PageHeader } from "@/components/page-header";
import { MarketingGenerator } from "@/components/marketing/generator";

export default function MarketingPage() {
  return (
    <div>
      <PageHeader
        title="Marketing Toolkit"
        description="Generate ready-made posters, WhatsApp campaigns, and SMS reminders with AI."
      />
      <div className="p-6 pt-0">
        <MarketingGenerator />
      </div>
    </div>
  );
}
