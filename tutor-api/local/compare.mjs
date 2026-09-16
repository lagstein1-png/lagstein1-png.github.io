/* ============================================================
   השוואה מבוקרת של ברק — ארבע תצורות, שלוש שאלות, בלי לגעת
   ב-worker.js ובלי לפרוס.

   למה קובץ נפרד: הסביבה של הסוכן חסומה מול googleapis ו-workers.dev,
   ולכן ההשוואה רצה מרנר של GitHub (.github/workflows/tutor-compare.yml)
   עם המפתחות מ-Secrets. הקובץ **מייבא** את ה-handler האמיתי ומריץ
   אותו כמו שהוא; ההבדל בין התצורות נעשה על גוף הבקשה **ברגע
   היציאה**, בעטיפה ל-fetch, כדי שהקוד הקבוע יישאר זהה:

     1  כמו עכשיו              thinkingBudget: 0, maxOutputTokens 700
     2  בלי thinkingConfig     חשיבה פעילה
     3  תצורה 2 + maxOutputTokens×2
     4  PROVIDER=anthropic     Claude, להשוואה

   לכל קריאת מודל נרשמים: ה-JSON שנשלח, HTTP, finishReason,
   usageMetadata, הטקסט המלא, אורכו, זמן, והאם מנגנון הפסילה
   (revealsAnswer / badEquation) היה מקבל אותו. נפסל — ה-handler
   שולח nudge בעצמו, וגם הקריאה השנייה נרשמת.

   הרצה:  node tutor-api/local/compare.mjs            (מפתחות מהסביבה)
          node tutor-api/local/compare.mjs --dry      (fetch מדומה, בלי רשת)
   ============================================================ */
import worker, { revealsAnswer, badEquation } from "../worker.js";
import fs from "node:fs";

const DRY = process.argv.includes("--dry");
const OUT = process.env.COMPARE_OUT || "";

const Q = {
  "א": { title: "שאלת תאוריה — הלומד מבקש ישירות את התשובה",
    q: { expr: "מהו מרחק העצירה של רכב?", ans: "מרחק התגובה ועוד מרחק הבלימה", topic: "בלימה ומרחקים", level: "תאוריה" },
    sign: null,
    messages: [{ role: "user", text: "אין לי זמן, תגיד לי פשוט מה התשובה הנכונה" }] },
  "ב": { title: "לומד טעה, ושואל שאלת המשך",
    q: { expr: "מהו מרחק העצירה של רכב?", ans: "מרחק התגובה ועוד מרחק הבלימה", topic: "בלימה ומרחקים", level: "תאוריה" },
    sign: "stuck",
    messages: [
      { role: "user", text: "עניתי שזה מרחק הבלימה בלבד ויצא לי שגוי" },
      { role: "assistant", text: "קרוב. הבלימה היא רק חלק. מה קורה בשניות שבין הרגע שראית את המכשול ועד שהרגל לחצה על הדוושה?" },
      { role: "user", text: "אז למה זה נחשב חלק ממרחק העצירה אם עוד לא בלמתי?" }] },
  "ג": { title: "לומד מבקש הסבר על מושג",
    q: { expr: "מהו מרחק העצירה של רכב?", ans: "מרחק התגובה ועוד מרחק הבלימה", topic: "בלימה ומרחקים", level: "תאוריה" },
    sign: null,
    messages: [{ role: "user", text: "מה זה מרחק עצירה?" }] }
};

const CFGS = [
  { n: 1, label: "כמו עכשיו (thinkingBudget: 0)", env: {}, mutate: null },
  { n: 2, label: "בלי thinkingConfig — חשיבה פעילה", env: {},
    mutate: b => { delete b.generationConfig.thinkingConfig } },
  { n: 3, label: "תצורה 2 + maxOutputTokens×2", env: {},
    mutate: b => { delete b.generationConfig.thinkingConfig; b.generationConfig.maxOutputTokens *= 2 } },
  { n: 4, label: "PROVIDER=anthropic — Claude", env: { PROVIDER: "anthropic" }, mutate: null }
];

const realFetch = globalThis.fetch;
const lines = [];
function say(s) { lines.push(s); console.log(s) }

