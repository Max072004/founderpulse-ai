import Link from "next/link";
import { ArrowRight, Database, RadioTower, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/ui/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportanceScore } from "@/components/dashboard/importance-score";
import { DisruptionBadge } from "@/components/dashboard/disruption-badge";
import { getArticles } from "@/lib/db/articles";
import { parseStrategicSignal } from "@/lib/ai/strategic-signal";
import { computeDisruptionRisk } from "@/lib/intelligence/analytics";

export default async function LandingPage() {
  const articles = await getArticles({ limit: 3 });

  return (
    <AppShell>
      <section className="relative mx-auto max-w-[1400px] px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="grid min-h-[calc(100vh-8rem)] items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-in">
            <p className="section-label">Founder intelligence platform</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              Know what matters
              <span className="block text-muted-foreground">before the market does.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              FounderPulse AI turns live AI news into ranked signals, disruption risk, sector momentum, and startup opportunities — built for founders who move fast.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg">
                  Open dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/brief">
                <Button size="lg" variant="secondary">
                  Daily brief
                </Button>
              </Link>
              <Link href="/timeline">
                <Button size="lg" variant="ghost">
                  Timeline <TrendingUp className="h-4 w-4" />
                </Button>
              </Link>
            <Link href="/trends">
              <Button size="lg" variant="ghost">
                Trends
              </Button>
            </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-8">
              {[
                ["Live signals", "RSS + Gemini"],
                ["Risk scoring", "Disruption badges"],
                ["Sector map", "Momentum tracking"]
              ].map(([label, sub]) => (
                <div key={label}>
                  <p className="font-data text-2xl font-semibold">{label.split(" ")[0]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 animate-slide-up">
            {articles.length ? articles.map((article) => {
              const risk = computeDisruptionRisk(article);
              const strategic = parseStrategicSignal(article);
              return (
                <Card key={article.id} className="surface-interactive">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 pb-0">
                    <div className="min-w-0 space-y-2">
                      <DisruptionBadge risk={risk} />
                      <CardTitle className="line-clamp-2 text-sm leading-snug">{article.title}</CardTitle>
                    </div>
                    <ImportanceScore score={article.importance_score} size="sm" />
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-foreground/90">{strategic.thesis}</p>
                  </CardContent>
                </Card>
              );
            }) : (
              <Card>
                <CardHeader><CardTitle>Waiting for live signals</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Connect Supabase and run ingestion to populate the terminal.</p></CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/20">
        <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ["RSS ingestion", "Production feed pipeline with dedupe, hashing, and source attribution.", RadioTower],
            ["Gemini analysis", "Founder insights, why-it-matters context, categories, and opportunities.", Sparkles],
            ["Supabase core", "Typed persistence, indexes, RLS-ready schema, and Vercel cron support.", Database]
          ].map(([title, text, Icon]) => (
            <Card key={title as string} className="surface-interactive">
              <CardHeader>
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle>{title as string}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{text as string}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
