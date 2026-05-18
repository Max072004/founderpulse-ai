import type { ConfidenceLevel, UrgencyLevel } from "@/lib/intelligence/daily-brief";

export type CardAspect = "portrait" | "landscape";
export type CardKind =
  | "founder_signal"
  | "contrarian"
  | "market_shift"
  | "momentum"
  | "brief_summary";

export const CARD_DIMENSIONS: Record<CardAspect, { width: number; height: number }> = {
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1200, height: 675 }
};

export type ShareableCardBase = {
  id: string;
  kind: CardKind;
  label: string;
  confidence: ConfidenceLevel;
  tags: string[];
  editionDate: string;
};

export type FounderSignalCardData = ShareableCardBase & {
  kind: "founder_signal";
  thesis: string;
  marketImpact: string;
  importanceScore: number;
  urgency: UrgencyLevel;
  sourceTitle: string;
};

export type ContrarianCardData = ShareableCardBase & {
  kind: "contrarian";
  prediction: string;
  rationale: string;
};

export type MarketShiftCardData = ShareableCardBase & {
  kind: "market_shift";
  sector: string;
  direction: "surging" | "cooling" | "stable";
  delta: number;
  insight: string;
};

export type MomentumCardData = ShareableCardBase & {
  kind: "momentum";
  sectors: { label: string; momentum: number; velocity: string }[];
  overallMomentum: number;
};

export type BriefSummaryCardData = ShareableCardBase & {
  kind: "brief_summary";
  headline: string;
  bullets: string[];
  urgency: UrgencyLevel;
  readMinutes: number;
};

export type ShareableCard =
  | FounderSignalCardData
  | ContrarianCardData
  | MarketShiftCardData
  | MomentumCardData
  | BriefSummaryCardData;

export const CARD_KIND_LABELS: Record<CardKind, string> = {
  founder_signal: "Founder Signal",
  contrarian: "Contrarian Prediction",
  market_shift: "Market Shift",
  momentum: "Momentum Snapshot",
  brief_summary: "Daily Brief"
};
