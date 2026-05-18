import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { runIngestion } from "@/lib/ingestion/pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (env.CRON_SECRET) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runIngestion();
  return NextResponse.json({ data: result });
}
