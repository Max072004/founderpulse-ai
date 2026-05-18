"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function BriefSection({
  id,
  label,
  title,
  count,
  children,
  defaultOpen = false
}: {
  id: string;
  label: string;
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="border-b border-border/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:bg-muted/10"
      >
        <div>
          <p className="section-label">{label}</p>
          <h2 className="mt-1 text-base font-semibold tracking-[-0.02em]">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {count !== undefined ? (
            <span className="font-data text-xs text-muted-foreground">{count}</span>
          ) : null}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")} />
        </div>
      </button>
      {open ? <div className="pb-6">{children}</div> : null}
    </section>
  );
}
