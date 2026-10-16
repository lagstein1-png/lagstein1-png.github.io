/* ============================================================
   hebank.js — סריקת התוכן של `hebrew`
   ------------------------------------------------------------
   ‏`content.js` דורש שלד `topic()/Q()` בתוך `index.html`, ו-`hebrew`
   מחזיקה את המאגר ב-`bank.json` שנטען ב-`fetch`. לכן היא הייתה
   האפליקציה הציבורית האחרונה עם מאגר שאלות שאיש לא סרק (O-143),
   ו-`stage.js` הצהיר על כך בכל ריצה בלי להפיל.

     node .claude/qa/hebank.js
     node .claude/qa/hebank.js --check      (אותו דבר; לעקביות עם שאר הכלים)
     QA_BANK=<נתיב> node .claude/qa/hebank.js   מאגר חלופי — להוכחת נפילה

   המאגר שטוח, ואין בו `buildQ` להריץ — נסרק הכול, ולא במדגם.
   שני חלקים ושתי סכימות:

     practice       `{tracks, topic, level, passage, prompt, options,
                    correct, hint, explain}` — `prompt`, `hint` ו-`explain`
                    הם `{he,ar,ru,en}` (O-232, 16.10.2026). אפשרות היא
                    `{he,ar,ru,en}` כשהיא תשובה על הבנה, ומחרוזת עברית
                    כשהיא החומר הנבדק (מילה, צורה, משפט). `passage` נשאר
                    עברית: הוא הטקסט שקוראים.
     topics[].levels  פריטי `concept` ו-`scenario`, ו-`conceptExtras`
                    לצדם — **ארבע שפות**.
   שלמות ארבע השפות נבדקת בשני החלקים. הבדיקות האחרות (ריק, כפילות,
   רמז שמסגיר) רצות על העברית, `he`.

   הדוח נכתב ל-`reports/hebrew.json` ו-`.md` באותה צורה שהשאר
   כותבים, כדי ש-`stage.js` ו-`fresh.js` יקראו אותו כמו כל אחד.
   ============================================================ */
const fs = require('fs'), path = require('path');
const DIR = __dirname, ROOT = path.resolve(DIR, '..', '..');
const OUT = path.join(DIR, 'reports');
const APP = 'hebrew';
const BANK = process.env.QA_BANK || path.join(ROOT, APP, 'bank.json');

const B = JSON.parse(fs.readFileSync(BANK, 'utf8'));
const items = Array.isArray(B.practice) ? B.practice : [];

const find = {};
function add(kind, sev, msg, where) {
  const f = find[kind] || (find[kind] = { kind, sev, n: 0, ex: [], cells: {} });
  if (sev === 'FAIL') f.sev = 'FAIL';
  f.n++;
  if (f.ex.length < 6) f.ex.push({ msg, where });
  f.cells[where] = (f.cells[where] || 0) + 1;
}
const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
/* שדה של practice הוא מחרוזת עברית או `{he,ar,ru,en}`; הבדיקות על התוכן
   רצות על העברית. בלי זה `norm` של אובייקט הוא "[object Object]",
   וכל האפשרויות נראות זהות. */
const heOf = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v.he : v;

/* אותם ספים שבהם `content.js` מודד עברית. */
const LIM_OPT = 120, LIM_Q = 300;
const BROKEN = /�|â€|Ã[\u0080-¿]/;
/* `\b` ב-JavaScript מוגדר על `\w`, שאינו כולל עברית — ולכן הצורה
   שב-`content.js` היא `(^|\s)(\p{L}{2,})\s+\2(\s|$)`, ואותה
   רשימת היוצאים מן הכלל (״איבר איבר״ הוא ניסוח מתמטי תקני,
   ״שבעה שבעה״ ציטוט מקראי). */
const DBL = /(^|\s)(\p{L}{2,})\s+\2(\s|$)/u;
const DBL_OK = ['איבר איבר', 'פעם פעם', 'לאט לאט', 'מעט מעט', 'יום יום', 'שנה שנה',
                'שבעה שבעה', 'שניים שניים', 'לך לך'];

const seen = new Map(), cells = {};
let n = 0;

