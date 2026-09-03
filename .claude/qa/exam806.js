/* בודק התוכן של bagrut-806.

   כל שאר האפליקציות נבדקות ב-entropy ו-options, שמגרילות שאלות
   ממחולל. ל-806 אין מחולל: התוכן נכתב ביד, שאלה־שאלה, ולכן אף
   אחד מהכלים האלה אינו חל עליה. עד היום היא הייתה האפליקציה
   היחידה שנכנס אליה תוכן בלי רשת ביטחון.

   הבודק אינו מעתיק את הלוגיקה של האפליקציה — הוא מחלץ את
   `parseNum`, `normText`, `normExpr` ו-`checkAnswer` מתוך
   `app.js` עצמו ומריץ אותן. העתק היה נפרד מהמקור ביום שהמקור
   ישתנה, וזו בדיוק הבעיה ש-exam.js קיים בשבילה.
*/
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const APP = path.join(ROOT, 'bagrut-806', 'app.js');
const DATA = path.join(ROOT, 'bagrut-806', 'data', 'exams.js');

/* --- התוכן ------------------------------------------------------ */
const win = {};
vm.runInNewContext(fs.readFileSync(DATA, 'utf8'), { window: win });
const EXAMS = win.EXAMS;
if (!Array.isArray(EXAMS)) { console.log('✗ data/exams.js לא הגדיר window.EXAMS כמערך'); process.exit(1); }

/* --- הפונקציות האמיתיות מתוך app.js ------------------------------ */
const appSrc = fs.readFileSync(APP, 'utf8');
function grab(name) {
  /* מהשורה "function name(" ועד הסוגר המסולסל שסוגר אותה, בספירה */
  const at = appSrc.indexOf('function ' + name + '(');
  if (at < 0) return null;
  let i = appSrc.indexOf('{', at), depth = 0;
  for (let j = i; j < appSrc.length; j++) {
    const c = appSrc[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (!depth) return appSrc.slice(at, j + 1); }
  }
  return null;
}
const NEEDED = ['parseNum', 'normText', 'normExpr', 'checkAnswer'];
const srcs = NEEDED.map(grab);
if (srcs.some(s => !s)) {
  console.log('✗ לא הצלחתי לחלץ מ-app.js: ' +
    NEEDED.filter((n, i) => !srcs[i]).join(', ') +
    '\n  הבודק מסרב לנחש. אם הפונקציות שונו — לעדכן את exam806.js.');
  process.exit(1);
}
const sandbox = {};
vm.runInNewContext(srcs.join('\n'), sandbox);
const checkAnswer = sandbox.checkAnswer;

/* --- ממצאים ------------------------------------------------------ */
let bad = 0, warn = 0;
const where = [];
function fail(msg) { console.log('✗ ' + where.join(' › ') + ': ' + msg); bad++; }
function note(msg) { console.log('· ' + where.join(' › ') + ': ' + msg); warn++; }

const str = v => typeof v === 'string' ? v.trim() : '';
const has = v => str(v).length > 0;
/* LaTeX שדלף לשדה שאמור להיות מילים. `\` הוא הסימן החד־משמעי;
   `$` הוא תוחם נוסחה. שניהם לא אמורים להיאמר בקול. */
const looksLatex = s => /[\\$]/.test(String(s || ''));

