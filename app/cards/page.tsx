import { AppShell } from "@/components/ui/shell";
import { CardStudio } from "@/components/cards/card-studio";
import { getArticles } from "@/lib/db/articles";

export const metadata = {
  title: "Signal Cards | FounderPulse AI",
  description: "Shareable founder intelligence cards for X, LinkedIn, and social."
};

export default async function CardsPage() {
  const articles = await getArticles({ limit: 100 });

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <CardStudio articles={articles} />
      </div>
    </AppShell>
  );
}
