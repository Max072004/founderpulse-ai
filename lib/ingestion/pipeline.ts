import { getServiceSupabase } from "@/lib/db/supabase";
import { generateFounderInsight } from "@/lib/ai/gemini";
import { STRATEGIC_SIGNAL_METADATA_KEY } from "@/lib/ai/strategic-signal";
import { fetchAllFeeds, RawArticle } from "@/lib/ingestion/rss";
import { DEFAULT_FEEDS } from "@/lib/news/feeds";

export type IngestionResult = {
  fetched: number;
  inserted: number;
  summarized: number;
  skipped: number;
  failed: number;
};

function sleep(ms: number) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}

async function upsertRawArticle(
  article: RawArticle
) {

  const supabase =
    getServiceSupabase();

  const {
    data: existing,
    error
  } =
  await supabase

    .from("articles")

    .select(
      "id,status"
    )

    .eq(
      "hash",
      article.hash
    )

    .maybeSingle();

  if (error) {
    throw error;
  }

  if (existing) {

    return {

      articleId:
        existing.id,

      inserted:
        false,

      status:
        existing.status

    };

  }

  const {
    data,
    error: insertError
  } =
  await supabase

    .from("articles")

    .insert({

      title:
        article.title,

      source_name:
        article.sourceName,

      source_url:
        article.sourceUrl,

      canonical_url:
        article.canonicalUrl,

      author:
        article.author,

      published_at:
        article.publishedAt,

      raw_excerpt:
        article.rawExcerpt,

      slug:
        article.slug,

      hash:
        article.hash,

      categories:
        article.categoryHint
          ? [article.categoryHint]
          : [],

      status:
        "raw",

      metadata: {

        categoryHint:
          article.categoryHint

      }

    })

    .select(
      "id,status"
    )

    .single();

  if (insertError) {
    throw insertError;
  }

  return {

    articleId:
      data.id,

    inserted:
      true,

    status:
      data.status

  };

}

export async function runIngestion():

Promise<IngestionResult> {

  const supabase =
    getServiceSupabase();

  const articles =
    await fetchAllFeeds(
      DEFAULT_FEEDS
    );

  const result =
  {

    fetched:
      articles.length,

    inserted:
      0,

    summarized:
      0,

    skipped:
      0,

    failed:
      0

  };

  for (

    const article
    of articles

  ) {

    let articleId =
      "";

    try {

      const upserted =

      await upsertRawArticle(
        article
      );

      articleId =
        upserted.articleId;

      if (

        !upserted.inserted &&

        upserted.status ===
        "summarized"

      ) {

        result.skipped++;

        continue;

      }

      if (

        upserted.inserted

      ) {

        result.inserted++;

      }

      const insight =

      await generateFounderInsight({

        title:
          article.title,

        sourceName:
          article.sourceName,

        url:
          article.canonicalUrl,

        excerpt:
          article.rawExcerpt,

        categoryHint:
          article.categoryHint

      });

      const {
        error: updateError
      } =
      await supabase

        .from("articles")

        .update({

          summary:
            insight.summary,

          founder_insight:
            insight.founder_insight,

          why_it_matters:
            insight.why_it_matters,

          startup_opportunities:
            insight.startup_opportunities,

          categories:
            insight.categories,

          importance_score:
            insight.importance_score,

          signal_score:
            insight.importance_score,

          metadata: {

            [STRATEGIC_SIGNAL_METADATA_KEY]:

            insight
              .strategic_signal

          },

          status:
            "summarized",

          updated_at:
            new Date()
              .toISOString()

        })

        .eq(
          "id",
          articleId
        );

      if (
        updateError
      ) {

        throw updateError;

      }

      result.summarized++;

      await sleep(
        1000
      );

    }

    catch (error) {

      console.log(
        "Failed:",
        error
      );

      if (
        articleId
      ) {

        await supabase

          .from("articles")

          .update({

            status:
              "failed"

          })

          .eq(
            "id",
            articleId
          );

      }

      result.failed++;

    }

  }

  return result;

}