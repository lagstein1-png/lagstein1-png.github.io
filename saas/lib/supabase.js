"use strict";
/* Supabase over plain HTTPS. No SDK.

   Two doors:
   - Auth (GoTrue):  /auth/v1/...   signup, password login, token check
   - Data (PostgREST): /rest/v1/... the subscriptions table

   Reads and writes to the table go through the service role key, so the
   browser never sees it and row level security stays closed to the
   public. The service role key lives only in the environment. */

const { isSet } = require("./config");

class SupabaseError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function make(cfg) {
  const { url, anonKey, serviceKey } = cfg.supabase;
  const configured = isSet(url, "https://") && isSet(anonKey) && isSet(serviceKey);

  async function call(path, { method = "GET", body, token, service = false, prefer } = {}) {
    if (!configured) throw new SupabaseError(503, "Supabase is not configured");
    const headers = {
      apikey: anonKey,
      Authorization: "Bearer " + (service ? serviceKey : token || anonKey),
      "Content-Type": "application/json",
    };
    if (prefer) headers.Prefer = prefer;
    const res = await fetch(url + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!res.ok) {
      const msg =
        (data && (data.msg || data.message || data.error_description || data.error)) ||
        "Supabase request failed";
      throw new SupabaseError(res.status, msg);
    }
    return data;
  }

  /* ---- auth ---- */

  function signUp(email, password) {
    return call("/auth/v1/signup", { method: "POST", body: { email, password } });
  }

  function signIn(email, password) {
    return call("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: { email, password },
    });
  }

  function signOut(token) {
    return call("/auth/v1/logout", { method: "POST", token });
  }

  /* Returns the user for a valid access token, or throws 401. */
  async function userFromToken(token) {
    if (!token) throw new SupabaseError(401, "Missing token");
    try {
      return await call("/auth/v1/user", { token });
    } catch (e) {
      if (e.status === 401 || e.status === 403) throw new SupabaseError(401, "Invalid or expired session");
      throw e;
    }
  }

  /* ---- subscriptions table ---- */

  async function getSubscription(userId) {
    const rows = await call(
      "/rest/v1/subscriptions?user_id=eq." + encodeURIComponent(userId) + "&select=*&limit=1",
      { service: true }
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async function findByStripeSubscription(subId) {
    const rows = await call(
      "/rest/v1/subscriptions?stripe_subscription_id=eq." + encodeURIComponent(subId) + "&select=*&limit=1",
      { service: true }
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async function findByStripeCustomer(customerId) {
    const rows = await call(
      "/rest/v1/subscriptions?stripe_customer_id=eq." + encodeURIComponent(customerId) + "&select=*&limit=1",
      { service: true }
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  /* Insert or update by user_id. */
  async function upsertSubscription(row) {
    row.updated_at = new Date().toISOString();
    const rows = await call("/rest/v1/subscriptions?on_conflict=user_id", {
      method: "POST",
      service: true,
      body: [row],
      prefer: "resolution=merge-duplicates,return=representation",
    });
    return Array.isArray(rows) && rows.length ? rows[0] : row;
  }

  return {
    configured,
    signUp,
    signIn,
    signOut,
    userFromToken,
    getSubscription,
    findByStripeSubscription,
    findByStripeCustomer,
    upsertSubscription,
  };
}

module.exports = { make, SupabaseError };
