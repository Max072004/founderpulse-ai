import { NextResponse } from "next/server";
import { getArticles } from "@/lib/db/articles";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const articles = await getArticles({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    minScore: searchParams.get("minScore") ? Number(searchParams.get("minScore")) : undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
  });

  return NextResponse.json({ data: articles });
}
