import { STRATEGIC_SIGNAL_METADATA_KEY } from "@/lib/ai/strategic-signal";
import { getPublicSupabase } from "@/lib/db/supabase";
import type { Article, ArticleCategory } from "@/lib/db/types";

export const demoArticles: Article[] = [
  {
    id: "demo-1",
    slug: "agents-rewire-saas-workflows-demo",
    title: "AI agents are turning SaaS workflows into outcome-based services",
    source_name: "FounderPulse Demo",
    source_url: "https://founderpulse.ai",
    canonical_url: "https://founderpulse.ai/demo/agents",
    author: "FounderPulse AI",
    published_at: new Date().toISOString(),
    raw_excerpt: "Agents are moving from copilots into systems that complete full business processes.",
    summary: "AI agents are shifting software from task assistance to managed outcomes, pressuring SaaS companies to own more of the workflow.",
    founder_insight: "Vertical AI agents are becoming standalone outcome businesses.",
    why_it_matters:
      "Distribution is still unsettled in most verticals; the team that owns a painful workflow outcome can price on results before incumbents re-bundle.",
    startup_opportunities: [
      "Outcome-priced compliance agents for regulated mid-market teams",
      "Agent orchestration for ERPs that cannot build in-house",
      "Vertical agent brands with buyer-verified SLAs"
    ],
    categories: ["agents", "enterprise_ai"],
    importance_score: 86,
    signal_score: 86,
    hash: "demo-1",
    status: "summarized",
    metadata: {
      [STRATEGIC_SIGNAL_METADATA_KEY]: {
        thesis: "Vertical AI agents are becoming standalone outcome businesses.",
        market_shift:
          "AI-native workflow layers are replacing seat-based SaaS dashboards—buyers want completed work, not another UI.",
        why_founders_care:
          "Distribution is still unsettled in most verticals; the team that owns a painful workflow outcome can price on results before incumbents re-bundle.",
        startup_opportunities: [
          "Outcome-priced compliance agents for regulated mid-market teams",
          "Agent orchestration for ERPs that cannot build in-house",
          "Vertical agent brands with buyer-verified SLAs"
        ],
        threatened_business_models: [
          "Per-seat SaaS dashboards without autonomous execution",
          "Systems integrators selling manual process redesign",
          "Horizontal copilots with no workflow ownership"
        ],
        future_trends: [
          "Agents priced on SLAs displace seat-based copilots in back-office",
          "Vertical agent startups outbid platforms on trust and data loops",
          "Human review becomes exception-only for routine workflows"
        ]
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "demo-2",
    slug: "open-source-models-pressure-inference-costs-demo",
    title: "Open-source models keep compressing inference costs",
    source_name: "FounderPulse Demo",
    source_url: "https://founderpulse.ai",
    canonical_url: "https://founderpulse.ai/demo/open-source",
    author: "FounderPulse AI",
    published_at: new Date(Date.now() - 86400000).toISOString(),
    raw_excerpt: "Smaller capable models are making specialized AI products cheaper to run.",
    summary: "Efficient open models are lowering the cost floor for AI startups and making narrow, high-volume use cases more viable.",
    founder_insight: "Inference cost optimization is becoming a moat.",
    why_it_matters:
      "Products that meter usage profitably today can undercut incumbents still subsidizing inference—cost leadership is a GTM weapon.",
    startup_opportunities: [
      "Distilled-model routing for SaaS vendors with bill-shock risk",
      "Private deploy + fine-tune shops for regulated buyers",
      "Edge inference packaging for field-heavy industries"
    ],
    categories: ["open_source", "infrastructure"],
    importance_score: 78,
    signal_score: 78,
    hash: "demo-2",
    status: "summarized",
    metadata: {
      [STRATEGIC_SIGNAL_METADATA_KEY]: {
        thesis: "Inference cost optimization is becoming a moat.",
        market_shift:
          "Open-weight models are collapsing the cost floor, making high-volume, low-ARPU automation economically viable for the first time.",
        why_founders_care:
          "Products that meter usage profitably today can undercut incumbents still subsidizing inference—cost leadership is a GTM weapon.",
        startup_opportunities: [
          "Distilled-model routing for SaaS vendors with bill-shock risk",
          "Private deploy + fine-tune shops for regulated buyers",
          "Edge inference packaging for field-heavy industries"
        ],
        threatened_business_models: [
          "Closed-model API resellers without routing or distillation IP",
          "High-margin inference middlemen with no workload specialization",
          "AI features bolted on without unit-economic redesign"
        ],
        future_trends: [
          "AI memory systems become a standard infrastructure purchase",
          "Multi-model routing becomes table stakes for any AI product",
          "Inference optimization vendors consolidate like early CDNs"
        ]
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function getArticles(filters?: {
  q?: string;
  category?: string;
  minScore?: number;
  limit?: number;
}) {
  const supabase = getPublicSupabase();
  if (!supabase) return demoArticles;

  let query = supabase
    .from("articles")
    .select("*")
    .eq("status", "summarized")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(filters?.limit ?? 40);

  if (filters?.q) {
    query = query.or(`title.ilike.%${filters.q}%,summary.ilike.%${filters.q}%,founder_insight.ilike.%${filters.q}%`);
  }
  if (filters?.category) {
    query = query.contains("categories", [filters.category as ArticleCategory]);
  }
  if (filters?.minScore) {
    query = query.gte("importance_score", filters.minScore);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to load articles from Supabase", error.message);
    return [];
  }
  if (!data?.length) return [];
  return data;
}

export async function getArticleBySlug(slug: string) {
  const supabase = getPublicSupabase();
  if (!supabase) return demoArticles.find((article) => article.slug === slug) ?? null;

  const { data, error } = await supabase.from("articles").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    console.error("Failed to load article from Supabase", error.message);
    return null;
  }
  return data;
}
