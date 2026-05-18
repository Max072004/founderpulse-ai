"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { ImportanceScore } from "@/components/dashboard/importance-score";
import {
  getEventTypeLabel,
  getEventTypeStyles,
  getTrendStyles,
  type TimelineEvent
} from "@/lib/intelligence/timeline";
import { cn } from "@/lib/utils/cn";

export function TimelineEventCard({
  event,
  compact = false
}: {
  event: TimelineEvent;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const typeStyles = getEventTypeStyles(event.eventType);
  const trend = getTrendStyles(event.trendDirection);

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-card/50 transition duration-200",
        event.isMarketShift ? "border-primary/25 glow-accent" : "border-border/70",
        open && "bg-card/80"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-4 p-4 text-left"
      >
        <div className="mt-1 flex flex-col items-center gap-1">
          <span className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-background", trend.dot)} />
          {!compact ? (
            <span className={cn("font-data text-[10px] uppercase tracking-wide", trend.className)}>
              {trend.label}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", typeStyles)}>
              {getEventTypeLabel(event.eventType)}
            </span>
            {event.isMarketShift ? (
              <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                Market shift
              </span>
            ) : null}
            <span className="text-[10px] text-muted-foreground">{event.categoryLabel}</span>
          </div>
          <h3 className={cn("font-medium leading-snug tracking-[-0.01em]", compact ? "text-sm" : "text-base")}>
            {event.title}
          </h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{event.founderImplication}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <ImportanceScore score={event.importanceScore} size="sm" />
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")} />
        </div>
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border/60 px-4 pb-4 pt-3">
          <DetailBlock label="Why it matters" text={event.whyItMatters} />
          <DetailBlock label="Market impact" text={event.marketImpact} />
          <DetailBlock label="Founder implication" text={event.founderImplication} highlight />
          {event.companies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {event.companies.map((c) => (
                <span key={c} className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-muted-foreground">{event.sourceName}</span>
            {event.slug.startsWith("milestone-") ? null : (
              <Link
                href={`/articles/${event.slug}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
              >
                Full brief <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function DetailBlock({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm leading-relaxed", highlight ? "font-medium text-foreground" : "text-muted-foreground")}>
        {text}
      </p>
    </div>
  );
}
