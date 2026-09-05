"use strict";
/* Stripe over plain HTTPS. No SDK.

   Stripe's API takes form-encoded bodies with bracket keys
   (line_items[0][price]=...). encodeForm flattens a nested object into
   that shape. Webhook signatures are checked with the built-in crypto
   module, exactly as the SDK does: HMAC-SHA256 over "<t>.<raw body>". */

const crypto = require("crypto");
const { isSet } = require("./config");

class StripeError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function encodeForm(obj, prefix, out) {
  out = out || new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + "[" + k + "]" : k;
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item !== null && typeof item === "object") encodeForm(item, key + "[" + i + "]", out);
        else out.append(key + "[" + i + "]", String(item));
      });
    } else if (typeof v === "object") {
      encodeForm(v, key, out);
    } else {
      out.append(key, String(v));
    }
  }
  return out;
}

function make(cfg) {
  const { secretKey, webhookSecret } = cfg.stripe;
  const configured = isSet(secretKey, "sk_");
  const webhookConfigured = isSet(webhookSecret, "whsec_");

  async function call(path, { method = "GET", body } = {}) {
    if (!configured) throw new StripeError(503, "Stripe is not configured");
    const res = await fetch("https://api.stripe.com" + path, {
      method,
      headers: {
        Authorization: "Bearer " + secretKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body ? encodeForm(body).toString() : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data.error && data.error.message) || "Stripe request failed";
      throw new StripeError(res.status, msg);
    }
    return data;
  }

  function createCheckoutSession({ priceId, email, userId, plan, customerId, successUrl, cancelUrl }) {
    const body = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: { user_id: userId, plan },
      subscription_data: { metadata: { user_id: userId, plan } },
      allow_promotion_codes: true,
    };
    if (customerId) body.customer = customerId;
    else body.customer_email = email;
    return call("/v1/checkout/sessions", { method: "POST", body });
  }

  function createPortalSession({ customerId, returnUrl }) {
    return call("/v1/billing_portal/sessions", {
      method: "POST",
      body: { customer: customerId, return_url: returnUrl },
    });
  }

  function getSubscription(id) {
    return call("/v1/subscriptions/" + encodeURIComponent(id));
  }

  function getPrice(id) {
    return call("/v1/prices/" + encodeURIComponent(id));
  }

  /* Verify a webhook. Returns the parsed event or throws. */
  function verifyWebhook(rawBody, signatureHeader, toleranceSec = 300) {
    if (!webhookConfigured) throw new StripeError(503, "STRIPE_WEBHOOK_SECRET is not configured");
    if (!signatureHeader) throw new StripeError(400, "Missing Stripe-Signature header");
    let t = null;
    const v1 = [];
    for (const part of signatureHeader.split(",")) {
      const [k, v] = part.split("=");
      if (k === "t") t = v;
      if (k === "v1") v1.push(v);
    }
    if (!t || !v1.length) throw new StripeError(400, "Malformed Stripe-Signature header");
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(t + "." + rawBody, "utf8")
      .digest("hex");
    const ok = v1.some((sig) => {
      const a = Buffer.from(sig, "hex");
      const b = Buffer.from(expected, "hex");
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    });
    if (!ok) throw new StripeError(400, "Webhook signature does not match");
    const age = Math.abs(Date.now() / 1000 - Number(t));
    if (age > toleranceSec) throw new StripeError(400, "Webhook timestamp outside tolerance");
    try {
      return JSON.parse(rawBody);
    } catch {
      throw new StripeError(400, "Webhook body is not JSON");
    }
  }

  /* Used only by the local test: build a signature the way Stripe does. */
  function signForTest(rawBody, secret, ts) {
    const t = ts || Math.floor(Date.now() / 1000);
    const sig = crypto.createHmac("sha256", secret).update(t + "." + rawBody, "utf8").digest("hex");
    return "t=" + t + ",v1=" + sig;
  }

  return {
    configured,
    webhookConfigured,
    createCheckoutSession,
    createPortalSession,
    getSubscription,
    getPrice,
    verifyWebhook,
    signForTest,
    encodeForm,
  };
}

module.exports = { make, StripeError, encodeForm };
