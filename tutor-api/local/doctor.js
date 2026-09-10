/* ============================================================
   ג׳וש — אבחון. אומר בדיוק למה השרת לא עולה.

   הכלי הזה **אינו פונה לרשת ואינו עולה כסף**. הוא בודק שבעה
   דברים שכל אחד מהם מפיל את `server.js`, ומדפיס לכל אחד מה
   לעשות. הוא נכתב אחרי שהבעלים דיווח ״השרת לא עולה״ בלי הודעת
   שגיאה, ואבחון בהתכתבות לקח שלוש סבבים.

   הרצה:  node tutor-api/local/doctor.js
   ============================================================ */
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const PORT = Number(process.env.PORT) || 3000;
let bad = 0;
const ok   = (t, d) => console.log("  ✓ " + t + (d ? "  —  " + d : ""));
const fail = (t, d) => { bad++; console.log("  ✗ " + t + (d ? "\n      " + d : "")) };
const note = (t) => console.log("  · " + t);

console.log("\n  אבחון ג׳וש — השרת המקומי\n");

/* 1 · גרסת Node */
const major = Number(process.versions.node.split(".")[0]);
if (major >= 18) ok("Node " + process.versions.node);
else fail("Node " + process.versions.node + " ישן מדי",
          "ג׳וש דורש 18 ומעלה (fetch גלובלי). התקנה: https://nodejs.org");

/* 2 · הקבצים במקומם */
const need = [
  ["tutor-api/worker.js",           "המוח של ג׳וש"],
  ["tutor-api/package.json",        'ההצהרה "type": "module" — בלעדיה הייבוא נכשל'],
  ["tutor-api/local/server.js",     "השרת עצמו"],
  ["tutor-api/local/index.html",    "מסך הבדיקה /josh"],
  ["tutor/tutor.js",                "הווידג׳ט שנטען באפליקציות"]
];
for (const [rel, why] of need) {
  if (fs.existsSync(path.join(ROOT, rel))) ok(rel);
  else fail(rel + " חסר", why + ".  הרץ:  git pull");
}

/* 3 · הייבוא באמת עובד */
try {
  const m = await import(path.join(ROOT, "tutor-api", "worker.js"));
  if (m.LIM && m.ROLE && m.default && typeof m.default.fetch === "function")
    ok("worker.js נטען", Object.keys(m.ROLE).length + " אפליקציות, " +
       LIMtxt(m.LIM));
  else
    fail("worker.js נטען אבל חסרים בו ייצואים",
         "צפוי LIM, ROLE ו-default.fetch. יש: " + Object.keys(m).join(", "));
} catch (e) {
  fail("worker.js לא נטען", String(e && e.message).split("\n")[0] +
       "\n      אם כתוב CommonJS — חסר tutor-api/package.json.  git pull");
}
function LIMtxt(L) { return L.perDay + " פניות ליום לכתובת" }

/* 4 · הפורט פנוי */
await new Promise(res => {
  const s = net.createServer();
  s.once("error", e => {
    if (e.code === "EADDRINUSE")
      fail("פורט " + PORT + " תפוס",
           "משהו אחר מאזין עליו. סגור אותו, או:  PORT=3001 node tutor-api/local/server.js");
    else fail("פורט " + PORT + ": " + e.code);
    res();
  });
  s.once("listening", () => { ok("פורט " + PORT + " פנוי"); s.close(res) });
  s.listen(PORT, "127.0.0.1");
});

/* 5 · המפתח */
const envFile = path.join(ROOT, ".env");
let key = process.env.ANTHROPIC_API_KEY || "";
if (!key && fs.existsSync(envFile)) {
  const m = fs.readFileSync(envFile, "utf8")
    .split(/\r?\n/).find(l => /^\s*ANTHROPIC_API_KEY\s*=/.test(l));
  if (m) key = m.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
}
if (!fs.existsSync(envFile) && !process.env.ANTHROPIC_API_KEY)
  fail("אין קובץ .env ואין משתנה סביבה",
       "צור .env בשורש המאגר עם שורה:  ANTHROPIC_API_KEY=sk-ant-...");
else if (!key)
  fail("המפתח ריק",
       ".env קיים, אבל אין ערך אחרי ANTHROPIC_API_KEY=  ·  " + envFile);
else if (!/^sk-ant-/.test(key))
  fail("המפתח אינו נראה כמו מפתח של Anthropic",
       "מפתח תקין מתחיל ב-sk-ant- . אולי הודבק חלקית, או עם מרכאות.");
else
  ok("מפתח נמצא", key.length + " תווים, מתחיל ב-" + key.slice(0, 7) + "…");

/* 6 · .env אינו נעקב בגיט */
if (fs.existsSync(envFile)) {
  const gi = path.join(ROOT, ".gitignore");
  const listed = fs.existsSync(gi) &&
    fs.readFileSync(gi, "utf8").split(/\r?\n/).some(l => l.trim() === ".env");
  if (listed) ok(".env חסום ב-.gitignore", "לא יעלה ל-GitHub");
  else fail(".env אינו ב-.gitignore", "המפתח עלול לעלות ל-GitHub. הוסף שורה: .env");
}

/* 7 · פסק דין */
console.log("");
if (bad) {
  console.log("  " + (bad === 1 ? "בעיה אחת" : bad + " בעיות") +
              ". תקן את מה שמסומן ב-✗ והרץ שוב.\n");
  process.exit(1);
}
note("הכול תקין. הרצה:  node tutor-api/local/server.js");
note("ואז בדפדפן:  http://127.0.0.1:" + PORT + "/josh");
console.log("");
