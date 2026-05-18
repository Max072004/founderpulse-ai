"use client";

import { Clock, Zap } from "lucide-react";
import { ConfidenceBadge, UrgencyBadge } from "@/components/brief/brief-indicators";
import { Badge } from "@/components/ui/badge";
import type { DailyBrief } from "@/lib/intelligence/daily-brief";
import { cn } from "@/lib/utils/cn";

export function BriefStickySummary({ brief, className }: { brief: DailyBrief; className?: string }) {
  return (
    <div
      className={cn(
        "sticky top-14 z-20 border-b border-border/60 bg-background/90 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            <Zap className="h-3 w-3" />
            Daily brief
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Read in {brief.readMinutes} min
          </span>
          <UrgencyBadge level={brief.overallUrgency} />
          <ConfidenceBadge level={brief.overallConfidence} />
        </div>
        <h1 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.02em] sm:text-xl">
          {brief.headline}
        </h1>
        <ul className="mt-3 space-y-1.5">
          {brief.executiveSummary.slice(0, 4).map((line) => (
            <li key={line} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {brief.sectorTags.map((tag) => (
            <Badge key={tag} variant="muted">{tag}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
