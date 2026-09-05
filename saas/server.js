"use strict";
/* Learning app website: landing -> signup -> 7-day trial -> pricing ->
   checkout -> dashboard.

   Built on Node's own http module. No npm dependencies, so `node server.js`
   runs anywhere Node 18+ runs, and Render needs no install step.

   Routes
     GET  /health                 liveness, always 200 while the process runs
     GET  /ready                  readiness: which credentials are real
     GET  /api/config             public config for the pages
     POST /api/auth/signup        { email, password }
     POST /api/auth/login         { email, password }
     POST /api/auth/logout        Bearer token
     GET  /api/me                 Bearer token -> user + subscription + access
     POST /api/trial/start        Bearer token -> 7-day trial (idempotent)
     POST /api/checkout           Bearer token, { plan } -> Stripe Checkout URL
     POST /api/billing/portal     Bearer token -> Stripe customer portal URL
     POST /api/stripe/webhook     Stripe events, signature checked
     GET  /api/dashboard          Bearer token, requires active access
     GET  /*                      static files from ./public

   Missing credentials never crash the process: the route that needs them
   answers 503 with a message the page shows to the user. */

const http = require("http");
const fs = require("fs");
const path = require("path");
const config = require("./lib/config");
const supabaseLib = require("./lib/supabase");
const stripeLib = require("./lib/stripe");

/* .env is read here so no dotenv package is needed. Real values already in
   the environment (as on Render) win over the file. */
function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
loadDotEnv(path.join(__dirname, ".env"));

const cfg = config.load();
const supabase = supabaseLib.make(cfg);
const stripe = stripeLib.make(cfg);
const PUBLIC_DIR = path.join(__dirname, "public");
const STARTED_AT = Date.now();

/* ------------------------------------------------------------------ */
/* helpers                                                             */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function send(res, status, body, headers) {
  const h = Object.assign(
    {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    headers || {}
  );
  res.writeHead(status, h);
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function json(res, status, obj) {
  send(res, status, obj);
}

function fail(res, err) {
  const status = err && err.status ? err.status : 500;
  const message = status === 500 ? "Internal error" : err.message;
  if (status === 500) console.error("[error]", err);
  json(res, status, { error: message });
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(Object.assign(new Error("Body too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function readJson(req) {
  const text = await readBody(req);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error("Body must be JSON"), { status: 400 });
  }
}

function bearer(req) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

async function requireUser(req) {
  if (!supabase.configured) throw Object.assign(new Error("Supabase is not configured"), { status: 503 });
  return supabase.userFromToken(bearer(req));
}

function validEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}

function validPassword(s) {
  return typeof s === "string" && s.length >= 8 && s.length <= 128;
}

/* ------------------------------------------------------------------ */
/* subscription state                                                  */

/* One place decides whether a user may enter the dashboard. */
function accessFor(sub) {
  const now = Date.now();
  if (!sub) return { access: false, reason: "no_subscription" };
  const periodEnd = sub.current_period_end ? Date.parse(sub.current_period_end) : null;
  const trialEnd = sub.trial_end ? Date.parse(sub.trial_end) : null;

  if (sub.status === "active" && (!periodEnd || periodEnd > now)) return { access: true, reason: "paid" };
  if (sub.status === "trialing") {
    /* Stripe trials carry current_period_end; our own trial carries trial_end. */
    const end = periodEnd || trialEnd;
    if (end && end > now) return { access: true, reason: "trial" };
    return { access: false, reason: "trial_expired" };
  }
  if (sub.status === "past_due") return { access: false, reason: "past_due" };
  return { access: false, reason: sub.status || "inactive" };
}

async function startTrial(user) {
  const existing = await supabase.getSubscription(user.id);
  if (existing) return existing; /* never reset a trial or overwrite a paid plan */
  const trialEnd = new Date(Date.now() + cfg.trialDays * 24 * 60 * 60 * 1000).toISOString();
  return supabase.upsertSubscription({
    user_id: user.id,
    email: user.email,
    status: "trialing",
    plan: "trial",
    trial_end: trialEnd,
  });
}

function publicSubscription(sub) {
  if (!sub) return null;
  return {
    status: sub.status,
    plan: sub.plan,
    trial_end: sub.trial_end,
    current_period_end: sub.current_period_end,
    has_stripe_customer: Boolean(sub.stripe_customer_id),
  };
}

/* ------------------------------------------------------------------ */
/* Stripe webhook handling                                             */

function statusFromStripe(s) {
  /* Stripe: trialing, active, past_due, canceled, unpaid, incomplete,
     incomplete_expired, paused. Keep the ones the dashboard understands. */
  if (s === "trialing" || s === "active" || s === "past_due") return s;
  return "canceled";
}

function planFromSubscription(stripeSub) {
  const meta = (stripeSub.metadata && stripeSub.metadata.plan) || null;
  if (meta) return meta;
  const item = stripeSub.items && stripeSub.items.data && stripeSub.items.data[0];
  const priceId = item && item.price && item.price.id;
  for (const p of config.PLANS) if (cfg.stripe.prices[p.id] === priceId) return p.id;
  return "paid";
}

async function applyStripeSubscription(stripeSub, hintUserId) {
  const userId =
    hintUserId || (stripeSub.metadata && stripeSub.metadata.user_id) || null;
  let row = null;
  if (userId) row = await supabase.getSubscription(userId);
  if (!row) row = await supabase.findByStripeSubscription(stripeSub.id);
  if (!row && stripeSub.customer) row = await supabase.findByStripeCustomer(stripeSub.customer);
  if (!row && !userId) {
    console.warn("[webhook] subscription without a known user:", stripeSub.id);
    return null;
  }
  const item = stripeSub.items && stripeSub.items.data && stripeSub.items.data[0];
  const periodEnd = (item && item.current_period_end) || stripeSub.current_period_end || null;
  return supabase.upsertSubscription({
    user_id: userId || row.user_id,
    email: row ? row.email : undefined,
    status: statusFromStripe(stripeSub.status),
    plan: planFromSubscription(stripeSub),
    stripe_customer_id: typeof stripeSub.customer === "string" ? stripeSub.customer : stripeSub.customer && stripeSub.customer.id,
    stripe_subscription_id: stripeSub.id,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    trial_end: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : row ? row.trial_end : null,
  });
}

async function handleStripeEvent(event) {
  const obj = event.data && event.data.object;
  switch (event.type) {
    case "checkout.session.completed": {
      if (obj.mode !== "subscription" || !obj.subscription) return;
      const stripeSub = await stripe.getSubscription(obj.subscription);
      const userId = obj.client_reference_id || (obj.metadata && obj.metadata.user_id) || null;
      await applyStripeSubscription(stripeSub, userId);
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await applyStripeSubscription(obj, null);
      return;
    default:
      return; /* other events are acknowledged and ignored */
  }
}

/* ------------------------------------------------------------------ */
/* static files                                                        */

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === "/" || rel === "") rel = "/index.html";
  if (rel === "/dashboard" || rel === "/pricing" || rel === "/signup" || rel === "/login") rel += ".html";
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return json(res, 403, { error: "Forbidden" });
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      const nf = path.join(PUBLIC_DIR, "404.html");
      if (fs.existsSync(nf)) return send(res, 404, fs.readFileSync(nf), { "Content-Type": MIME[".html"] });
      return json(res, 404, { error: "Not found" });
    }
    const ext = path.extname(file).toLowerCase();
    const isHtml = ext === ".html";
    send(res, 200, fs.readFileSync(file), {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": isHtml ? "no-cache" : "public, max-age=300",
    });
  });
}

