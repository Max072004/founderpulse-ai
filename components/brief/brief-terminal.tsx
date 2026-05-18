"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { BriefExportPanel } from "@/components/brief/brief-export-panel";
import { ConfidenceBadge, UrgencyBadge } from "@/components/brief/brief-indicators";
import { BriefSection } from "@/components/brief/brief-section";
import { BriefStickySummary } from "@/components/brief/brief-sticky-summary";
import { Badge } from "@/components/ui/badge";
import { generateDailyBrief } from "@/lib/intelligence/daily-brief";
import type { Article } from "@/lib/db/types";
import { cn } from "@/lib/utils/cn";

export function BriefTerminal({ articles }: { articles: Article[] }) {
  const [exportMode, setExportMode] = useState(false);
  const brief = useMemo(() => generateDailyBrief(articles), [articles]);

  return (
    <div className={cn(exportMode && "brief-export-mode")}>
      {!exportMode ? <BriefStickySummary brief={brief} /> : null}

      <article
        className={cn(
          "mx-auto px-4 py-8 sm:px-6",
          exportMode ? "brief-export-canvas max-w-[1080px]" : "max-w-3xl"
        )}
      >
        <header className={cn("mb-8", exportMode && "brief-export-header")}>
          <p className="font-data text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            FounderPulse Intelligence · {brief.editionLabel}
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.03em] sm:text-4xl">
            Daily Founder Brief
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Compressed strategic intelligence synthesized from founder signals, timeline events, and market shifts.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <UrgencyBadge level={brief.overallUrgency} />
            <ConfidenceBadge level={brief.overallConfidence} />
            <span className="rounded-md border border-border/80 px-2 py-0.5 font-data text-[10px] text-muted-foreground">
              {brief.readMinutes}-min read
            </span>
          </div>
        </header>

        {!exportMode ? (
          <div className="mb-8">
            <BriefExportPanel brief={brief} exportMode={exportMode} onExportModeChange={setExportMode} />
          </div>
        ) : null}

        <div className={cn("brief-document divide-y divide-border/60 rounded-xl border border-border/80 bg-card/30", exportMode && "brief-export-document")}>
          <BriefSection id="signals" label="01" title="Top founder signals" count={brief.topSignals.length} defaultOpen>
            <ul className="space-y-4">
              {brief.topSignals.map((signal, i) => (
                <li key={signal.id} className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-data text-xs text-muted-foreground">#{i + 1}</span>
                    <UrgencyBadge level={signal.urgency} />
                    <ConfidenceBadge level={signal.confidence} />
                    <span className="font-data text-xs text-primary">{signal.importanceScore}</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug">{signal.thesis}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{signal.title}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {signal.sectors.map((s) => (
                      <Badge key={s} variant="muted">{s}</Badge>
                    ))}
                  </div>
                  {!signal.slug.startsWith("milestone-") ? (
                    <Link href={`/articles/${signal.slug}`} className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
                      Full signal <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </BriefSection>

          <BriefSection id="shifts" label="02" title="Biggest market shifts" count={brief.marketShifts.length}>
            <ul className="space-y-3">
              {brief.marketShifts.map((shift) => (
                <li key={shift.label} className="flex gap-4 border-l-2 border-primary/30 pl-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{shift.label}</span>
                      <span className={cn("font-data text-xs", shift.direction === "surging" ? "text-accent" : shift.direction === "cooling" ? "text-warning" : "text-muted-foreground")}>
                        {shift.direction} {shift.delta > 0 ? "+" : ""}{shift.delta}
                      </span>
                      <ConfidenceBadge level={shift.confidence} />
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{shift.insight}</p>
                  </div>
                </li>
              ))}
            </ul>
          </BriefSection>

          <BriefSection id="opportunities" label="03" title="Emerging startup opportunities" count={brief.opportunities.length}>
            <ul className="space-y-2">
              {brief.opportunities.map((opp) => (
                <li key={opp.text} className="flex items-start gap-3 rounded-lg bg-muted/20 px-3 py-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="text-sm leading-relaxed">{opp.text}</p>
                    <div className="mt-1.5 flex gap-2">
                      <Badge variant="muted">{opp.sector}</Badge>
                      <UrgencyBadge level={opp.urgency} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </BriefSection>

          <BriefSection id="infra" label="04" title="Infrastructure changes" count={brief.infrastructure.length}>
            <InsightList items={brief.infrastructure} />
          </BriefSection>

          <BriefSection id="regulatory" label="05" title="Regulatory developments" count={brief.regulatory.length}>
            <InsightList items={brief.regulatory} />
          </BriefSection>

          <BriefSection id="sectors" label="06" title="Rising AI sectors" count={brief.risingSectors.length}>
            <div className="grid gap-3 sm:grid-cols-2">
              {brief.risingSectors.map((sector) => (
                <div key={sector.label} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sector.label}</span>
                    <span className={cn("text-[10px] uppercase", sector.velocity === "hot" ? "text-warning" : "text-primary")}>{sector.velocity}</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", sector.velocity === "hot" ? "bg-warning" : "bg-primary")} style={{ width: `${sector.momentum}%` }} />
                  </div>
                  <p className="mt-1 font-data text-xs text-muted-foreground">{sector.momentum} momentum</p>
                </div>
              ))}
            </div>
          </BriefSection>

          <BriefSection id="threatened" label="07" title="Threatened incumbents" count={brief.threatenedIncumbents.length}>
            <ul className="space-y-2">
              {brief.threatenedIncumbents.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-danger">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </BriefSection>

          <BriefSection id="contrarian" label="08" title="Contrarian prediction" defaultOpen>
            <div className="rounded-lg border border-primary/25 bg-primary/5 p-5">
              <p className="text-base font-medium leading-relaxed tracking-[-0.01em]">{brief.contrarian.text}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{brief.contrarian.rationale}</p>
              <div className="mt-3">
                <ConfidenceBadge level={brief.contrarian.confidence} />
              </div>
            </div>
          </BriefSection>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Generated {new Intl.DateTimeFormat("en", { timeStyle: "short", dateStyle: "medium" }).format(new Date(brief.generatedAt))}
          </span>
          <div className="flex gap-3">
            <Link href="/cards" className="hover:text-foreground">Signal cards</Link>
            <Link href="/timeline" className="hover:text-foreground">Timeline</Link>
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          </div>
        </footer>

        {exportMode ? (
          <div className="mt-6 print:hidden">
            <BriefExportPanel brief={brief} exportMode={exportMode} onExportModeChange={setExportMode} />
            <p className="mt-2 text-center text-xs text-muted-foreground">Use browser screenshot or print to PDF · 1080px canvas</p>
          </div>
        ) : null}
      </article>
    </div>
  );
}

function InsightList({ items }: { items: { title: string; implication: string; urgency: import("@/lib/intelligence/daily-brief").UrgencyLevel; confidence: import("@/lib/intelligence/daily-brief").ConfidenceLevel }[] }) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No major developments in this window.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.title} className="space-y-1">
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{item.implication}</p>
          <div className="flex gap-2">
            <UrgencyBadge level={item.urgency} />
            <ConfidenceBadge level={item.confidence} />
          </div>
        </li>
      ))}
    </ul>
  );
}
