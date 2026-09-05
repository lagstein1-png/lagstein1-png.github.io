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
/* עוזרים ברמת הקובץ ש-normExpr נשען עליהם. grab מביא פונקציות
   בלבד, ולכן var נשלף בנפרד. הרשימה הזאת גדלה כש-app.js גדל —
   וזה בכוונה: בודק שמנחש מה חסר יריץ קוד שאינו הקוד שבאפליקציה. */
function grabVar(name) {
  const at = appSrc.indexOf('var ' + name + ' =');
  if (at < 0) return null;
  const end = appSrc.indexOf(';', at);
  return end < 0 ? null : appSrc.slice(at, end + 1);
}
const VARS = ['LHS_NAME'];
const NEEDED = ['parseNum', 'normText', 'normExpr', 'checkAnswer', 'dropMul', 'stripLhs'];
const srcs = VARS.map(grabVar).filter(Boolean).concat(NEEDED.map(grab));
const missing = NEEDED.filter(n => !grab(n));
if (missing.length) {
  console.log('✗ לא הצלחתי לחלץ מ-app.js: ' +
    missing.join(', ') +
    '\n  הבודק מסרב לנחש. אם הפונקציות שונו — לעדכן את exam806.js.');
  process.exit(1);
}
const sandbox = {};
vm.runInNewContext(srcs.join('\n'), sandbox);
/* הרצה יבשה אחת לפני התוכן. בלעדיה עוזר חדש ב-app.js שלא נשלף כאן
   מפיל את הבודק באמצע עם stack trace, ומי שקורא את הפלט חושב
   שהתוכן שבור. */
try { sandbox.checkAnswer({ type: 'number', value: 1, tolerance: 0 }, '1'); }
catch (e) {
  console.log('✗ הפונקציות שנשלפו מ-app.js אינן רצות: ' + e.message +
    '\n  כנראה נוסף להן עוזר חדש. להוסיף אותו ל-NEEDED או ל-VARS ב-exam806.js.');
  process.exit(1);
}
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

/* אוצר המילים של הנושאים — רשימה סגורה בכוונה.

   `recordResult` שומר את דוח הנושאים החלשים כ-`d.weak[q.topic]`,
   כלומר מחרוזת הנושא היא המפתח. שני שמות לאותו נושא מפצלים תלמיד
   אחד לשתי שורות, וכל מחצית עלולה ליפול מתחת לסף ולא להיות מסומנת
   כלל — כך היה כאן עם ״אינטגרל״ מול ״חשבון אינטגרלי״ ועם ״חקירת
   פונקציה״ מול ״חשבון דיפרנציאלי״.

   נושא חדש מוסיפים כאן ביד. זו לא בירוקרטיה: הוספה מודעת היא
   בדיוק מה שמונע את הסחיפה, ושם שנכתב בהיסח הדעת נתפס. */
const TOPICS = [
  'הסתברות', 'סדרות', 'חשבון דיפרנציאלי', 'חשבון אינטגרלי',
  'טריגונומטריה', 'גדילה ודעיכה', 'גאומטריה אנליטית', 'בעיות קיצון'
];

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
    else if (TOPICS.indexOf(str(q.topic)) < 0)
      fail('topic "' + str(q.topic) + '" אינו באוצר המילים. שם נרדף לנושא ' +
        'קיים מפצל את דוח הנושאים החלשים לשתי שורות. ' +
        'אם זה באמת נושא חדש — להוסיף אותו ל-TOPICS ב-exam806.js');
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
          /* `checkAnswer` יוצא בענף המספרי לפני שהוא מגיע ל-accept,
             ולכן accept על מספר אינו נקרא כלל. מי שכתב אותו מאמין
             שהוא הרחיב את מה שמתקבל, וזה בדיוק סוג הבאג שאינו
             מתפוצץ: נבדק בפועל — accept:["חמש"] על value 5 מחזיר
             false. הסובלנות במספרים היא tolerance, ו-parseNum כבר
             מקבל שבר, אחוז ופסיק עשרוני בלי שיירשמו. */
          if (fa.accept != null)
            fail('accept על type:"number" אינו נקרא — checkAnswer מכריע לפי tolerance. ' +
              'שבר, אחוז ופסיק עשרוני כבר מתקבלים ב-parseNum');
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
        /* כאן עמדה בדיקה שהזינה כל ניסוח מ-accept חזרה ל-checkAnswer
           וציפתה שיתקבל. היא לא יכלה להיכשל לעולם: `checkAnswer`
           בונה את רשימת המותרים כ-`[value].concat(accept)` ואז
           מנרמל אותה, ולכן כל איבר ברשימה מתקבל מעצם היותו בה.
           בדיקה שהתשובה עליה היא תמיד "כן" נראית כמו רשת ביטחון
           ואינה אחת.

           מה שכן יכול להישבר הוא ההפך: ניסוח שמנורמל בדיוק כמו
           ה-`value` או כמו ניסוח קודם ברשימה. הוא נראה כמו סובלנות
           נוספת, הוא נספר בעין ככזה, ואינו מוסיף ולו תשובה אחת
           שלא התקבלה קודם. נבדק בפועל מול הקוד: "עולה.", "עולה!!"
           ו-"  עולה  " כולם מנורמלים ל-"עולה".

           זו הערה ולא ממצא, בכוונה: התלמיד שכותב את הניסוח הזה
           **כן** מתקבל — דרך ה-`value`. מה שנשבר הוא רק האמונה של
           מי שכתב את הרשימה, שסבר שהוסיף ניסוח וקיבל שורה מתה.
           דבר שאינו פוגע בתלמיד אינו מצדיק חבילת בדיקות אדומה. */
        const norm = fa.type === 'expression' ? sandbox.normExpr : sandbox.normText;
        const seen = new Map([[norm(fa.value), 'value']]);
        for (const a of (fa.accept || [])) {
          if (typeof a !== 'string') { fail('accept מכיל ערך שאינו מחרוזת'); continue; }
          const k = norm(a);
          if (seen.has(k))
            note('הניסוח "' + a + '" ב-accept זהה ל-' + seen.get(k) +
              ' אחרי נרמול — שורה שאינה מוסיפה תשובה');
          else seen.set(k, '"' + a + '"');
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
         שכבר מופיע בנתוני השאלה אינו ממצא — הוא נתון, לא תשובה.

         וההתאמה נעשית בגבולות מספר ולא כתת־מחרוזת: התשובה 80
         נמצאת בתוך 180, ורמז שאומר ״סכום הזוויות במשולש הוא 180
         מעלות״ נדלק בטעות. חיפוש תת־מחרוזת על מספרים מייצר ממצא
         כוזב בכל פעם שהתשובה היא סיפא או רישא של מספר אחר. */
      if (fa && has(fa.value !== undefined ? String(fa.value) : '')) {
        const ans = String(fa.value).trim();
        const inside = (hay) => {
          let from = 0, at;
          while ((at = hay.indexOf(ans, from)) >= 0) {
            const before = hay[at - 1], after = hay[at + ans.length];
            const digit = c => c !== undefined && /[0-9.,]/.test(c);
            if (!digit(before) && !digit(after)) return true;
            from = at + 1;
          }
          return false;
        };
        const given = (str(q.text) + ' ' + str(s.text) + ' ' + str(q.latex) + ' ' + str(s.latex));
        const distinctive = ans.length >= 2 && !inside(given);
        if (distinctive) {
          steps.forEach((st, i) => {
            if (inside(str(st.hint)))
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
