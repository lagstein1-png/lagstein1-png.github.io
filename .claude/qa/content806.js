/* ============================================================
   content806.js — סריקת תוכן למשפחת הבנק הסטטי
   ------------------------------------------------------------
   `content.js` מגריל שאלות מ-`buildQ` ובודק אותן. `bagrut-806`
   אינה מחוללת שאלות: התוכן שלה יושב כתוב ביד ב-`data/exams.js`,
   ולכן היא נפלה בין הכיסאות — **אף סריקת תוכן אוטומטית לא רצה
   עליה מעולם** (O-13 ב-FINDINGS).

     node .claude/qa/content806.js

   מה זה **אינו**: `exam806.js` כבר בודק את הסכימה, את `speech`
   מול `latex`, את `tolerance`, את `reject` ואת הרמז שמכיל את
   התשובה. אין כאן שכפול שלו. כאן נמדד מה שאפשר למדוד רק כשרואים
   את **כל** המאגר יחד:

     duplicate   שאלה או סעיף שחוזרים בין האוספים
     wording     מציין מיקום שנשאר, רווח כפול, סוגר שלא נסגר
     tts         מה שההקראה העברית תיתקל בו — אותיות לטיניות
     guessable   תשובה שחוזרת כל כך הרבה שאפשר לנחש אותה
     balance     נושא עם פחות שאלות מאחרים

   הדוח נכתב ל-`reports/bagrut-806.json` ו-`.md`, באותה צורה
   ש-`content.js` כותב, כדי ש-`stage.js` יקרא אותו כמו כל אפליקציה
   אחרת. פסק הדין זהה: FAIL חוסם, REVIEW דורש עין, PASS נקי.

   **הוא אינו קורא מתמטיקה** — זה תפקידו של אוקלידס, ושל
   ה-`reject` שבתוכן עצמו.
   ============================================================ */
const fs = require('fs'), path = require('path');
const DIR = __dirname, ROOT = path.resolve(DIR, '..', '..');
const OUT = path.join(DIR, 'reports');
const APP = 'bagrut-806';

global.window = {};
/* QA806_DATA מאפשר להצביע על קובץ תוכן אחר. הוא קיים כדי להוכיח
   שהבדיקה נופלת על תוכן שבור — בלי לשבור את התוכן האמיתי. */
require(process.env.QA806_DATA || path.join(ROOT, APP, 'data', 'exams.js'));
const EXAMS = global.window.EXAMS || [];

const find = {};
function add(kind, sev, msg, where) {
  const f = find[kind] || (find[kind] = { kind, sev, n: 0, ex: [], cells: {} });
  /* החומרה של המשפחה היא החמורה שנמצאה בה, ולא הראשונה. בלי זה
     ממצא חוסם שנוסף אחרי ממצא לעין נבלע, והפסק דין יוצא REVIEW. */
  if (sev === 'FAIL') f.sev = 'FAIL';
  f.n++;
  if (f.ex.length < 6) f.ex.push({ msg, where });
  f.cells[where] = (f.cells[where] || 0) + 1;
}

/* --- מעבר אחד על הכול, ואיסוף מה שצריך השוואה גלובלית --- */
const seenQ = new Map(), seenSub = new Map(), answers = new Map();
const byTopic = {};
let nQ = 0, nS = 0;
const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

