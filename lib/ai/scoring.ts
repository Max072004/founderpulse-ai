import type { ArticleCategory } from "@/lib/db/types";

const founderKeywords = [
  "startup",
  "developer",
  "enterprise",
  "pricing",
  "api",
  "agent",
  "funding",
  "open source",
  "workflow",
  "automation",
  "model",
  "regulation"
];

export function categorizeText(text: string, hint?: ArticleCategory | null): ArticleCategory[] {
  const lower = text.toLowerCase();
  const categories = new Set<ArticleCategory>();
  if (hint) categories.add(hint);
  if (/agent|workflow|automation/.test(lower)) categories.add("agents");
  if (/funding|raised|valuation|series [abc]/.test(lower)) categories.add("funding");
  if (/gpu|chip|nvidia|semiconductor|inference/.test(lower)) categories.add("chips");
  if (/policy|regulat|copyright|lawsuit|safety/.test(lower)) categories.add("regulation");
  if (/open source|weights|github|hugging face/.test(lower)) categories.add("open_source");
  if (/research|paper|benchmark|dataset/.test(lower)) categories.add("research");
  if (/enterprise|customer|security|compliance/.test(lower)) categories.add("enterprise_ai");
  if (/consumer|app|iphone|android|creator/.test(lower)) categories.add("consumer_ai");
  if (/model|llm|multimodal|release|preview/.test(lower)) categories.add("model_release");
  if (/infra|database|vector|rag|orchestration|cloud/.test(lower)) categories.add("infrastructure");
  return Array.from(categories).slice(0, 4);
}

export function scoreImportance(text: string, categories: ArticleCategory[]) {
  const lower = text.toLowerCase();
  const keywordScore = founderKeywords.reduce((score, keyword) => {
    return lower.includes(keyword) ? score + 7 : score;
  }, 0);
  const categoryBoost = categories.length * 6;
  const marketBoost = /launch|release|partner|acquire|funding|regulation|benchmark/.test(lower) ? 12 : 0;
  return Math.min(100, Math.max(18, 28 + keywordScore + categoryBoost + marketBoost));
}
