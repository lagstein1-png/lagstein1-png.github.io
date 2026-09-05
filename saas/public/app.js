"use strict";
/* Shared client: language, read-aloud, API calls, session, setup banner.
   Plain JS, no framework. Every page includes this file. */

(function () {
  /* ---------------- language ---------------- */

  var T = {
    he: {
      brand: "לומדים בקול",
      nav_home: "בית", nav_pricing: "מחירים", nav_signup: "הרשמה", nav_dashboard: "האזור שלי", nav_logout: "יציאה",
      read_aloud: "הקרא לי", stop_reading: "עצור הקראה", lang_switch: "English",
      setup_warn: "האתר עדיין בהקמה: ההרשמה והתשלום יופעלו כשהחיבור לשירותים יושלם.",
      home_h1: "לימוד שקורא בקול, בקצב שלך",
      home_lead: "אתר לימוד למי שקורא לאט, מתקשה בהבנת הנקרא, או פשוט מבין טוב יותר בשמיעה. טקסט גדול, מסך שקט, וכל דבר אפשר להקריא.",
      home_cta: "התחל 7 ימי ניסיון חינם", home_cta2: "לצפייה במחירים",
      home_how: "איך זה עובד",
      step1: "נרשמים עם דוא\"ל וסיסמה.", step2: "מקבלים 7 ימי ניסיון בלי כרטיס אשראי.",
      step3: "בוחרים מסלול כשהניסיון נגמר.", step4: "ממשיכים ללמוד באזור האישי.",
      home_for: "למי זה מתאים",
      for1: "דיסלקציה וקושי בקריאה", for2: "קשב וריכוז", for3: "עולים חדשים שלומדים עברית", for4: "כל מי שמעדיף לשמוע במקום לקרוא",
      signup_h1: "הרשמה", login_h1: "כניסה",
      email: "דוא\"ל", password: "סיסמה", password_help: "לפחות 8 תווים.",
      signup_btn: "הרשמה והתחלת ניסיון", login_btn: "כניסה",
      to_login: "כבר רשומים? כניסה", to_signup: "אין חשבון? הרשמה",
      working: "רגע...", confirm_email: "נשלח אליך דוא\"ל לאימות. אחרי האישור אפשר להיכנס.",
      pricing_h1: "מחירים", pricing_lead: "7 ימי ניסיון חינם בכל מסלול. אפשר לבטל בכל רגע.",
      plan_starter: "בסיסי", plan_pro: "מורחב", plan_family: "משפחתי",
      starter_1: "כל תכני הלימוד", starter_2: "הקראה בקול", starter_3: "משתמש אחד",
      pro_1: "כל מה שבבסיסי", pro_2: "מעקב התקדמות", pro_3: "עדיפות בתמיכה",
      family_1: "כל מה שבמורחב", family_2: "עד 5 משתמשים", family_3: "דוח להורה",
      price_pending: "המחיר יוצג כשהחיבור לתשלומים יושלם",
      per_month: "לחודש", per_year: "לשנה", choose: "בחירה", need_login: "כדי לבחור מסלול צריך להיכנס קודם.",
      dash_h1: "האזור שלי", dash_loading: "טוען...",
      dash_trial: "ניסיון חינם פעיל. נותרו {n} ימים.", dash_paid: "מנוי פעיל: {plan}.",
      dash_expired: "תקופת הניסיון נגמרה. כדי להמשיך, בחר מסלול.", dash_no_access: "אין גישה פעילה. בחר מסלול כדי להמשיך.",
      dash_manage: "ניהול תשלום", dash_pick: "לבחירת מסלול", dash_content: "תכני הלימוד",
      dash_content_p: "כאן ייכנסו תכני הלימוד. בינתיים, זה המקום שלך.",
      checkout_success: "התשלום התקבל. תודה!", checkout_cancel: "התשלום בוטל. אפשר לנסות שוב.",
      err_generic: "משהו השתבש. נסה שוב.", not_found: "הדף לא נמצא", back_home: "חזרה לדף הבית",
    },
    en: {
      brand: "Learn Aloud",
      nav_home: "Home", nav_pricing: "Pricing", nav_signup: "Sign up", nav_dashboard: "My area", nav_logout: "Log out",
      read_aloud: "Read aloud", stop_reading: "Stop reading", lang_switch: "עברית",
      setup_warn: "This site is still being set up: signup and payments will open once the services are connected.",
      home_h1: "Learning that reads aloud, at your pace",
      home_lead: "A learning site for people who read slowly, struggle with comprehension, or simply understand better by listening. Large text, a quiet screen, and everything can be read aloud.",
      home_cta: "Start a free 7-day trial", home_cta2: "See pricing",
      home_how: "How it works",
      step1: "Sign up with email and password.", step2: "Get 7 free days, no credit card.",
      step3: "Pick a plan when the trial ends.", step4: "Keep learning in your area.",
      home_for: "Who it is for",
      for1: "Dyslexia and reading difficulty", for2: "Attention and focus", for3: "Newcomers learning Hebrew", for4: "Anyone who prefers listening to reading",
      signup_h1: "Sign up", login_h1: "Log in",
      email: "Email", password: "Password", password_help: "At least 8 characters.",
      signup_btn: "Sign up and start trial", login_btn: "Log in",
      to_login: "Already registered? Log in", to_signup: "No account? Sign up",
      working: "One moment...", confirm_email: "We sent you a confirmation email. After confirming you can log in.",
      pricing_h1: "Pricing", pricing_lead: "7 free days on every plan. Cancel any time.",
      plan_starter: "Starter", plan_pro: "Pro", plan_family: "Family",
      starter_1: "All learning content", starter_2: "Read aloud", starter_3: "One user",
      pro_1: "Everything in Starter", pro_2: "Progress tracking", pro_3: "Priority support",
      family_1: "Everything in Pro", family_2: "Up to 5 users", family_3: "Parent report",
      price_pending: "Price appears once payments are connected",
      per_month: "per month", per_year: "per year", choose: "Choose", need_login: "Please log in first to choose a plan.",
      dash_h1: "My area", dash_loading: "Loading...",
      dash_trial: "Free trial active. {n} days left.", dash_paid: "Active plan: {plan}.",
      dash_expired: "Your trial has ended. Pick a plan to continue.", dash_no_access: "No active access. Pick a plan to continue.",
      dash_manage: "Manage billing", dash_pick: "Pick a plan", dash_content: "Learning content",
      dash_content_p: "Learning content will live here. For now, this is your space.",
      checkout_success: "Payment received. Thank you!", checkout_cancel: "Checkout was cancelled. You can try again.",
      err_generic: "Something went wrong. Please try again.", not_found: "Page not found", back_home: "Back to home",
    },
  };

  function getLang() {
    try { return localStorage.getItem("lang") || "he"; } catch (e) { return "he"; }
  }
  function setLang(l) {
    try { localStorage.setItem("lang", l); } catch (e) { /* private mode */ }
    applyLang();
  }
  function t(key, vars) {
    var s = (T[getLang()] && T[getLang()][key]) || T.he[key] || key;
    if (vars) for (var k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
  }
  function applyLang() {
    var l = getLang();
    document.documentElement.lang = l;
    document.documentElement.dir = l === "he" ? "rtl" : "ltr";
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) els[i].textContent = t(els[i].getAttribute("data-i18n"));
    var ph = document.querySelectorAll("[data-i18n-placeholder]");
    for (var j = 0; j < ph.length; j++) ph[j].setAttribute("placeholder", t(ph[j].getAttribute("data-i18n-placeholder")));
    var tt = document.querySelector("[data-i18n-title]");
    if (tt) document.title = t(tt.getAttribute("data-i18n-title")) + " · " + t("brand");
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  }

  /* ---------------- read aloud ---------------- */

  var speaking = false;
  function readAloud(btn) {
    var synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) { synth.cancel(); speaking = false; btn.textContent = t("read_aloud"); return; }
    var main = document.querySelector("main");
    var text = main ? main.innerText : document.body.innerText;
    var u = new SpeechSynthesisUtterance(text);
    u.lang = getLang() === "he" ? "he-IL" : "en-US";
    u.rate = 0.9;
    u.onend = u.onerror = function () { speaking = false; btn.textContent = t("read_aloud"); };
    synth.cancel();
    synth.speak(u);
    speaking = true;
    btn.textContent = t("stop_reading");
  }

  /* ---------------- session + api ---------------- */

  function token() { try { return localStorage.getItem("session_token"); } catch (e) { return null; } }
  function setToken(v) { try { v ? localStorage.setItem("session_token", v) : localStorage.removeItem("session_token"); } catch (e) { /* ignore */ } }

  function api(method, path, body) {
    var h = { "Content-Type": "application/json" };
    var tk = token();
    if (tk) h.Authorization = "Bearer " + tk;
    return fetch(path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) {
        return r.text().then(function (txt) {
          var data = {};
          try { data = txt ? JSON.parse(txt) : {}; } catch (e) { data = { error: txt }; }
          if (!r.ok) { var err = new Error(data.error || t("err_generic")); err.status = r.status; err.data = data; throw err; }
          return data;
        });
      });
  }

  function logout() {
    api("POST", "/api/auth/logout").catch(function () {}).then(function () {
      setToken(null);
      location.href = "/index.html";
    });
  }

  /* ---------------- shared header ---------------- */

  function renderHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var loggedIn = Boolean(token());
    host.innerHTML =
      '<div class="bar">' +
      '<a class="brand" href="/index.html" data-i18n="brand"></a>' +
      '<nav class="main" aria-label="main">' +
      '<a href="/index.html" data-i18n="nav_home"></a>' +
      '<a href="/pricing.html" data-i18n="nav_pricing"></a>' +
      (loggedIn
        ? '<a href="/dashboard.html" data-i18n="nav_dashboard"></a><a href="#" id="logout-link" data-i18n="nav_logout"></a>'
        : '<a href="/signup.html" data-i18n="nav_signup"></a>') +
      "</nav>" +
      '<div class="tools">' +
      '<button type="button" class="btn secondary small" id="read-btn" data-i18n="read_aloud"></button>' +
      '<button type="button" class="btn secondary small" id="lang-btn" data-i18n="lang_switch"></button>' +
      "</div></div>";
    var lo = document.getElementById("logout-link");
    if (lo) lo.addEventListener("click", function (e) { e.preventDefault(); logout(); });
    document.getElementById("lang-btn").addEventListener("click", function () { setLang(getLang() === "he" ? "en" : "he"); });
    var rb = document.getElementById("read-btn");
    if (!window.speechSynthesis) rb.classList.add("hidden");
    rb.addEventListener("click", function () { readAloud(rb); });
  }

  /* Setup banner: shown while Supabase or Stripe are not configured. */
  function renderSetupBanner() {
    var box = document.getElementById("setup-banner");
    if (!box) return;
    api("GET", "/api/config").then(function (c) {
      window.APP_CONFIG = c;
      if (!c.supabase || !c.stripe) { box.className = "notice warn"; box.textContent = t("setup_warn"); }
      document.dispatchEvent(new CustomEvent("configready", { detail: c }));
    }).catch(function () {
      /* Static hosting without the server: same warning. */
      window.APP_CONFIG = { supabase: false, stripe: false, plans: [] };
      box.className = "notice warn"; box.textContent = t("setup_warn");
      document.dispatchEvent(new CustomEvent("configready", { detail: window.APP_CONFIG }));
    });
  }

  window.App = { t: t, api: api, token: token, setToken: setToken, getLang: getLang, logout: logout };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    applyLang();
    renderSetupBanner();
  });
})();
