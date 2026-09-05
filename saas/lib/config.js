"use strict";
/* Configuration and readiness.

   Every value comes from the environment. A missing or placeholder value
   never crashes the server: the feature that needs it is reported as
   "not configured" in /ready and the matching routes answer 503 with a
   clear message. Nothing here is a secret, and nothing here is invented. */

const PLACEHOLDER = /your[_-]|placeholder|replace|changeme|xxx|<|>|example\.com|^\.\.\.$/i;

function raw(name) {
  return (process.env[name] || "").trim();
}

/* A value counts as set only when it exists and does not look like the
   sample text from .env.example. */
function isSet(value, prefix) {
  if (!value) return false;
  if (PLACEHOLDER.test(value)) return false;
  if (prefix && !value.startsWith(prefix)) return false;
  return true;
}

const PLANS = [
  { id: "starter", envKey: "STRIPE_STARTER_PRICE_ID" },
  { id: "pro",     envKey: "STRIPE_PRO_PRICE_ID" },
  { id: "family",  envKey: "STRIPE_FAMILY_PRICE_ID" },
];

function load() {
  const cfg = {
    port: Number(raw("PORT")) || 3000,
    appUrl: (raw("APP_URL") || "").replace(/\/+$/, ""),
    trialDays: 7,
    supabase: {
      url: raw("SUPABASE_URL").replace(/\/+$/, ""),
      anonKey: raw("SUPABASE_ANON_KEY"),
      serviceKey: raw("SUPABASE_SERVICE_ROLE_KEY"),
    },
    stripe: {
      secretKey: raw("STRIPE_SECRET_KEY"),
      webhookSecret: raw("STRIPE_WEBHOOK_SECRET"),
      prices: {},
    },
  };
  for (const p of PLANS) cfg.stripe.prices[p.id] = raw(p.envKey);
  if (!cfg.appUrl) cfg.appUrl = "http://localhost:" + cfg.port;
  return cfg;
}

/* Readiness is computed on every call so a process restarted with new
   environment values reports the new state without code changes. */
function readiness(cfg) {
  const checks = {
    supabase:
      isSet(cfg.supabase.url, "https://") &&
      isSet(cfg.supabase.anonKey) &&
      isSet(cfg.supabase.serviceKey),
    stripe: isSet(cfg.stripe.secretKey, "sk_"),
    stripe_webhook: isSet(cfg.stripe.webhookSecret, "whsec_"),
    plans: {},
  };
  for (const p of PLANS) checks.plans[p.id] = isSet(cfg.stripe.prices[p.id], "price_");

  const missing = [];
  if (!isSet(cfg.supabase.url, "https://")) missing.push("SUPABASE_URL");
  if (!isSet(cfg.supabase.anonKey)) missing.push("SUPABASE_ANON_KEY");
  if (!isSet(cfg.supabase.serviceKey)) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!checks.stripe) missing.push("STRIPE_SECRET_KEY");
  if (!checks.stripe_webhook) missing.push("STRIPE_WEBHOOK_SECRET");
  for (const p of PLANS) if (!checks.plans[p.id]) missing.push(p.envKey);
  if (!isSet(cfg.appUrl, "http")) missing.push("APP_URL");

  const ready = missing.length === 0;
  return { ready, checks, missing };
}

module.exports = { load, readiness, PLANS, isSet };
