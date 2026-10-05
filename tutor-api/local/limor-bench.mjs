/* ============================================================
   המבחן הקבוע של לימור — הצד של Gemini. פיילוט ״לימור במכשיר״,
   5.10.2026.

   אותן עשרים שאלות של `limor/bench.js` שרצות במכשיר ב-
   `limor/bench.html`, רצות כאן דרך ה-handler האמיתי של `worker.js`
   — מיובא, לא מועתק — כדי שההשוואה תהיה על אותו קלט. הסביבה של
   הסוכן חסומה מול googleapis, ולכן זה רץ מרנר של GitHub
   (`.github/workflows/limor-bench.yml`) עם המפתח מ-Secrets.

   לכל שאלה נרשמים: הטקסט שהלומד מקבל, הזמן הכולל, כמה קריאות
   למודל נדרשו (2 = השומר פסל את הראשונה וביקש שוב), והאם התשובה
   הסופית עוברת את אותם שומרים שהמכשיר מפעיל.

   הרצה:  node tutor-api/local/limor-bench.mjs           (מפתח מהסביבה)
          node tutor-api/local/limor-bench.mjs --dry     (fetch מדומה, בלי רשת)
   ============================================================ */
import worker, { revealsAnswer, badEquation, badLang } from "../worker.js";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes("--dry");
const OUT = process.env.BENCH_OUT || "";

/* `bench.js` הוא קובץ דפדפן (`var LIMOR_BENCH = …`). קוראים אותו כמו
   שהדפדפן קורא, ולא מעתיקים את השאלות לכאן. */
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(HERE, "..", "..", "limor", "bench.js"), "utf8"), ctx);
const BENCH = ctx.LIMOR_BENCH;

if (!DRY && !process.env.GEMINI_API_KEY) { console.error("GEMINI_API_KEY אינו בסביבה. --dry מריץ בלי רשת."); process.exit(1) }

const realFetch = globalThis.fetch;
const lines = [];
const say = s => { lines.push(s); console.log(s) };
function verdict(text, ans) {
  if (!text) return "empty";
  if (revealsAnswer(text, ans)) return "reveals";   /* תור ראשון — השומר תמיד פעיל */
  if (badEquation(text)) return "equation";
  if (badLang(text, "he")) return "lang";
  return "";
}

const env = { GEMINI_API_KEY: process.env.GEMINI_API_KEY || "dry", ALLOW_NO_RATE_LIMIT: "yes" };
const results = [];
for (const it of BENCH) {
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    if (/:generateContent/.test(String(url))) calls++;   /* גילוי המודלים אינו קריאת תשובה */
    if (!DRY) return realFetch(url, init);
    const text = "[dry] בואי נסתכל יחד על מה שכתוב במסך. מה לדעתך השלב הראשון?";
    return new Response(JSON.stringify({ candidates: [{ finishReason: "STOP", content: { parts: [{ text }] } }] }), { status: 200 });
  };
  const req = new Request("https://tutor.local/ask", { method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "https://bekol.co.il" },
    body: JSON.stringify({ app: it.app, lang: "he", sign: it.sign, mode: "chat", screen: it.screen,
                           userText: it.userText, history: [], actions: [] }) });
  const t0 = Date.now();
  const res = await worker.fetch(req, env, { waitUntil() {} });
  const ms = Date.now() - t0;
  const out = await res.json().catch(() => ({}));
  const text = String(out.say || out.text || "").trim();
  const why = res.status === 200 ? verdict(text, it.screen.correct) : "http " + res.status;
  results.push({ id: it.id, status: res.status, ms, calls, model: out.model || null, ok: !why, reason: why, text });
  say(`\n### ${it.id} · HTTP ${res.status} · ${ms} מ״ש · ${calls} קריאות · ${out.model || "-"} · ${why || "עברה"}`);
  say(`הלומד: ${it.userText}${it.screen.student ? " (ענה " + it.screen.student + ")" : ""}`);
  say(text || "(ריק)");
}
globalThis.fetch = realFetch;

const ok = results.filter(r => r.status === 200);
const ms = ok.map(r => r.ms).sort((a, b) => a - b);
const med = ms.length ? (ms.length % 2 ? ms[ms.length >> 1] : Math.round((ms[ms.length / 2 - 1] + ms[ms.length / 2]) / 2)) : 0;
say(`\n## סיכום: ${ok.length} מתוך ${results.length} ענו ב-200 · עברו את השומרים: ${results.filter(r => r.ok).length}` +
    ` · נדרש ניסיון שני: ${results.filter(r => r.calls > 1).length} · זמן חציוני: ${med} מ״ש`);
if (OUT) {
  fs.writeFileSync(OUT, lines.join("\n") + "\n");
  fs.writeFileSync(OUT.replace(/\.txt$/, "") + ".json", JSON.stringify({ when: new Date().toISOString(), dry: DRY, results }, null, 1));
}
