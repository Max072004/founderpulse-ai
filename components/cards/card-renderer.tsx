import { forwardRef } from "react";
import { BriefSummaryCard } from "@/components/cards/cards/brief-summary-card";
import { ContrarianCard } from "@/components/cards/cards/contrarian-card";
import { FounderSignalCard } from "@/components/cards/cards/founder-signal-card";
import { MarketShiftCard } from "@/components/cards/cards/market-shift-card";
import { MomentumCard } from "@/components/cards/cards/momentum-card";
import type { CardAspect, ShareableCard } from "@/lib/cards/types";

export const ShareCardRenderer = forwardRef<HTMLDivElement, { card: ShareableCard; aspect: CardAspect }>(
  function ShareCardRenderer({ card, aspect }, ref) {
    switch (card.kind) {
      case "founder_signal":
        return <FounderSignalCard ref={ref} data={card} aspect={aspect} />;
      case "contrarian":
        return <ContrarianCard ref={ref} data={card} aspect={aspect} />;
      case "market_shift":
        return <MarketShiftCard ref={ref} data={card} aspect={aspect} />;
      case "momentum":
        return <MomentumCard ref={ref} data={card} aspect={aspect} />;
      case "brief_summary":
        return <BriefSummaryCard ref={ref} data={card} aspect={aspect} />;
      default:
        return null;
    }
  }
);
