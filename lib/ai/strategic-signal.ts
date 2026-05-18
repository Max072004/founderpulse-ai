import { z } from "zod";
import type { Article } from "@/lib/db/types";

export const strategicSignalSchema = z.object({
  thesis: z.string().min(12).max(220),
  market_shift: z.string().min(20).max(420),
  why_founders_care: z.string().min(20).max(420),
  startup_opportunities: z.array(z.string().min(12).max(160)).min(2).max(4),
  threatened_business_models: z.array(z.string().min(12).max(160)).min(2).max(3),
  future_trends: z.array(z.string().min(12).max(160)).min(2).max(3)
});

export type StrategicSignal = z.infer<typeof strategicSignalSchema>;

export const STRATEGIC_SIGNAL_METADATA_KEY = "strategic_signal";

export function isStrategicSignal(value: unknown): value is StrategicSignal {
  return strategicSignalSchema.safeParse(value).success;
}

export function parseStrategicSignal(article: Article): StrategicSignal {
  const metadata = article.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const stored = (metadata as Record<string, unknown>)[STRATEGIC_SIGNAL_METADATA_KEY];
    if (isStrategicSignal(stored)) return stored;
  }

  return synthesizeStrategicSignal(article);
}

function synthesizeStrategicSignal(article: Article): StrategicSignal {
  const categories = new Set(article.categories);
  const thesis =
    article.founder_insight?.trim() ||
    inferThesis(article.title, categories) ||
    article.title;

  const market_shift =
    inferMarketShift(categories, article.title) ||
    "Capability and cost curves in AI are shifting faster than incumbent product roadmaps can absorb.";

  const why_founders_care =
    article.why_it_matters?.trim() ||
    "Window for wedge formation is narrow: first movers who own a workflow outcome—not a feature—capture pricing power before incumbents bundle.";

  const opportunities =
    article.startup_opportunities.length >= 2
      ? article.startup_opportunities.slice(0, 4)
      : inferOpportunities(categories);

  return {
    thesis: clampWords(thesis, 22),
    market_shift: clampWords(market_shift, 55),
    why_founders_care: clampWords(why_founders_care, 55),
    startup_opportunities: opportunities.map((o) => clampWords(o, 18)),
    threatened_business_models: inferThreatenedModels(categories),
    future_trends: inferFutureTrends(categories)
  };
}

function inferThesis(title: string, categories: Set<string>) {
  if (categories.has("agents")) {
    return "Vertical AI agents are graduating from copilots to outcome-priced workflow businesses.";
  }
  if (categories.has("open_source") || categories.has("infrastructure")) {
    return "Inference cost compression is becoming a distribution moat, not a feature.";
  }
  if (categories.has("model_release")) {
    return "Model capability jumps are re-opening winner-take-most races in vertical software.";
  }
  if (categories.has("regulation")) {
    return "Regulatory friction is shifting defensibility from models to audit-ready workflow ownership.";
  }
  return clampWords(title, 18);
}

function inferMarketShift(categories: Set<string>, title: string) {
  if (categories.has("agents")) {
    return "AI-native workflow layers are replacing seat-based SaaS dashboards—buyers want completed work, not another UI.";
  }
  if (categories.has("open_source")) {
    return "Open-weight models are collapsing the cost floor, making high-volume, low-ARPU automation economically viable for the first time.";
  }
  if (categories.has("infrastructure")) {
    return "AI memory, routing, and observability stacks are hardening into infrastructure—analogous to early cloud control planes.";
  }
  if (categories.has("chips")) {
    return "Compute scarcity is pushing intelligence to the edge and forcing product teams to treat inference as a unit economics problem.";
  }
  if (categories.has("funding")) {
    return `Capital is concentrating behind ${clampWords(title, 8)}—signaling which layers investors believe will capture margin next.`;
  }
  return null;
}

function inferOpportunities(categories: Set<string>) {
  if (categories.has("agents")) {
    return [
      "Outcome-priced ops agents for finance and legal teams with audit trails",
      "Agent orchestration for mid-market ERPs that cannot build in-house",
      "Vertical agent marketplaces with buyer-verified SLAs"
    ];
  }
  if (categories.has("open_source")) {
    return [
      "Private fine-tune + deploy shops for regulated industries",
      "Usage-metered AI support with margin-positive unit economics",
      "Distilled-model routing layers that cut bill shock for SaaS vendors"
    ];
  }
  return [
    "Workflow software that sells completed outcomes, not seats",
    "Infrastructure tooling that makes AI reliability a buyer requirement"
  ];
}

