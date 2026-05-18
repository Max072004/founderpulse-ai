import { Zap } from "lucide-react";
import type { TimelineEvent } from "@/lib/intelligence/timeline";
import { getEventTypeLabel } from "@/lib/intelligence/timeline";

export function TimelineMarketShifts({ highlights }: { highlights: TimelineEvent[] }) {
  if (!highlights.length) return null;

  return (
    <div className="glow-accent rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card/40 to-transparent p-4">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Market shift radar</h3>
      </div>
      <ul className="grid gap-3 md:grid-cols-3">
        {highlights.map((event) => (
          <li key={event.id} className="rounded-lg border border-border/60 bg-background/40 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {getEventTypeLabel(event.eventType)} · {event.importanceScore}
            </p>
            <p className="mt-1.5 text-sm font-medium leading-snug">{event.title}</p>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{event.marketImpact}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
