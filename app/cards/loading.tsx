import { AppShell } from "@/components/ui/shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function CardsLoading() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-20 max-w-lg rounded-xl" />
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
          <Skeleton className="aspect-[4/5] max-h-[600px] rounded-xl" />
        </div>
      </div>
    </AppShell>
  );
}
