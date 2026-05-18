"use client";

import { useRef } from "react";
import { TimelineEventCard } from "@/components/timeline/timeline-event-card";
import type { TimelineCluster } from "@/lib/intelligence/timeline";
import { cn } from "@/lib/utils/cn";

export function TimelineHorizontal({ clusters }: { clusters: TimelineCluster[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
      <div
        ref={scrollRef}
        className="timeline-scroll flex gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth"
        style={{ scrollbarWidth: "thin" }}
      >
        {clusters.map((cluster) => (
          <section key={cluster.key} className="flex w-[min(100%,340px)] shrink-0 flex-col">
            <div className="sticky left-0 mb-4 space-y-2 border-b border-border/60 pb-3">
              <p className="font-data text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cluster.label}</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">{cluster.events.length} events</span>
                <span className={cn("font-data text-[11px]", cluster.momentum >= 75 ? "text-accent" : "text-primary")}>{cluster.momentum}</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${cluster.momentum}%` }} />
              </div>
            </div>
            <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
              {cluster.events.map((event) => (
                <TimelineEventCard key={event.id} event={event} compact />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
