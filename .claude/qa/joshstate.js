/* =====================================================================
   joshstate.js — הגלאי נשאר גלאי, ומודד את מה שהוא מבטיח

     node .claude/qa/joshstate.js

   **למה שתי חבילות ולא אחת.** `joshface.js` בודק קוד בלבד, ודי לו:
   שכבת תצוגה שלא קוראת לרשת היא שכבת תצוגה. גלאי הוא דבר אחר —
   הוא יכול להיות נקי לחלוטין מכל איסור ועדיין **לדווח לא נכון**,
   וזה כישלון חמור יותר: `slow` שנדלק על כל לומד שקורא לאט הוא
   תווית, בדיוק מה שהקובץ נכתב כדי למנוע.

   לכן כאן שני חלקים:

     א. שבע שאלות על הקוד — מה שאסור לגלאי להיות
     ב. שבעה־עשר תרחישים שמריצים אותו — מה שהוא חייב לדווח

   חלק ב׳ מריץ כל תרחיש ב-`vm` נפרד. המודול מחזיק מצב גלובלי
   (`log`, `live`), ולכן תרחיש שרץ אחרי תרחיש היה יורש את השובל
   שלו — וזו בדיוק הדרך שבה חבילת בדיקות יוצאת ירוקה על מצב
   שמעולם לא נבדק.

   ── התרחיש שהוא הסיבה לקובץ ──

   תרחיש 8: לומד שכל תשובותיו לוקחות עשרים שניות, באופן עקבי.
   הוא **חייב** לצאת `ok`. קהל היעד כאן הוא דיסלקציה, ADHD
   ועולים חדשים, ואם קריאה איטית מדליקה `slow` אז הגלאי מתאר את
   האדם ולא את הרגע. מה ש-`slow` אמור לתפוס הוא **שינוי** אצל
   אותו לומד — תרחיש 7.

   הוכחת נפילה, 13.9.2026 — שש הזרקות, כל אחת לעותק זמני:

     SLOW_FACTOR 2.2 → 1.0            ✗ 8
     SLOW_MIN 4 → 1                   ✗ 9
     רמז אינו נרשם                     ✗ 11
     שער המבחן הוסר מ-answer          ✗ 12, 13
     frustrated הוסר                  ✗ 4
     median(t.slice(0,-1)) → median(t) ✗ 16

   **והשורה האחרונה נוספה מפני שההזרקה השישית יצאה ירוקה.**
   בניסוח הראשון לא היה תרחיש 16, ואף בדיקה לא נעלה את הכלל
   הזה; וגם תרחיש 8 עצמו היה חלש — שישה זמנים זהים עוברים בכל
   מקדם. שניהם תוקנו לפני המיזוג. הפלטים ב-`FINDINGS.md`.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const FILE = process.argv[2] || 'tutor/josh-state.js';
/* `resolve` ולא `join` — נתיב מוחלט חייב לנצח, אחרת הוכחת נפילה על
   עותק זמני קוראת בשקט את הקובץ האמיתי ויוצאת ירוקה. אותו נימוק
   בדיוק כמו ב-`joshface.js`. */
const full = path.resolve(ROOT, FILE);

if (!fs.existsSync(full)) {
  console.log('✗ ' + FILE + ' אינו קיים');
  process.exit(1);
}
const src = fs.readFileSync(full, 'utf8');
let bad = 0;
const fail = m => { console.log('✗ ' + m); bad++ };

/* ------------------------------------------------------------------
   א. הקוד

   קריאה בפועל ולא אזכור: הקובץ מתאר בהערותיו את מה שאסור לו
   לעשות, ותבנית שמפילה אותו על ההסבר שלו עצמו מאמנת את העין
   להתעלם. אותה מסקנה כמו ב-`josh.js` וב-`brain.js`.
   ------------------------------------------------------------------ */
const call = n => new RegExp('(?:^|[^\\w.$])' + n + '\\s*\\(');
const prop = n => new RegExp('(?:^|[^\\w.$])' + n + '\\s*[.\\[]');

