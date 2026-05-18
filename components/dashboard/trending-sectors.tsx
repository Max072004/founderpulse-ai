import { Flame, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import type { TrendingSector } from "@/lib/intelligence/analytics";
import { cn } from "@/lib/utils/cn";

export function TrendingSectorsSection({ sectors }: { sectors: TrendingSector[] }) {
  return (
    <section className="space-y-4">
      <SectionHeader label="Trending" title="AI sectors on the move" />
      {!sectors.length ? (
        <Card><CardContent><EmptyState icon={TrendingUp} title="No sector data" description="Trending sectors populate from live article categories." /></CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sectors.map((sector) => (
            <Card key={sector.category} className="surface-interactive">
              <CardHeader className="flex flex-row items-center justify-between pb-0">
                <CardTitle className="text-sm">{sector.label}</CardTitle>
                {sector.velocity === "hot" ? <Flame className="h-4 w-4 text-warning" /> : null}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="font-data text-2xl font-semibold tracking-tight">{sector.momentum}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{sector.velocity}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", sector.velocity === "hot" ? "bg-warning" : sector.velocity === "rising" ? "bg-primary" : "bg-muted-foreground/40")}
                    style={{ width: `${sector.momentum}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{sector.signalCount} signals · {sector.averageScore} importance</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
