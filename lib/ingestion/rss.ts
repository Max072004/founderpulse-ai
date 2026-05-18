import Parser from "rss-parser";
import { DEFAULT_FEEDS, type NewsFeed } from "@/lib/news/feeds";
import { createArticleHash, normalizeUrl, slugify } from "@/lib/ingestion/dedupe";
import type { ArticleCategory } from "@/lib/db/types";

const parser = new Parser({
  timeout: 12000,
  headers: {
    "User-Agent": "FounderPulseAI/1.0 (+https://founderpulse.ai)"
  }
});

export type RawArticle = {
  title: string;
  sourceName: string;
  sourceUrl: string;
  canonicalUrl: string;
  author?: string | null;
  publishedAt?: string | null;
  rawExcerpt?: string | null;
  hash: string;
  slug: string;
  categoryHint?: ArticleCategory | null;
};

export async function fetchFeed(feed: NewsFeed): Promise<RawArticle[]> {
  const parsed = await parser.parseURL(feed.url);
  return parsed.items
    .filter((item) => item.title && item.link)
    .slice(0, 20)
    .map((item) => {
      const canonicalUrl = normalizeUrl(item.link as string);
      const title = item.title as string;
      const date = item.isoDate || item.pubDate || null;
      return {
        title,
        sourceName: feed.name,
        sourceUrl: feed.url,
        canonicalUrl,
        author: item.creator || item.author || null,
        publishedAt: date ? new Date(date).toISOString() : null,
        rawExcerpt: item.contentSnippet || item.summary || item.content || null,
        hash: createArticleHash(title, canonicalUrl),
        slug: `${slugify(title)}-${createArticleHash(title, canonicalUrl).slice(0, 8)}`,
        categoryHint: feed.categoryHint ?? null
      };
    });
}

export async function fetchAllFeeds(feeds = DEFAULT_FEEDS) {
  const settled = await Promise.allSettled(feeds.map(fetchFeed));
  return settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}
