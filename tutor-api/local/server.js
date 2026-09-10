/* ============================================================
   ג׳וש — שרת מקומי לפיתוח ולבדיקה.

   **אין כאן ג׳וש שני.** האישיות, התפקידים, בדיקות הנכונות
   ותקרות הקלט יושבות כולן ב-`../worker.js`, וגם ההגשה עצמה:
   הקובץ הזה מייבא את ה-handler של ה-Worker ומריץ אותו כמו
   שהוא. לכן מה שנבדק כאן הוא בדיוק מה שירוץ בייצור — ולא
   העתק שלו שיתיישן.

   למה זה קיים: `tutor/tutor.js` מחזיק `var API = ""`, ולכן
   ג׳וש כבוי בכל האפליקציות עד שנפרס Worker. השרת הזה נותן
   כתובת מקומית, כדי שאפשר יהיה לשמוע את ג׳וש ולתקן אותו
   **לפני** שמשלמים על פריסה.

   אין npm ואין build — ספריות Node בלבד, כמו בכל המאגר.
   הרצה:  node tutor-api/local/server.js
   ============================================================ */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker, { LIM, ROLE } from "../worker.js";

/* ---------- שומר גרסה ----------
   `worker.js` פונה ל-Anthropic ב-`fetch` גלובלי, והוא קיים מ-Node 18.
   בלי השומר הזה שרת על גרסה ישנה יותר עולה יפה ונופל רק כשמגיעה
   הפנייה הראשונה — ואז השגיאה היא "fetch is not defined" בתוך קוד
   שאינו שלך. עדיף להיעצר כאן, ולומר בדיוק מה חסר. */
{
  const major = Number(process.versions.node.split(".")[0]);
  if (!(major >= 18)) {
    console.error("");
    console.error("  ✗ Node " + process.versions.node + " ישן מדי.");
    console.error("    ג׳וש דורש Node 18 ומעלה (fetch גלובלי).");
    console.error("    התקנה: https://nodejs.org  ואז  node --version");
    console.error("");
    process.exit(1);
  }
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");   /* שורש המאגר */
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const ENDPOINT = "/api/josh/chat";

/* ---------- .env ---------- */
/* process.loadEnvFile קיים מ-Node 20.12. אם אין — קריאה ידנית,
   כדי שהשרת לא ייפול על גרסה ישנה יותר בלי לומר למה. */
function loadEnv() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  try { process.loadEnvFile(file); return } catch (e) {}
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trim().startsWith("#")) continue;
    if (!(m[1] in process.env))
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();

/* ---------- מונה יומי בזיכרון ---------- */
/* ה-Worker נכשל־סגור בלי מונה, וטוב שכך: בלי תקרה אין חסם עלות.
   בייצור המונה הוא KV של Cloudflare; כאן הוא Map, ומממש את אותם
   שני מתודות בלבד שה-Worker קורא להן. התקרות עצמן הן של
   `LIM` שב-worker.js — לא מספרים חדשים. */
const store = new Map();
const RATE = {
  async get(key) {
    const row = store.get(key);
    if (!row) return null;
    if (row.exp && row.exp < Date.now()) { store.delete(key); return null }
    return row.val;
  },
  async put(key, val, opts) {
    store.set(key, { val, exp: opts && opts.expirationTtl
      ? Date.now() + opts.expirationTtl * 1000 : 0 });
  }
};

const KEY = process.env.ANTHROPIC_API_KEY || "";
const ENV = {
  ANTHROPIC_API_KEY: KEY,
  ALLOW_ORIGIN: "*",          /* מקומי בלבד — ראו האזהרה ב-README */
  RATE
};

/* ---------- הגשת קבצים סטטיים ---------- */
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",   ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".txt": "text/plain; charset=utf-8"
};

/* `tutor/tutor.js` נשמר במאגר עם `var API = ""` — כך ג׳וש כבוי
   בייצור עד שהבעלים מריץ enable-tutor.js. כאן מוזרקת כתובת
   מקומית **בזמן ההגשה בלבד**; הקובץ שעל הדיסק אינו נוגע, ולכן
   `node .claude/qa/tutor.js` ממשיך לראות אותו כבוי. */
