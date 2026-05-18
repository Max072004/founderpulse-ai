import { NextResponse } from "next/server";
import { demoArticles } from "@/lib/db/articles";
import { getPublicSupabase } from "@/lib/db/supabase";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const supabase = getPublicSupabase();
  if (!supabase) {
    const article = demoArticles.find((item) => item.id === id || item.slug === id);
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json({ data: article });
  }

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .or(`id.eq.${id},slug.eq.${id}`)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  return NextResponse.json({ data });
}
