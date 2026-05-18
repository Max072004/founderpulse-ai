"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, LayoutGrid, Rows3 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import type { TimelineViewMode, TimelineGranularity } from "@/lib/intelligence/timeline";

const categories = [
  "all", "model_release", "funding", "agents", "enterprise_ai", "infrastructure",
  "open_source", "regulation", "research", "chips", "consumer_ai"
];

const eventTypes = [
  "all", "model_launch", "funding", "acquisition", "agent_breakthrough",
  "regulation", "infrastructure", "market_signal"
];

type TimelineFiltersProps = {
  companies: string[];
  viewMode: TimelineViewMode;
  granularity: TimelineGranularity;
  onViewModeChange: (mode: TimelineViewMode) => void;
  onGranularityChange: (g: TimelineGranularity) => void;
};

export function TimelineFiltersBar({
  companies, viewMode, granularity, onViewModeChange, onGranularityChange
}: TimelineFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    router.push(`/timeline?${next.toString()}`);
  }

  return (
    <div className="surface flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Filter className="h-3.5 w-3.5" />
        Terminal filters
      </div>
      <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Select className="h-9 bg-background/60 text-xs" defaultValue={params.get("category") ?? "all"} onChange={(e) => update("category", e.target.value)}>
          <option value="all">All categories</option>
          {categories.filter((c) => c !== "all").map((c) => (
            <option key={c} value={c}>{c.replaceAll("_", " ")}</option>
          ))}
        </Select>
        <Select className="h-9 bg-background/60 text-xs" defaultValue={params.get("eventType") ?? "all"} onChange={(e) => update("eventType", e.target.value)}>
          <option value="all">All event types</option>
          {eventTypes.filter((t) => t !== "all").map((t) => (
            <option key={t} value={t}>{t.replaceAll("_", " ")}</option>
          ))}
        </Select>
        <Select className="h-9 bg-background/60 text-xs" defaultValue={params.get("company") ?? "all"} onChange={(e) => update("company", e.target.value)}>
          <option value="all">All companies</option>
          {companies.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select className="h-9 bg-background/60 text-xs" defaultValue={params.get("sort") ?? "date"} onChange={(e) => update("sort", e.target.value)}>
          <option value="date">Sort by date</option>
          <option value="importance">Sort by importance</option>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle icon={Rows3} label="Vertical" active={viewMode === "vertical"} onClick={() => onViewModeChange("vertical")} />
        <ViewToggle icon={LayoutGrid} label="Horizontal" active={viewMode === "horizontal"} onClick={() => onViewModeChange("horizontal")} />
        <span className="mx-1 h-5 w-px bg-border" />
        <button type="button" onClick={() => onGranularityChange("week")} className={cn("rounded-md px-2.5 py-1.5 text-xs transition", granularity === "week" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>Week</button>
        <button type="button" onClick={() => onGranularityChange("month")} className={cn("rounded-md px-2.5 py-1.5 text-xs transition", granularity === "month" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>Month</button>
      </div>
    </div>
  );
}

function ViewToggle({ icon: Icon, label, active, onClick }: { icon: typeof Filter; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition", active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>
      <Icon className="h-3.5 w-3.5" />{label}
    </button>
  );
}
