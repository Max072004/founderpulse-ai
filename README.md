# FounderPulse AI

Production-ready AI founder intelligence platform built with Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, Supabase, Gemini, RSS ingestion, and Vercel cron.

## Features

- Real RSS feed ingestion from AI sources
- Deduplication by normalized URL and title hash
- Gemini-powered founder summaries
- Founder insight, why this matters, startup opportunities, importance scoring
- AI trend categories, search, filters, dashboard, article detail pages, and trends page
- Supabase persistence with indexes and RLS-ready policies
- Vercel cron endpoint for scheduled ingestion

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run:

```sql
-- paste supabase/migrations/001_founderpulse_schema.sql into the Supabase SQL editor
```

3. Copy `.env.example` to `.env.local` and fill the values.

4. Run locally:

```bash
npm run dev
```

5. Trigger ingestion:

```bash
curl -X POST http://localhost:3000/api/ingest -H "Authorization: Bearer $CRON_SECRET"
```

## Architecture

- `app/` contains App Router pages and API routes.
- `components/` contains reusable UI and dashboard components.
- `lib/ingestion/` fetches RSS, normalizes URLs, deduplicates, inserts, and summarizes.
- `lib/ai/` handles Gemini analysis and heuristic fallback scoring.
- `lib/db/` contains typed Supabase clients and article queries.
- `supabase/migrations/` contains the database schema.

When Gemini or Supabase env vars are missing, the UI uses demo data so the product experience remains visible during local setup.
