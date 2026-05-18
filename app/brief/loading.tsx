import { AppShell } from "@/components/ui/shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function BriefLoading() {
  return (
    <AppShell>
      <div className="border-b border-border/60 bg-background/90 px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-full max-w-xl" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Skeleton className="h-32 rounded-xl" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </AppShell>
  );
}
