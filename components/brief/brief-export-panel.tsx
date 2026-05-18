"use client";

import { useState } from "react";
import { Check, Copy, Download, Linkedin, Share2, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildLinkedInSummary,
  buildMarkdownExport,
  buildTweetThread,
  type BriefExportFormat
} from "@/lib/intelligence/brief-export";
import type { DailyBrief } from "@/lib/intelligence/daily-brief";
import { cn } from "@/lib/utils/cn";

export function BriefExportPanel({
  brief,
  exportMode,
  onExportModeChange
}: {
  brief: DailyBrief;
  exportMode: boolean;
  onExportModeChange: (on: boolean) => void;
}) {
  const [format, setFormat] = useState<BriefExportFormat>("thread");
  const [copied, setCopied] = useState(false);

  const content = {
    thread: buildTweetThread(brief).join("\n\n---\n\n"),
    linkedin: buildLinkedInSummary(brief),
    markdown: buildMarkdownExport(brief),
    plain: buildMarkdownExport(brief)
  }[format];

  const tweets = format === "thread" ? buildTweetThread(brief) : [];

  async function copy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `founderpulse-brief-${brief.editionDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Share & export</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <FormatBtn icon={Twitter} label="Thread" active={format === "thread"} onClick={() => setFormat("thread")} />
          <FormatBtn icon={Linkedin} label="LinkedIn" active={format === "linkedin"} onClick={() => setFormat("linkedin")} />
          <FormatBtn icon={Download} label="Markdown" active={format === "markdown"} onClick={() => setFormat("markdown")} />
          <Button size="sm" variant={exportMode ? "default" : "secondary"} onClick={() => onExportModeChange(!exportMode)}>
            Screenshot mode
          </Button>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="secondary" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button size="sm" variant="ghost" onClick={download}>Download</Button>
      </div>
      <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-border/60 bg-background/60 p-4">
        {format === "thread" ? (
          <ol className="space-y-3">
            {tweets.map((tweet, i) => (
              <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-data text-primary">{i + 1}.</span> {tweet}
              </li>
            ))}
          </ol>
        ) : (
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{content}</pre>
        )}
      </div>
    </div>
  );
}

function FormatBtn({ icon: Icon, label, active, onClick }: { icon: typeof Share2; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />{label}
    </button>
  );
}