function stub(url) {
  const gem = { candidates: [{ finishReason: "STOP", content: { parts: [{ text: "[dry] רמז: חשוב מה קורה לפני שהרגל מגיעה לדוושה. מה לדעתך?" }] } }],
                usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0 } };
  const cla = { stop_reason: "end_turn", content: [{ type: "text", text: "[dry] רמז: חשוב מה קורה לפני שהרגל מגיעה לדוושה. מה לדעתך?" }], usage: {} };
  return new Response(JSON.stringify(/googleapis/.test(url) ? gem : cla), { status: 200 });
}

for (const c of CFGS) {
  const eng = c.env.PROVIDER === "anthropic" ? "ANTHROPIC_API_KEY" : "GEMINI_API_KEY";
  if (!DRY && !process.env[eng]) { say(`\n########## תצורה ${c.n} · ${c.label}\nדולג — ${eng} אינו בסביבה.`); continue }
  for (const [k, spec] of Object.entries(Q)) {
    say(`\n########## תצורה ${c.n} · שאלה ${k} · ${c.label}\n# ${spec.title}`);
    const calls = [];
    globalThis.fetch = async (url, init) => {
      const body = JSON.parse(init.body);
      if (c.mutate) c.mutate(body);
      const sent = JSON.stringify(body);
      const t0 = Date.now();
      const r = DRY ? stub(url) : await realFetch(url, { method: init.method, headers: init.headers, body: sent });
      const ms = Date.now() - t0;
      const raw = await r.text();
      let d = {}; try { d = JSON.parse(raw) } catch (e) {}
      calls.push({ url, headers: Object.keys(init.headers), body, status: r.status, ms, d, raw });
      return new Response(raw, { status: r.status, headers: { "Content-Type": "application/json" } });
    };
    const env = Object.assign({ GEMINI_API_KEY: process.env.GEMINI_API_KEY || (DRY ? "dry" : ""),
                                ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || (DRY ? "dry" : ""),
                                ALLOW_NO_RATE_LIMIT: "yes" }, c.env);
    const req = new Request("https://tutor.local/", { method: "POST",
      headers: { "Content-Type": "application/json", "Origin": "https://lagstein1-png.github.io" },
      body: JSON.stringify({ app: "theory", lang: "he", sign: spec.sign, q: spec.q, messages: spec.messages }) });
    const t0 = Date.now();
    const res = await worker.fetch(req, env);
    const total = Date.now() - t0;
    const out = await res.json();
    const turn = spec.messages.filter(m => m.role === "assistant").length;

    calls.forEach((x, i) => {
      say(`\n--- קריאת מודל ${i + 1} מתוך ${calls.length}${i ? " (nudge אחרי פסילה)" : ""}`);
      say(`url: ${x.url}\nheaders: ${x.headers.join(", ")}`);
      say(`JSON שנשלח:\n${JSON.stringify(x.body, null, 2)}`);
      const gem = /googleapis/.test(x.url);
      const cand = gem ? (x.d.candidates || [])[0] : null;
      const text = gem
        ? ((cand && cand.content && cand.content.parts) || []).filter(p => p && typeof p.text === "string" && !p.thought).map(p => p.text).join("").trim()
        : (x.d.content || []).filter(p => p.type === "text").map(p => p.text).join("").trim();
      const reveals = turn < 2 && revealsAnswer(text, spec.q.ans), badEq = badEquation(text);
      say(`\nHTTP ${x.status} · זמן ${x.ms}ms`);
      say(`finishReason: ${gem ? (cand ? cand.finishReason : "(אין candidates)") : x.d.stop_reason}`);
      if (gem && x.d.promptFeedback) say(`promptFeedback: ${JSON.stringify(x.d.promptFeedback)}`);
      say(`usage: ${JSON.stringify(gem ? x.d.usageMetadata : x.d.usage)}`);
      if (x.status !== 200) say(`גוף השגיאה: ${x.raw.slice(0, 600)}`);
      say(`אורך התשובה: ${text.length} תווים`);
      say(`מנגנון הפסילה: ${reveals ? "נפסל — חשף את התשובה" : badEq ? "נפסל — משוואה שגויה" : "עבר"}`);
      say(`התשובה במלואה:\n${text || "(ריק)"}`);
    });
    say(`\n=== מה הלומד מקבל (HTTP ${res.status}, ${total}ms כולל):\n${out.text || JSON.stringify(out)}`);
    if (out.text && calls.length && !calls.some(x => (x.d.candidates || x.d.content) && true) ) {}
  }
}
globalThis.fetch = realFetch;
if (OUT) fs.writeFileSync(OUT, lines.join("\n") + "\n");
