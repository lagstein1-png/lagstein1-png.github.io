/* =====================================================================
   כרטיסי האפליקציות לאתר ויקס — נגזרים מ-DATA.APPS, לא נכתבים ביד.

     node .claude/qa/wix.js            הגוש לטרמינל
     node .claude/qa/wix.js --md       אותו גוש, להדבקה ב-wix-content.md
     node .claude/qa/wix.js --check    האם wix-content.md מסונכרן
     node .claude/qa/wix.js --write    מחליף את שני הגושים במסמך במקום

   למה זה קיים
   -----------
   `marketing/README.md` אמר "כשמשהו משתנה בדף הבית, מריצים את
   המחולל מחדש" — ולא היה מחולל. ההוראה לא ניתנת לביצוע, והקובץ
   נועד לסטות מדף הבית בלי שאיש ישים לב: שם אפליקציה שהשתנה, תיאור
   שנוסח מחדש או אפליקציה שנוספה היו נשארים ב-wix-content.md
   בגרסה הישנה, והטקסט שמודבק לאתר החי היה מתאר משהו אחר.

   זה אותו דפוס של status.js: המספרים נגזרים, וההערכה האנושית
   נשארת במסמך.
   ===================================================================== */
const fs = require("fs"), path = require("path");
const root = process.cwd();
const md = process.argv.includes("--md");
const check = process.argv.includes("--check");

/* בסיס הכתובת. GitHub Pages יורד ביום היציאה (marketing/launch.md
   צעד 5), ולכן כל קישור שנגזר ממנו ימות באותו יום. הוא פרמטר ולא
   קבוע, כדי שמעבר מארח יהיה דגל אחד ולא עשרים וארבע עריכות ביד:

       node .claude/qa/wix.js --base https://<המארח החדש>

   ברירת המחדל היא המארח הנוכחי, כדי שהקובץ יישאר נכון היום. */
const bi = process.argv.indexOf("--base");
const BASE = bi >= 0 && process.argv[bi + 1]
  ? process.argv[bi + 1].replace(/\/+$/, "")
  : "https://lagstein1-png.github.io";
const LANGS = [["he", "עברית"], ["ar", "ערבית"], ["ru", "רוסית"], ["en", "אנגלית"]];
const CATS = ["math", "lang", "life"];

function data() {
  /* אותו חילוץ שב-status.js וב-apps.js: DATA הוא JSON שלם בשורה אחת. */
  const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const m = home.match(/var DATA=(\{"APPS".*?\});\s*\nvar APPS/s);
  if (!m) throw new Error("לא נמצא בלוק DATA ב-index.html");
  return JSON.parse(m[1]);
}

function block() {
  const d = data(), S = d.STR, out = [];
  for (const cat of CATS) {
    const apps = d.APPS.filter(a => a.cat === cat);
    if (!apps.length) continue;
    out.push("### " + LANGS.map(([l]) => S[l][cat]).join(" · "), "");
    for (const a of apps) {
      out.push("#### " + a.n.he, "");
      /* אפליקציה עם `u` מתפרסמת בכתובת שנקבעת בשם ריפו נפרד, ולכן
         הכתובת אינה נגזרת מהמזהה. אין כותבים אותה כאן — ראו NAMING.md. */
      out.push("- **קישור:** " + (a.u ? "(מכרטיס דף הבית — ראו למעלה)" : BASE + "/" + a.id + "/"));
      /* ?install=1 פותח את האפליקציה עם כפתור ההתקנה כבר על המסך.
         אפליקציה בריפו נפרד אינה מקבלת שורה כזאת: הטיפול בפרמטר
         יושב ב-legal/protect.js שבריפו הזה, ואין לי דרך לאמת שהעותק
         שלה מכיל אותו. */
      if (!a.u) out.push("- **התקנה ישירה:** " + BASE + "/" + a.id + "/?install=1");
      out.push("- **תוויות:** " + a.t.map(k => S.he[k]).join(" · "));
      for (const [l, name] of LANGS) out.push("- **" + name + ":** " + a.n[l] + " — " + a.d[l]);
      out.push("");
    }
  }
  return out.join("\n").replace(/\n+$/, "");
}

/* עמוד הבית — כותרת, פסקת פתיחה, "איך זה עובד" והכפתורים, כולם
   מ-STR. הגוש הזה סטה בפועל: נמדד ב-10.9.2026 ששבע מחרוזות
   במסמך כבר לא היו זהות לדף הבית — ארבע פסקאות פתיחה, how1,
   how3 ו-about — והטקסט שהיה מודבק לוויקס תיאר מוצר אחר.

   how1 נכלל כאן. הגרסה הקודמת של המסמך השמיטה אותו מפני שהוא
   הבטיח "אין הרשמה", וזה לא יתקיים לשמונה שבתשלום; ההשמטה פתרה
   את הסתירה במסמך והשאירה אותה בדף הבית. הפתרון הוא לתקן את
   המחרוזת, לא להסתיר אותה. */
