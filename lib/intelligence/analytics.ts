import type { StrategicSignal } from "@/lib/ai/strategic-signal";
import { parseStrategicSignal } from "@/lib/ai/strategic-signal";
import type { Article, ArticleCategory } from "@/lib/db/types";

export type DisruptionLevel = "low" | "moderate" | "elevated" | "critical";

export type DisruptionRisk = {
  level: DisruptionLevel;
  label: string;
  score: number;
};

export type FounderSignal = {
  article: Article;
  risk: DisruptionRisk;
  strategic: StrategicSignal;
};

export type MarketShift = {
  category: ArticleCategory;
  label: string;
  direction: "surging" | "cooling" | "stable";
  delta: number;
  signalCount: number;
  averageScore: number;
};

export type TrendingSector = {
  category: ArticleCategory;
  label: string;
  momentum: number;
  signalCount: number;
  averageScore: number;
  velocity: "hot" | "rising" | "steady";
};

export type CompanyMomentum = {
  name: string;
  mentions: number;
  averageScore: number;
  trend: "accelerating" | "steady" | "fading";
  latestSignal?: string;
};

const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  model_release: "Model releases",
  funding: "Funding & M&A",
  infrastructure: "Infrastructure",
  enterprise_ai: "Enterprise AI",
  consumer_ai: "Consumer AI",
  regulation: "Regulation",
  research: "Research",
  open_source: "Open source",
  chips: "Chips & hardware",
  agents: "AI agents"
};

const TRACKED_COMPANIES = [
  "OpenAI",
  "Anthropic",
  "Google",
  "Meta",
  "Microsoft",
  "Amazon",
  "Nvidia",
  "Apple",
  "xAI",
  "Mistral",
  "Cohere",
  "Hugging Face",
  "Databricks",
  "Snowflake",
  "Stripe",
  "Salesforce"
] as const;

export function formatCategory(category: ArticleCategory | string) {
  return CATEGORY_LABELS[category as ArticleCategory] ?? category.replaceAll("_", " ");
}

export function computeDisruptionRisk(article: Article): DisruptionRisk {
  const categories = new Set(article.categories);
  let score = Math.round(article.importance_score * 0.35);

  if (categories.has("regulation")) score += 28;
  if (categories.has("agents")) score += 22;
  if (categories.has("model_release")) score += 20;
  if (categories.has("chips")) score += 18;
  if (categories.has("funding")) score += 14;
  if (categories.has("enterprise_ai")) score += 12;
  if (article.startup_opportunities.length >= 3) score += 8;

  score = Math.min(100, score);

  if (score >= 78) {
    return { level: "critical", label: "Critical disruption", score };
  }
  if (score >= 62) {
    return { level: "elevated", label: "Elevated risk", score };
  }
  if (score >= 45) {
    return { level: "moderate", label: "Moderate shift", score };
  }
  return { level: "low", label: "Low disruption", score };
}

export function getFounderSignals(articles: Article[], limit = 4): FounderSignal[] {
  return [...articles]
    .sort((a, b) => b.importance_score - a.importance_score)
    .slice(0, limit)
    .map((article) => ({
      article,
      risk: computeDisruptionRisk(article),
      strategic: parseStrategicSignal(article)
    }));
}

export function computeMarketShifts(articles: Article[]): MarketShift[] {
  const midpoint = Math.floor(articles.length / 2);
  const recent = articles.slice(0, midpoint || articles.length);
  const prior = articles.slice(midpoint || articles.length);

  const bucket = (list: Article[]) => {
    const map = new Map<ArticleCategory, { count: number; score: number }>();
    for (const article of list) {
      for (const category of article.categories) {
        const current = map.get(category) ?? { count: 0, score: 0 };
        map.set(category, {
          count: current.count + 1,
          score: current.score + article.importance_score
        });
      }
    }
    return map;
  };

  const recentMap = bucket(recent);
  const priorMap = bucket(prior);

  const shifts: MarketShift[] = [];

  for (const [category, recentValue] of recentMap) {
    const priorValue = priorMap.get(category);
    const recentAvg = recentValue.score / recentValue.count;
    const priorAvg = priorValue ? priorValue.score / priorValue.count : recentAvg * 0.72;
    const delta = Math.round(recentAvg - priorAvg);

    shifts.push({
      category,
      label: formatCategory(category),
      direction: delta >= 6 ? "surging" : delta <= -4 ? "cooling" : "stable",
      delta,
      signalCount: recentValue.count,
      averageScore: Math.round(recentAvg)
    });
  }

  return shifts.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5);
}

export function computeTrendingSectors(articles: Article[]): TrendingSector[] {
  const map = new Map<ArticleCategory, { count: number; score: number }>();

  for (const article of articles) {
    for (const category of article.categories) {
      const current = map.get(category) ?? { count: 0, score: 0 };
      map.set(category, {
        count: current.count + 1,
        score: current.score + article.importance_score
      });
    }
  }

  return Array.from(map.entries())
    .map(([category, value]) => {
      const averageScore = Math.round(value.score / value.count);
      const momentum = Math.min(100, Math.round(averageScore * 0.65 + value.count * 6));
      return {
        category,
        label: formatCategory(category),
        momentum,
        signalCount: value.count,
        averageScore,
        velocity: (momentum >= 82 ? "hot" : momentum >= 68 ? "rising" : "steady") as TrendingSector["velocity"]
      };
    })
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 6);
}

export function computeCompanyMomentum(articles: Article[]): CompanyMomentum[] {
  const map = new Map<string, { mentions: number; score: number; latest?: string }>();

  for (const article of articles) {
    for (const company of TRACKED_COMPANIES) {
      if (!article.title.includes(company) && !article.summary?.includes(company)) continue;
      const current = map.get(company) ?? { mentions: 0, score: 0, latest: undefined };
      map.set(company, {
        mentions: current.mentions + 1,
        score: current.score + article.importance_score,
        latest: article.title
      });
    }
  }

  return Array.from(map.entries())
    .map(([name, value]) => {
      const averageScore = Math.round(value.score / value.mentions);
      return {
        name,
        mentions: value.mentions,
        averageScore,
        trend: (averageScore >= 82 ? "accelerating" : averageScore >= 68 ? "steady" : "fading") as CompanyMomentum["trend"],
        latestSignal: value.latest
      };
    })
    .sort((a, b) => b.mentions * b.averageScore - a.mentions * a.averageScore)
    .slice(0, 8);
}

export function scoreTier(score: number) {
  if (score >= 85) return { label: "Priority", tone: "critical" as const };
  if (score >= 70) return { label: "High", tone: "elevated" as const };
  if (score >= 55) return { label: "Watch", tone: "moderate" as const };
  return { label: "Background", tone: "low" as const };
}
