-- Run once in the Supabase SQL editor.
--
-- One row per user. The server writes here with the service role key;
-- browsers can only read their own row (and only through the server,
-- which is the only client that holds a key).

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  email                  text,
  status                 text not null default 'trialing',   -- trialing | active | past_due | canceled
  plan                   text not null default 'trial',      -- trial | starter | pro | family
  trial_end              timestamptz,
  current_period_end     timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_idx     on public.subscriptions (stripe_customer_id);
create index if not exists subscriptions_stripe_subscription_idx on public.subscriptions (stripe_subscription_id);

alter table public.subscriptions enable row level security;

-- A logged-in user may read their own row. Nobody but the service role writes.
drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
