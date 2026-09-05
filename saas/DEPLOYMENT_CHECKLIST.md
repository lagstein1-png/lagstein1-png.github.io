# Deployment checklist

Do these in order. Each step has a way to check it worked. Nothing is
live until the last box is ticked, and the site keeps running safely at
every step in between.

## 1. Supabase

- [ ] Create a project at supabase.com.
- [ ] SQL editor → paste `supabase/schema.sql` → Run.
- [ ] Authentication → Providers → Email: enabled. Decide whether "Confirm
      email" is on. If on, new users get a mail before they can log in;
      the signup page already handles both cases.
- [ ] Project Settings → API: copy **Project URL**, **anon key**,
      **service_role key**.
- [ ] Authentication → URL configuration → Site URL = your APP_URL.

Check: after step 4 below, `GET /ready` shows `"supabase": true`.

## 2. Stripe

- [ ] Products → create three recurring prices (starter, pro, family).
      Copy each `price_...` id.
- [ ] Developers → API keys: copy the **secret key** (`sk_test_...` first,
      `sk_live_...` when going live).
- [ ] Developers → Webhooks → Add endpoint:
      `https://<your-app>/api/stripe/webhook`
      Events: `checkout.session.completed`,
      `customer.subscription.created`, `customer.subscription.updated`,
      `customer.subscription.deleted`. Copy the **signing secret**
      (`whsec_...`).
- [ ] Settings → Billing → Customer portal: enabled (used by "Manage
      billing").

Check: `GET /ready` shows `"stripe": true`, `"stripe_webhook": true` and
all three plans `true`. The pricing page shows real amounts from Stripe.

## 3. Render

- [ ] New → Blueprint → connect the GitHub repository. Render reads
      `saas/render.yaml`.
- [ ] Environment → set every `sync: false` variable from steps 1–2, plus
      `APP_URL=https://<your-app>.onrender.com` (or your domain).
- [ ] Deploy. Health check path is `/health`.

Check: `https://<your-app>/health` → `{"status":"ok"}` and
`https://<your-app>/ready` → HTTP 200 with `"ready": true`.

## 4. End-to-end in test mode

- [ ] Sign up with a fresh email → dashboard shows "Free trial active, 7
      days left".
- [ ] Pricing → choose a plan → Stripe test card `4242 4242 4242 4242` →
      back on dashboard with "Payment received".
- [ ] Supabase → Table editor → `subscriptions`: the row now has
      `status = active`, `stripe_customer_id`, `stripe_subscription_id`.
- [ ] Dashboard → "Manage billing" opens the Stripe portal. Cancel there →
      webhook sets `status = canceled` → dashboard says pick a plan.
- [ ] Stripe → Developers → Webhooks: all deliveries `200`.

## 5. Go live

- [ ] Swap `sk_test_` for `sk_live_`, live price ids, live webhook secret.
- [ ] Custom domain on Render, `APP_URL` updated, Supabase Site URL
      updated, Stripe webhook URL updated.
- [ ] `/ready` is 200 on the live URL.

## What is intentionally not here

- No analytics, no cookies beyond the session token in localStorage.
- No email sending of our own: Supabase sends confirmation mails, Stripe
  sends receipts.
- Learning content itself: the dashboard is the protected shell it will
  live in.
