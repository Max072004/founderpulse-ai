import { parseStrategicSignal } from "@/lib/ai/strategic-signal";
import {
  computeMarketShifts,
  computeTrendingSectors,
  formatCategory,
  getFounderSignals
} from "@/lib/intelligence/analytics";
import {
  buildTimelineFromArticles,
  getMarketShiftHighlights,
  type TimelineEvent
} from "@/lib/intelligence/timeline";
import type { Article, ArticleCategory } from "@/lib/db/types";

export type ConfidenceLevel = "high" | "medium" | "speculative";
export type UrgencyLevel = "critical" | "elevated" | "watch";

export type BriefSignalItem = {
  id: string;
  slug: string;
  thesis: string;
  title: string;
  importanceScore: number;
  confidence: ConfidenceLevel;
  urgency: UrgencyLevel;
  sectors: string[];
};

export type BriefShiftItem = {
  label: string;
  direction: "surging" | "cooling" | "stable";
  delta: number;
  insight: string;
  confidence: ConfidenceLevel;
};

export type BriefOpportunityItem = {
  text: string;
  sector: string;
  urgency: UrgencyLevel;
};

export type BriefInsightItem = {
  title: string;
  implication: string;
  urgency: UrgencyLevel;
  confidence: ConfidenceLevel;
};

export type BriefSectorItem = {
  label: string;
  momentum: number;
  velocity: "hot" | "rising" | "steady";
};

export type ContrarianPrediction = {
  text: string;
  confidence: ConfidenceLevel;
  rationale: string;
};

export type DailyBrief = {
  editionDate: string;
  editionLabel: string;
  generatedAt: string;
  readMinutes: number;
  headline: string;
  executiveSummary: string[];
  overallConfidence: ConfidenceLevel;
  overallUrgency: UrgencyLevel;
  sectorTags: string[];
  topSignals: BriefSignalItem[];
  marketShifts: BriefShiftItem[];
  opportunities: BriefOpportunityItem[];
  infrastructure: BriefInsightItem[];
  regulatory: BriefInsightItem[];
  risingSectors: BriefSectorItem[];
  threatenedIncumbents: string[];
  contrarian: ContrarianPrediction;
};

export function generateDailyBrief(articles: Article[], editionDate = new Date()): DailyBrief {
  const signals = getFounderSignals(articles, 5);
  const shifts = computeMarketShifts(articles);
  const sectors = computeTrendingSectors(articles);
  const timeline = buildTimelineFromArticles(articles);
  const marketHighlights = getMarketShiftHighlights(timeline, 4);

  const recentWindow = 48 * 60 * 60 * 1000;
  const now = editionDate.getTime();
  const recentArticles = articles.filter((a) => {
    const t = new Date(a.published_at ?? a.created_at).getTime();
    return now - t <= recentWindow;
  });
  const pool = recentArticles.length >= 3 ? recentArticles : articles;

  const topSignals: BriefSignalItem[] = signals.slice(0, 4).map((s) => ({
    id: s.article.id,
    slug: s.article.slug,
    thesis: s.strategic.thesis,
    title: s.article.title,
    importanceScore: s.article.importance_score,
    confidence: scoreToConfidence(s.article.importance_score, s.risk.level),
    urgency: scoreToUrgency(s.article.importance_score),
    sectors: s.article.categories.map(formatCategory)
  }));

  const marketShifts: BriefShiftItem[] = shifts.length
    ? shifts.slice(0, 3).map((s) => ({
        label: s.label,
        direction: s.direction,
        delta: s.delta,
        insight:
          s.direction === "surging"
            ? `${s.label} is gaining signal density—founders should expect faster competitive resets.`
            : s.direction === "cooling"
              ? `${s.label} is losing urgency—capital may be rotating elsewhere.`
              : `${s.label} is holding steady—differentiation shifts to execution speed.`,
        confidence: scoreToConfidence(s.averageScore)
      }))
    : marketHighlights.slice(0, 3).map((e) => ({
        label: e.categoryLabel,
        direction: e.trendDirection,
        delta: e.importanceScore >= 85 ? 12 : 6,
        insight: e.marketImpact,
        confidence: scoreToConfidence(e.importanceScore)
      }));

  const opportunities = collectOpportunities(pool, sectors);
  const infrastructure = collectInsights(pool, timeline, ["infrastructure", "chips", "open_source"], "infrastructure");
  const regulatory = collectInsights(pool, timeline, ["regulation"], "regulation");
  const risingSectors: BriefSectorItem[] = sectors.slice(0, 4).map((s) => ({
    label: s.label,
    momentum: s.momentum,
    velocity: s.velocity
  }));
  const threatenedIncumbents = collectThreatened(pool, signals);
  const contrarian = buildContrarian(shifts, sectors, articles);
  const sectorTags = [...new Set(sectors.slice(0, 5).map((s) => s.label))];

  const avgScore =
    articles.length > 0
      ? articles.reduce((sum, a) => sum + a.importance_score, 0) / articles.length
      : 72;
  const overallUrgency = scoreToUrgency(Math.max(...articles.map((a) => a.importance_score), 70));
  const overallConfidence: ConfidenceLevel =
    articles.length >= 8 && avgScore >= 75 ? "high" : articles.length >= 4 ? "medium" : "speculative";

  const headline = buildHeadline(topSignals, marketShifts, risingSectors);
  const executiveSummary = buildExecutiveSummary({
    headline,
    topSignals,
    marketShifts,
    opportunities,
    risingSectors,
    threatenedIncumbents,
    contrarian,
    overallUrgency
  });

  return {
    editionDate: editionDate.toISOString().slice(0, 10),
    editionLabel: formatEditionLabel(editionDate),
    generatedAt: new Date().toISOString(),
    readMinutes: 2,
    headline,
    executiveSummary,
    overallConfidence,
    overallUrgency,
    sectorTags,
    topSignals,
    marketShifts,
    opportunities,
    infrastructure,
    regulatory,
    risingSectors,
    threatenedIncumbents,
    contrarian
  };
}

