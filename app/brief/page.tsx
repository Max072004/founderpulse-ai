import { AppShell } from "@/components/ui/shell";
import { BriefTerminal } from "@/components/brief/brief-terminal";
import { getArticles } from "@/lib/db/articles";

export const metadata = {
  title: "Daily Founder Brief | FounderPulse AI",
  description: "Compressed strategic intelligence for AI founders—read in 2 minutes."
};

export default async function BriefPage() {
  const articles = await getArticles({ limit: 100 });

  return (
    <AppShell className="brief-page">
      <BriefTerminal articles={articles} />
    </AppShell>
  );
}
