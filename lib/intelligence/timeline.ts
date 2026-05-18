import { parseStrategicSignal } from "@/lib/ai/strategic-signal";
import { formatCategory } from "@/lib/intelligence/analytics";
import type { Article, ArticleCategory } from "@/lib/db/types";

export type TimelineEventType =
  | "model_launch"
  | "funding"
  | "acquisition"
  | "agent_breakthrough"
  | "regulation"
  | "infrastructure"
  | "market_signal";

export type TrendDirection = "surging" | "stable" | "cooling";

export type TimelineEvent = {
  id: string;
  slug: string;
  occurredAt: string;
  title: string;
  eventType: TimelineEventType;
  category: ArticleCategory;
  categoryLabel: string;
  importanceScore: number;
  whyItMatters: string;
  founderImplication: string;
  marketImpact: string;
  trendDirection: TrendDirection;
  companies: string[];
  isMarketShift: boolean;
  sourceName: string;
};

export type TimelineCluster = {
  key: string;
  label: string;
  start: Date;
  end: Date;
  events: TimelineEvent[];
  averageImportance: number;
  momentum: number;
  marketShiftCount: number;
};

export type TimelineFilters = {
  category?: string;
  company?: string;
  eventType?: string;
  minScore?: number;
  sort?: "importance" | "date";
};

export type TimelineViewMode = "vertical" | "horizontal";
export type TimelineGranularity = "week" | "month";

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
  "Salesforce",
  "DeepMind",
  "Perplexity"
] as const;

const EVENT_TYPE_LABELS: Record<TimelineEventType, string> = {
  model_launch: "Model launch",
  funding: "Startup funding",
  acquisition: "Acquisition",
  agent_breakthrough: "Agent breakthrough",
  regulation: "Regulatory event",
  infrastructure: "Infrastructure shift",
  market_signal: "Market signal"
};

const EVENT_TYPE_COLORS: Record<TimelineEventType, string> = {
  model_launch: "text-primary border-primary/40 bg-primary/10",
  funding: "text-accent border-accent/40 bg-accent/10",
  acquisition: "text-warning border-warning/40 bg-warning/10",
  agent_breakthrough: "text-primary border-primary/30 bg-primary/5",
  regulation: "text-danger border-danger/40 bg-danger/10",
  infrastructure: "text-muted-foreground border-border bg-muted/40",
  market_signal: "text-foreground border-border/80 bg-card/80"
};

const TREND_STYLES: Record<TrendDirection, { label: string; className: string; dot: string }> = {
  surging: { label: "Surging", className: "text-accent", dot: "bg-accent" },
  stable: { label: "Stable", className: "text-primary", dot: "bg-primary" },
  cooling: { label: "Cooling", className: "text-muted-foreground", dot: "bg-muted-foreground/60" }
};

export function getEventTypeLabel(type: TimelineEventType) {
  return EVENT_TYPE_LABELS[type];
}

export function getEventTypeStyles(type: TimelineEventType) {
  return EVENT_TYPE_COLORS[type];
}

export function getTrendStyles(direction: TrendDirection) {
  return TREND_STYLES[direction];
}

export function articleToTimelineEvent(article: Article): TimelineEvent {
  const strategic = parseStrategicSignal(article);
  const primaryCategory = article.categories[0] ?? "enterprise_ai";
  const eventType = inferEventType(article);
  const companies = extractCompanies(article.title, article.summary ?? "");
  const occurredAt = article.published_at ?? article.created_at;

  return {
    id: article.id,
    slug: article.slug,
    occurredAt,
    title: buildEventTitle(article.title, eventType),
    eventType,
    category: primaryCategory,
    categoryLabel: formatCategory(primaryCategory),
    importanceScore: article.importance_score,
    whyItMatters: strategic.why_founders_care,
    founderImplication: strategic.thesis,
    marketImpact: strategic.market_shift,
    trendDirection: inferTrendDirection(article.importance_score, eventType),
    companies,
    isMarketShift: article.importance_score >= 80 || strategic.market_shift.length > 80,
    sourceName: article.source_name
  };
}