function injectApi(src) {
  const out = src.replace(/var API = "";/,
    'var API = "http://' + HOST + ':' + PORT + ENDPOINT + '";');
  if (out === src) console.warn("אזהרה: לא נמצא `var API = \"\";` ב-tutor/tutor.js — ג׳וש יישאר כבוי באפליקציות.");
  return out;
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(ROOT, rel);
  /* מחוץ לשורש — לא מגישים */
  if (!file.startsWith(ROOT + path.sep)) return send(res, 403, "forbidden");
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, "not found");

  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  if (rel === "/tutor/tutor.js")
    return send(res, 200, injectApi(fs.readFileSync(file, "utf8")), type);
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
}

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type || "text/plain; charset=utf-8",
                          "Cache-Control": "no-store" });
  res.end(body);
}

/* ---------- הגשר: בקשת Node → Request → ה-Worker ---------- */
async function toWorker(req, res) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);

  const request = new Request("http://" + HOST + ":" + PORT + ENDPOINT, {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : body
  });

  let out;
  try {
    out = await worker.fetch(request, ENV);
  } catch (e) {
    console.error("ג׳וש נפל:", e && e.message ? e.message : e);
    return send(res, 500, JSON.stringify({ error: "server" }),
                "application/json; charset=utf-8");
  }
  const headers = {};
  out.headers.forEach((v, k) => { headers[k] = v });
  res.writeHead(out.status, headers);
  res.end(Buffer.from(await out.arrayBuffer()));
}

/* ---------- הניתוב ---------- */
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://" + HOST + ":" + PORT);
  const p = url.pathname;

  if (p === ENDPOINT) return toWorker(req, res);

  /* מסך הבדיקה של ג׳וש */
  if (p === "/josh" || p === "/josh/")
    return send(res, 200, fs.readFileSync(path.join(HERE, "index.html"), "utf8"),
                MIME[".html"]);

  /* בריאות — עונה בלי לפנות ל-Anthropic ובלי לעלות כסף */
  if (p === "/health")
    return send(res, 200, JSON.stringify({
      ok: true, key: KEY ? "present" : "missing",
      apps: Object.keys(ROLE), limits: LIM
    }), MIME[".json"]);

  if (req.method !== "GET" && req.method !== "HEAD")
    return send(res, 405, "method not allowed");
  serveStatic(req, res, p);
});

/* פורט תפוס הוא הסיבה הנפוצה ביותר ל״השרת לא עולה״, ובלי המאזין
   הזה Node זורק ERR_SERVER_ALREADY_LISTEN בלי לומר מה לעשות. */
server.on("error", (e) => {
  console.error("");
  if (e && e.code === "EADDRINUSE") {
    console.error("  ✗ פורט " + PORT + " כבר תפוס — משהו אחר מאזין עליו.");
    console.error("    אפשרות א: לסגור אותו.");
    console.error("    אפשרות ב: להריץ על פורט אחר —  PORT=3001 node tutor-api/local/server.js");
  } else if (e && e.code === "EACCES") {
    console.error("  ✗ אין הרשאה להאזין על פורט " + PORT + ".");
    console.error("    פורט מתחת ל-1024 דורש הרשאות. נסה  PORT=3001 …");
  } else {
    console.error("  ✗ השרת לא עלה: " + (e && (e.code || e.message)));
  }
  console.error("");
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("  ג׳וש רץ.  http://" + HOST + ":" + PORT + "/josh");
  console.log("  האפליקציות:  http://" + HOST + ":" + PORT + "/math-app/");
  console.log("  " + ENDPOINT + "   ·   /health");
  console.log("");
  if (!KEY) {
    console.log("  ⚠ אין ANTHROPIC_API_KEY. הדף ייטען, וכל פנייה תחזור 500.");
    console.log("    שורה אחת בקובץ .env שבשורש המאגר:  ANTHROPIC_API_KEY=sk-ant-...");
    console.log("");
  }
  console.log("  תקרות (מ-worker.js, לא מספרים חדשים): " +
              LIM.perDay + " פניות ליום לכתובת, " + LIM.globalPerDay + " לכל השירות.");
  console.log("");
});
