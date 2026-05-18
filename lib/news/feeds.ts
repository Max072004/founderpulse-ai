import type { ArticleCategory } from "@/lib/db/types";

export type NewsFeed = {
  name: string;
  url: string;
  categoryHint?: ArticleCategory;
};

export const DEFAULT_FEEDS: NewsFeed[] = [
  { name: "OpenAI Blog", url: "https://openai.com/news/rss.xml", categoryHint: "model_release" },
  { name: "Google DeepMind", url: "https://deepmind.google/discover/blog/rss.xml", categoryHint: "research" },
  { name: "Anthropic News", url: "https://www.anthropic.com/news/rss.xml", categoryHint: "model_release" },
  { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml", categoryHint: "open_source" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", categoryHint: "enterprise_ai" },
  { name: "MIT AI News", url: "https://news.mit.edu/rss/topic/artificial-intelligence2", categoryHint: "research" }
];