for (let i = 0; i < items.length; i++) {
  const q = items[i] || {};
  const cell = norm(q.topic) + ' L' + q.level;
  const where = cell + ' #' + (i + 1);
  cells[cell] = (cells[cell] || 0) + 1;
  n++;

  const opts = Array.isArray(q.options) ? q.options : [];

  /* --- 1. התשובה --- */
  if (!(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < opts.length))
    add('answer-index', 'FAIL', 'correct=' + q.correct + ' מחוץ לטווח ' + opts.length + ' האפשרויות', where);

  /* --- 2. האפשרויות --- */
  if (opts.length < 2) add('too-few-options', 'FAIL', opts.length + ' אפשרויות', where);
  else if (opts.length > 4) add('too-many-options', 'FAIL', opts.length + ' אפשרויות — המקלדת מקצה 1–4', where);
  const tx = opts.map(o => norm(heOf(o)));
  if (new Set(tx).size !== tx.length)
    add('dup-option', 'FAIL', 'שתי אפשרויות זהות על המסך: ' + tx.join(' | '), where);
  for (const x of tx) {
    if (!x) add('empty-option', 'FAIL', 'אפשרות ריקה', where);
    if (x.length > LIM_OPT) add('long-option', 'REVIEW', x.length + ' תווים באפשרות', where);
  }

  /* --- 3. ניחוש לפי אורך: הקצה חייב להיות משותף, אחרת הוא רמז.
         נמדד לכל תא בסופו, כמו ב-content.js. --- */

  /* --- 4. שדות שהלומד מקבל --- */
  const qP = heOf(q.prompt), qH = heOf(q.hint), qE = heOf(q.explain);
  if (!norm(qP)) add('empty-question', 'FAIL', 'אין prompt', where);
  if (!norm(qH)) add('no-hint', 'FAIL', 'אין hint', where);
  if (!norm(qE)) add('no-explanation', 'FAIL', 'אין explain', where);

  /* --- 5. ניסוח --- */
  for (const [kind, v] of [['prompt', qP], ['hint', qH], ['explain', qE], ['passage', q.passage]]) {
    const s = norm(v);
    if (!s) continue;
    if (BROKEN.test(s)) add('broken-text', 'FAIL', kind + ': ' + s.slice(0, 70), where);
    if (/ {2,}/.test(String(v))) add('double-space', 'REVIEW', kind + ': ' + s.slice(0, 70), where);
    const o = (s.match(/[({\[]/g) || []).length, c = (s.match(/[)}\]]/g) || []).length;
    if (o !== c) add('unbalanced-brackets', 'REVIEW', kind + ': ' + s.slice(0, 70), where);
    const d = s.match(DBL);
    if (d && DBL_OK.indexOf(d[0].trim()) < 0)
      add('doubled-word', 'REVIEW', kind + ': …' + d[0].trim() + '…', where);
  }
  if (norm(qP).length > LIM_Q)
    add('long-question', 'REVIEW', norm(qP).length + ' תווים בשאלה', where);

  /* --- 6. שאלה כפולה, וכפולה־סותרת --- */
  const key = norm(qP) + ' ¶ ' + norm(q.passage) + ' ¶ ' + tx.slice().sort().join(' ¦ ');
  if (key.replace(/[¶¦ ]/g, '')) {
    const prev = seen.get(key);
    if (prev) {
      const same = prev.ans === tx[q.correct];
      add('duplicate', same ? 'REVIEW' : 'FAIL',
        'אותה שאלה ואותן אפשרויות כמו ' + prev.where +
        (same ? '' : ', והתשובה שונה ("' + prev.ans + '" מול "' + tx[q.correct] + '")'), where);
    } else seen.set(key, { where, ans: tx[q.correct] });
  }

  /* --- 7. ההסבר מסגיר את התשובה כשהוא מצטט רק אותה.
         זה תקין ברוב המקרים (ההסבר נקרא **אחרי** המענה), ולכן
         אינו נמדד כאן. מה שכן נמדד הוא ההפך: רמז שאומר את
         התשובה, והוא נקרא **לפני**. --- */
  const h = norm(qH), ans = tx[q.correct];
  if (h && ans && ans.length >= 3 && h.indexOf(ans) >= 0)
    add('answer-in-hint', 'FAIL', 'הרמז מכיל את התשובה במילים שלה: "' + ans + '"', where);
}

