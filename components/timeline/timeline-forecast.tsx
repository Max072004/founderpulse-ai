import { Telescope } from "lucide-react";
import { parseStrategicSignal } from "@/lib/ai/strategic-signal";
import type { Article } from "@/lib/db/types";

export function TimelineForecast({ articles }: { articles: Article[] }) {
  const trends = new Map<string, number>();

  for (const article of articles) {
    const signal = parseStrategicSignal(article);
    for (const trend of signal.future_trends) {
      trends.set(trend, (trends.get(trend) ?? 0) + article.importance_score);
    }
  }

  const ranked = Array.from(trends.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text]) => text);

  if (!ranked.length) return null;

  return (
    <section className="rounded-xl border border-border/60 bg-card/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Telescope className="h-4 w-4 text-accent" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Forward radar · 12–24 months
        </h3>
      </div>
      <ul className="space-y-2">
        {ranked.map((trend, index) => (
          <li key={trend} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-data shrink-0 text-xs text-muted-foreground/70">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{trend}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
