-- =====================================================================
-- מונה מבקרים — הטבלאות, האינדקסים והפונקציות ב-Supabase (Postgres).
-- מריצים פעם אחת ב-SQL Editor של הפרויקט. הקובץ בטוח להרצה חוזרת.
--
-- מה יש כאן
--   analytics_visits  ביקורים גולמיים. אין IP, אין user-agent מלא, אין שם.
--   analytics_daily   סיכום יומי (יום, דף, מונה) — נשאר גם אחרי שהגולמי נמחק.
--   analytics_rollup_and_purge(retention, tz)  מסכם ימים שלמים ומוחק
--                     גולמי ישן מ-retention ימים. השרת קורא לה כל שש שעות.
--   analytics_summary(days, tz)  הסיכום שמסך האדמין מציג, כ-JSON אחד.
--
-- אבטחה: RLS דלוק ואין מדיניות — anon ו-authenticated לא רואים כלום,
-- לא בטבלאות ולא בפונקציות. רק service_role (השרת) מגיע לכאן, והמפתח
-- שלו יושב במשתנה סביבה בשרת ולא בשום קובץ בריפו.
-- =====================================================================

create table if not exists public.analytics_visits (
  id                bigint generated always as identity primary key,
  session_id_hash   text        not null,
  visited_at        timestamptz not null default now(),
  page              text        not null default '/',
  language          text,
  referrer          text,
  user_agent_family text,
  created_at        timestamptz not null default now()
);

create index if not exists analytics_visits_visited_at_idx on public.analytics_visits (visited_at);
create index if not exists analytics_visits_session_idx    on public.analytics_visits (session_id_hash);
create index if not exists analytics_visits_page_idx       on public.analytics_visits (page);

create table if not exists public.analytics_daily (
  day    date    not null,
  page   text    not null,
  visits integer not null default 0,
  primary key (day, page)
);

alter table public.analytics_visits enable row level security;
alter table public.analytics_daily  enable row level security;
revoke all on public.analytics_visits from anon, authenticated;
revoke all on public.analytics_daily  from anon, authenticated;

-- ---------------------------------------------------------------------
-- סיכום ומחיקה. יום נמחק בשלמותו (לפי אזור הזמן), ולכן אף יום לא נספר
-- פעמיים: "סך הכול" = הימים שכבר אינם בגולמי (מהסיכום) + מניין הגולמי.
-- ---------------------------------------------------------------------
create or replace function public.analytics_rollup_and_purge(
  p_retention_days integer default 90,
  p_tz             text    default 'Asia/Jerusalem')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today  date := (now() at time zone p_tz)::date;
  v_cutoff date := v_today - p_retention_days;
  v_rolled integer;
  v_purged integer;
begin
  insert into analytics_daily (day, page, visits)
  select (visited_at at time zone p_tz)::date, page, count(*)::integer
  from analytics_visits
  where visited_at < (v_today::timestamp at time zone p_tz)
  group by 1, 2
  on conflict (day, page) do update set visits = excluded.visits;
  get diagnostics v_rolled = row_count;

  delete from analytics_visits
  where visited_at < (v_cutoff::timestamp at time zone p_tz);
  get diagnostics v_purged = row_count;

  return jsonb_build_object('rolled', v_rolled, 'purged', v_purged, 'cutoff', v_cutoff);
end
$$;

-- ---------------------------------------------------------------------
-- הסיכום למסך האדמין.
-- ---------------------------------------------------------------------
create or replace function public.analytics_summary(
  p_days integer default 30,
  p_tz   text    default 'Asia/Jerusalem')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today   date := (now() at time zone p_tz)::date;
  v_from    date := v_today - (greatest(p_days, 1) - 1);
  v_from_ts timestamptz := v_from::timestamp at time zone p_tz;
  v_first   date;
  v_total   bigint;
  v_today_n bigint;
  v_week    bigint;
  v_days    jsonb;
  v_pages   jsonb;
  v_langs   jsonb;
  v_refs    jsonb;
  v_uas     jsonb;
begin
  select min((visited_at at time zone p_tz)::date) into v_first from analytics_visits;

  select coalesce(sum(visits), 0) into v_total
  from analytics_daily where v_first is null or day < v_first;
  select v_total + count(*) into v_total from analytics_visits;

  select count(*) into v_today_n from analytics_visits
  where visited_at >= (v_today::timestamp at time zone p_tz);
  select count(*) into v_week from analytics_visits
  where visited_at >= ((v_today - 6)::timestamp at time zone p_tz);

  select coalesce(jsonb_agg(jsonb_build_object('day', to_char(d.day, 'YYYY-MM-DD'), 'visits',
           case when v_first is not null and d.day >= v_first then coalesce(r.n, 0) else coalesce(a.n, 0) end)
           order by d.day), '[]'::jsonb)
  into v_days
  from (select g::date as day from generate_series(v_from::timestamp, v_today::timestamp, interval '1 day') g) d
  left join (select (visited_at at time zone p_tz)::date as day, count(*) as n
             from analytics_visits where visited_at >= v_from_ts group by 1) r on r.day = d.day
  left join (select day, sum(visits) as n from analytics_daily group by day) a on a.day = d.day;

  select coalesce(jsonb_agg(jsonb_build_object('page', page, 'visits', n) order by n desc), '[]'::jsonb) into v_pages
  from (select page, count(*) as n from analytics_visits where visited_at >= v_from_ts group by page order by n desc limit 10) t;

  select coalesce(jsonb_agg(jsonb_build_object('language', coalesce(language, '—'), 'visits', n) order by n desc), '[]'::jsonb) into v_langs
  from (select language, count(*) as n from analytics_visits where visited_at >= v_from_ts group by language order by n desc limit 6) t;

  select coalesce(jsonb_agg(jsonb_build_object('referrer', coalesce(referrer, '—'), 'visits', n) order by n desc), '[]'::jsonb) into v_refs
  from (select referrer, count(*) as n from analytics_visits where visited_at >= v_from_ts group by referrer order by n desc limit 10) t;

  select coalesce(jsonb_agg(jsonb_build_object('ua', coalesce(user_agent_family, '—'), 'visits', n) order by n desc), '[]'::jsonb) into v_uas
  from (select user_agent_family, count(*) as n from analytics_visits where visited_at >= v_from_ts group by user_agent_family order by n desc limit 6) t;

  return jsonb_build_object(
    'total', v_total, 'today', v_today_n, 'week', v_week,
    'days', v_days, 'pages', v_pages, 'languages', v_langs, 'referrers', v_refs, 'browsers', v_uas);
end
$$;

-- הפונקציות זמינות לשרת בלבד
revoke execute on function public.analytics_rollup_and_purge(integer, text) from public, anon, authenticated;
revoke execute on function public.analytics_summary(integer, text)          from public, anon, authenticated;
grant  execute on function public.analytics_rollup_and_purge(integer, text) to service_role;
grant  execute on function public.analytics_summary(integer, text)          to service_role;

-- אופציונלי: אם השרת אינו רץ ברציפות, אפשר לתת ל-pg_cron למחוק במקומו.
-- דורש הפעלת ההרחבה pg_cron בפרויקט (Database → Extensions).
-- select cron.schedule('analytics-purge', '30 3 * * *',
--   $$select public.analytics_rollup_and_purge(90, 'Asia/Jerusalem')$$);