/* --- החלק הרב־לשוני: מושגים, תרחישים, תוספות — ותרגול ------------
   6.10.2026: `topics[].levels` ו-`conceptExtras` כתובים בארבע שפות —
   וזה החלק שהלומד קורא **לפני** התרגול. חסר תרגום שם הוא מסך ריק,
   לא אי־נוחות. 16.10.2026 (O-232): גם `practice`, ראו למטה. */
const LGS = ['he', 'ar', 'ru', 'en'];
function four(obj, label, where) {
  if (!obj) return;
  const miss = LGS.filter(lg => {
    const v = obj[lg];
    if (Array.isArray(v)) return !v.length || v.some(x => !norm(x));
    return !norm(v);
  });
  if (miss.length === LGS.length) add('lang-missing', 'FAIL', 'אין ' + label + ' באף שפה', where);
  else if (miss.length) add('lang-missing', 'FAIL', 'חסר ' + label + ' ב-' + miss.join(','), where);
  /* **ואין כאן `lang-untranslated`, בכוונה.** האפליקציה הזאת מלמדת
     עברית, ולכן ״נמט تصريف الفعل العبري، مثل קל أو הפעיל״ הוא
     הגדרה ערבית תקינה לגמרי: המילה העברית היא החומר, והערבית
     היא ההסבר. נמדד — שש הגדרות כאלה (קל, הפעיל, כתיבה, לכן).
     זה בדיוק מה ש-`LEARN="he"` פוטר ממנו ב-`ulpan`. */
}
for (const t of (B.topics || [])) {
  four(t.name, 'שם הנושא', t.id);
  four(t.description, 'תיאור הנושא', t.id);
  (t.levels || []).forEach((lv, li) => (lv || []).forEach((x, xi) => {
    const w = t.id + ' L' + (li + 1) + ' #' + (xi + 1);
    if (x.type === 'concept') { four(x.name, 'שם המושג', w); four(x.def, 'הגדרת המושג', w) }
    else if (x.type === 'scenario') {
      four(x.lines, 'שורות התרחיש', w);
      (x.questions || []).forEach((qq, qi) => {
        const pre = 'תרחיש, שאלה ' + (qi + 1) + ': ';
        four(qq.prompt, pre + 'נוסח', w);
        four(qq.answer, pre + 'תשובה', w);
        (qq.wrong || []).forEach((ww, wi) => four(ww, pre + 'מסיח ' + (wi + 1), w));
      });
    }
  }));
}
(B.conceptExtras || []).forEach((x, i) => {
  const w = 'conceptExtras #' + (i + 1) + ' (' + norm(x.topic) + ')';
  four(x.name, 'שם המושג', w); four(x.def, 'ההגדרה', w);
});

/* --- practice בארבע שפות (O-232) -------------------------------------
   128 שאלות היו בעברית בלבד עד 16.10.2026, וההערה בראש הקובץ קראה לזה
   ״עברית בלבד״ בלי שום מסמך שמראה שזו הכרעה. `app.js` מציג כל שדה דרך
   `t()`, ולכן מחרוזת עברית שם אינה נשברת — היא פשוט מוצגת בעברית
   ללומד שבחר ערבית. כלומר שום דבר על המסך אינו מתריע, וזו הבדיקה.

   ‏`prompt`, `hint`, `explain` — חייבים `{he,ar,ru,en}` מלא.
   ‏אפשרות — מחרוזת עברית מותרת: זה החומר הנבדק (״הולכים״, ״כ־ת־ב״,
   משפט לדוגמה). אבל אפשרות שהיא אובייקט חייבת את ארבע השפות, ו**אין
   ערבוב**: שאלה שחלק מהאפשרויות שלה מתורגם וחלק לא מציגה רשימה חצי
   עברית, ולומד לא יבין למה. **מה שהבדיקה אינה יכולה לדעת:** אם
   אפשרות שנכתבה כמחרוזת היא באמת חומר, או תשובת הבנה ששכחו לתרגם.
   זה נבדק בקריאה. */