/* --- 1. שלמות הסכימה, 2. latex בלי speech, 3. תשובה שנבדקת מול עצמה --- */
const ids = new Set();
for (const ex of EXAMS) {
  where.length = 0;
  where.push(str(ex.id) || '(בחינה בלי id)');

  if (!has(ex.id)) fail('אין id');
  else if (ids.has(ex.id)) fail('id כפול — שתי בחינות נושאות אותו מזהה');
  else ids.add(ex.id);

  if (typeof ex.year !== 'number') fail('year אינו מספר');
  if (!has(ex.season)) fail('אין season');
  if (!has(ex.moed)) fail('אין moed');
  if (!(Number(ex.durationMinutes) > 0)) fail('durationMinutes אינו מספר חיובי');

  const demo = str(ex.season) === 'הדגמה';
  const qs = Array.isArray(ex.questions) ? ex.questions : [];
  if (!qs.length) { fail('אין questions'); continue; }

  let pts = 0;
  const numbers = new Set();

  for (const q of qs) {
    where.length = 1;
    where.push('שאלה ' + (q.number == null ? '?' : q.number));

    if (q.number == null) fail('אין number');
    else if (numbers.has(q.number)) fail('מספר שאלה כפול בתוך אותה בחינה');
    else numbers.add(q.number);

    if (!has(q.topic)) fail('אין topic — דוח הנושאים החלשים נבנה ממנו');
    if (!has(q.text)) fail('אין text');
    else if (looksLatex(q.text)) fail('ב-text יש סימני LaTeX. הנוסחאות שייכות ל-latex');

    /* הכלל שהקובץ עצמו קורא לו "אסור לשבור" */
    if (has(q.latex) && !has(q.speech))
      fail('יש latex ואין speech — הנוסחה הזאת לא תוקרא');
    if (has(q.speech) && looksLatex(q.speech))
      fail('ב-speech יש סימני LaTeX. מנוע ההקראה יאמר אותם כמו שהם');
    if (has(q.speech) && !has(q.latex))
      note('יש speech בלי latex — אין נוסחה להקריא');

    const subs = Array.isArray(q.subQuestions) ? q.subQuestions : [];
    if (!subs.length) { fail('אין subQuestions'); continue; }
    const letters = new Set();

    for (const s of subs) {
      where.length = 2;
      where.push('סעיף ' + (str(s.letter) || '?'));

      if (!has(s.letter)) fail('אין letter');
      else if (letters.has(s.letter)) fail('אות סעיף כפולה בתוך אותה שאלה');
      else letters.add(s.letter);

      if (!has(s.text)) fail('אין text');
      else if (looksLatex(s.text)) fail('ב-text יש סימני LaTeX');

      if (!(Number(s.points) > 0)) fail('points אינו מספר חיובי');
      else pts += Number(s.points);

      if (has(s.latex) && !has(s.speech))
        fail('יש latex ואין speech — הנוסחה הזאת לא תוקרא');
      if (has(s.speech) && looksLatex(s.speech))
        fail('ב-speech יש סימני LaTeX');
      if (has(s.speech) && !has(s.latex))
        note('יש speech בלי latex');

      /* --- התשובה הסופית --- */
      const fa = s.finalAnswer;
      if (!fa) { fail('אין finalAnswer — הסעיף לא ניתן לבדיקה'); }
      else if (['number', 'expression', 'text'].indexOf(fa.type) < 0) {
        fail('finalAnswer.type הוא "' + fa.type + '" ואינו number / expression / text');
      } else if (fa.type === 'number') {
        if (typeof fa.value !== 'number' || !isFinite(fa.value)) fail('finalAnswer.value אינו מספר');
        else {
          const tol = typeof fa.tolerance === 'number' ? fa.tolerance : 0;
          if (!tol && !Number.isInteger(fa.value))
            note('tolerance 0 על תשובה שאינה שלמה (' + fa.value + ') — מי שעיגל ייפסל');
          if (tol < 0) fail('tolerance שלילי');
          /* טווח שבולע חצי מהתשובה מקבל גם מסלולי פתרון שגויים */
          if (tol > 0 && Math.abs(fa.value) > 0 && tol >= Math.abs(fa.value) * 0.5)
            fail('tolerance ' + tol + ' רחב מחצי מהתשובה (' + fa.value + ') — הוא יקבל גם פתרון שגוי');
          /* התשובה הרשומה חייבת לעבור את הבודק של האפליקציה עצמה */
          if (!checkAnswer(fa, String(fa.value)).ok)
            fail('התשובה הרשומה עצמה נכשלת ב-checkAnswer של האפליקציה');
        }
      } else {
        if (!has(fa.value)) fail('finalAnswer.value ריק');
        else if (!checkAnswer(fa, fa.value).ok)
          fail('התשובה הרשומה עצמה נכשלת ב-checkAnswer של האפליקציה');
        for (const a of (fa.accept || [])) {
          if (!checkAnswer(fa, a).ok)
            fail('הניסוח החלופי "' + a + '" ב-accept נדחה על ידי checkAnswer');
        }
      }

      /* --- השלבים, והרמז שאינו אמור לפתור --- */
      const steps = Array.isArray(s.steps) ? s.steps : [];
      if (!steps.length) { fail('אין steps — אין רמז ואין פתרון'); continue; }

      steps.forEach((st, i) => {
        const tag = 'שלב ' + (i + 1);
        if (!has(st.hint)) fail(tag + ': אין hint');
        if (!has(st.detail)) fail(tag + ': אין detail');
        if (has(st.hint) && has(st.detail) && str(st.hint) === str(st.detail))
          fail(tag + ': ה-hint וה-detail זהים — הרמז הוא הפתרון');
      });

      /* רמז שמכיל את התשובה הסופית פותר במקום התלמיד. מספר
         שכבר מופיע בנתוני השאלה אינו ממצא — הוא נתון, לא תשובה. */
      if (fa && has(fa.value !== undefined ? String(fa.value) : '')) {
        const ans = String(fa.value).trim();
        const given = (str(q.text) + ' ' + str(s.text) + ' ' + str(q.latex) + ' ' + str(s.latex));
        const distinctive = ans.length >= 2 && given.indexOf(ans) < 0;
        if (distinctive) {
          steps.forEach((st, i) => {
            if (str(st.hint).indexOf(ans) >= 0)
              fail('שלב ' + (i + 1) + ': ה-hint מכיל את התשובה הסופית (' + ans + ')');
          });
        }
      }
    }
  }

  where.length = 1;
  if (demo) {
    console.log('· ' + where[0] + ': בחינת הדגמה, ' + qs.length + ' שאלות, ' + pts + ' נקודות');
  } else {
    console.log('✓ ' + where[0] + ': בחינה אמיתית, ' + qs.length + ' שאלות, ' + pts + ' נקודות');
    /* בחינה שמתיימרת להיות אמיתית חייבת להיות שלמה. בחינת הדגמה
       חלקית במהותה, ולכן הכלל חל רק על מי שאינה מסומנת ככזאת. */
    if (pts !== 100) fail('בחינה שאינה מסומנת "הדגמה" וסכום הנקודות בה ' + pts + ' ולא 100');
  }
}

where.length = 0;
console.log('\n' + EXAMS.length + ' בחינות נבדקו, ' + bad + ' ממצאים' +
  (warn ? ', ' + warn + ' הערות' : ''));
process.exit(bad ? 1 : 0);