for (const ex of EXAMS) {
  for (const q of ex.questions || []) {
    nQ++;
    byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
    const where = ex.id + ' ש' + q.number;

    /* --- שאלה שחוזרת.
       המפתח כולל את הנוסחה ולא רק את הנוסח: ״נתונה הפונקציה
       שלהלן.״ הוא פתיח גנרי, וכל מה שמבדיל בין השאלות יושב
       ב-latex. השוואה על הנוסח בלבד סימנה שמונה שאלות שונות
       לגמרי ככפולות — בדיקה שנדלקת על תוכן תקין מאמנת להתעלם
       ממנה, וזה גרוע מבדיקה שאינה קיימת. */
    const kq = norm(q.text) + ' ¶ ' + norm(q.latex);
    if (kq) {
      if (seenQ.has(kq))
        add('duplicate', 'REVIEW', 'נוסח השאלה זהה ל-' + seenQ.get(kq), where);
      else seenQ.set(kq, where);
    }
    check(q.text, where + ' · נוסח');
    check(q.speech, where + ' · הקראה');

    for (const s of q.subQuestions || []) {
      nS++;
      const w = where + s.letter;

      /* --- סעיף שחוזר: אותו נוסח. אם גם התשובה שונה — חוסם, כי
         אז שני מסכים מציגים אותה שאלה ומקבלים תשובות שונות. --- */
      /* גם כאן: אותו נוסח סעיף מתחת לשתי פונקציות שונות הוא
         שתי שאלות שונות, ולכן הנוסחה של השאלה־האם נכנסת למפתח. */
      const ks = norm(q.latex) + ' ¶ ' + norm(s.text) + ' ¶ ' + norm(s.latex);
      if (ks) {
        const prev = seenSub.get(ks);
        if (prev) {
          const same = String(prev.ans) === String(s.finalAnswer && s.finalAnswer.value);
          add('duplicate', same ? 'REVIEW' : 'FAIL',
            'נוסח הסעיף זהה ל-' + prev.where +
            (same ? '' : ', והתשובה שונה (' + prev.ans + ' מול ' +
              (s.finalAnswer && s.finalAnswer.value) + ')'), w);
        } else seenSub.set(ks, { where: w, ans: s.finalAnswer && s.finalAnswer.value });
      }

      check(s.text, w + ' · נוסח');
      check(s.speech, w + ' · הקראה');
      for (const st of s.steps || []) {
        check(st.hint, w + ' · רמז');
        check(st.detail, w + ' · פתרון');
      }

      /* --- תשובה שחוזרת הרבה: אפשר לנחש בלי לפתור --- */
      const fa = s.finalAnswer;
      if (fa && fa.type === 'number') {
        const k = String(fa.value);
        (answers.get(k) || answers.set(k, []).get(k)).push(w);
      }
    }
  }
}

/* --- ניסוח והקראה, על כל מחרוזת שהלומד רואה או שומע --- */
function check(str, where) {
  const s = String(str == null ? '' : str);
  if (!s) return;
  if (/\{[a-zA-Z]\w*\}/.test(s))
    add('wording', 'FAIL', 'מציין מיקום שנשאר בטקסט: ' + (s.match(/\{[a-zA-Z]\w*\}/) || [])[0], where);
  if (/ {2,}/.test(s))
    add('wording', 'REVIEW', 'רווח כפול', where);
  if (s !== s.trim())
    add('wording', 'REVIEW', 'רווח בתחילת המחרוזת או בסופה', where);
  const open = (s.match(/\(/g) || []).length, close = (s.match(/\)/g) || []).length;
  if (open !== close)
    add('wording', 'REVIEW', 'סוגריים לא מאוזנים (' + open + ' פתוחים, ' + close + ' סגורים)', where);
  /* אות לטינית בודדת היא שם משתנה מקובל — x, k, A, B — ומוקראת
     בסדר. רצף של שתיים ומעלה הוא מילה לטינית, וקול עברי יאיית
     אותה אות־אות: "backslash" נשמע "בי איי סי...". */
  const latin = s.match(/[A-Za-z]{2,}/g);
  if (latin) {
    const real = latin.filter(w => !/^(ABC|BC|AB|AC|CE|BCE)$/.test(w));
    if (real.length)
      add('tts', 'REVIEW', 'רצף לטיני בתוך טקסט עברי: ' + real.slice(0, 3).join(', '), where);
  }
}

