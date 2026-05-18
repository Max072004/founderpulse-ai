import { forwardRef } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { CardFrame } from "@/components/cards/card-frame";
import type { CardAspect, MarketShiftCardData } from "@/lib/cards/types";
import { cn } from "@/lib/utils/cn";

export const MarketShiftCard = forwardRef<HTMLDivElement, { data: MarketShiftCardData; aspect: CardAspect }>(
  function MarketShiftCard({ data, aspect }, ref) {
    const landscape = aspect === "landscape";
    const Icon = data.direction === "surging" ? TrendingUp : data.direction === "cooling" ? TrendingDown : Minus;
    const dirColor = data.direction === "surging" ? "text-accent" : data.direction === "cooling" ? "text-warning" : "text-muted-foreground";

    return (
      <CardFrame ref={ref} aspect={aspect} label={data.label} editionDate={data.editionDate} confidence={data.confidence} tags={data.tags} glow>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className={cn("flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5", dirColor)}>
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <p className={cn("font-semibold tracking-[-0.02em]", landscape ? "text-2xl" : "text-3xl")}>{data.sector}</p>
              <p className={cn("font-data text-sm uppercase tracking-wide", dirColor)}>
                {data.direction} {data.delta > 0 ? "+" : ""}{data.delta}
              </p>
            </div>
          </div>
          <p className={cn("leading-relaxed text-muted-foreground", landscape ? "text-base" : "text-lg")}>{data.insight}</p>
        </div>
      </CardFrame>
    );
  }
);
