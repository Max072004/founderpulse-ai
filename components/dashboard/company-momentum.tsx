import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ImportanceScore } from "@/components/dashboard/importance-score";
import type { CompanyMomentum } from "@/lib/intelligence/analytics";
import { cn } from "@/lib/utils/cn";

const trendStyles = {
  accelerating: "text-accent",
  steady: "text-primary",
  fading: "text-muted-foreground"
} as const;

export function CompanyMomentumSection({ companies }: { companies: CompanyMomentum[] }) {
  return (
    <section className="space-y-4">
      <SectionHeader
        label="Momentum"
        title="Company signal tracking"
        description="Mention frequency and importance across tracked AI leaders."
      />
      <Card>
        <CardContent className="p-0">
          {!companies.length ? (
            <EmptyState icon={Building2} title="No company momentum" description="Company tracking activates when signals mention tracked leaders." className="border-0 bg-transparent" />
          ) : (
            <ul className="divide-y divide-border/60">
              {companies.map((company, index) => (
                <li key={company.name} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-muted/20">
                  <span className="font-data w-5 text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{company.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{company.latestSignal ?? `${company.mentions} mentions`}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[10px] font-medium uppercase tracking-wide", trendStyles[company.trend])}>{company.trend}</span>
                    <ImportanceScore score={company.averageScore} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
