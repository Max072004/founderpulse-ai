"use client";

import { useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  Linkedin,
  Maximize2,
  Twitter
} from "lucide-react";
import { ShareCardRenderer } from "@/components/cards/card-renderer";
import { Button } from "@/components/ui/button";
import { buildShareableCards, getCardInsightText } from "@/lib/cards/card-data";
import { buildCardLinkedIn, buildCardTweet } from "@/lib/cards/card-social";
import {
  copyCardImage,
  downloadCardBlob,
  exportCardToPng
} from "@/lib/cards/export-image";
import {
  CARD_DIMENSIONS,
  CARD_KIND_LABELS,
  type CardAspect,
  type ShareableCard
} from "@/lib/cards/types";
import type { Article } from "@/lib/db/types";
import { cn } from "@/lib/utils/cn";

export function CardStudio({ articles }: { articles: Article[] }) {
  const cards = useMemo(() => buildShareableCards(articles), [articles]);
  const [selectedId, setSelectedId] = useState(cards[0]?.id ?? "");
  const [aspect, setAspect] = useState<CardAspect>("portrait");
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.42);
  const [copied, setCopied] = useState<"image" | "insight" | "tweet" | "linkedin" | null>(null);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const selected = cards.find((c) => c.id === selectedId) ?? cards[0];
  const dims = CARD_DIMENSIONS[aspect];

  async function handleExport(action: "download" | "copy") {
    const el = cardRef.current;
    if (!el || !selected) return;
    setExporting(true);
    const prev = el.style.transform;
    el.style.transform = "none";
    try {
      const blob = await exportCardToPng(el, aspect);
      const filename = `founderpulse-${selected.kind}-${aspect}.png`;
      if (action === "download") {
        downloadCardBlob(blob, filename);
      } else {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied("image");
      }
    } catch {
      if (action === "copy") {
        await copyCardImage(el, aspect);
        setCopied("image");
      }
    } finally {
      el.style.transform = prev;
      setExporting(false);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  async function copyText(kind: "insight" | "tweet" | "linkedin") {
    if (!selected) return;
    const text =
      kind === "insight"
        ? getCardInsightText(selected)
        : kind === "tweet"
          ? buildCardTweet(selected)
          : buildCardLinkedIn(selected);
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!selected) {
    return (
      <p className="text-sm text-muted-foreground">No cards available. Run ingestion to generate intelligence.</p>
    );
  }

  return (
    <div className={cn("space-y-8", screenshotMode && "card-screenshot-mode")}>
      <header>
        <p className="section-label">Social export</p>
        <h1 className="display-title mt-2">Signal cards</h1>
        <p className="mt-2 max-w-2xl body-muted">
          Investor-grade share cards for X, LinkedIn, and screenshots—1080×1350 portrait or 1200×675 landscape.
        </p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Card types</p>
          {cards.map((card) => (
            <CardPicker key={card.id} card={card} active={card.id === selected.id} onSelect={() => setSelectedId(card.id)} />
          ))}
        </aside>

        <div className="space-y-4">
          <Toolbar
            aspect={aspect}
            onAspectChange={setAspect}
            screenshotMode={screenshotMode}
            onScreenshotMode={() => setScreenshotMode((v) => !v)}
            previewScale={previewScale}
            onScaleChange={setPreviewScale}
            exporting={exporting}
            copied={copied}
            onDownload={() => handleExport("download")}
            onCopyImage={() => handleExport("copy")}
            onCopyInsight={() => copyText("insight")}
            onCopyTweet={() => copyText("tweet")}
            onCopyLinkedIn={() => copyText("linkedin")}
          />

          <div
            className={cn(
              "flex justify-center overflow-auto rounded-xl border border-border/60 bg-[#030304] p-6",
              screenshotMode && "card-screenshot-canvas"
            )}
            style={{ minHeight: dims.height * previewScale + 48 }}
          >
            <div
              style={{
                width: dims.width * previewScale,
                height: dims.height * previewScale
              }}
            >
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left"
                }}
              >
                <ShareCardRenderer ref={cardRef} card={selected} aspect={aspect} />
              </div>
            </div>
          </div>

          <p className="text-center font-data text-[11px] text-muted-foreground">
            {dims.width} × {dims.height}px · {aspect === "portrait" ? "Instagram / LinkedIn portrait" : "X / LinkedIn landscape"}
          </p>
        </div>
      </div>
    </div>
  );
}

