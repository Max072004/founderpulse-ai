"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
        <EmptyState
          icon={AlertTriangle}
          title="Intelligence feed unavailable"
          description="We could not load the dashboard. Check your Supabase connection and try again."
          action={
            <Button onClick={reset} variant="secondary">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    </AppShell>
  );
}