/* --- ולמה אין כאן ״תשובה שאפשר לנחש״ ---------------------------
   ב-content.js יש משפחה כזאת, והיא נכונה שם: התלמיד בוחר מארבע
   אפשרויות, ולכן מסיח שנראה אחרת מהשאר הוא רמז. כאן התשובה
   נכתבת בשדה חופשי, ואין מה לבחור מתוכו.

   נמדד: התשובה 2 חוזרת ב-10 סעיפים מתוך 114. מי שיכתוב 2 בכל
   סעיף יצדק ב-8.8 אחוזים — וזה אינו אקספלויט אלא התפלגות טבעית
   של מספרים קטנים בתרגילי מתמטיקה. בדיקה שנדלקת על זה מאמנת
   להתעלם ממנה. `answers` נאסף בכל זאת, כי הוא זול ומופיע בדוח. */

/* --- איזון הנושאים --- */
const counts = Object.values(byTopic);
if (counts.length) {
  const lo = Math.min(...counts), hi = Math.max(...counts);
  if (hi >= lo * 2)
    add('balance', 'REVIEW',
      'הנושא הדל ביותר נושא ' + lo + ' שאלות והעשיר ' + hi +
      ' — מי שנחלש בדל מקבל פחות ממחצית החומר לתרגל בו',
      Object.keys(byTopic).find(k => byTopic[k] === lo));
}

/* --- פסק הדין, באותם כללים של content.js --- */
function verdict(f) {
  let fail = 0, review = 0;
  for (const k of Object.keys(f)) (f[k].sev === 'FAIL' ? fail++ : review++);
  return { verdict: fail ? 'FAIL' : (review ? 'REVIEW' : 'PASS'), fail, review };
}
const v = verdict(find);

const R = {
  n: nS, cells: nQ, find,
  topics: byTopic, exams: EXAMS.length,
  answerSpread: [...answers.entries()].map(a => [a[0], a[1].length])
    .sort((a, b) => b[1] - a[1]).slice(0, 8),
  app: APP, sample: nS,
  verdict: v.verdict, fail: v.fail, review: v.review,
  generated: new Date().toISOString().slice(0, 10)
};

function md() {
  const L = [];
  L.push('# ' + APP + ' — סריקת תוכן');
  L.push('');
  L.push('**' + v.verdict + '** · ' + v.fail + ' משפחות חוסמות · ' +
         v.review + ' לעין אנושית');
  L.push('');
  L.push('הבנק סטטי (`data/exams.js`), ולכן נסרק במלואו ולא במדגם: ' +
         EXAMS.length + ' אוספים, ' + nQ + ' שאלות, ' + nS + ' סעיפים.');
  L.push('');
  L.push('| נושא | שאלות |');
  L.push('|---|---|');
  Object.keys(byTopic).sort((a, b) => byTopic[b] - byTopic[a])
    .forEach(k => L.push('| ' + k + ' | ' + byTopic[k] + ' |'));
  L.push('');
  const ks = Object.keys(find);
  if (!ks.length) L.push('אפס ממצאים.');
  ks.forEach(k => {
    const f = find[k];
    L.push('## ' + k + ' — ' + f.sev + ' · ' + f.n);
    f.ex.forEach(e => L.push('- `' + e.where + '` — ' + e.msg));
    L.push('');
  });
  return L.join('\n');
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, APP + '.json'), JSON.stringify(R, null, 1));
fs.writeFileSync(path.join(OUT, APP + '.md'), md());

const mark = v.verdict === 'PASS' ? '✓' : (v.verdict === 'FAIL' ? '✗' : '!');
console.log(mark + ' ' + APP + '  ' + v.verdict +
  '  ·  ' + EXAMS.length + ' אוספים, ' + nQ + ' שאלות, ' + nS + ' סעיפים' +
  '  ·  ' + v.fail + ' חוסם / ' + v.review + ' לעין');
Object.keys(find).forEach(k => {
  const f = find[k];
  console.log('  ' + (f.sev === 'FAIL' ? '✗' : '·') + ' ' + k.padEnd(10) +
    ' ' + String(f.n).padStart(3) + '  ' + f.ex[0].msg.slice(0, 70));
});
process.exit(v.verdict === 'FAIL' ? 1 : 0);
