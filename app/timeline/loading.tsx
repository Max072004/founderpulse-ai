import { AppShell } from "@/components/ui/shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimelineLoading() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-28 max-w-2xl rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </AppShell>
  );
}
