import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisruptionBadge } from "@/components/dashboard/disruption-badge";
import { ImportanceScore } from "@/components/dashboard/importance-score";
import { StrategicSignalBody } from "@/components/dashboard/strategic-signal-body";
import { parseStrategicSignal } from "@/lib/ai/strategic-signal";
import { getArticleBySlug } from "@/lib/db/articles";
import { computeDisruptionRisk } from "@/lib/intelligence/analytics";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const risk = computeDisruptionRisk(article);
  const strategic = parseStrategicSignal(article);

  return (
    <AppShell>
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <DisruptionBadge risk={risk} />
          <Badge variant="muted">Strategic brief</Badge>
          {article.categories.map((category) => (
            <Badge key={category} variant="muted">
              {category.replaceAll("_", " ")}
            </Badge>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_200px]">
          <div>
            <p className="section-label">Source signal</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.02em] text-muted-foreground sm:text-3xl">
              {article.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              {article.source_name}
              {article.published_at
                ? ` · ${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(article.published_at))}`
                : ""}
            </p>
            {article.summary ? (
              <p className="mt-6 border-t border-border/60 pt-6 text-sm leading-relaxed text-muted-foreground">
                {article.summary}
              </p>
            ) : null}
          </div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Importance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <ImportanceScore score={article.importance_score} size="lg" showLabel />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-10 glow-accent">
          <CardHeader>
            <p className="section-label">Strategic intelligence</p>
            <CardTitle className="text-base">Venture-grade founder signal</CardTitle>
          </CardHeader>
          <CardContent>
            <StrategicSignalBody strategic={strategic} variant="featured" />
            <a href={article.canonical_url} target="_blank" rel="noreferrer" className="mt-8 inline-block">
              <Button variant="secondary">
                Original source <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </article>
    </AppShell>
  );
}
