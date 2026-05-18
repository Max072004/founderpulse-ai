grant usage on schema public to anon, authenticated, service_role;

grant select on public.articles to anon, authenticated;
grant select on public.feeds to anon, authenticated;

grant all privileges on public.articles to service_role;
grant all privileges on public.feeds to service_role;
