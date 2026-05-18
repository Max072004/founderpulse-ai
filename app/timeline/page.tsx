import { Suspense } from "react";
import { AppShell } from "@/components/ui/shell";
import { TimelineTerminal } from "@/components/timeline/timeline-terminal";
import { Skeleton } from "@/components/ui/skeleton";
import { getArticles } from "@/lib/db/articles";

export default async function TimelinePage() {
  const articles = await getArticles({ limit: 120 });

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<TimelineSkeleton />}>
          <TimelineTerminal articles={articles} />
        </Suspense>
      </div>
    </AppShell>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full max-w-xl rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-14 rounded-xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}
