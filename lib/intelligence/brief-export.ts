import type { DailyBrief } from "@/lib/intelligence/daily-brief";

export type BriefExportFormat = "thread" | "linkedin" | "markdown" | "plain";

export function buildTweetThread(brief: DailyBrief): string[] {
  const tweets: string[] = [];

  tweets.push(
    truncate(
      `FounderPulse Daily Brief · ${brief.editionLabel}\n\n${brief.headline}\n\n🧵 Strategic intelligence for founders (2-min read):`,
      280
    )
  );

  brief.executiveSummary.slice(0, 4).forEach((line, i) => {
    tweets.push(truncate(`${i + 1}/ ${line}`, 280));
  });

  if (brief.topSignals[0]) {
    tweets.push(
      truncate(
        `Lead signal (${brief.topSignals[0].importanceScore}): ${brief.topSignals[0].thesis}`,
        280
      )
    );
  }

  if (brief.opportunities[0]) {
    tweets.push(truncate(`Startup wedge: ${brief.opportunities[0].text}`, 280));
  }

  if (brief.threatenedIncumbents.length) {
    tweets.push(
      truncate(`Threatened: ${brief.threatenedIncumbents.slice(0, 2).join(" · ")}`, 280)
    );
  }

  tweets.push(truncate(`Contrarian take: ${brief.contrarian.text}`, 280));

  tweets.push(
    truncate(
      `Full brief + live AI timeline → founderpulse.ai/brief\n\n#AI #startups #founders`,
      280
    )
  );

  return tweets;
}

export function buildLinkedInSummary(brief: DailyBrief): string {
  const lines = [
    `📊 FounderPulse Daily Brief · ${brief.editionLabel}`,
    "",
    brief.headline,
    "",
    "What moved the market:",
    ...brief.executiveSummary.slice(0, 4).map((l) => `→ ${l}`),
    "",
    brief.topSignals.length
      ? `Lead signal: ${brief.topSignals[0].thesis} (${brief.topSignals[0].importanceScore}/100)`
      : "",
    brief.opportunities.length ? `Wedge to watch: ${brief.opportunities[0].text}` : "",
    "",
    `Contrarian: ${brief.contrarian.text}`,
    "",
    "Compressed strategic intelligence for AI founders—not a news roundup.",
    "",
    "#ArtificialIntelligence #Startups #VentureCapital #Founders #AI"
  ];

  return lines.filter(Boolean).join("\n");
}

export function buildMarkdownExport(brief: DailyBrief): string {
  const sections = [
    `# FounderPulse Daily Brief`,
    `**${brief.editionLabel}** · ${brief.readMinutes}-min read · Confidence: ${brief.overallConfidence} · Urgency: ${brief.overallUrgency}`,
    "",
    `## ${brief.headline}`,
    "",
    "### Executive summary",
    ...brief.executiveSummary.map((l) => `- ${l}`),
    "",
    "### Top founder signals",
    ...brief.topSignals.map((s) => `- **${s.thesis}** (${s.importanceScore}) — ${s.title}`),
    "",
    "### Market shifts",
    ...brief.marketShifts.map((s) => `- ${s.label} (${s.direction}, ${s.delta > 0 ? "+" : ""}${s.delta}): ${s.insight}`),
    "",
    "### Startup opportunities",
    ...brief.opportunities.map((o) => `- ${o.text}`),
    "",
    "### Infrastructure",
    ...brief.infrastructure.map((i) => `- ${i.title}: ${i.implication}`),
    "",
    "### Regulatory",
    ...brief.regulatory.map((i) => `- ${i.title}: ${i.implication}`),
    "",
    "### Rising sectors",
    ...brief.risingSectors.map((s) => `- ${s.label} — ${s.momentum} momentum (${s.velocity})`),
    "",
    "### Threatened incumbents",
    ...brief.threatenedIncumbents.map((t) => `- ${t}`),
    "",
    "### Contrarian prediction",
    `> ${brief.contrarian.text}`,
    "",
    `_${brief.contrarian.rationale}_`
  ];

  return sections.join("\n");
}

export function buildPlainExport(brief: DailyBrief, format: BriefExportFormat): string {
  if (format === "linkedin") return buildLinkedInSummary(brief);
  if (format === "markdown") return buildMarkdownExport(brief);
  if (format === "thread") return buildTweetThread(brief).join("\n\n---\n\n");
  return buildMarkdownExport(brief);
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}
