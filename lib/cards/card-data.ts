import { parseStrategicSignal } from "@/lib/ai/strategic-signal";
import {
  computeTrendingSectors,
  formatCategory,
  getFounderSignals
} from "@/lib/intelligence/analytics";
import { generateDailyBrief } from "@/lib/intelligence/daily-brief";
import { computeTimelineMomentum } from "@/lib/intelligence/timeline";
import { buildTimelineFromArticles } from "@/lib/intelligence/timeline";
import type { Article } from "@/lib/db/types";
import type { ShareableCard } from "@/lib/cards/types";

export function buildShareableCards(articles: Article[]): ShareableCard[] {
  const brief = generateDailyBrief(articles);
  const signals = getFounderSignals(articles, 6);
  const sectors = computeTrendingSectors(articles);
  const timeline = buildTimelineFromArticles(articles);
  const overallMomentum = computeTimelineMomentum(timeline);
  const editionDate = brief.editionDate;
  const cards: ShareableCard[] = [];

  if (brief.topSignals[0] || signals[0]) {
    const s = brief.topSignals[0];
    const full = signals[0];
    const strategic = full?.strategic;
    cards.push({
      id: `signal-${s?.id ?? full?.article.id ?? "lead"}`,
      kind: "founder_signal",
      label: "Founder Signal",
      confidence: s?.confidence ?? "high",
      tags: s?.sectors ?? full?.article.categories.map(formatCategory) ?? [],
      editionDate,
      thesis: s?.thesis ?? strategic?.thesis ?? brief.headline,
      marketImpact: strategic?.market_shift ?? brief.marketShifts[0]?.insight ?? "",
      importanceScore: s?.importanceScore ?? full?.article.importance_score ?? 85,
      urgency: s?.urgency ?? "elevated",
      sourceTitle: s?.title ?? full?.article.title ?? ""
    });
  }

  cards.push({
    id: "contrarian-daily",
    kind: "contrarian",
    label: "Contrarian Prediction",
    confidence: brief.contrarian.confidence,
    tags: ["Forecast", "Strategy"],
    editionDate,
    prediction: brief.contrarian.text,
    rationale: brief.contrarian.rationale
  });

  const shift = brief.marketShifts[0];
  if (shift) {
    cards.push({
      id: `shift-${shift.label}`,
      kind: "market_shift",
      label: "Market Shift",
      confidence: shift.confidence,
      tags: [shift.label, shift.direction],
      editionDate,
      sector: shift.label,
      direction: shift.direction,
      delta: shift.delta,
      insight: shift.insight
    });
  }

  if (sectors.length) {
    cards.push({
      id: "momentum-snapshot",
      kind: "momentum",
      label: "Momentum Snapshot",
      confidence: overallMomentum >= 75 ? "high" : "medium",
      tags: sectors.slice(0, 3).map((s) => s.label),
      editionDate,
      sectors: sectors.slice(0, 4).map((s) => ({
        label: s.label,
        momentum: s.momentum,
        velocity: s.velocity
      })),
      overallMomentum
    });
  }

  cards.push({
    id: `brief-${editionDate}`,
    kind: "brief_summary",
    label: "Daily Founder Brief",
    confidence: brief.overallConfidence,
    tags: brief.sectorTags.slice(0, 4),
    editionDate,
    headline: brief.headline,
    bullets: brief.executiveSummary.slice(0, 5),
    urgency: brief.overallUrgency,
    readMinutes: brief.readMinutes
  });

  for (const signal of signals.slice(1, 4)) {
    const strategic = signal.strategic;
    cards.push({
      id: `signal-${signal.article.id}`,
      kind: "founder_signal",
      label: "Founder Signal",
      confidence:
        signal.article.importance_score >= 85 ? "high" : signal.article.importance_score >= 70 ? "medium" : "speculative",
      tags: signal.article.categories.map(formatCategory),
      editionDate,
      thesis: strategic.thesis,
      marketImpact: strategic.market_shift,
      importanceScore: signal.article.importance_score,
      urgency:
        signal.article.importance_score >= 85 ? "critical" : signal.article.importance_score >= 72 ? "elevated" : "watch",
      sourceTitle: signal.article.title
    });
  }

  for (const shiftItem of brief.marketShifts.slice(1, 3)) {
    cards.push({
      id: `shift-${shiftItem.label}-alt`,
      kind: "market_shift",
      label: "Market Shift",
      confidence: shiftItem.confidence,
      tags: [shiftItem.label],
      editionDate,
      sector: shiftItem.label,
      direction: shiftItem.direction,
      delta: shiftItem.delta,
      insight: shiftItem.insight
    });
  }

  return cards;
}

export function getCardInsightText(card: ShareableCard): string {
  switch (card.kind) {
    case "founder_signal":
      return `${card.thesis}\n\n${card.marketImpact}`;
    case "contrarian":
      return `${card.prediction}\n\n${card.rationale}`;
    case "market_shift":
      return `${card.sector} (${card.direction}): ${card.insight}`;
    case "momentum":
      return card.sectors.map((s) => `${s.label}: ${s.momentum} momentum (${s.velocity})`).join("\n");
    case "brief_summary":
      return [card.headline, ...card.bullets].join("\n");
    default:
      return "";
  }
}
