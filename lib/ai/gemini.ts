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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateFounderInsight(input: {
  title: string;
  sourceName: string;
  url: string;
  excerpt?: string | null;
  categoryHint?: ArticleCategory | null;
}): Promise<GeneratedInsight> {

  const combined = `${input.title}\n${input.excerpt ?? ""}`;

  const fallbackCategories =
    categorizeText(
      combined,
      input.categoryHint
    );

  const fallbackScore =
    scoreImportance(
      combined,
      fallbackCategories
    );

  const fallback =
    buildFallbackInsight(
      input,
      fallbackCategories,
      fallbackScore
    );

  if (!env.GEMINI_API_KEY) {
    return fallback;
  }

  try {

    const genAI =
      new GoogleGenerativeAI(
        env.GEMINI_API_KEY
      );

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType:
            "application/json"
        }
      });

    let result = null;

    for (
      let attempt = 1;
      attempt <= 3;
      attempt++
    ) {

      try {

        result =
          await model.generateContent(
            buildStrategicSignalPrompt(
              input
            )
          );

        break;

      } catch (error) {

        const message =
          error instanceof Error
            ? error.message
            : "Unknown";

        if (
          message.includes("429") ||
          message.includes(
            "TooManyRequests"
          )
        ) {

          console.log(
            `Rate limited. Retry ${attempt}/3`
          );

          await sleep(15000);

          continue;
        }

        throw error;
      }
    }

    if (!result) {
      return fallback;
    }

    const text =
      extractJson(
        result.response.text()
      );

    const parsed =
      insightSchema.safeParse(
        JSON.parse(text)
      );

    if (!parsed.success) {
      return fallback;
    }

    const signalParsed =
      strategicSignalSchema.safeParse({
        thesis:
          parsed.data.thesis,

        market_shift:
          parsed.data.market_shift,

        why_founders_care:
          parsed.data
            .why_founders_care,

        startup_opportunities:
          parsed.data
            .startup_opportunities,

        threatened_business_models:
          parsed.data
            .threatened_business_models,

        future_trends:
          parsed.data
            .future_trends
      });

    const strategic_signal =
      signalParsed.success
        ? signalParsed.data
        : fallback.strategic_signal;

    const categories =
      parsed.data.categories.filter(
        (
          category
        ): category is ArticleCategory =>
          CATEGORY_VALUES.includes(
            category as ArticleCategory
          )
      );

    return {

      summary:
        parsed.data.summary,

      founder_insight:
        strategic_signal.thesis,

      why_it_matters:
        strategic_signal
          .why_founders_care,

      startup_opportunities:
        strategic_signal
          .startup_opportunities,

      categories:
        categories.length
          ? categories
          : fallbackCategories,

      importance_score:
        normalizeImportanceScore(
          parsed.data
            .importance_score ||
            fallbackScore
        ),

      strategic_signal
    };

  } catch (error) {

    console.log(
      "Gemini failed. Using fallback."
    );

    return fallback;
  }
}

function buildFallbackInsight(
  input: any,
  categories: ArticleCategory[],
  importance_score: number
): GeneratedInsight {

  return {

    summary:
      input.excerpt?.slice(
        0,
        420
      ) ||
      input.title,

    founder_insight:
      "AI capability shifts are creating founder opportunities.",

    why_it_matters:
      "Rapid AI changes create opportunities for fast-moving founders.",

    startup_opportunities: [
      "Workflow automation",
      "Vertical AI",
      "Infrastructure tooling"
    ],

    categories,

    importance_score,

    strategic_signal: {

      thesis:
        "AI shifts create founder opportunities.",

      market_shift:
        "AI adoption accelerating.",

      why_founders_care:
        "Early movers win.",

      startup_opportunities: [
        "Workflow AI",
        "Infra AI"
      ],

      threatened_business_models: [
        "Manual services",
        "Legacy SaaS"
      ],

      future_trends: [
        "Automation",
        "AI-native software"
      ]
    }
  };
}

function extractJson(value: string) {

  const cleaned =
    value
      .replace(
        /```json|```/g,
        ""
      )
      .trim();

  const start =
    cleaned.indexOf("{");

  const end =
    cleaned.lastIndexOf("}");

  return cleaned.slice(
    start,
    end + 1
  );
}

function normalizeImportanceScore(
  score: number
) {

  if (
    score > 0 &&
    score <= 10
  ) {
    return Math.round(
      score * 10
    );
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(score)
    )
  );
}