function CardPicker({ card, active, onSelect }: { card: ShareableCard; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border px-3 py-2.5 text-left transition",
        active ? "border-primary/40 bg-primary/10" : "border-border/60 bg-card/40 hover:bg-muted/30"
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {CARD_KIND_LABELS[card.kind]}
      </p>
      <p className="mt-0.5 line-clamp-1 text-xs font-medium">{cardLabel(card)}</p>
    </button>
  );
}

function cardLabel(card: ShareableCard) {
  switch (card.kind) {
    case "founder_signal":
      return card.thesis;
    case "contrarian":
      return card.prediction;
    case "market_shift":
      return card.sector;
    case "momentum":
      return "Sector momentum";
    case "brief_summary":
      return card.headline;
  }
}

function Toolbar({
  aspect,
  onAspectChange,
  screenshotMode,
  onScreenshotMode,
  previewScale,
  onScaleChange,
  exporting,
  copied,
  onDownload,
  onCopyImage,
  onCopyInsight,
  onCopyTweet,
  onCopyLinkedIn
}: {
  aspect: CardAspect;
  onAspectChange: (a: CardAspect) => void;
  screenshotMode: boolean;
  onScreenshotMode: () => void;
  previewScale: number;
  onScaleChange: (n: number) => void;
  exporting: boolean;
  copied: string | null;
  onDownload: () => void;
  onCopyImage: () => void;
  onCopyInsight: () => void;
  onCopyTweet: () => void;
  onCopyLinkedIn: () => void;
}) {
  return (
    <div className="surface flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Aspect</span>
        <button
          type="button"
          onClick={() => onAspectChange("portrait")}
          className={cn("rounded-md px-2.5 py-1 text-xs", aspect === "portrait" ? "bg-muted text-foreground" : "text-muted-foreground")}
        >
          1080×1350
        </button>
        <button
          type="button"
          onClick={() => onAspectChange("landscape")}
          className={cn("rounded-md px-2.5 py-1 text-xs", aspect === "landscape" ? "bg-muted text-foreground" : "text-muted-foreground")}
        >
          1200×675
        </button>
        <span className="mx-2 h-4 w-px bg-border" />
        <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="range"
          min={0.28}
          max={0.55}
          step={0.01}
          value={previewScale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="w-24"
        />
        <Button size="sm" variant={screenshotMode ? "default" : "secondary"} onClick={onScreenshotMode}>
          Screenshot mode
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onDownload} disabled={exporting}>
          <Download className="h-3.5 w-3.5" />
          PNG
        </Button>
        <Button size="sm" variant="secondary" onClick={onCopyImage} disabled={exporting}>
          {copied === "image" ? <Check className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}
          {copied === "image" ? "Copied" : "Copy image"}
        </Button>
        <Button size="sm" variant="secondary" onClick={onCopyInsight}>
          {copied === "insight" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          Copy insight
        </Button>
        <Button size="sm" variant="ghost" onClick={onCopyTweet}>
          {copied === "tweet" ? <Check className="h-3.5 w-3.5" /> : <Twitter className="h-3.5 w-3.5" />}
          Tweet
        </Button>
        <Button size="sm" variant="ghost" onClick={onCopyLinkedIn}>
          {copied === "linkedin" ? <Check className="h-3.5 w-3.5" /> : <Linkedin className="h-3.5 w-3.5" />}
          LinkedIn
        </Button>
      </div>
    </div>
  );
}
