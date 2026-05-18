import { cn } from "@/lib/utils/cn";
import type { DisruptionRisk } from "@/lib/intelligence/analytics";

const styles = {
  low: "border-border/80 bg-muted/40 text-muted-foreground",
  moderate: "border-warning/25 bg-warning/10 text-warning",
  elevated: "border-primary/30 bg-primary/10 text-primary",
  critical: "border-danger/30 bg-danger/10 text-danger"
} as const;

export function DisruptionBadge({ risk, className }: { risk: DisruptionRisk; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        styles[risk.level],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", risk.level === "critical" ? "bg-danger animate-pulse-subtle" : risk.level === "elevated" ? "bg-primary" : risk.level === "moderate" ? "bg-warning" : "bg-muted-foreground/50")} />
      {risk.label}
    </span>
  );
}
