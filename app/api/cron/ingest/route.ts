import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { runIngestion } from "@/lib/ingestion/pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const secret = searchParams.get("secret");

  if (!secret) {
    return NextResponse.json(
      { error: "Missing secret" },
      { status: 401 }
    );
  }

  if (secret !== env.CRON_SECRET) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        received: secret ? "provided" : "missing",
        expectedExists: !!env.CRON_SECRET,
      },
      { status: 401 }
    );
  }

  const result = await runIngestion();

  return NextResponse.json({ data: result });
}