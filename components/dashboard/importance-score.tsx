import { cn } from "@/lib/utils/cn";
import { scoreTier } from "@/lib/intelligence/analytics";

type ImportanceScoreProps = {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

const sizes = {
  sm: { ring: "h-10 w-10", text: "text-xs", stroke: 2.5 },
  md: { ring: "h-14 w-14", text: "text-sm", stroke: 3 },
  lg: { ring: "h-20 w-20", text: "text-lg", stroke: 3.5 }
};

export function ImportanceScore({ score, size = "md", showLabel = false, className }: ImportanceScoreProps) {
  const tier = scoreTier(score);
  const config = sizes[size];
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const toneColor = {
    critical: "text-primary",
    elevated: "text-warning",
    moderate: "text-muted-foreground",
    low: "text-muted-foreground/70"
  }[tier.tone];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("relative", config.ring)}>
        <svg className={cn("h-full w-full -rotate-90", config.ring)} viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="currentColor" strokeWidth={config.stroke} className="text-muted/80" />
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-500", toneColor)}
          />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center font-data font-semibold", config.text, toneColor)}>
          {score}
        </span>
      </div>
      {showLabel ? (
        <div>
          <p className="text-xs font-medium text-foreground">{tier.label}</p>
          <p className="text-[11px] text-muted-foreground">importance</p>
        </div>
      ) : null}
    </div>
  );
}
