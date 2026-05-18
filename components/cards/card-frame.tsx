import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { CARD_DIMENSIONS, type CardAspect } from "@/lib/cards/types";
import { ConfidenceBadge } from "@/components/brief/brief-indicators";
import type { ConfidenceLevel } from "@/lib/intelligence/daily-brief";
import { CardBrand } from "@/components/cards/card-brand";

type CardFrameProps = {
  aspect: CardAspect;
  label: string;
  editionDate: string;
  confidence: ConfidenceLevel;
  tags: string[];
  children: ReactNode;
  glow?: boolean;
  className?: string;
};

export const CardFrame = forwardRef<HTMLDivElement, CardFrameProps>(function CardFrame(
  { aspect, label, editionDate, confidence, tags, children, glow, className },
  ref
) {
  const { width, height } = CARD_DIMENSIONS[aspect];
  const landscape = aspect === "landscape";

  return (
    <div
      ref={ref}
      data-share-card="true"
      className={cn(
        "relative flex flex-col overflow-hidden text-foreground",
        glow && "ring-1 ring-primary/25",
        className
      )}
      style={{
        width,
        height,
        background:
          "radial-gradient(ellipse 90% 60% at 20% -10%, rgba(96,165,250,0.12), transparent), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(52,211,153,0.06), transparent), #060608"
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      <div className={cn("relative flex flex-1 flex-col", landscape ? "p-10" : "p-12")}>
        <CardBrand label={label} editionDate={editionDate} aspect={aspect} />
        <div className="flex flex-1 flex-col justify-center">{children}</div>
        <footer className={cn("mt-auto flex flex-wrap items-center gap-2 border-t border-white/10 pt-6", landscape && "pt-4")}>
          <ConfidenceBadge level={confidence} />
          {tags.slice(0, landscape ? 3 : 4).map((tag) => (
            <span key={tag} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {tag}
            </span>
          ))}
          <span className="ml-auto font-data text-[10px] text-muted-foreground/70">founderpulse.ai</span>
        </footer>
      </div>
    </div>
  );
});
