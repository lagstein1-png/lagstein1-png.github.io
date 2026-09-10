/* ============================================================
   ג׳וש — כתיבת המפתח ל-.env, בלי לערוך קובץ ביד.

   נכתב אחרי שהבעלים ערך את `.env` פעמיים ו-`doctor` המשיך לדווח
   ״המפתח ריק״. עריכה ביד נכשלת בשקט בחמש דרכים — הקובץ נשמר
   בתיקייה אחרת, העורך לא שמר, המפתח הודבק בתוך שורת הערה, נוספו
   מרכאות או רווח, או שנוצרה שורה שנייה והפרסר קרא את הראשונה.
   כאן אין עריכה: מדביקים, והכלי כותב.

   הרצה:  node tutor-api/local/setkey.js
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const FILE = path.join(ROOT, ".env");

const HEAD = [
  "# ג׳וש — השרת המקומי. הקובץ הזה נשאר על המחשב שלך בלבד.",
  "# `.gitignore` חוסם אותו, ולכן הוא לעולם לא יעלה ל-GitHub.",
  "# נכתב על ידי  node tutor-api/local/setkey.js  — אין צורך לערוך ביד.",
  ""
];

/* קלט מוסתר. אם אין TTY (הרצה בתוך צינור) — קריאה רגילה, כי
   עדיף קלט גלוי מאשר כלי שנתקע בלי לומר למה. */
function ask(prompt) {
  return new Promise(res => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const tty = process.stdin.isTTY;
    if (tty) {
      let shown = false;
      rl._writeToOutput = function (s) {
        if (!shown) { rl.output.write(prompt); shown = true; return }
        if (s.includes("\n")) rl.output.write("\n");
      };
    }
    rl.question(prompt, v => { rl.close(); res(v) });
  });
}

const raw = await ask("  הדבק כאן את המפתח (הוא לא יוצג): ");
const key = String(raw).trim().replace(/^["']|["']$/g, "").trim();

console.log("");
if (!key) {
  console.error("  ✗ לא הודבק כלום. שום דבר לא נכתב.\n");
  process.exit(1);
}
if (!/^sk-ant-/.test(key)) {
  console.error("  ✗ המפתח אינו מתחיל ב-sk-ant- , ולכן לא נכתב.");
  console.error("    מפתח של Anthropic נראה כך:  sk-ant-api03-…");
  console.error("    console.anthropic.com → API Keys → Create Key\n");
  process.exit(1);
}
if (/\s/.test(key)) {
  console.error("  ✗ יש רווח בתוך המפתח — כנראה הודבק חלקית. לא נכתב.\n");
  process.exit(1);
}

/* שמירה על שאר הקובץ: כל שורה שאינה ANTHROPIC_API_KEY נשארת
   כלשונה, וכל מופע קיים של המפתח מוסר — כדי שלא תיוותר שורה
   שנייה שפרסר אחר יקרא במקומה. */
let rest = [];
if (fs.existsSync(FILE))
  rest = fs.readFileSync(FILE, "utf8").split(/\r?\n/)
    .filter(l => !/^\s*ANTHROPIC_API_KEY\s*=/.test(l))
    .filter(l => !HEAD.includes(l));

const body = HEAD.concat(rest.filter(l => l.trim() !== ""))
                 .concat(["", "ANTHROPIC_API_KEY=" + key, ""]);
fs.writeFileSync(FILE, body.join("\n"), { mode: 0o600 });

/* אימות — קוראים מהדיסק, ולא סומכים על מה שנכתב */
const back = fs.readFileSync(FILE, "utf8").split(/\r?\n/)
  .filter(l => /^\s*ANTHROPIC_API_KEY\s*=/.test(l));
if (back.length !== 1 || back[0].split("=").slice(1).join("=").trim() !== key) {
  console.error("  ✗ הכתיבה לא אומתה. בדוק הרשאות על " + FILE + "\n");
  process.exit(1);
}

console.log("  ✓ נכתב:  " + FILE);
console.log("    " + key.length + " תווים, מתחיל ב-" + key.slice(0, 7) + "…");
console.log("    הרשאות 600 — קריאה למשתמש שלך בלבד.");
console.log("");
console.log("  עכשיו:  node tutor-api/local/server.js");
console.log("  ואז:    http://127.0.0.1:3000/josh");
console.log("");
