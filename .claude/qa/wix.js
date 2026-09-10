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

/* עמוד המחירים — נגזר מ-price ומ-once שב-DATA.APPS, ומהמחרוזות
   free ו-once שב-STR. שום מספר כאן אינו נכתב ביד.

   price הוא סכום בש״ח לחודש — כך כתוב בהערה שב-index.html ליד
   priceLabel — למעט רשומה שיש בה once:true, שהיא תשלום חד־פעמי.
   **אין בקוד מחרוזת ממשק שאומרת "לחודש" באף שפה**, ולכן התקופה
   אינה מודפסת כאן לצד המספר: היא תיכתב כשתיווסף ל-STR בארבע
   השפות, כמו כל מחרוזת אחרת שנראית למשתמש. */
function priceLabel(a, S) {
  if (a.price === 0) return S.free;
  return a.price + " ₪" + (a.once ? " " + S.once : "");
}

function prices() {
  const d = data(), S = d.STR, out = [];
  const free = d.APPS.filter(a => a.price === 0);
  const paid = d.APPS.filter(a => a.price > 0);
  for (const [l, name] of LANGS) {
    out.push("### " + name, "");
    /* s4 היא המחרוזת שדף הבית כבר משתמש בה מתחת למספר הזה
       ("אפליקציות חינם לתמיד"), ולכן היא מצטרפת למספר נכון בכל
       ארבע השפות. S.free לבדה נותנת "4 חינם", שאינו משפט. */
    out.push("**" + free.length + " " + S[l].s4 + ":** " +
      free.map(a => a.n[l]).join(" · "), "");
    out.push("| " + (l === "he" ? "אפליקציה | מחיר" :
      l === "ar" ? "التطبيق | السعر" :
      l === "ru" ? "Приложение | Цена" : "App | Price") + " |");
    out.push("|---|---|");
    for (const a of paid) out.push("| " + a.n[l] + " | " + priceLabel(a, S[l]) + " |");
    out.push("");
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

/* גבולות סעיף המחירים: מהכותרת שלו ועד הכותרת הראשית הבאה. */
function priceBounds(doc) {
  const h = "## עמוד מחירים";
  const at = doc.indexOf(h);
  if (at < 0) return null;
  const next = doc.indexOf("\n## ", at + h.length);
  const end = next < 0 ? doc.length : next;
  /* הגוש הנבדק מתחיל בכותרת השפה הראשונה ולא מיד אחרי הכותרת
     הראשית: ההסבר האנושי שמעליה נערך ביד, בדיוק כמו ב-STATUS.md.
     נגזר נבדק, שיקול דעת נשאר. */
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
  /* גם המחירים: סעיף שנשאר מאחור הוא מחיר שגוי מול לקוח, ולא רק
     טקסט מיושן. */
  const pb = priceBounds(doc);
  const pHave = pb ? doc.slice(pb.start, pb.end).trim() : null;
  const pWant = prices().trim();
  if (have === want && pHave === pWant) {
    console.log(`כרטיסי האפליקציות והמחירים ב-wix-content.md תואמים לכל ${data().APPS.length} האפליקציות`);
    process.exit(0);
  }
  if (have === want && pHave !== pWant) {
    console.log("כרטיסי האפליקציות תואמים, אבל סעיף המחירים סטה מ-DATA.APPS.");
    const a = (pHave || "").split("\n"), b2 = pWant.split("\n");
    let j = 0; while (j < a.length && j < b2.length && a[j] === b2[j]) j++;
    console.log("· במסמך: " + (a[j] === undefined ? "(נגמר)" : a[j]));
    console.log("· בקוד:  " + (b2[j] === undefined ? "(נגמר)" : b2[j]));
    console.log("\nרענון: node .claude/qa/wix.js --prices");
    process.exit(1);
  }
  const hl = have.split("\n"), wl = want.split("\n");
  let i = 0; while (i < hl.length && i < wl.length && hl[i] === wl[i]) i++;
  console.log("wix-content.md סטה מ-DATA.APPS. ההבדל הראשון:");
  console.log("· במסמך: " + (hl[i] === undefined ? "(נגמר)" : hl[i]));
  console.log("· בקוד:  " + (wl[i] === undefined ? "(נגמר)" : wl[i]));
  console.log("\nרענון: node .claude/qa/wix.js --md");
  process.exit(1);
}

if (process.argv.includes("--prices")) {
  console.log(prices());
  if (!md) console.log(`\n${data().APPS.filter(a => a.price > 0).length} בתשלום · ` +
    `${data().APPS.filter(a => a.price === 0).length} חינם · מקור: DATA.APPS שב-index.html`);
  process.exit(0);
}

console.log(block());
if (!md) console.log(`\n${data().APPS.length} אפליקציות · מקור: DATA.APPS שב-index.html` +
  `\nבסיס הכתובת: ${BASE}`);