items.forEach((q, i) => {
  const w = norm(q.topic) + ' L' + q.level + ' #' + (i + 1);
  for (const k of ['prompt', 'hint', 'explain']) {
    const v = q[k];
    if (typeof v === 'string') { if (norm(v)) add('lang-missing', 'FAIL', 'practice: ' + k + ' בעברית בלבד', w); }
    else four(v, 'practice: ' + k, w);
  }
  const opts = Array.isArray(q.options) ? q.options : [];
  const nObj = opts.filter(o => o && typeof o === 'object').length;
  if (nObj && nObj < opts.length)
    add('lang-mixed-options', 'FAIL', 'practice: ' + nObj + ' מתוך ' + opts.length + ' אפשרויות מתורגמות, השאר עברית', w);
  opts.forEach((o, j) => { if (o && typeof o === 'object') four(o, 'practice: אפשרות ' + (j + 1), w); });
});

/* --- ניחוש לפי אורך, לכל תא --- */
const byCell = {};
items.forEach((q, i) => {
  const cell = norm(q.topic) + ' L' + q.level;
  (byCell[cell] || (byCell[cell] = [])).push(q);
});
for (const cell of Object.keys(byCell)) {
  const list = byCell[cell];
  let win = 0;
  for (const q of list) {
    const tx = (q.options || []).map(norm);
    if (!tx.length) continue;
    const mx = Math.max(...tx.map(x => x.length));
    const share = tx.filter(x => x.length === mx).length;
    if (tx[q.correct] != null && tx[q.correct].length === mx) win += 1 / share;
  }
  const pct = Math.round(win / list.length * 100);
  if (pct > 70)
    add('longest-answer', 'REVIEW',
      'מי שבוחר תמיד את האפשרות הארוכה ביותר קולע ב-' + pct + '% מהשאלות (ניחוש עיוור: 25%)', cell);
}

/* --- צפיפות: תא דק הוא תא שהלומד ממצה --- */
const thin = Object.keys(cells).filter(k => cells[k] < 6);
if (thin.length)
  add('thin-cell', 'REVIEW',
    thin.length + ' תאים נושאים פחות משש שאלות: ' + thin.join(', '), thin[0]);

function verdict(f) {
  let fail = 0, review = 0;
  for (const k of Object.keys(f)) (f[k].sev === 'FAIL' ? fail++ : review++);
  return { verdict: fail ? 'FAIL' : (review ? 'REVIEW' : 'PASS'), fail, review };
}
const v = verdict(find);

const R = {
  n, cells: Object.keys(cells).length, find,
  topics: cells, app: APP, sample: n,
  verdict: v.verdict, fail: v.fail, review: v.review,
  generated: new Date().toISOString().slice(0, 10),
  sig: require('./sig.js').sigOf(APP)
};
/* אותה חתימה — אותו תאריך, והקובץ נשאר זהה בייט לבייט. */
try {
  const prev = JSON.parse(fs.readFileSync(path.join(OUT, APP + '.json'), 'utf8'));
  if (prev.sig === R.sig && prev.generated) R.generated = prev.generated;
} catch (e) { /* אין דוח קודם */ }

function md() {
  const L = [];
  L.push('# ' + APP + ' — סריקת תוכן');
  L.push('');
  L.push('**' + v.verdict + '** · ' + v.fail + ' משפחות חוסמות · ' + v.review + ' לעין אנושית');
  L.push('');
  L.push('המאגר סטטי (`bank.json`), ולכן נסרק במלואו ולא במדגם: ' +
         n + ' שאלות ב-' + Object.keys(cells).length + ' תאים.');
  L.push('');
  L.push('| תא | שאלות |');
  L.push('|---|---|');
  Object.keys(cells).sort((a, b) => cells[b] - cells[a])
    .forEach(k => L.push('| ' + k + ' | ' + cells[k] + ' |'));
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
console.log(mark + ' ' + APP + '  ' + v.verdict + '  ·  ' + n + ' שאלות, ' +
  Object.keys(cells).length + ' תאים  ·  ' + v.fail + ' חוסם / ' + v.review + ' לעין');
Object.keys(find).forEach(k => {
  const f = find[k];
  console.log('  ' + (f.sev === 'FAIL' ? '✗' : '·') + ' ' + k.padEnd(12) +
    ' ' + String(f.n).padStart(3) + '  ' + f.ex[0].msg.slice(0, 70));
});
process.exit(v.verdict === 'FAIL' ? 1 : 0);
