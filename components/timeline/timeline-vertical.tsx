"use client";

import { TimelineEventCard } from "@/components/timeline/timeline-event-card";
import type { TimelineCluster } from "@/lib/intelligence/timeline";
import { cn } from "@/lib/utils/cn";

export function TimelineVertical({ clusters }: { clusters: TimelineCluster[] }) {
  return (
    <div className="relative space-y-12 pl-2">
      <div className="absolute bottom-0 left-[11px] top-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
      {clusters.map((cluster) => (
        <section key={cluster.key} id={`cluster-${cluster.key}`} className="relative scroll-mt-28">
          <div className="sticky top-[3.75rem] z-20 -ml-2 mb-6 flex items-center gap-4 bg-background/85 py-2 backdrop-blur-md">
            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-background">
              <span className="h-2 w-2 rounded-full bg-primary" />
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-data text-sm font-semibold tracking-tight">{cluster.label}</h2>
                <p className="text-[11px] text-muted-foreground">{cluster.events.length} events</p>
              </div>
              <MomentumPill value={cluster.momentum} shifts={cluster.marketShiftCount} />
            </div>
          </div>
          <div className="space-y-3 pl-8">
            {cluster.events.map((event) => (
              <TimelineEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MomentumPill({ value, shifts }: { value: number; shifts: number }) {
  const tone = value >= 80 ? "text-accent border-accent/30 bg-accent/10" : value >= 65 ? "text-primary border-primary/30 bg-primary/10" : "text-muted-foreground border-border bg-muted/30";
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-data text-[11px]", tone)}>
      <span>{value} momentum</span>
      {shifts > 0 ? <span className="text-muted-foreground">· {shifts} shifts</span> : null}
    </span>
  );
}
