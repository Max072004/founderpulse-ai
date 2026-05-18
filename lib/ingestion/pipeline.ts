import { getServiceSupabase } from "@/lib/db/supabase";
import { generateFounderInsight } from "@/lib/ai/gemini";
import { STRATEGIC_SIGNAL_METADATA_KEY } from "@/lib/ai/strategic-signal";
import { fetchAllFeeds, type RawArticle } from "@/lib/ingestion/rss";
import { DEFAULT_FEEDS } from "@/lib/news/feeds";

export type IngestionResult = {
  fetched: number;
  inserted: number;
  summarized: number;
  skipped: number;
  failed: number;
};

async function upsertRawArticle(article: RawArticle) {
  const supabase = getServiceSupabase();
  const { data: existing, error: findError } = await supabase
    .from("articles")
    .select("id,status")
    .eq("hash", article.hash)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return { articleId: existing.id, inserted: false, status: existing.status };

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: article.title,
      source_name: article.sourceName,
      source_url: article.sourceUrl,
      canonical_url: article.canonicalUrl,
      author: article.author ?? null,
      published_at: article.publishedAt ?? null,
      raw_excerpt: article.rawExcerpt ?? null,
      slug: article.slug,
      hash: article.hash,
      categories: article.categoryHint ? [article.categoryHint] : [],
      status: "raw",
      metadata: { categoryHint: article.categoryHint ?? null }
    })
    .select("id,status")
    .single();

  if (error) throw error;
  return { articleId: data.id, inserted: true, status: data.status };
}

async function summarizeArticle(article: RawArticle, articleId: string) {
  const supabase = getServiceSupabase();
  const insight = await generateFounderInsight({
    title: article.title,
    sourceName: article.sourceName,
    url: article.canonicalUrl,
    excerpt: article.rawExcerpt,
    categoryHint: article.categoryHint
  });

  const { error } = await supabase
    .from("articles")
    .update({
      summary: insight.summary,
      founder_insight: insight.founder_insight,
      why_it_matters: insight.why_it_matters,
      startup_opportunities: insight.startup_opportunities,
      categories: insight.categories,
      importance_score: insight.importance_score,
      signal_score: insight.importance_score,
      metadata: { [STRATEGIC_SIGNAL_METADATA_KEY]: insight.strategic_signal },
      status: "summarized",
      updated_at: new Date().toISOString()
    })
    .eq("id", articleId);

  if (error) throw error;
}

export async function runIngestion(): Promise<IngestionResult> {
  const articles = await fetchAllFeeds(DEFAULT_FEEDS);
  const result: IngestionResult = {
    fetched: articles.length,
    inserted: 0,
    summarized: 0,
    skipped: 0,
    failed: 0
  };

  for (const article of articles) {
    try {
      const upserted = await upsertRawArticle(article);
      if (!upserted.inserted && upserted.status === "summarized") {
        result.skipped += 1;
        continue;
      }
      if (upserted.inserted) result.inserted += 1;
      await summarizeArticle(article, upserted.articleId);
      result.summarized += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message.split("\n")[0] : "Unknown error";
      console.error("Ingestion item failed", message);
      result.failed += 1;
    }
  }

  return result;
}
