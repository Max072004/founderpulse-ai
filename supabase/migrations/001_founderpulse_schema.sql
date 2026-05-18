create extension if not exists pgcrypto;

do $$ begin
  create type article_status as enum ('raw', 'summarized', 'failed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.feeds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  category_hint text,
  active boolean not null default true,
  last_fetched_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  source_name text not null,
  source_url text not null,
  canonical_url text not null,
  author text,
  published_at timestamptz,
  raw_excerpt text,
  summary text,
  founder_insight text,
  why_it_matters text,
  startup_opportunities text[] not null default '{}',
  categories text[] not null default '{}',
  importance_score integer not null default 0 check (importance_score between 0 and 100),
  signal_score integer not null default 0 check (signal_score between 0 and 100),
  hash text not null unique,
  status article_status not null default 'raw',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published_at_idx on public.articles (published_at desc);
create index if not exists articles_importance_score_idx on public.articles (importance_score desc);
create index if not exists articles_categories_idx on public.articles using gin (categories);
create index if not exists articles_search_idx on public.articles using gin (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(founder_insight, ''))
);

alter table public.articles enable row level security;
alter table public.feeds enable row level security;

drop policy if exists "Public can read summarized articles" on public.articles;
create policy "Public can read summarized articles"
  on public.articles for select
  using (status = 'summarized');

drop policy if exists "Public can read active feeds" on public.feeds;
create policy "Public can read active feeds"
  on public.feeds for select
  using (active = true);

insert into public.feeds (name, url, category_hint)
values
  ('OpenAI Blog', 'https://openai.com/news/rss.xml', 'model_release'),
  ('Google DeepMind', 'https://deepmind.google/discover/blog/rss.xml', 'research'),
  ('Anthropic News', 'https://www.anthropic.com/news/rss.xml', 'model_release'),
  ('Hugging Face Blog', 'https://huggingface.co/blog/feed.xml', 'open_source'),
  ('VentureBeat AI', 'https://venturebeat.com/category/ai/feed/', 'enterprise_ai'),
  ('MIT AI News', 'https://news.mit.edu/rss/topic/artificial-intelligence2', 'research')
on conflict (url) do nothing;
