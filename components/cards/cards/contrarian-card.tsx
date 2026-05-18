import { forwardRef } from "react";
import { CardFrame } from "@/components/cards/card-frame";
import type { CardAspect, ContrarianCardData } from "@/lib/cards/types";
import { cn } from "@/lib/utils/cn";

export const ContrarianCard = forwardRef<HTMLDivElement, { data: ContrarianCardData; aspect: CardAspect }>(
  function ContrarianCard({ data, aspect }, ref) {
    const landscape = aspect === "landscape";
    return (
      <CardFrame ref={ref} aspect={aspect} label={data.label} editionDate={data.editionDate} confidence={data.confidence} tags={data.tags} glow>
        <div className="space-y-6">
          <p className="font-data text-[11px] uppercase tracking-[0.28em] text-warning">Against the consensus</p>
          <p className={cn("font-semibold leading-[1.12] tracking-[-0.03em]", landscape ? "text-2xl" : "text-[2rem]")}>{data.prediction}</p>
          <p className={cn("leading-relaxed text-muted-foreground", landscape ? "line-clamp-3 text-sm" : "text-base")}>{data.rationale}</p>
        </div>
      </CardFrame>
    );
  }
);