function scoreToConfidence(score: number, disruption?: string): ConfidenceLevel {
  if (score >= 85 || disruption === "critical") return "high";
  if (score >= 68 || disruption === "elevated") return "medium";
  return "speculative";
}

function scoreToUrgency(score: number): UrgencyLevel {
  if (score >= 85) return "critical";
  if (score >= 72) return "elevated";
  return "watch";
}

function buildHeadline(
  signals: BriefSignalItem[],
  shifts: BriefShiftItem[],
  sectors: BriefSectorItem[]
) {
  const thesis = signals[0]?.thesis;
  if (thesis) return thesis;
  const surging = shifts.find((s) => s.direction === "surging");
  if (surging) return `${surging.label} is accelerating—founders should reposition this week.`;
  const hot = sectors.find((s) => s.velocity === "hot");
  if (hot) return `${hot.label} momentum is peaking; window for wedges is narrowing.`;
  return "AI market structure is shifting faster than incumbent roadmaps can absorb.";
}

function buildExecutiveSummary(input: {
  headline: string;
  topSignals: BriefSignalItem[];
  marketShifts: BriefShiftItem[];
  opportunities: BriefOpportunityItem[];
  risingSectors: BriefSectorItem[];
  threatenedIncumbents: string[];
  contrarian: ContrarianPrediction;
  overallUrgency: UrgencyLevel;
}) {
  const bullets: string[] = [];
  bullets.push(input.headline);
  if (input.topSignals[0]) {
    bullets.push(`Lead signal (${input.topSignals[0].importanceScore}): ${input.topSignals[0].thesis}`);
  }
  const surging = input.marketShifts.find((s) => s.direction === "surging");
  if (surging) bullets.push(`Market shift: ${surging.label} ${surging.delta > 0 ? "+" : ""}${surging.delta} momentum.`);
  if (input.opportunities[0]) bullets.push(`Top wedge: ${input.opportunities[0].text}`);
  if (input.risingSectors[0]) bullets.push(`Hot sector: ${input.risingSectors[0].label} (${input.risingSectors[0].momentum} momentum).`);
  if (input.threatenedIncumbents[0]) bullets.push(`At risk: ${input.threatenedIncumbents[0]}.`);
  bullets.push(`Contrarian: ${input.contrarian.text}`);
  return bullets.slice(0, 6);
}

