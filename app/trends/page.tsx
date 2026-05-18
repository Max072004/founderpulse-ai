import { BarChart3 } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ImportanceScore } from "@/components/dashboard/importance-score";
import { getArticles } from "@/lib/db/articles";
import { computeTrendingSectors } from "@/lib/intelligence/analytics";

export default async function TrendsPage() {
  const articles = await getArticles({ limit: 80 });
  const sectors = computeTrendingSectors(articles);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="section-label">Sector analysis</p>
          <h1 className="display-title mt-2">AI trend map</h1>
          <p className="mt-3 max-w-2xl body-muted">
            Where founder-relevant signals cluster — model releases, agents, infrastructure, regulation, and more.
          </p>
        </header>

        {sectors.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sectors.map((sector, index) => (
              <Card key={sector.category} className="surface-interactive">
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0">
                  <div>
                    <span className="font-data text-xs text-muted-foreground">#{String(index + 1).padStart(2, "0")}</span>
                    <CardTitle className="mt-2 text-base">{sector.label}</CardTitle>
                    <Badge variant="muted" className="mt-2">{sector.velocity}</Badge>
                  </div>
                  <ImportanceScore score={sector.averageScore} size="md" showLabel />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${sector.momentum}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{sector.signalCount} signals</span>
                    <span className="font-data">{sector.momentum} momentum</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={BarChart3}
                title="No trend data yet"
                description="Trend categories appear after ingestion stores summarized articles with category tags."
              />
            </CardContent>
          </Card>
        )}

      </div>
    </AppShell>
  );
}
