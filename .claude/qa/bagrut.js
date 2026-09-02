/* בדיקת תוכן ל-bagrut-806.
   entropy.js ו-options.js אינם חלים כאן: הם בודקים מחוללים, ול-806
   אין מחולל — יש קובץ תוכן קבוע. מה שכן אפשר לבדוק הוא ששני הכללים
   שכתובים בראש data/exams.js באמת נשמרים, ושכל סעיף שלם.

   הרצה:  node .claude/qa/bagrut.js
   יוצא עם 1 אם יש שגיאה, ו-0 אם רק אזהרות.                       */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const errs = [], warns = [];

global.window = global;
require(path.join(ROOT, "bagrut-806/data/exams.js"));
const EXAMS = global.EXAMS || [];

/* מקור האמת לתוויות ״לא בחינה אמיתית״ הוא app.js עצמו, ולא רשימה
   שמועתקת לכאן: רשימה מועתקת מתיישנת בשקט ברגע שמישהו מוסיף עונה. */
const app = fs.readFileSync(path.join(ROOT, "bagrut-806/app.js"), "utf8");
const fakeBlock = app.match(/var FAKE = \{([\s\S]*?)\};/);
const FAKE = fakeBlock ? [...fakeBlock[1].matchAll(/"([^"]+)"\s*:/g)].map(m => m[1]) : [];
if (!FAKE.length) errs.push("app.js: לא נמצאה מפת FAKE — אי אפשר לדעת אילו עונות מסומנות כלא-אמיתיות");

const E = (id, m) => errs.push(id + ": " + m);
const W = (id, m) => warns.push(id + ": " + m);
const has = v => typeof v === "string" && v.trim() !== "";

const seenExam = {};
let totalSubs = 0;

EXAMS.forEach(ex => {
  const xid = ex.id || "(בחינה בלי id)";
  if (!has(ex.id)) E(xid, "אין id");
  if (seenExam[ex.id]) E(xid, "id כפול");
  seenExam[ex.id] = 1;
  if (!(ex.durationMinutes > 0)) E(xid, "durationMinutes אינו מספר חיובי");

  /* הכלל השני מראש exams.js: מה שאינו בחינה אמיתית מסומן ככזה.
     בדיקה אוטומטית אינה יכולה לדעת מה אמיתי, ולכן עונה שאינה ברשימת
     FAKE מסומנת כאזהרה — היא מצהירה על עצמה כבחינה אמיתית. */
  if (FAKE.indexOf(ex.season) < 0)
    W(xid, 'season "' + ex.season + '" אינו ברשימת FAKE של app.js — הבחינה תוצג בלי תווית אזהרה, ולכן היא חייבת להיות בחינה אמיתית');

  const seenNum = {};
  let pts = 0;
  (ex.questions || []).forEach(q => {
    const qid = xid + " ש" + q.number;
    if (seenNum[q.number]) E(qid, "מספר שאלה כפול");
    seenNum[q.number] = 1;
    if (!has(q.topic)) E(qid, "אין topic — דוח הנושאים החלשים מקבץ לפיו");
    if (!has(q.text)) E(qid, "אין נוסח");
    /* הכלל הראשון מראש exams.js: יש נוסחה — יש speech. */
    if (has(q.latex) && !has(q.speech)) E(qid, "יש latex ואין speech — ההקראה תשתוק או תקרא LaTeX גולמי");

    const seenL = {};
    const subs = q.subQuestions || [];
    if (!subs.length) E(qid, "אין סעיפים");
    subs.forEach(s => {
      totalSubs++;
      const sid = qid + " סעיף " + (s.letter || "?");
      if (!has(s.letter)) E(sid, "אין letter");
      if (seenL[s.letter]) E(sid, "אות סעיף כפולה");
      seenL[s.letter] = 1;
      if (!has(s.text)) E(sid, "אין נוסח");
      if (!(s.points > 0)) E(sid, "points אינו מספר חיובי"); else pts += s.points;
      if (has(s.latex) && !has(s.speech)) E(sid, "יש latex ואין speech");

      const fa = s.finalAnswer;
      if (!fa) E(sid, "אין finalAnswer — המנוע יגיד לתלמיד שאין תשובה בקובץ");
      else if (["number", "expression", "text"].indexOf(fa.type) < 0)
        E(sid, 'type לא מוכר: "' + fa.type + '"');
      else if (fa.type === "number") {
        if (typeof fa.value !== "number" || !isFinite(fa.value)) E(sid, "value אינו מספר סופי");
        if (typeof fa.tolerance !== "number" || fa.tolerance < 0)
          E(sid, "אין tolerance תקין — השוואה מדויקת על מספר עשרוני נכשלת כמעט תמיד");
      } else if (!has(fa.value)) E(sid, "value ריק");

      const st = s.steps || [];
      if (!st.length) E(sid, "אין steps");
      st.forEach((x, i) => {
        const p = sid + " שלב " + (i + 1);
        if (!has(x.hint)) E(p, "אין hint");
        if (!has(x.detail)) E(p, "אין detail");
        /* רמז שזהה לפתרון אינו רמז. */
        if (has(x.hint) && x.hint.trim() === (x.detail || "").trim()) E(p, "hint זהה ל-detail");
      });
    });
  });
  console.log("== " + xid + "  (" + ex.season + " " + ex.year + ")  " +
    (ex.questions || []).length + " שאלות · " + pts + " נקודות");
  /* בשאלון שבו עונים על חלק מהשאלות סך הנקודות אינו 100, ולכן
     הכלל הנכון הוא משקל שווה לכל שאלה — ולא סכום קבוע לבחינה.
     שאלה ששוקלת יותר מאחרת מטה את הציון לפי מה שהתלמיד בחר. */
  const wq = (ex.questions || []).map(q =>
    (q.subQuestions || []).reduce((a, s) => a + (s.points || 0), 0));
  if (wq.length > 1 && wq.some(v => v !== wq[0]))
    W(xid, "משקל השאלות אינו אחיד: " + wq.join(", "));
});

console.log("סה\"כ " + EXAMS.length + " בחינות, " + totalSubs + " סעיפים");
if (warns.length) { console.log("\nאזהרות:"); warns.forEach(w => console.log("  ! " + w)); }
if (errs.length) { console.log("\nשגיאות:"); errs.forEach(w => console.log("  ✗ " + w)); }
else console.log("\nאין שגיאות.");
process.exit(errs.length ? 1 : 0);
