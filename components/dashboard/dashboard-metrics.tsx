import { Activity, Target, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

type MetricProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  highlight?: boolean;
};

function MetricCard({ label, value, hint, icon: Icon, highlight }: MetricProps) {
  return (
    <div className={cn("surface-interactive rounded-xl p-4", highlight && "glow-accent border-primary/20")}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", highlight ? "text-primary" : "text-muted-foreground")} />
      </div>
      <p className="mt-3 font-data text-3xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function DashboardMetrics({
  signalCount,
  topScore,
  opportunities,
  highPriority
}: {
  signalCount: number;
  topScore: number;
  opportunities: number;
  highPriority: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard label="Live signals" value={signalCount.toString()} hint="Ranked by importance" icon={Activity} highlight />
      <MetricCard label="Top score" value={topScore.toString()} hint="Highest importance" icon={Zap} />
      <MetricCard label="Opportunities" value={opportunities.toString()} hint="Startup wedges surfaced" icon={Target} />
      <MetricCard label="Priority" value={highPriority.toString()} hint="85+ importance" icon={TrendingUp} />
    </div>
  );
}
