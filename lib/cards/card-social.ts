import type { ShareableCard } from "@/lib/cards/types";
import { getCardInsightText } from "@/lib/cards/card-data";

export function buildCardTweet(card: ShareableCard): string {
  const insight = getCardInsightText(card);
  const tagLine = card.tags.slice(0, 2).join(" · ");

  switch (card.kind) {
    case "founder_signal":
      return truncate(
        `Founder signal (${card.importanceScore}/100)\n\n${card.thesis}\n\n${tagLine}\n\n— FounderPulse AI`,
        280
      );
    case "contrarian":
      return truncate(`Contrarian take:\n\n${card.prediction}\n\n— FounderPulse AI #AI #startups`, 280);
    case "market_shift":
      return truncate(
        `Market shift: ${card.sector} is ${card.direction} (${card.delta > 0 ? "+" : ""}${card.delta})\n\n${card.insight}\n\n— FounderPulse`,
        280
      );
    case "momentum":
      return truncate(
        `AI sector momentum snapshot\n\n${card.sectors.map((s) => `→ ${s.label}: ${s.momentum}`).join("\n")}\n\n— FounderPulse`,
        280
      );
    case "brief_summary":
      return truncate(
        `Daily Founder Brief · ${card.editionDate}\n\n${card.headline}\n\n${card.bullets[0] ?? ""}\n\nfounderpulse.ai/brief`,
        280
      );
    default:
      return truncate(insight, 280);
  }
}

export function buildCardLinkedIn(card: ShareableCard): string {
  const insight = getCardInsightText(card);

  const headers: Record<ShareableCard["kind"], string> = {
    founder_signal: "📡 Founder Signal",
    contrarian: "🔮 Contrarian Prediction",
    market_shift: "📈 Market Shift",
    momentum: "⚡ Momentum Snapshot",
    brief_summary: "📊 Daily Founder Brief"
  };

  return [
    `${headers[card.kind]} · FounderPulse AI`,
    "",
    insight,
    "",
    `Tags: ${card.tags.join(" · ")}`,
    `Confidence: ${card.confidence}`,
    "",
    "Strategic intelligence for AI founders—not a news roundup.",
    "",
    "#ArtificialIntelligence #Startups #VentureCapital #Founders"
  ].join("\n");
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}
