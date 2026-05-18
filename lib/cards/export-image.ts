import { toBlob, toPng } from "html-to-image";
import type { CardAspect } from "@/lib/cards/types";
import { CARD_DIMENSIONS } from "@/lib/cards/types";

export async function exportCardToPng(element: HTMLElement, aspect: CardAspect): Promise<Blob> {
  const { width, height } = CARD_DIMENSIONS[aspect];

  const blob = await toBlob(element, {
    width,
    height,
    pixelRatio: 2,
    cacheBust: true,
    style: {
      transform: "none",
      transformOrigin: "top left"
    }
  });

  if (!blob) throw new Error("Failed to generate image");
  return blob;
}

export async function exportCardToDataUrl(element: HTMLElement, aspect: CardAspect): Promise<string> {
  const { width, height } = CARD_DIMENSIONS[aspect];
  return toPng(element, {
    width,
    height,
    pixelRatio: 2,
    cacheBust: true
  });
}

export async function copyCardImage(element: HTMLElement, aspect: CardAspect): Promise<void> {
  const blob = await exportCardToPng(element, aspect);
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

export function downloadCardBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
