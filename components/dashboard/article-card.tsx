import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisruptionBadge } from "@/components/dashboard/disruption-badge";
import { ImportanceScore } from "@/components/dashboard/importance-score";
import { parseStrategicSignal } from "@/lib/ai/strategic-signal";
import { computeDisruptionRisk } from "@/lib/intelligence/analytics";
import type { Article } from "@/lib/db/types";

export function ArticleCard({ article }: { article: Article }) {
  const risk = computeDisruptionRisk(article);
  const strategic = parseStrategicSignal(article);

  return (
    <Card className="surface-interactive group">
      <CardHeader className="space-y-4 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <DisruptionBadge risk={risk} />
              <span className="text-[11px] text-muted-foreground">{article.source_name}</span>
              {article.published_at ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock3 className="h-3 w-3" />
                  {new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
                    new Date(article.published_at)
                  )}
                </span>
              ) : null}
            </div>
            <CardTitle className="text-base leading-snug">
              <Link href={`/articles/${article.slug}`} className="transition group-hover:text-primary">
                {article.title}
              </Link>
            </CardTitle>
          </div>
          <ImportanceScore score={article.importance_score} size="md" showLabel />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm font-medium leading-relaxed text-foreground/90">
          {strategic.thesis}
        </p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{strategic.market_shift}</p>
        <div className="flex flex-wrap gap-1.5">
          {article.categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="muted">
              {category.replaceAll("_", " ")}
            </Badge>
          ))}
        </div>
        <Link
          href={`/articles/${article.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100"
        >
          Read intelligence <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
