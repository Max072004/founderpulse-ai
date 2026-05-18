import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 rounded-md border border-border bg-muted/45 px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
        className
      )}
      {...props}
    />
  );
}