export function buildTimelineFromArticles(articles: Article[]): TimelineEvent[] {
  const fromArticles = articles.map(articleToTimelineEvent);
  const merged = [...fromArticles, ...DEMO_MILESTONE_EVENTS];
  const byId = new Map<string, TimelineEvent>();
  for (const event of merged) {
    byId.set(event.id, event);
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

export function filterTimelineEvents(events: TimelineEvent[], filters: TimelineFilters) {
  let result = [...events];

  if (filters.category && filters.category !== "all") {
    result = result.filter((e) => e.category === filters.category || e.eventType === filters.category);
  }
  if (filters.eventType && filters.eventType !== "all") {
    result = result.filter((e) => e.eventType === filters.eventType);
  }
  if (filters.company && filters.company !== "all") {
    result = result.filter(
      (e) =>
        e.companies.includes(filters.company!) ||
        e.title.includes(filters.company!) ||
        e.sourceName.includes(filters.company!)
    );
  }
  if (filters.minScore) {
    result = result.filter((e) => e.importanceScore >= filters.minScore!);
  }

  if (filters.sort === "importance") {
    result.sort((a, b) => b.importanceScore - a.importanceScore);
  } else {
    result.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }

  return result;
}

export function clusterTimelineEvents(
  events: TimelineEvent[],
  granularity: TimelineGranularity
): TimelineCluster[] {
  const groups = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const date = new Date(event.occurredAt);
    const key =
      granularity === "month"
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : getWeekKey(date);
    const bucket = groups.get(key) ?? [];
    bucket.push(event);
    groups.set(key, bucket);
  }

  return Array.from(groups.entries())
    .map(([key, clusterEvents]) => {
      const sorted = clusterEvents.sort(
        (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );
      const start = new Date(sorted[sorted.length - 1]!.occurredAt);
      const end = new Date(sorted[0]!.occurredAt);
      const averageImportance = Math.round(
        sorted.reduce((sum, e) => sum + e.importanceScore, 0) / sorted.length
      );
      const marketShiftCount = sorted.filter((e) => e.isMarketShift).length;

      return {
        key,
        label: formatClusterLabel(key, granularity, start),
        start,
        end,
        events: sorted,
        averageImportance,
        momentum: computeClusterMomentum(sorted, averageImportance),
        marketShiftCount
      };
    })
    .sort((a, b) => b.start.getTime() - a.start.getTime());
}

export function getTimelineCompanies(events: TimelineEvent[]) {
  const set = new Set<string>();
  for (const company of TRACKED_COMPANIES) {
    if (events.some((e) => e.companies.includes(company))) set.add(company);
  }
  for (const event of events) {
    for (const company of event.companies) set.add(company);
  }
  return Array.from(set).sort();
}

export function getMarketShiftHighlights(events: TimelineEvent[], limit = 3) {
  return events.filter((e) => e.isMarketShift).sort((a, b) => b.importanceScore - a.importanceScore).slice(0, limit);
}

export function computeTimelineMomentum(events: TimelineEvent[]) {
  if (!events.length) return 0;
  const recent = events.slice(0, Math.min(10, events.length));
  const avg = recent.reduce((sum, e) => sum + e.importanceScore, 0) / recent.length;
  const shiftDensity = recent.filter((e) => e.isMarketShift).length / recent.length;
  return Math.min(100, Math.round(avg * 0.7 + shiftDensity * 30));
}

function inferEventType(article: Article): TimelineEventType {
  const text = `${article.title} ${article.summary ?? ""}`.toLowerCase();
  if (/\bacqui(re|s)|merger|bought|buyout\b/.test(text)) return "acquisition";
  if (/\bfunding|raised|series [a-e]|valuation|seed round|investment\b/.test(text)) return "funding";
  if (article.categories.includes("regulation") || /\bregulat|eu ai act|executive order|compliance law\b/.test(text)) {
    return "regulation";
  }
  if (article.categories.includes("agents") || /\bagent\b.*\b(autonom|workflow|breakthrough)\b/.test(text)) {
    return "agent_breakthrough";
  }
  if (article.categories.includes("model_release") || /\brelease[sd]? model|gpt-|claude|gemini\b/.test(text)) {
    return "model_launch";
  }
  if (
    article.categories.some((c) => ["infrastructure", "chips", "open_source"].includes(c)) ||
    /\binference|gpu|datacenter|chip\b/.test(text)
  ) {
    return "infrastructure";
  }
  return "market_signal";
}

function buildEventTitle(title: string, eventType: TimelineEventType) {
  const max = 88;
  if (title.length <= max) return title;
  return `${title.slice(0, max).trim()}…`;
}

function inferTrendDirection(score: number, eventType: TimelineEventType): TrendDirection {
  if (score >= 82 || ["model_launch", "agent_breakthrough", "funding"].includes(eventType)) return "surging";
  if (score >= 65) return "stable";
  return "cooling";
}

function extractCompanies(title: string, summary: string) {
  const text = `${title} ${summary}`;
  return TRACKED_COMPANIES.filter((company) => text.includes(company));
}

function getWeekKey(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start.toISOString().slice(0, 10);
}

function formatClusterLabel(key: string, granularity: TimelineGranularity, start: Date) {
  if (granularity === "month") {
    return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(start);
  }
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
  return `Week of ${fmt.format(start)} – ${fmt.format(end)}`;
}

function computeClusterMomentum(events: TimelineEvent[], averageImportance: number) {
  const surging = events.filter((e) => e.trendDirection === "surging").length;
  const shiftBoost = events.filter((e) => e.isMarketShift).length * 8;
  return Math.min(100, Math.round(averageImportance * 0.6 + surging * 6 + shiftBoost));
}

/** Curated milestones enrich the terminal when the live feed is sparse */
const DEMO_MILESTONE_EVENTS: TimelineEvent[] = [
  {
    id: "milestone-claude-37",
    slug: "milestone-claude-37",
    occurredAt: "2025-02-24T12:00:00.000Z",
    title: "Anthropic ships Claude 3.7 with extended reasoning for enterprise agents",
    eventType: "model_launch",
    category: "model_release",
    categoryLabel: "Model releases",
    importanceScore: 91,
    whyItMatters:
      "Reasoning-tier models collapse the gap between demo agents and production workflows—buyers will pay for reliability, not chat.",
    founderImplication: "Agent startups must prove eval-backed reliability or lose to platform bundles.",
    marketImpact: "Model capability jumps reset vertical SaaS roadmaps every quarter.",
    trendDirection: "surging",
    companies: ["Anthropic"],
    isMarketShift: true,
    sourceName: "Industry milestone"
  },
  {
    id: "milestone-nvidia-earnings",
    slug: "milestone-nvidia-earnings",
    occurredAt: "2025-02-19T12:00:00.000Z",
    title: "Nvidia data-center revenue signals AI infra spend remains supply-constrained",
    eventType: "infrastructure",
    category: "chips",
    categoryLabel: "Chips & hardware",
    importanceScore: 88,
    whyItMatters: "Compute scarcity keeps inference economics central to product design for another cycle.",
    founderImplication: "Founders who meter and optimize inference own margin; resellers without routing IP get compressed.",
    marketImpact: "Infrastructure layer captures outsized value while application margins remain contested.",
    trendDirection: "surging",
    companies: ["Nvidia"],
    isMarketShift: true,
    sourceName: "Market signal"
  },
  {
    id: "milestone-openai-funding",
    slug: "milestone-openai-funding",
    occurredAt: "2025-01-31T12:00:00.000Z",
    title: "Mega-round chatter reinforces capital concentration in frontier labs",
    eventType: "funding",
    category: "funding",
    categoryLabel: "Funding & M&A",
    importanceScore: 85,
    whyItMatters: "Capital depth at the foundation layer raises the bar for undifferentiated model plays.",
    founderImplication: "Application and workflow layers remain the highest-risk-adjusted venture bets.",
    marketImpact: "Funding velocity shifts from foundation models toward vertical workflow ownership.",
    trendDirection: "stable",
    companies: ["OpenAI"],
    isMarketShift: true,
    sourceName: "Funding radar"
  },
  {
    id: "milestone-eu-ai-act",
    slug: "milestone-eu-ai-act",
    occurredAt: "2024-08-01T12:00:00.000Z",
    title: "EU AI Act enforcement timeline forces audit-ready AI workflows",
    eventType: "regulation",
    category: "regulation",
    categoryLabel: "Regulation",
    importanceScore: 84,
    whyItMatters: "Compliance becomes a product surface—teams selling into EU enterprise need traceability on day one.",
    founderImplication: "Regulatory friction shifts moats from model access to audit-ready workflow ownership.",
    marketImpact: "Enterprise buyers delay broad rollouts without governance and logging guarantees.",
    trendDirection: "stable",
    companies: [],
    isMarketShift: true,
    sourceName: "Regulatory"
  },
  {
    id: "milestone-devin-launch",
    slug: "milestone-devin-launch",
    occurredAt: "2024-03-12T12:00:00.000Z",
    title: "Cognition debuts Devin—autonomous software agent narrative goes mainstream",
    eventType: "agent_breakthrough",
    category: "agents",
    categoryLabel: "AI agents",
    importanceScore: 90,
    whyItMatters: "Agents moved from copilot demos to headline-grabbing labor replacement stories.",
    founderImplication: "Vertical AI agents are becoming standalone businesses, not features.",
    marketImpact: "Seat-based dev tooling faces outcome-priced agent competition.",
    trendDirection: "surging",
    companies: [],
    isMarketShift: true,
    sourceName: "Agent breakthrough"
  }
];
