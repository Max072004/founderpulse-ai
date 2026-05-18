import { forwardRef } from "react";
import { CardFrame } from "@/components/cards/card-frame";
import type { CardAspect, MomentumCardData } from "@/lib/cards/types";
import { cn } from "@/lib/utils/cn";

export const MomentumCard = forwardRef<HTMLDivElement, { data: MomentumCardData; aspect: CardAspect }>(
  function MomentumCard({ data, aspect }, ref) {
    const landscape = aspect === "landscape";
    return (
      <CardFrame ref={ref} aspect={aspect} label={data.label} editionDate={data.editionDate} confidence={data.confidence} tags={data.tags}>
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <p className={cn("font-data font-semibold tracking-tight text-primary", landscape ? "text-5xl" : "text-6xl")}>{data.overallMomentum}</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Composite momentum</p>
          </div>
          <ul className={cn("space-y-4", landscape && "grid grid-cols-2 gap-4 space-y-0")}>
            {data.sectors.map((sector) => (
              <li key={sector.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{sector.label}</span>
                  <span className="font-data text-muted-foreground">{sector.momentum}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn("h-full rounded-full", sector.velocity === "hot" ? "bg-warning" : "bg-primary")}
                    style={{ width: `${sector.momentum}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardFrame>
    );
  }
);
