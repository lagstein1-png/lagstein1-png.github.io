/* ============================================================
   המבחן הקבוע של לימור — הצד של Gemma, על המעבד של רנר. O-138.

   `limor/bench.html` מריץ את עשרים השאלות במכשיר עם WebGPU. מהסביבה
   של הסוכן Hugging Face חסום, ולכן אין לנו אף תשובה אמיתית של
   המודל. רנר של GitHub אינו חסום. כאן רץ **הקובץ עצמו**,
   `tutor/limor-device.js`, בתוך vm: אותו `answer()`, אותו פרומפט
   (`CORE` + `contextBlock` + `DEVICE_RULE` מ-`worker.js`) ואותם שומרים.
   שלוש מחרוזות מוחלפות לפני ההרצה, ורק הן:
     · כתובת הספרייה ב-jsDelivr ← transformers.js של node (`TJS`)
     · `/tutor-api/worker.js`   ← הקובץ בדיסק
     · `device:"webgpu"`         ← `device:"cpu"`
   ו-`DTYPE` נבחר ב-`DTYPES`, מפני שעל מעבד q4f16 אולי אינו רץ.

   **מה זה מודד ומה לא.** העברית, שגיאות העובדה והשומרים — כן, עם
   הסתייגות אחת: אם רץ dtype אחר מ-q4f16, הכימות שונה מזה שבמכשיר.
   זמן התגובה כאן הוא של מעבד ברנר ואינו מייצג טלפון. וגודל ההורדה
   האמיתי נמדד מרשימת הקבצים, עם אותו `WANT` שבקובץ.

   הרצה:  TJS=<נתיב ל-transformers.node.mjs> node tutor-api/local/limor-device-bench.mjs
          node tutor-api/local/limor-device-bench.mjs --dry   (מודל מדומה, בלי רשת)
   ============================================================ */
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..", "..");
const DRY = process.argv.includes("--dry");
const OUT = process.env.BENCH_OUT || "";
const DTYPES = (process.env.DTYPES || "q4f16,q4").split(",");

const lines = [];
const say = s => { lines.push(s); console.log(s) };

/* עשרים השאלות — כמו שהדפדפן קורא אותן */
const bctx = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "limor", "bench.js"), "utf8"), bctx);
const BENCH = bctx.LIMOR_BENCH;

/* ספרייה מדומה ל---dry: מחזירה רמז קבוע, כדי לבדוק את הצינור בלבד. */
const STUB = "data:text/javascript," + encodeURIComponent(`
  export const env = {};
  export async function pipeline(){ return async (m) => [{ generated_text: m.concat([{ role:"assistant", content:"[dry] בואי נסתכל על השורה הראשונה. מה כתוב בה?" }]) }] }`);
const LIBURL = DRY ? STUB : pathToFileURL(process.env.TJS || "").href;
if (!DRY && !process.env.TJS) { console.error("TJS אינו מוגדר. --dry מריץ בלי רשת."); process.exit(1) }

function boot(dtype) {
  let src = fs.readFileSync(path.join(ROOT, "tutor", "limor-device.js"), "utf8");
  const swap = (from, to) => { if (src.indexOf(from) < 0) throw new Error("לא נמצא בקובץ: " + from); src = src.split(from).join(to) };
  const lib = (src.match(/var LIB\s*=\s*"([^"]+)"/) || [])[1];
  swap('"' + lib + '"', JSON.stringify(LIBURL));
  swap('"/tutor-api/worker.js"', JSON.stringify(pathToFileURL(path.join(ROOT, "tutor-api", "worker.js")).href));
  swap('device:"webgpu"', 'device:"cpu"');
  src = src.replace(/var DTYPE\s*=\s*"[^"]+"/, "var DTYPE = " + JSON.stringify(dtype));
  const store = {};
  const g = {
    document: { readyState: "complete", documentElement: { lang: "he" }, getElementById: () => null, addEventListener() {} },
    navigator: {}, isSecureContext: false,
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: k => { delete store[k] } },
    performance, console, setTimeout, clearTimeout, fetch: globalThis.fetch
  };
  g.window = g;
  const ctx = vm.createContext(g);
  new vm.Script(src, { filename: "limor-device.js", importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER })
    .runInContext(ctx);
  return g.LIMOR_DEVICE;
}

/* 1 · הגודל האמיתי — מרשימת הקבצים, עם ה-WANT של הקובץ */
if (!DRY) {
  const D = boot(DTYPES[0]);
  const n = await D.measure();
  say(`גודל ההורדה (${DTYPES[0]}, embed_tokens + decoder_model_merged): ${n ? (n / 1e9).toFixed(2) + " GB (" + n + " בתים)" : "0 — WANT לא התאים לאף קובץ, או שהרשימה לא נקראה"}`);
  const list = await fetch("https://huggingface.co/api/models/" + D.MODEL + "/tree/main/onnx").then(r => r.json()).catch(() => []);
  say("קבצי onnx במאגר:\n" + list.map(f => `  ${f.path}  ${((f.lfs && f.lfs.size) || f.size || 0)}`).join("\n"));
}

/* 2 · הטעינה — dtype ראשון שעולה */
let D = null, dtype = "";
for (const d of DTYPES) {
  const cand = boot(d);
  const t0 = Date.now();
  const ok = await cand.load();
  say(`טעינה ${d}: ${ok ? "הצליחה" : "נכשלה"} · ${Date.now() - t0} מ״ש`);
  if (ok) { D = cand; dtype = d; break }
}
if (!D) { say("שום dtype לא נטען. ראו את השגיאה למעלה."); if (OUT) fs.writeFileSync(OUT, lines.join("\n") + "\n"); process.exit(1) }

/* 3 · עשרים השאלות — כמו `run()` ב-bench.html */
const results = [];
for (const it of BENCH) {
  const r = await D.answer({ app: it.app, lang: "he", sign: it.sign, mode: "chat", screen: it.screen, userText: it.userText, history: [] })
    .catch(e => ({ ok: false, reason: "error: " + (e && e.message || e), text: "", ms: 0 }));
  results.push({ id: it.id, ok: r.ok, reason: r.reason, ms: r.ms, text: r.text });
  say(`\n### ${it.id} · ${r.ms} מ״ש · ${r.ok ? "עברה" : "נפסלה: " + r.reason}`);
  say(`הלומד: ${it.userText}${it.screen.student ? " (ענה " + it.screen.student + ")" : ""}`);
  say(r.text || "(ריק)");
}
const ms = results.map(r => r.ms).sort((a, b) => a - b);
const med = ms.length % 2 ? ms[ms.length >> 1] : Math.round((ms[ms.length / 2 - 1] + ms[ms.length / 2]) / 2);
say(`\n## סיכום (${dtype}, מעבד): עברו את השומרים ${results.filter(r => r.ok).length} מתוך ${results.length}` +
    ` · נפסלו: ${results.filter(r => !r.ok).map(r => r.id + "=" + r.reason).join(", ") || "אף אחת"} · זמן חציוני: ${med} מ״ש (מעבד ברנר — לא טלפון)`);
if (OUT) {
  fs.writeFileSync(OUT, lines.join("\n") + "\n");
  fs.writeFileSync(OUT.replace(/\.txt$/, "") + ".json", JSON.stringify({ when: new Date().toISOString(), dry: DRY, dtype, results }, null, 1));
}
