/* =====================================================================
   כרטיסי האפליקציות לאתר ויקס — נגזרים מ-DATA.APPS, לא נכתבים ביד.

     node .claude/qa/wix.js            הגוש לטרמינל
     node .claude/qa/wix.js --md       אותו גוש, להדבקה ב-wix-content.md
     node .claude/qa/wix.js --check    האם wix-content.md מסונכרן

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

const BASE = "https://lagstein1-png.github.io";
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

/* גבולות הגוש בתוך wix-content.md: מהכותרת של הקטגוריה הראשונה
   ועד לכותרת הראשית הבאה. */
function bounds(doc) {
  const start = doc.indexOf("### " + data().STR.he[CATS[0]]);
  if (start < 0) return null;
  const next = doc.indexOf("\n## ", start);
  return { start, end: next < 0 ? doc.length : next };
}

const DOC = path.join(root, "marketing", "wix-content.md");

if (check) {
  if (!fs.existsSync(DOC)) { console.log("marketing/wix-content.md אינו קיים"); process.exit(1); }
  const doc = fs.readFileSync(DOC, "utf8"), b = bounds(doc);
  if (!b) { console.log("לא נמצא גוש כרטיסי האפליקציות ב-wix-content.md"); process.exit(1); }
  const have = doc.slice(b.start, b.end).replace(/\n+$/, "");
  const want = block();
  if (have === want) {
    console.log(`כרטיסי האפליקציות ב-wix-content.md תואמים לכל ${data().APPS.length} האפליקציות`);
    process.exit(0);
  }
  const hl = have.split("\n"), wl = want.split("\n");
  let i = 0; while (i < hl.length && i < wl.length && hl[i] === wl[i]) i++;
  console.log("wix-content.md סטה מ-DATA.APPS. ההבדל הראשון:");
  console.log("· במסמך: " + (hl[i] === undefined ? "(נגמר)" : hl[i]));
  console.log("· בקוד:  " + (wl[i] === undefined ? "(נגמר)" : wl[i]));
  console.log("\nרענון: node .claude/qa/wix.js --md");
  process.exit(1);
}

console.log(block());
if (!md) console.log(`\n${data().APPS.length} אפליקציות · מקור: DATA.APPS שב-index.html`);
