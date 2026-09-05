# Learn Aloud — product website

Signup → 7-day free trial → pricing → Stripe Checkout → dashboard.
Custom code, no site builder. Hebrew first, English toggle, read-aloud on
every page, large calm layout.

## Stack

| Layer | What | Why |
|---|---|---|
| Server | Node 18+ built-in `http` | Zero npm dependencies: `node server.js` runs anywhere, nothing to install, nothing to audit |
| Pages | static HTML/CSS/JS in `public/` | Low cognitive load, no framework |
| Auth + data | Supabase (GoTrue + PostgREST over HTTPS) | Email/password, one `subscriptions` table |
| Billing | Stripe Checkout + webhooks over HTTPS | Subscriptions, customer portal |
| Host | Render, via `render.yaml` | Real Node host with health checks |

The Supabase and Stripe clients live in `lib/` and speak REST directly,
so the server has the same behaviour with or without an SDK.

## Run locally

    cp .env.example .env      # fill in real values when you have them
    node server.js            # http://localhost:3000

Without real values the site still runs: pages show a "still being set
up" banner, `/ready` answers 503 and lists what is missing, and signup /
checkout answer 503 with a plain message instead of crashing.

## Test

    node test/smoke.js        # server with placeholder keys, 35 checks
    node test/browser.js      # real Chromium: every page, no JS errors, guards

## Endpoints

| Route | Auth | Purpose |
|---|---|---|
| `GET /health` | – | liveness |
| `GET /ready` | – | readiness: which credentials are real, 200/503 |
| `GET /api/config` | – | public flags for the pages |
| `GET /api/prices` | – | live prices from Stripe (never invented) |
| `POST /api/auth/signup` | – | create user, start 7-day trial |
| `POST /api/auth/login` | – | password login (starts trial if none) |
| `POST /api/auth/logout` | Bearer | end session |
| `GET /api/me` | Bearer | user + subscription + `access` |
| `POST /api/trial/start` | Bearer | idempotent trial |
| `POST /api/checkout` | Bearer | Stripe Checkout URL for `starter` / `pro` / `family` |
| `POST /api/billing/portal` | Bearer | Stripe customer portal URL |
| `POST /api/stripe/webhook` | signature | subscription lifecycle |
| `GET /api/dashboard` | Bearer + access | protected content |

Access rule (`accessFor` in `server.js`): `active` with a future
`current_period_end`, or `trialing` with a future `trial_end`. Everything
else is refused with a reason the dashboard shows.

## Files

    server.js              routes, static files, access rule, webhook handling
    lib/config.js          env loading, placeholder detection, readiness
    lib/supabase.js        auth + subscriptions table over REST
    lib/stripe.js          checkout, portal, prices, webhook signature
    public/                index, signup, pricing, dashboard, 404, styles, app.js
    supabase/schema.sql    the one table, with row level security
    render.yaml            Render blueprint (rootDir: saas)
    .env.example           every variable, with sample values
    DEPLOYMENT_CHECKLIST.md what to do, in order, to go live
