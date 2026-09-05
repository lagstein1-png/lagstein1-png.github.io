"use strict";
/* Real browser check: open every page with placeholder credentials, click
   what is visible, and fail on any JS error. Also walks the guard:
   dashboard without a session must land on the login form.
   Run: node test/browser.js   (needs Playwright's Chromium) */

const path = require("path");
let chromium;
try {
  ({ chromium } = require("/opt/node22/lib/node_modules/playwright"));
} catch {
  ({ chromium } = require("playwright"));
}

process.env.PORT = "0";
process.env.SUPABASE_URL = "https://your-project.supabase.co";
process.env.STRIPE_SECRET_KEY = "sk_test_your_stripe_secret_key";
const { server } = require(path.join(__dirname, "..", "server.js"));

(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch();
  let failed = 0;

  for (const page of ["/index.html", "/signup.html", "/pricing.html", "/404.html"]) {
    const ctx = await browser.newContext({ locale: "he-IL" });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
    p.on("console", (m) => { if (m.type() === "error") errs.push("CONSOLE: " + m.text()); });
    await p.goto(base + page, { waitUntil: "networkidle" });
    const banner = await p.textContent("#setup-banner");
    const h1 = await p.textContent("h1");
    const dir = await p.getAttribute("html", "dir");
    /* language toggle, then back */
    await p.click("#lang-btn");
    const dirEn = await p.getAttribute("html", "dir");
    await p.click("#lang-btn");
    /* click the visible buttons once */
    const buttons = await p.$$("button:visible");
    for (const b of buttons) { try { await b.click({ timeout: 1000 }); } catch { /* navigation etc. */ } }
    await p.waitForTimeout(300);
    const problems = [];
    if (!h1 || !h1.trim()) problems.push("empty h1");
    if (dir !== "rtl" || dirEn !== "ltr") problems.push("language toggle did not flip dir");
    if (page !== "/404.html" && !/הקמה/.test(banner || "")) problems.push("setup banner missing");
    if (errs.length) problems.push(...errs);
    console.log(page.padEnd(16) + (problems.length ? "ERRORS: " + problems.join(" | ") : "clean (h1: " + h1.trim() + ")"));
    if (problems.length) failed++;
    await ctx.close();
  }

  /* guard: dashboard without a session -> login */
  {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto(base + "/dashboard.html", { waitUntil: "networkidle" });
    const url = p.url();
    const okGuard = /signup\.html#login$/.test(url);
    console.log("guard".padEnd(16) + (okGuard ? "clean (redirected to " + url.replace(base, "") + ")" : "ERRORS: landed on " + url));
    if (!okGuard) failed++;
    await ctx.close();
  }

  /* guard: dashboard with a fake session -> server refuses, page sends to login */
  {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto(base + "/index.html", { waitUntil: "networkidle" });
    await p.evaluate(() => localStorage.setItem("session_token", "fake"));
    await p.goto(base + "/dashboard.html", { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    const status = await p.textContent("#status");
    const okFake = /not configured/i.test(status || "") || /signup\.html#login$/.test(p.url());
    console.log("fake session".padEnd(16) + (okFake ? "clean (" + (status || p.url().replace(base, "")).trim() + ")" : "ERRORS: " + status));
    if (!okFake) failed++;
    await ctx.close();
  }

  await browser.close();
  server.close();
  process.exitCode = failed ? 1 : 0;
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
