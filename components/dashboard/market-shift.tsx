import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import type { MarketShift } from "@/lib/intelligence/analytics";
import { cn } from "@/lib/utils/cn";

const directionConfig = {
  surging: { icon: TrendingUp, label: "Surging", className: "text-accent" },
  cooling: { icon: TrendingDown, label: "Cooling", className: "text-warning" },
  stable: { icon: Minus, label: "Stable", className: "text-muted-foreground" }
} as const;

export function MarketShiftSection({ shifts }: { shifts: MarketShift[] }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        label="Market shift"
        title="Where momentum is moving"
        description="Category velocity based on recent signal density and importance."
      />
      <Card>
        <CardContent className="p-0">
          {!shifts.length ? (
            <EmptyState
              icon={Minus}
              title="No market shifts detected"
              description="Shifts appear once enough categorized signals flow through the pipeline."
              className="border-0 bg-transparent"
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {shifts.map((shift) => {
                const config = directionConfig[shift.direction];
                const Icon = config.icon;
                return (
                  <li key={shift.category} className="flex items-center gap-4 px-5 py-4 transition hover:bg-muted/20">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/30", config.className)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{shift.label}</p>
                      <p className="text-xs text-muted-foreground">{shift.signalCount} signals · {shift.averageScore} avg score</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-data text-sm font-semibold", config.className)}>
                        {shift.delta > 0 ? "+" : ""}{shift.delta}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{config.label}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
