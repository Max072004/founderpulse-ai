"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  "all",
  "model_release",
  "agents",
  "enterprise_ai",
  "infrastructure",
  "open_source",
  "funding",
  "regulation",
  "research",
  "chips"
];

export function Filters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    router.push(`/dashboard?${next.toString()}`);
  }

  return (
    <Card className="border-border/60 bg-card/40">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:w-28">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </div>
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={params.get("q") ?? ""}
            className="h-9 border-border/60 bg-background/60 pl-9"
            placeholder="Search signals, companies, markets…"
            onKeyDown={(event) => {
              if (event.key === "Enter") update("q", event.currentTarget.value);
            }}
          />
        </label>
        <Select
          className="h-9 w-full border-border/60 bg-background/60 sm:w-44"
          defaultValue={params.get("category") ?? "all"}
          onChange={(event) => update("category", event.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
        <Select
          className="h-9 w-full border-border/60 bg-background/60 sm:w-40"
          defaultValue={params.get("minScore") ?? "0"}
          onChange={(event) => update("minScore", event.target.value)}
        >
          <option value="0">Any score</option>
          <option value="50">50+ importance</option>
          <option value="70">70+ importance</option>
          <option value="85">85+ priority</option>
        </Select>
      </CardContent>
    </Card>
  );
}
