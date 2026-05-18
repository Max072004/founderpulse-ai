import crypto from "node:crypto";

export function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) =>
      parsed.searchParams.delete(key)
    );
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

export function createArticleHash(title: string, canonicalUrl: string) {
  const normalized = `${title.trim().toLowerCase()}::${normalizeUrl(canonicalUrl)}`;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 88);
}