function home() {
  const d = data(), S = d.STR, out = [];
  for (const [l, name] of LANGS) {
    const T = S[l];
    out.push("### " + name, "");
    out.push("**כותרת:** " + [T.h1a, T.h1b, T.h1c].join(" ").replace(/\s+/g, " ").trim(), "");
    out.push("**תווית:** " + T.badge, "");
    out.push("**פסקת פתיחה:** " + T.lead, "");
    out.push("**" + T.howT + ":**", "");
    out.push("1. " + T.how1);
    out.push("2. " + T.how2);
    out.push("3. " + T.how3, "");
    out.push("**כפתורים:** \"" + T.ctaApps + "\" · \"" + T.ctaContact + "\"", "");
  }
  return out.join("\n").replace(/\n+$/, "");
}

/* גבולות הגוש בתוך wix-content.md: מהכותרת של הקטגוריה הראשונה
   ועד לכותרת הראשית הבאה. */
function bounds(doc) {
  const start = doc.indexOf("### " + data().STR.he[CATS[0]]);
  if (start < 0) return null;
  const next = doc.indexOf("\n## ", start);
  return { start, end: next < 0 ? doc.length : next };
}

/* גבולות עמוד הבית: מכותרת השפה הראשונה שאחריו ועד הכותרת
   הראשית הבאה. אותו עיקרון — נגזר נבדק, פרוזה נשארת. */
function homeBounds(doc) {
  const h = "## עמוד הבית";
  const at = doc.indexOf(h);
  if (at < 0) return null;
  const next = doc.indexOf("\n## ", at + h.length);
  const end = next < 0 ? doc.length : next;
  const first = doc.indexOf("\n### ", at);
  if (first < 0 || first > end) return null;
  return { start: first, end };
}

const DOC = path.join(root, "marketing", "wix-content.md");

if (check) {
  if (!fs.existsSync(DOC)) { console.log("marketing/wix-content.md אינו קיים"); process.exit(1); }
  const doc = fs.readFileSync(DOC, "utf8"), b = bounds(doc);
  if (!b) { console.log("לא נמצא גוש כרטיסי האפליקציות ב-wix-content.md"); process.exit(1); }
  const have = doc.slice(b.start, b.end).replace(/\n+$/, "");
  const want = block();
  const hb = homeBounds(doc);
  const hHave = hb ? doc.slice(hb.start, hb.end).trim() : null;
  const hWant = home().trim();
  const diff = (a, b, title, how) => {
    console.log(title);
    const x = (a || "").split("\n"), y = b.split("\n");
    let j = 0; while (j < x.length && j < y.length && x[j] === y[j]) j++;
    console.log("· במסמך: " + (x[j] === undefined ? "(נגמר)" : x[j]));
    console.log("· בקוד:  " + (y[j] === undefined ? "(נגמר)" : y[j]));
    console.log("\nרענון: " + how);
    process.exit(1);
  };
  if (have === want && hHave === hWant) {
    console.log(`עמוד הבית וכרטיסי האפליקציות ב-wix-content.md תואמים לכל ${data().APPS.length} האפליקציות`);
    process.exit(0);
  }
  if (have === want && hHave !== hWant)
    diff(hHave, hWant, "כרטיסי האפליקציות תואמים, אבל עמוד הבית סטה מ-DATA.STR.",
      "node .claude/qa/wix.js --home");
  const hl = have.split("\n"), wl = want.split("\n");
  let i = 0; while (i < hl.length && i < wl.length && hl[i] === wl[i]) i++;
  console.log("wix-content.md סטה מ-DATA.APPS. ההבדל הראשון:");
  console.log("· במסמך: " + (hl[i] === undefined ? "(נגמר)" : hl[i]));
  console.log("· בקוד:  " + (wl[i] === undefined ? "(נגמר)" : wl[i]));
  console.log("\nרענון: node .claude/qa/wix.js --md");
  process.exit(1);
}

/* --write — מחליף את שני הגושים במקום, במקום הדבקה ידנית (18.9.2026:
   הגוש נסחף פעמיים ביום אחד כי --md מדפיס בלבד). */
if (process.argv.includes("--write")) {
  let doc = fs.readFileSync(DOC, "utf8");
  const hb = homeBounds(doc);
  if (hb) doc = doc.slice(0, hb.start) + home().trim() + "\n" + doc.slice(hb.end);
  const b = bounds(doc);
  if (!b) { console.log("לא נמצא גוש כרטיסי האפליקציות ב-wix-content.md"); process.exit(1); }
  doc = doc.slice(0, b.start) + block() + "\n" + doc.slice(b.end);
  fs.writeFileSync(DOC, doc);
  console.log("wix-content.md עודכן משני הגושים");
  process.exit(0);
}

if (process.argv.includes("--home")) {
  console.log(home());
  if (!md) console.log("\nמקור: DATA.STR שב-index.html");
  process.exit(0);
}

console.log(block());
if (!md) console.log(`\n${data().APPS.length} אפליקציות · מקור: DATA.APPS שב-index.html` +
  `\nבסיס הכתובת: ${BASE}`);
