import { Activity } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CardAspect } from "@/lib/cards/types";

export function CardBrand({ label, editionDate, aspect }: { label: string; editionDate: string; aspect: CardAspect }) {
  const compact = aspect === "landscape";
  return (
    <header className={cn("flex items-start justify-between", compact ? "mb-6" : "mb-10")}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </span>
        <div>
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-muted-foreground">FounderPulse AI</p>
          <p className="text-sm font-semibold tracking-[-0.02em] text-foreground">{label}</p>
        </div>
      </div>
      <p className="font-data text-[10px] uppercase tracking-wider text-muted-foreground">{editionDate}</p>
    </header>
  );
}
