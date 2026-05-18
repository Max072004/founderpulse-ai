import { forwardRef } from "react";
import { CardFrame } from "@/components/cards/card-frame";
import { UrgencyBadge } from "@/components/brief/brief-indicators";
import type { BriefSummaryCardData, CardAspect } from "@/lib/cards/types";
import { cn } from "@/lib/utils/cn";

export const BriefSummaryCard = forwardRef<HTMLDivElement, { data: BriefSummaryCardData; aspect: CardAspect }>(
  function BriefSummaryCard({ data, aspect }, ref) {
    const landscape = aspect === "landscape";
    return (
      <CardFrame ref={ref} aspect={aspect} label={data.label} editionDate={data.editionDate} confidence={data.confidence} tags={data.tags} glow>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-data text-[10px] uppercase tracking-wide text-primary">
              {data.readMinutes}-min read
            </span>
            <UrgencyBadge level={data.urgency} />
          </div>
          <h2 className={cn("font-semibold leading-[1.1] tracking-[-0.03em]", landscape ? "text-2xl" : "text-[1.75rem]")}>{data.headline}</h2>
          <ul className={cn("space-y-2.5", landscape && "grid grid-cols-2 gap-x-6 gap-y-2")}>
            {data.bullets.slice(0, landscape ? 4 : 5).map((bullet) => (
              <li key={bullet} className="flex gap-2 text-sm leading-snug text-muted-foreground">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span className={landscape ? "line-clamp-2" : ""}>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardFrame>
    );
  }
);
