"use strict";
/* Smoke test with placeholder credentials. Run: node test/smoke.js
   Proves: the server starts without real keys, /health and /ready answer,
   every page serves, protected routes refuse cleanly, the webhook checks
   its signature, and the access rule behaves. No network access needed. */

const assert = require("assert");
const path = require("path");

process.env.PORT = "0";
process.env.APP_URL = "http://localhost:3000";
process.env.SUPABASE_URL = "https://your-project.supabase.co";
process.env.SUPABASE_ANON_KEY = "your_supabase_anon_key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "your_supabase_service_role_key";
process.env.STRIPE_SECRET_KEY = "sk_test_your_stripe_secret_key";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_your_webhook_secret";
process.env.STRIPE_STARTER_PRICE_ID = "price_your_starter_price";
process.env.STRIPE_PRO_PRICE_ID = "";
process.env.STRIPE_FAMILY_PRICE_ID = "";

const { server, accessFor } = require(path.join(__dirname, "..", "server.js"));
const config = require(path.join(__dirname, "..", "lib", "config.js"));
const stripeLib = require(path.join(__dirname, "..", "lib", "stripe.js"));

let passed = 0;
function ok(name, cond) {
  if (!cond) throw new Error("FAILED: " + name);
  passed++;
  console.log("  ✓ " + name);
}

async function req(base, method, p, body, headers) {
  const res = await fetch(base + p, {
    method,
    headers: Object.assign({ "Content-Type": "application/json" }, headers || {}),
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, type: res.headers.get("content-type") || "" };
}

(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port;
  console.log("server on " + base);

  /* readiness with placeholders */
  const r = config.readiness(config.load());
  ok("placeholders are not treated as credentials", r.ready === false);
  ok("readiness names every missing variable", r.missing.includes("SUPABASE_URL") && r.missing.includes("STRIPE_PRO_PRICE_ID"));

  let x = await req(base, "GET", "/health");
  ok("/health is 200", x.status === 200 && x.data.status === "ok");

  x = await req(base, "GET", "/ready");
  ok("/ready is 503 while unconfigured", x.status === 503 && x.data.ready === false && Array.isArray(x.data.missing));

  x = await req(base, "GET", "/api/config");
  ok("/api/config reports supabase and stripe as off", x.status === 200 && x.data.supabase === false && x.data.stripe === false && x.data.trial_days === 7);

  for (const page of ["/", "/index.html", "/signup.html", "/pricing.html", "/dashboard.html", "/dashboard", "/pricing", "/styles.css", "/app.js"]) {
    x = await req(base, "GET", page);
    ok("GET " + page + " is 200", x.status === 200);
  }
  x = await req(base, "GET", "/no-such-page");
  ok("unknown page is 404", x.status === 404);
  x = await req(base, "GET", "/../server.js");
  ok("path traversal is refused", x.status !== 200 || !/createServer/.test(String(x.data)));

  /* auth and protected routes fail cleanly */
  x = await req(base, "POST", "/api/auth/signup", { email: "a@b.co", password: "12345678" });
  ok("signup without Supabase is 503 with a message", x.status === 503 && /not configured/i.test(x.data.error));
  x = await req(base, "POST", "/api/auth/signup", "{bad json");
  ok("bad JSON is rejected, not crashed", x.status === 503 || x.status === 400);
  x = await req(base, "GET", "/api/me");
  ok("/api/me without Supabase is 503", x.status === 503);
  x = await req(base, "GET", "/api/dashboard", undefined, { Authorization: "Bearer nope" });
  ok("/api/dashboard is refused", x.status === 503 || x.status === 401);
  x = await req(base, "POST", "/api/checkout", { plan: "starter" });
  ok("checkout is refused without a session", x.status === 503 || x.status === 401);
  x = await req(base, "GET", "/api/nothing");
  ok("unknown API route is 404", x.status === 404);
  x = await req(base, "DELETE", "/index.html");
  ok("non-GET on static is 405", x.status === 405);

  /* webhook */
  x = await req(base, "POST", "/api/stripe/webhook", "{}", { "Stripe-Signature": "t=1,v1=00" });
  ok("webhook with placeholder secret is 503", x.status === 503);

  /* signature verification with a real-looking secret, in isolation */
  const secret = "whsec_" + "a".repeat(32);
  const st = stripeLib.make({ stripe: { secretKey: "sk_test_" + "b".repeat(24), webhookSecret: secret, prices: {} } });
  const body = JSON.stringify({ id: "evt_1", type: "ping", data: { object: {} } });
  const good = st.signForTest(body, secret);
  ok("valid signature verifies", st.verifyWebhook(body, good).id === "evt_1");
  let threw = false;
  try { st.verifyWebhook(body + " ", good); } catch (e) { threw = e.status === 400; }
  ok("tampered body is rejected", threw);
  threw = false;
  try { st.verifyWebhook(body, st.signForTest(body, secret, 1000)); } catch (e) { threw = /tolerance/.test(e.message); }
  ok("stale timestamp is rejected", threw);

  /* form encoding for Stripe */
  const enc = stripeLib.encodeForm({ mode: "subscription", line_items: [{ price: "price_1", quantity: 1 }], metadata: { user_id: "u" } }).toString();
  ok("nested form encoding matches Stripe's bracket syntax", enc.includes("line_items%5B0%5D%5Bprice%5D=price_1") && enc.includes("metadata%5Buser_id%5D=u"));

  /* access rule */
  const soon = new Date(Date.now() + 3600e3).toISOString();
  const past = new Date(Date.now() - 3600e3).toISOString();
  ok("no row -> no access", accessFor(null).access === false);
  ok("live trial -> access", accessFor({ status: "trialing", trial_end: soon }).access === true);
  ok("expired trial -> no access", accessFor({ status: "trialing", trial_end: past }).reason === "trial_expired");
  ok("active paid -> access", accessFor({ status: "active", current_period_end: soon }).access === true);
  ok("lapsed paid -> no access", accessFor({ status: "active", current_period_end: past }).access === false);
  ok("past_due -> no access", accessFor({ status: "past_due" }).access === false);
  ok("canceled -> no access", accessFor({ status: "canceled" }).access === false);

  server.close();
  console.log("\n" + passed + " checks passed");
})().catch((e) => {
  console.error(e.message);
  server.close();
  process.exit(1);
});
