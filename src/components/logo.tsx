import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-xl font-semibold font-headline text-foreground", className)}>
      <div className="bg-primary rounded-lg p-1.5">
        <Award className="h-6 w-6 text-primary-foreground" />
      </div>
      <span>RewardBoost</span>
    </div>
  );
}