function collectOpportunities(articles: Article[], sectors: ReturnType<typeof computeTrendingSectors>) {
  const seen = new Set<string>();
  const items: BriefOpportunityItem[] = [];

  for (const article of [...articles].sort((a, b) => b.importance_score - a.importance_score)) {
    const signal = parseStrategicSignal(article);
    for (const opp of signal.startup_opportunities) {
      if (seen.has(opp) || items.length >= 5) continue;
      seen.add(opp);
      items.push({
        text: opp,
        sector: formatCategory(article.categories[0] ?? "enterprise_ai"),
        urgency: scoreToUrgency(article.importance_score)
      });
    }
  }

  if (items.length < 3 && sectors[0]) {
    items.push({
      text: `Build outcome-priced workflow software in ${sectors[0].label} before incumbents bundle agents.`,
      sector: sectors[0].label,
      urgency: "elevated"
    });
  }

  return items.slice(0, 5);
}

function collectInsights(
  articles: Article[],
  timeline: TimelineEvent[],
  categories: ArticleCategory[],
  eventType: TimelineEvent["eventType"]
) {
  const items: BriefInsightItem[] = [];
  const catSet = new Set(categories);

  for (const article of articles) {
    if (!article.categories.some((c) => catSet.has(c))) continue;
    const signal = parseStrategicSignal(article);
    items.push({
      title: article.title,
      implication: signal.market_shift,
      urgency: scoreToUrgency(article.importance_score),
      confidence: scoreToConfidence(article.importance_score)
    });
    if (items.length >= 3) break;
  }

  if (items.length < 2) {
    for (const event of timeline) {
      if (event.eventType !== eventType && !categories.includes(event.category)) continue;
      items.push({
        title: event.title,
        implication: event.marketImpact,
        urgency: scoreToUrgency(event.importanceScore),
        confidence: scoreToConfidence(event.importanceScore)
      });
      if (items.length >= 3) break;
    }
  }

  return items.slice(0, 3);
}

function collectThreatened(
  articles: Article[],
  signals: ReturnType<typeof getFounderSignals>
) {
  const seen = new Set<string>();
  const list: string[] = [];

  for (const s of signals) {
    for (const t of s.strategic.threatened_business_models) {
      if (!seen.has(t)) {
        seen.add(t);
        list.push(t);
      }
    }
  }

  for (const article of articles) {
    const signal = parseStrategicSignal(article);
    for (const t of signal.threatened_business_models) {
      if (!seen.has(t)) {
        seen.add(t);
        list.push(t);
      }
    }
    if (list.length >= 5) break;
  }

  return list.slice(0, 5);
}

function buildContrarian(
  shifts: ReturnType<typeof computeMarketShifts>,
  sectors: ReturnType<typeof computeTrendingSectors>,
  articles: Article[]
): ContrarianPrediction {
  const cooling = shifts.find((s) => s.direction === "cooling");
  const hottest = sectors[0];
  const avgHype = sectors.filter((s) => s.velocity === "hot").length;

  if (cooling && avgHype >= 2) {
    return {
      text: `While capital chases ${hottest?.label ?? "AI agents"}, ${cooling.label} is being underpriced—contrarian founders can build quietly into buyer fatigue elsewhere.`,
      confidence: "medium",
      rationale: "Cooling category delta with concurrent hype elsewhere signals misallocated founder attention."
    };
  }

  if (hottest?.velocity === "hot") {
    return {
      text: `The consensus trade in ${hottest.label} is crowded; the next margin pool is inference economics and memory infra, not another horizontal agent.`,
      confidence: "medium",
      rationale: "Sector momentum concentration historically precedes infrastructure layer repricing."
    };
  }

  const lowScore = articles.filter((a) => a.importance_score < 70 && a.categories.includes("regulation"));
  if (lowScore.length) {
    return {
      text: "Regulation headlines are noise—buyers will pay premiums for audit-ready workflow ownership, not compliance chatbots.",
      confidence: "speculative",
      rationale: "Regulatory signals score below agent/funding cluster despite media volume."
    };
  }

  return {
    text: "Enterprise AI budgets are not shrinking—they are consolidating around vendors who sell finished outcomes, not copilot seats.",
    confidence: "medium",
    rationale: "Importance scores cluster on workflow ownership signals vs. feature announcements."
  };
}

function formatEditionLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