/* ------------------------------------------------------------------ */
/* router                                                              */

async function route(req, res) {
  const url = new URL(req.url, "http://localhost");
  const p = url.pathname;
  const m = req.method;

  if (m === "GET" && p === "/health") {
    return json(res, 200, { status: "ok", uptime_seconds: Math.round((Date.now() - STARTED_AT) / 1000), time: new Date().toISOString() });
  }

  if (m === "GET" && p === "/ready") {
    const r = config.readiness(cfg);
    return json(res, r.ready ? 200 : 503, r);
  }

  if (m === "GET" && p === "/api/config") {
    const r = config.readiness(cfg);
    return json(res, 200, {
      supabase: r.checks.supabase,
      stripe: r.checks.stripe,
      ready: r.ready,
      trial_days: cfg.trialDays,
      app_url: cfg.appUrl,
      plans: config.PLANS.map((pl) => ({ id: pl.id, configured: r.checks.plans[pl.id] })),
    });
  }

  if (m === "GET" && p === "/api/prices") {
    /* Live prices from Stripe when configured. Nothing is made up when it is not. */
    if (!stripe.configured) return json(res, 503, { error: "Stripe is not configured", prices: {} });
    const out = {};
    for (const pl of config.PLANS) {
      const id = cfg.stripe.prices[pl.id];
      if (!config.isSet(id, "price_")) continue;
      try {
        const pr = await stripe.getPrice(id);
        out[pl.id] = {
          amount: pr.unit_amount,
          currency: pr.currency,
          interval: pr.recurring && pr.recurring.interval,
        };
      } catch (e) {
        out[pl.id] = { error: e.message };
      }
    }
    return json(res, 200, { prices: out });
  }

  if (m === "POST" && p === "/api/auth/signup") {
    if (!supabase.configured) return json(res, 503, { error: "Signup is not available yet: Supabase is not configured" });
    const body = await readJson(req);
    if (!validEmail(body.email)) return json(res, 400, { error: "Please enter a valid email address" });
    if (!validPassword(body.password)) return json(res, 400, { error: "Password must be 8 to 128 characters" });
    const data = await supabase.signUp(body.email, body.password);
    const user = data.user || data;
    const session = data.access_token ? { access_token: data.access_token, refresh_token: data.refresh_token, expires_in: data.expires_in } : null;
    let sub = null;
    if (user && user.id) sub = await startTrial({ id: user.id, email: body.email });
    return json(res, 200, {
      user: user ? { id: user.id, email: user.email } : null,
      session,
      needs_email_confirmation: !session,
      subscription: publicSubscription(sub),
    });
  }

  if (m === "POST" && p === "/api/auth/login") {
    if (!supabase.configured) return json(res, 503, { error: "Login is not available yet: Supabase is not configured" });
    const body = await readJson(req);
    if (!validEmail(body.email) || typeof body.password !== "string") return json(res, 400, { error: "Email and password are required" });
    let data;
    try {
      data = await supabase.signIn(body.email, body.password);
    } catch (e) {
      if (e.status === 400 || e.status === 401) return json(res, 401, { error: "Wrong email or password" });
      throw e;
    }
    const sub = await startTrial({ id: data.user.id, email: data.user.email });
    return json(res, 200, {
      user: { id: data.user.id, email: data.user.email },
      session: { access_token: data.access_token, refresh_token: data.refresh_token, expires_in: data.expires_in },
      subscription: publicSubscription(sub),
    });
  }

  if (m === "POST" && p === "/api/auth/logout") {
    const token = bearer(req);
    if (token && supabase.configured) await supabase.signOut(token).catch(() => {});
    return json(res, 200, { ok: true });
  }

  if (m === "GET" && p === "/api/me") {
    const user = await requireUser(req);
    const sub = await supabase.getSubscription(user.id);
    const a = accessFor(sub);
    return json(res, 200, { user: { id: user.id, email: user.email }, subscription: publicSubscription(sub), access: a.access, reason: a.reason, trial_days: cfg.trialDays });
  }

  if (m === "POST" && p === "/api/trial/start") {
    const user = await requireUser(req);
    const sub = await startTrial(user);
    const a = accessFor(sub);
    return json(res, 200, { subscription: publicSubscription(sub), access: a.access, reason: a.reason });
  }

  if (m === "POST" && p === "/api/checkout") {
    const user = await requireUser(req);
    if (!stripe.configured) return json(res, 503, { error: "Payments are not available yet: Stripe is not configured" });
    const body = await readJson(req);
    const plan = config.PLANS.find((pl) => pl.id === body.plan);
    if (!plan) return json(res, 400, { error: "Unknown plan" });
    const priceId = cfg.stripe.prices[plan.id];
    if (!config.isSet(priceId, "price_")) return json(res, 503, { error: "This plan has no Stripe price configured (" + plan.envKey + ")" });
    const sub = await supabase.getSubscription(user.id);
    const session = await stripe.createCheckoutSession({
      priceId,
      email: user.email,
      userId: user.id,
      plan: plan.id,
      customerId: sub && sub.stripe_customer_id,
      successUrl: cfg.appUrl + "/dashboard.html?checkout=success",
      cancelUrl: cfg.appUrl + "/pricing.html?checkout=cancel",
    });
    return json(res, 200, { url: session.url });
  }

  if (m === "POST" && p === "/api/billing/portal") {
    const user = await requireUser(req);
    if (!stripe.configured) return json(res, 503, { error: "Billing portal is not available yet: Stripe is not configured" });
    const sub = await supabase.getSubscription(user.id);
    if (!sub || !sub.stripe_customer_id) return json(res, 400, { error: "No billing account yet" });
    const session = await stripe.createPortalSession({ customerId: sub.stripe_customer_id, returnUrl: cfg.appUrl + "/dashboard.html" });
    return json(res, 200, { url: session.url });
  }

  if (m === "POST" && p === "/api/stripe/webhook") {
    if (!stripe.webhookConfigured) return json(res, 503, { error: "STRIPE_WEBHOOK_SECRET is not configured" });
    if (!supabase.configured) return json(res, 503, { error: "Supabase is not configured" });
    const raw = await readBody(req, 1024 * 1024);
    let event;
    try {
      event = stripe.verifyWebhook(raw, req.headers["stripe-signature"]);
    } catch (e) {
      return json(res, e.status || 400, { error: e.message });
    }
    await handleStripeEvent(event);
    return json(res, 200, { received: true });
  }

  if (m === "GET" && p === "/api/dashboard") {
    const user = await requireUser(req);
    const sub = await supabase.getSubscription(user.id);
    const a = accessFor(sub);
    if (!a.access) return json(res, 402, { error: "No active trial or subscription", reason: a.reason });
    return json(res, 200, {
      welcome: user.email,
      access: a.reason,
      subscription: publicSubscription(sub),
    });
  }

  if (p.startsWith("/api/")) return json(res, 404, { error: "Unknown API route" });
  if (m !== "GET" && m !== "HEAD") return json(res, 405, { error: "Method not allowed" });
  return serveStatic(req, res, p);
}

const server = http.createServer((req, res) => {
  route(req, res).catch((err) => fail(res, err));
});

if (require.main === module) {
  server.listen(cfg.port, () => {
    const r = config.readiness(cfg);
    console.log("Server listening on " + cfg.appUrl + " (port " + cfg.port + ")");
    if (r.ready) console.log("Readiness: all credentials configured");
    else console.warn("Readiness: NOT ready. Missing or placeholder: " + r.missing.join(", "));
  });
}

module.exports = { server, cfg, accessFor, handleStripeEvent };