function inferThreatenedModels(categories: Set<string>) {
  if (categories.has("agents") || categories.has("enterprise_ai")) {
    return [
      "Horizontal SaaS dashboards priced per seat",
      "Consulting-heavy systems integrators selling manual workflow redesign",
      "Legacy RPA vendors without native reasoning loops"
    ];
  }
  if (categories.has("open_source") || categories.has("infrastructure")) {
    return [
      "Closed-model API resellers without routing or distillation IP",
      "High-margin inference middlemen with no workload specialization",
      "Single-vendor AI features bolted onto legacy software"
    ];
  }
  if (categories.has("consumer_ai")) {
    return ["Ad-supported content feeds", "Generic chat wrappers without retention loops"];
  }
  return [
    "Feature-layer AI startups without workflow ownership",
    "Incumbents selling AI as an upsell without pricing model change"
  ];
}

function inferFutureTrends(categories: Set<string>) {
  if (categories.has("agents")) {
    return [
      "Agents sold on SLA-backed outcomes displace seat-based copilots",
      "Vertical agent brands outbid horizontal platforms on trust",
      "Human-in-the-loop shifts from default to exception-only in back-office"
    ];
  }
  if (categories.has("infrastructure") || categories.has("open_source")) {
    return [
      "AI memory systems become a standard infrastructure purchase",
      "Inference optimization vendors consolidate like early CDN players",
      "Multi-model routing becomes table stakes for any AI product"
    ];
  }
  if (categories.has("model_release")) {
    return [
      "Capability jumps trigger category resets every 6–9 months",
      "Winners pair proprietary data loops with commodity models",
      "Evaluation and safety tooling becomes a standalone budget line"
    ];
  }
  return [
    "Buyers demand proof of ROI in 30-day pilots, not annual AI roadmaps",
    "Defensibility migrates from model access to workflow + data moats",
    "Capital flows to teams that own distribution in a vertical, not model novelty"
  ];
}

function clampWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}

export function buildStrategicSignalPrompt(input: {
  title: string;
  sourceName: string;
  url: string;
  excerpt?: string | null;
}) {
  return [
    "You are a venture analyst at an elite startup intelligence firm (think a16z + Stratechery for founders).",
    "Produce a structured strategic signal from the article below.",
    "",
    "VOICE & QUALITY BAR:",
    "- Highly opinionated. Take a clear, defensible position—no hedging.",
    "- Concise and high-signal. Every word must earn its place.",
    "- Startup-relevant and investor-grade. Sound like a partner memo, not a blog recap.",
    "- NEVER use generic filler: no 'AI is evolving', 'founders should pay attention', 'stay informed', 'could be significant'.",
    "- Be specific to THIS article's implications—not template advice.",
    "",
    "FIELD REQUIREMENTS (JSON):",
    "- thesis: One bold strategic claim, max 18 words. Reads like a forecast headline.",
    "- market_shift: The structural market change this reveals (1–2 sentences). Name the shift, not the news.",
    "- why_founders_care: Why act NOW—timing, competitive window, pricing power, or distribution (1–2 sentences).",
    "- startup_opportunities: 2–4 specific wedges. Name buyer + wedge + why incumbents miss it. No 'build an AI app for X'.",
    "- threatened_business_models: 2–3 incumbents or models at risk. Be concrete (e.g. 'seat-based CRM dashboards').",
    "- future_trends: 2–3 predictions for the next 12–24 months this implies. Forward-looking, not descriptive.",
    "- summary: Factual recap, max 65 words.",
    "- categories: From model_release, funding, infrastructure, enterprise_ai, consumer_ai, regulation, research, open_source, chips, agents.",
    "- importance_score: 0–100 for founder urgency (market impact × timing × opportunity density).",
    "",
    "EXAMPLE THESIS STYLES (do not copy—match quality):",
    "- 'AI-native workflow layers may replace SaaS dashboards.'",
    "- 'Inference cost optimization is becoming a moat.'",
    "- 'Vertical AI agents are becoming standalone businesses.'",
    "- 'AI memory systems may become the next infrastructure layer.'",
    "",
    `Title: ${input.title}`,
    `Source: ${input.sourceName}`,
    `URL: ${input.url}`,
    `Excerpt: ${input.excerpt ?? "No excerpt provided."}`,
    "",
    "Return valid JSON with keys: summary, thesis, market_shift, why_founders_care, startup_opportunities, threatened_business_models, future_trends, categories, importance_score."
  ].join("\n");
}
