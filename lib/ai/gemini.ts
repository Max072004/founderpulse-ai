import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { env } from "@/lib/config/env";
import { categorizeText, scoreImportance } from "@/lib/ai/scoring";
import {
  buildStrategicSignalPrompt,
  strategicSignalSchema,
  type StrategicSignal
} from "@/lib/ai/strategic-signal";
import type { ArticleCategory } from "@/lib/db/types";

const insightSchema = z.object({
  summary: z.string(),
  thesis: z.string(),
  market_shift: z.string(),
  why_founders_care: z.string(),
  startup_opportunities: z.array(z.string()).min(2).max(4),
  threatened_business_models: z.array(z.string()).min(2).max(3),
  future_trends: z.array(z.string()).min(2).max(3),
  categories: z.array(z.string()).max(4),
  importance_score: z.number().min(0).max(100)
});

export type GeneratedInsight = {
  summary: string;
  founder_insight: string;
  why_it_matters: string;
  startup_opportunities: string[];
  categories: ArticleCategory[];
  importance_score: number;
  strategic_signal: StrategicSignal;
};

const CATEGORY_VALUES: ArticleCategory[] = [
  "model_release",
  "funding",
  "infrastructure",
  "enterprise_ai",
  "consumer_ai",
  "regulation",
  "research",
  "open_source",
  "chips",
  "agents"
];

export async function generateFounderInsight(input: {
  title: string;
  sourceName: string;
  url: string;
  excerpt?: string | null;
  categoryHint?: ArticleCategory | null;
}): Promise<GeneratedInsight> {
  const combined = `${input.title}\n${input.excerpt ?? ""}`;
  const fallbackCategories = categorizeText(combined, input.categoryHint);
  const fallbackScore = scoreImportance(combined, fallbackCategories);
  const fallback = buildFallbackInsight(input, fallbackCategories, fallbackScore);

  if (!env.GEMINI_API_KEY) {
    return fallback;
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const result = await model.generateContent(buildStrategicSignalPrompt(input));
  const text = extractJson(result.response.text());
  const parsed = insightSchema.safeParse(JSON.parse(text));

  if (!parsed.success) {
    throw new Error(`Gemini response failed validation: ${parsed.error.message}`);
  }

  const signalParsed = strategicSignalSchema.safeParse({
    thesis: parsed.data.thesis,
    market_shift: parsed.data.market_shift,
    why_founders_care: parsed.data.why_founders_care,
    startup_opportunities: parsed.data.startup_opportunities,
    threatened_business_models: parsed.data.threatened_business_models,
    future_trends: parsed.data.future_trends
  });

  const strategic_signal = signalParsed.success ? signalParsed.data : fallback.strategic_signal;

  const categories = parsed.data.categories.filter((category): category is ArticleCategory =>
    CATEGORY_VALUES.includes(category as ArticleCategory)
  );

  return {
    summary: parsed.data.summary,
    founder_insight: strategic_signal.thesis,
    why_it_matters: strategic_signal.why_founders_care,
    startup_opportunities: strategic_signal.startup_opportunities,
    categories: categories.length ? categories : fallbackCategories,
    importance_score: normalizeImportanceScore(parsed.data.importance_score || fallbackScore),
    strategic_signal
  };
}

function buildFallbackInsight(
  input: {
    title: string;
    sourceName: string;
    excerpt?: string | null;
    categoryHint?: ArticleCategory | null;
  },
  categories: ArticleCategory[],
  importance_score: number
): GeneratedInsight {
  const categorySet = new Set(categories);
  let strategic_signal: StrategicSignal;

  if (categorySet.has("agents")) {
    strategic_signal = {
      thesis: "Vertical AI agents are becoming standalone outcome businesses.",
      market_shift:
        "AI-native workflow layers are displacing seat-based SaaS dashboards—buyers want completed work, not another interface to manage.",
      why_founders_care:
        "Distribution is still unsettled in most verticals; the team that owns a painful workflow outcome can price on results before incumbents re-bundle.",
      startup_opportunities: [
        "Outcome-priced compliance agents for regulated mid-market teams",
        "Agent ops consoles that sell reliability SLAs to enterprises",
        "Vertical agent brands with proprietary eval data per industry"
      ],
      threatened_business_models: [
        "Per-seat SaaS dashboards without autonomous execution",
        "Systems integrators selling manual process redesign",
        "Horizontal copilots with no workflow ownership"
      ],
      future_trends: [
        "Agents priced on SLAs replace seat-based copilots in back-office",
        "Vertical agent startups outbid platforms on trust and data loops",
        "Human review becomes exception-only for routine workflows"
      ]
    };
  } else if (categorySet.has("open_source") || categorySet.has("infrastructure")) {
    strategic_signal = {
      thesis: "Inference cost optimization is becoming a moat.",
      market_shift:
        "Open-weight models and efficient runtimes are collapsing unit economics, reopening markets that were too thin-margin for AI automation.",
      why_founders_care:
        "Products that meter usage profitably today can undercut incumbents still subsidizing inference—cost leadership is a GTM weapon, not a backend detail.",
      startup_opportunities: [
        "Distilled-model routing for SaaS vendors with bill-shock risk",
        "Private deploy + fine-tune shops for regulated buyers",
        "Edge inference packaging for field-heavy industries"
      ],
      threatened_business_models: [
        "Closed-model resellers without routing or distillation IP",
        "High-margin inference middlemen with no workload specialization",
        "AI features bolted on without unit-economic redesign"
      ],
      future_trends: [
        "AI memory systems become a standard infrastructure purchase",
        "Multi-model routing becomes table stakes for any AI product",
        "Inference optimization vendors consolidate like early CDNs"
      ]
    };
  } else {
    strategic_signal = {
      thesis: "Capability jumps are resetting category leadership faster than incumbents can adapt.",
      market_shift: `The signal from ${input.sourceName} reflects accelerating capability diffusion—advantage is shifting from model access to workflow and data ownership.`,
      why_founders_care:
        "Category windows compress with each release cycle; founders who ship an outcome-owned wedge in 90 days beat teams still running annual AI roadmaps.",
      startup_opportunities: [
        "Workflow products that sell completed outcomes, not seats",
        "Buyer-specific eval and compliance layers incumbents will not build",
        "Distribution partnerships with urgent line-of-business owners"
      ],
      threatened_business_models: [
        "Feature-layer AI without workflow or data moats",
        "Incumbents selling AI upsells without pricing model change",
        "Consulting-heavy automation with no software margin"
      ],
      future_trends: [
        "Buyers demand 30-day ROI proof, not pilot theater",
        "Defensibility migrates to proprietary workflow data loops",
        "Capital concentrates on vertical distribution, not model novelty"
      ]
    };
  }

  return {
    summary: input.excerpt?.slice(0, 420) || `Strategic signal from ${input.sourceName}: ${input.title}.`,
    founder_insight: strategic_signal.thesis,
    why_it_matters: strategic_signal.why_founders_care,
    startup_opportunities: strategic_signal.startup_opportunities,
    categories,
    importance_score,
    strategic_signal
  };
}

function extractJson(value: string) {
  const cleaned = value.replace(/```json|```/g, "").trim();
  if (cleaned.startsWith("{") && cleaned.endsWith("}")) return cleaned;

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) return cleaned.slice(start, end + 1);

  throw new Error("Gemini response did not contain JSON");
}

function normalizeImportanceScore(score: number) {
  if (score > 0 && score <= 10) return Math.round(score * 10);
  return Math.min(100, Math.max(0, Math.round(score)));
}
