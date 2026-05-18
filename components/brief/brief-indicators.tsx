import { cn } from "@/lib/utils/cn";
import type { ConfidenceLevel, UrgencyLevel } from "@/lib/intelligence/daily-brief";

const confidenceStyles: Record<ConfidenceLevel, { label: string; className: string }> = {
  high: { label: "High confidence", className: "border-accent/40 bg-accent/10 text-accent" },
  medium: { label: "Medium confidence", className: "border-primary/40 bg-primary/10 text-primary" },
  speculative: { label: "Speculative", className: "border-border bg-muted/40 text-muted-foreground" }
};

const urgencyStyles: Record<UrgencyLevel, { label: string; className: string }> = {
  critical: { label: "Critical", className: "border-danger/40 bg-danger/10 text-danger" },
  elevated: { label: "Elevated", className: "border-warning/40 bg-warning/10 text-warning" },
  watch: { label: "Watch", className: "border-border bg-muted/40 text-muted-foreground" }
};

export function ConfidenceBadge({ level, className }: { level: ConfidenceLevel; className?: string }) {
  const s = confidenceStyles[level];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", s.className, className)}>
      <span className="h-1 w-1 rounded-full bg-current opacity-80" />
      {s.label}
    </span>
  );
}

export function UrgencyBadge({ level, className }: { level: UrgencyLevel; className?: string }) {
  const s = urgencyStyles[level];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", s.className, className)}>
      {s.label}
    </span>
  );
}
