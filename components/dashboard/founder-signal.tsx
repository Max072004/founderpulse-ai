import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DisruptionBadge } from "@/components/dashboard/disruption-badge";
import { ImportanceScore } from "@/components/dashboard/importance-score";
import { StrategicSignalBody } from "@/components/dashboard/strategic-signal-body";
import type { FounderSignal } from "@/lib/intelligence/analytics";
import { cn } from "@/lib/utils/cn";

export function FounderSignalSection({ signals }: { signals: FounderSignal[] }) {
  if (!signals.length) {
    return (
      <Card>
        <CardContent className="pt-5">
          <EmptyState
            icon={Radio}
            title="No strategic signals yet"
            description="Run ingestion to generate venture-grade intelligence: market shifts, threatened models, and forward trends."
          />
        </CardContent>
      </Card>
    );
  }

  const [featured, ...rest] = signals;

  return (
    <section className="space-y-4">
      <SectionHeader
        label="Strategic intelligence"
        title="Elite founder signals"
        description="Opinionated theses, market shifts, and investor-grade forecasts—not news recaps."
      />
      <Card className={cn("glow-accent overflow-hidden", featured.risk.level === "critical" && "border-primary/25")}>
        <CardHeader className="space-y-4 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <DisruptionBadge risk={featured.risk} />
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Priority signal
              </span>
            </div>
            <ImportanceScore score={featured.article.importance_score} size="lg" />
          </div>
          <CardTitle className="text-sm font-normal leading-snug text-muted-foreground">
            <Link href={`/articles/${featured.article.slug}`} className="transition hover:text-primary">
              {featured.article.title}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-2">
          <StrategicSignalBody strategic={featured.strategic} variant="featured" />
          <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-4">
            <p className="text-xs text-muted-foreground">{featured.article.source_name}</p>
            <Link
              href={`/articles/${featured.article.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary/80"
            >
              Full brief <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {rest.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((signal) => (
            <Card key={signal.article.id} className="surface-interactive group flex flex-col">
              <CardHeader className="space-y-3 pb-0">
                <div className="flex items-start justify-between gap-3">
                  <DisruptionBadge risk={signal.risk} />
                  <ImportanceScore score={signal.article.importance_score} size="sm" />
                </div>
                <CardTitle className="line-clamp-2 text-xs font-normal leading-snug text-muted-foreground">
                  <Link href={`/articles/${signal.article.slug}`} className="group-hover:text-primary">
                    {signal.article.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-3">
                <StrategicSignalBody strategic={signal.strategic} variant="compact" />
                <Link
                  href={`/articles/${signal.article.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition group-hover:opacity-100"
                >
                  Read brief <ArrowUpRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}
