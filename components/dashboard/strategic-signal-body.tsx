import { Crosshair, Lightbulb, ShieldAlert, Telescope, TrendingUp } from "lucide-react";
import type { StrategicSignal } from "@/lib/ai/strategic-signal";
import { cn } from "@/lib/utils/cn";

type StrategicSignalBodyProps = {
  strategic: StrategicSignal;
  variant?: "featured" | "compact";
  className?: string;
};

export function StrategicSignalBody({ strategic, variant = "featured", className }: StrategicSignalBodyProps) {
  const compact = variant === "compact";

  return (
    <div className={cn("space-y-4", className)}>
      <blockquote
        className={cn(
          "border-l-2 border-primary/50 pl-3 font-medium leading-snug tracking-[-0.01em] text-foreground",
          compact ? "text-sm" : "text-base sm:text-lg"
        )}
      >
        {strategic.thesis}
      </blockquote>

      <SignalBlock
        icon={TrendingUp}
        label="Market shift"
        text={strategic.market_shift}
        compact={compact}
      />
      <SignalBlock
        icon={Crosshair}
        label="Why founders care"
        text={strategic.why_founders_care}
        compact={compact}
      />

      {!compact ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SignalList
            icon={Lightbulb}
            label="Startup opportunities"
            items={strategic.startup_opportunities}
            tone="accent"
          />
          <SignalList
            icon={ShieldAlert}
            label="Threatened models"
            items={strategic.threatened_business_models}
            tone="warning"
          />
        </div>
      ) : null}

      <SignalList
        icon={Telescope}
        label={compact ? "Trends" : "Future trends"}
        items={strategic.future_trends}
        tone="primary"
        compact={compact}
      />
    </div>
  );
}

function SignalBlock({
  icon: Icon,
  label,
  text,
  compact
}: {
  icon: typeof TrendingUp;
  label: string;
  text: string;
  compact: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      </div>
      <p className={cn("leading-relaxed text-muted-foreground", compact ? "text-xs line-clamp-2" : "text-sm")}>{text}</p>
    </div>
  );
}

function SignalList({
  icon: Icon,
  label,
  items,
  tone,
  compact
}: {
  icon: typeof TrendingUp;
  label: string;
  items: string[];
  tone: "accent" | "warning" | "primary";
  compact?: boolean;
}) {
  const dotColor = {
    accent: "bg-accent",
    warning: "bg-warning",
    primary: "bg-primary"
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      </div>
      <ul className={cn("space-y-1.5", compact && "space-y-1")}>
        {items.map((item) => (
          <li key={item} className={cn("flex gap-2 text-muted-foreground", compact ? "text-xs line-clamp-1" : "text-xs leading-relaxed")}>
            <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full", dotColor)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
