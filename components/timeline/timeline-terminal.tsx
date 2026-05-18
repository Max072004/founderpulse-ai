"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, History } from "lucide-react";
import { TimelineFiltersBar } from "@/components/timeline/timeline-filters";
import { TimelineHorizontal } from "@/components/timeline/timeline-horizontal";
import { TimelineForecast } from "@/components/timeline/timeline-forecast";
import { TimelineMarketShifts } from "@/components/timeline/timeline-market-shifts";
import { TimelineVertical } from "@/components/timeline/timeline-vertical";
import { EmptyState } from "@/components/ui/empty-state";
import {
  buildTimelineFromArticles,
  clusterTimelineEvents,
  filterTimelineEvents,
  computeTimelineMomentum,
  getMarketShiftHighlights,
  getTimelineCompanies,
  type TimelineGranularity,
  type TimelineViewMode
} from "@/lib/intelligence/timeline";
import type { Article } from "@/lib/db/types";

export function TimelineTerminal({ articles }: { articles: Article[] }) {
  const params = useSearchParams();
  const [viewMode, setViewMode] = useState<TimelineViewMode>("vertical");
  const [granularity, setGranularity] = useState<TimelineGranularity>("month");

  const allEvents = useMemo(() => buildTimelineFromArticles(articles), [articles]);

  const filtered = useMemo(() => {
    return filterTimelineEvents(allEvents, {
      category: params.get("category") ?? undefined,
      eventType: params.get("eventType") ?? undefined,
      company: params.get("company") ?? undefined,
      minScore: params.get("minScore") ? Number(params.get("minScore")) : undefined,
      sort: (params.get("sort") as "importance" | "date") ?? "date"
    });
  }, [allEvents, params]);

  const clusters = useMemo(() => clusterTimelineEvents(filtered, granularity), [filtered, granularity]);
  const companies = useMemo(() => getTimelineCompanies(allEvents), [allEvents]);
  const highlights = useMemo(() => getMarketShiftHighlights(filtered), [filtered]);
  const momentum = useMemo(() => computeTimelineMomentum(filtered), [filtered]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-border/80 bg-muted/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <History className="h-3 w-3" />
            Intelligence terminal
          </div>
          <h1 className="display-title">AI timeline</h1>
          <p className="mt-2 max-w-2xl body-muted">
            Historical and emerging signals across models, capital, agents, regulation, and infrastructure—not a news feed.
          </p>
        </div>
        <TerminalStats momentum={momentum} eventCount={filtered.length} shiftCount={highlights.length} />
      </header>

      <TimelineMarketShifts highlights={highlights} />

      <TimelineForecast articles={articles} />

      <TimelineFiltersBar
        companies={companies}
        viewMode={viewMode}
        granularity={granularity}
        onViewModeChange={setViewMode}
        onGranularityChange={setGranularity}
      />

      {filtered.length ? (
        viewMode === "vertical" ? (
          <TimelineVertical clusters={clusters} />
        ) : (
          <TimelineHorizontal clusters={clusters} />
        )
      ) : (
        <EmptyState
          icon={Activity}
          title="No events match filters"
          description="Broaden category, company, or event-type filters to explore the intelligence timeline."
        />
      )}
    </div>
  );
}

function TerminalStats({ momentum, eventCount, shiftCount }: { momentum: number; eventCount: number; shiftCount: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        ["Momentum", momentum.toString()],
        ["Events", eventCount.toString()],
        ["Shifts", shiftCount.toString()]
      ].map(([label, value]) => (
        <div key={label} className="surface rounded-lg px-4 py-3 text-center">
          <p className="font-data text-2xl font-semibold">{value}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}
