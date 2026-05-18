import { Suspense } from "react";
import Link from "next/link";
import { Newspaper, RefreshCw } from "lucide-react";
import { ArticleCard } from "@/components/dashboard/article-card";
import { CompanyMomentumSection } from "@/components/dashboard/company-momentum";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { Filters } from "@/components/dashboard/filters";
import { FounderSignalSection } from "@/components/dashboard/founder-signal";
import { MarketShiftSection } from "@/components/dashboard/market-shift";
import { TrendingSectorsSection } from "@/components/dashboard/trending-sectors";
import { AppShell } from "@/components/ui/shell";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { getArticles } from "@/lib/db/articles";
import {
  computeCompanyMomentum,
  computeMarketShifts,
  computeTrendingSectors,
  getFounderSignals
} from "@/lib/intelligence/analytics";

type DashboardProps = {
  searchParams: Promise<{ q?: string; category?: string; minScore?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const params = await searchParams;
  const articles = await getArticles({
    q: params.q,
    category: params.category,
    minScore: params.minScore ? Number(params.minScore) : undefined
  });

  const allArticles = await getArticles({ limit: 80 });
  const topScore = Math.max(...articles.map((article) => article.importance_score), 0);
  const opportunities = articles.reduce((sum, article) => sum + article.startup_opportunities.length, 0);
  const highPriority = articles.filter((article) => article.importance_score >= 85).length;

  const founderSignals = getFounderSignals(allArticles.length ? allArticles : articles);
  const marketShifts = computeMarketShifts(allArticles.length ? allArticles : articles);
  const trendingSectors = computeTrendingSectors(allArticles.length ? allArticles : articles);
  const companyMomentum = computeCompanyMomentum(allArticles.length ? allArticles : articles);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 animate-fade-in">
          <p className="section-label">Intelligence terminal</p>
          <h1 className="display-title mt-2 text-balance">Founder signal dashboard</h1>
          <p className="mt-3 max-w-2xl body-muted">
            Prioritize what matters. Track market shifts, sector momentum, and disruption risk across live AI intelligence.
          </p>
          <Link
            href="/brief"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
          >
            Read today&apos;s Daily Founder Brief →
          </Link>
        </header>

        <DashboardMetrics
          signalCount={articles.length}
          topScore={topScore}
          opportunities={opportunities}
          highPriority={highPriority}
        />

        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_380px]">
          <div className="space-y-10 animate-slide-up">
            <FounderSignalSection signals={founderSignals} />
            <TrendingSectorsSection sectors={trendingSectors} />

            <section className="space-y-4">
              <SectionHeader
                label="Feed"
                title="All signals"
                description="Filter and scan the full intelligence stream."
              />
              <Suspense fallback={<FiltersSkeleton />}>
                <Filters />
              </Suspense>
              <div className="grid gap-3">
                {articles.length ? (
                  articles.map((article) => <ArticleCard key={article.id} article={article} />)
                ) : (
                  <EmptyState
                    icon={Newspaper}
                    title="No signals match your filters"
                    description="Try broadening your search or lowering the importance threshold. If the database is empty, run ingestion to populate live intelligence."
                  />
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8 animate-slide-up">
            <MarketShiftSection shifts={marketShifts} />
            <CompanyMomentumSection companies={companyMomentum} />
            <InsightPanel />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function InsightPanel() {
  return (
    <div className="rounded-xl border border-border/60 bg-gradient-to-b from-card/80 to-card/30 p-5">
      <div className="mb-3 flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Founder lens</h3>
      </div>
      <ul className="space-y-3 text-xs leading-relaxed text-muted-foreground">
        <li>Priority signals (85+) deserve same-day review — they compound fast.</li>
        <li>Disruption badges reflect regulatory, model, and workflow risk — not hype.</li>
        <li>Use opportunities as wedge hypotheses. Validate with buyers before building.</li>
      </ul>
    </div>
  );
}

function FiltersSkeleton() {
  return <div className="h-[58px] skeleton-shimmer rounded-xl" />;
}
