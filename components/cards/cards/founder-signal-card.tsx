import { forwardRef } from "react";
import { CardFrame } from "@/components/cards/card-frame";
import { UrgencyBadge } from "@/components/brief/brief-indicators";
import type { CardAspect, FounderSignalCardData } from "@/lib/cards/types";
import { cn } from "@/lib/utils/cn";

export const FounderSignalCard = forwardRef<HTMLDivElement, { data: FounderSignalCardData; aspect: CardAspect }>(
  function FounderSignalCard({ data, aspect }, ref) {
    const landscape = aspect === "landscape";

    return (
      <CardFrame
        ref={ref}
        aspect={aspect}
        label={data.label}
        editionDate={data.editionDate}
        confidence={data.confidence}
        tags={data.tags}
        glow
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-data text-5xl font-semibold tracking-tight text-primary">{data.importanceScore}</span>
            <UrgencyBadge level={data.urgency} />
          </div>
          <blockquote
            className={cn(
              "border-l-2 border-primary/60 pl-5 font-semibold leading-[1.15] tracking-[-0.03em]",
              landscape ? "text-2xl" : "text-3xl"
            )}
          >
            {data.thesis}
          </blockquote>
          <p className={cn("leading-relaxed text-muted-foreground", landscape ? "line-clamp-2 text-base" : "text-lg")}>
            {data.marketImpact}
          </p>
          {!landscape && data.sourceTitle ? (
            <p className="line-clamp-2 text-sm text-muted-foreground/70">{data.sourceTitle}</p>
          ) : null}
        </div>
      </CardFrame>
    );
  }
);