const CODE = [
  { t: 'אין קריאת רשת',
    bad: [['fetch', call('fetch')], ['XMLHttpRequest', /new\s+XMLHttpRequest/],
          ['WebSocket', /new\s+WebSocket/], ['sendBeacon', /sendBeacon\s*\(/]] },
  { t: 'אין כתובת רשת חיצונית',
    bad: [['http', /["'`]https?:\/\//]] },
  { t: 'אין אחסון — ״מקומי למפגש״ אינו הבטחה אלא היעדר מפתח',
    bad: [['localStorage', prop('localStorage')], ['sessionStorage', prop('sessionStorage')],
          ['indexedDB', prop('indexedDB')], ['cookie', /\.cookie\s*=/]] },
  { t: 'אין הקראה ואין בחירת קול — הקול הוא של tutor.js',
    bad: [['speechSynthesis', prop('speechSynthesis')],
          ['SpeechSynthesisUtterance', /new\s+SpeechSynthesisUtterance/],
          ['getVoices', call('getVoices')]] },
  { t: 'אין ציור — מי שמצייר הוא josh-face.js',
    bad: [['innerHTML', /\.innerHTML\s*=/], ['querySelector', call('querySelector')],
          ['createElement', call('createElement')], ['appendChild', call('appendChild')]] },
  { t: 'אין ROLE ואין החלטה מה ללמד',
    bad: [['ROLE', /\bROLE\b/], ['CORE', /\bCORE\s*=/]] },
  /* גלאי שמחזיק טיימר משלו מדווח על הזמן שעבר ולא על מה שהלומד
     עשה, והוא גם ממשיך לרוץ כשהלשונית מוסתרת. הזמן מגיע מבחוץ,
     כארגומנט. */
  { t: 'אין טיימר משלו — הזמן מגיע מהאפליקציה כארגומנט',
    bad: [['setInterval', call('setInterval')], ['setTimeout', call('setTimeout')],
          ['requestAnimationFrame', call('requestAnimationFrame')]] }
];

for (const c of CODE) {
  const hit = c.bad.filter(([, re]) => re.test(src)).map(([n]) => n);
  if (hit.length) fail(c.t + ' — נמצא: ' + hit.join(', '));
  else console.log('✓ ' + c.t);
}

/* ------------------------------------------------------------------
   ב. ההתנהגות

   כל תרחיש ב-vm נפרד: המודול מחזיק מצב, ושובל מתרחיש קודם היה
   הופך את הבדיקה לבדיקה של הסדר שבו כתבתי אותה.
   ------------------------------------------------------------------ */
function load() {
  const sandbox = {};
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  new vm.Script(src, { filename: FILE }).runInContext(sandbox);
  if (!sandbox.JOSHSTATE) throw new Error('JOSHSTATE לא הוגדר');
  return sandbox.JOSHSTATE;
}

let ran = 0;
function scenario(name, fn) {
  ran++;
  let got;
  try { got = fn(load()) } catch (e) { fail(name + ' — ' + e.message); return }
  if (got === true) console.log('✓ ' + name);
  else fail(name + ' — ' + got);
}
const want = (actual, expected) =>
  actual === expected ? true : 'ציפינו ל-' + expected + ', קיבלנו ' + actual;

/* מילוי נוח: n תשובות באותו אורך */
function feed(S, n, ok, ms) { for (let i = 0; i < n; i++) S.answer({ ok: ok, ms: ms }) }

scenario('1 · מפגש חדש הוא ok, ולא "לא יודע"',
  S => want(S.state(), 'ok'));

scenario('2 · תשובות נכונות נשארות ok',
  S => { feed(S, 5, true, 5000); return want(S.state(), 'ok') });

scenario('3 · שתי שגויות ברצף — stuck',
  S => { feed(S, 2, false, 5000); return want(S.state(), 'stuck') });

scenario('4 · שלוש שגויות ברצף — frustrated',
  S => { feed(S, 3, false, 5000); return want(S.state(), 'frustrated') });

/* הרצף נשבר, ולכן הסימן נגמר. זו בדיוק ההבחנה בין "ברגע" ל"אחוז
   מהמפגש": לומד שטעה שלוש וענה נכון אינו מתוסכל עכשיו. */
scenario('5 · תשובה נכונה שוברת את הרצף',
  S => { feed(S, 3, false, 5000); S.answer({ ok: true, ms: 5000 });
         return want(S.state(), 'ok') });

scenario('6 · רמז לבדו אינו מדליק דבר — הוא ההתנהגות הרצויה',
  S => { S.hint(); S.answer({ ok: true, ms: 5000 });
         S.hint(); S.answer({ ok: true, ms: 5000 });
         return want(S.state(), 'ok') });

/* השאלה האחרונה פי יותר מ-2.2 מהחציון של הלומד עצמו. */
scenario('7 · שינוי בקצב של הלומד עצמו — slow',
  S => { feed(S, 4, true, 5000); S.answer({ ok: true, ms: 12000 });
         return want(S.state(), 'slow') });

/* **התרחיש שהוא הסיבה לקובץ.** קצב איטי ועקבי אינו סימן למידה.

   הזמנים מתנדנדים במתכוון, ולא שישה פעמים 20000: בזמנים זהים
   `last` שווה בדיוק ל-`base`, וההשוואה `last > base * FACTOR`
   עוברת בכל מקדם מ-1 ומעלה — כלומר התרחיש היה ירוק גם אם מישהו
   היה מוחק את המקדם לגמרי. נמדד: `SLOW_FACTOR = 1.0` לא הפיל
   אותו. עם תנודה טבעית הוא כן מפיל, וזו הנקודה. */
scenario('8 · לומד שקורא לאט באופן עקבי נשאר ok',
  S => { [18000, 22000, 19000, 21000, 20000, 23000]
           .forEach(ms => S.answer({ ok: true, ms: ms }));
         return want(S.state(), 'ok') });

scenario('9 · בלי בסיס אין slow — מתחת ל-SLOW_MIN',
  S => { S.answer({ ok: true, ms: 5000 }); S.answer({ ok: true, ms: 5000 });
         S.answer({ ok: true, ms: 40000 });
         return want(S.state(), 'ok') });

/* חומרה קודמת לקצב: מי שתקוע אינו מדווח כ"איטי". */
scenario('10 · טעות גוברת על קצב',
  S => { feed(S, 4, true, 5000); S.answer({ ok: false, ms: 40000 });
         S.answer({ ok: false, ms: 40000 });
         return want(S.state(), 'stuck') });

scenario('11 · רמז יחד עם טעות, פעמיים — stuck',
  S => { S.hint(); S.answer({ ok: false, ms: 5000 });
         S.answer({ ok: true, ms: 5000 });
         S.hint(); S.answer({ ok: false, ms: 5000 });
         S.answer({ ok: true, ms: 5000 });
         return want(S.state(), 'stuck') });

/* האיסור המפורש של שלב 3. */
scenario('12 · מבחן כיתתי — off() אינו רושם דבר',
  S => { S.off(); feed(S, 5, false, 5000);
         if (S.state() !== 'ok') return 'כבוי ודיווח ' + S.state();
         return want(S.snapshot().n, 0) });

scenario('13 · ומבחן אינו משאיר שובל אחריו',
  S => { S.off(); feed(S, 5, false, 5000); S.on();
         return want(S.state(), 'ok') });

scenario('14 · קלט פגום נדחה ואינו נרשם',
  S => { S.answer(null); S.answer({}); S.answer({ ok: 'yes' });
         return want(S.snapshot().n, 0) });

scenario('15 · state מחזיר תמיד אחת מארבע',
  S => { const four = S.states().slice().sort().join(',');
         if (four !== 'frustrated,ok,slow,stuck') return 'הרשימה היא ' + four;
         const seen = {};
         for (let i = 0; i < 40; i++) {
           S.answer({ ok: i % 3 === 0, ms: 1000 + (i % 7) * 4000 });
           seen[S.state()] = 1;
         }
         const off = Object.keys(seen).filter(k => S.states().indexOf(k) < 0);
         return off.length ? 'מצב שאינו ברשימה: ' + off.join(',') : true });

/* השאלה האחרונה אינה רשאית לדלל את הבסיס שאליו היא מושווית.
   1000, 1000, 10000, 10000: הבסיס בלי האחרונה הוא 1000 והדיווח
   `slow`, ועם האחרונה הוא 5500 והדיווח `ok` — כלומר ההאטה מסתירה
   את עצמה. בלי התרחיש הזה `median(t.slice(0, -1))` לא היה נעול
   בשום מקום; נמדד — החלפתו ב-`median(t)` לא הפילה דבר. */
scenario('16 · ההאטה אינה מדללת את הבסיס שהיא נמדדת מולו',
  S => { [1000, 1000, 10000, 10000]
           .forEach(ms => S.answer({ ok: true, ms: ms }));
         return want(S.state(), 'slow') });

/* סימן חייב להיות ניתן לכיבוי. במצב רגוע כל טעות ראשונה פותחת רמז
   מעצמה, ולכן שלוש שאלות שגויות מותירות שלושה סימני רמז־עם־טעות;
   נמדד בדפדפן שהם נשארו כל החלון, ולומד שענה אחריהן ארבע נכון
   ברצף עדיין דווח `stuck`. */
scenario('17 · ארבע נכונות ברצף מנקות גם סימן של רמז־עם־טעות',
  S => { for (let i = 0; i < 3; i++) { S.hint(); S.answer({ ok: false, ms: 5000 }) }
         if (S.state() !== 'frustrated') return 'לפני הניקוי: ' + S.state();
         feed(S, 4, true, 5000);
         return want(S.state(), 'ok') });

console.log(bad
  ? `✗ ${FILE} — ${CODE.length} שאלות קוד, ${ran} תרחישים, ${bad} ממצאים`
  : `✓ ${FILE} — ${CODE.length} שאלות קוד, ${ran} תרחישים, 0 ממצאים`);
process.exit(bad ? 1 : 0);
