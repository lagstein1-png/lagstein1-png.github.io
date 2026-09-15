/* ״עזרה מהמורה״ — השומרים, החיווט ושער התנאים.

   שלוש שכבות נבדקות כאן:

   1. **השומרים שבשרת.** הם ההבדל בין בוט שנותן רמז לבין בוט
      שנותן את התשובה בשורה הראשונה, ובין הסבר נכון לבין
      8+7=16 שנכתב בביטחון. לכן הם נבדקים, ולא נסמכים על
      ההוראות למודל בלבד.

   2. **החיווט של שתים־עשרה האפליקציות.** אפליקציה שיש בה כפתור
      אבל אין בה תגית סקריפט תיראה תקינה עד שמישהו ילחץ; אפליקציה
      שאין לה את הקובץ ב-PRE תעבוד ברשת ותישבר אופליין. שניהם
      נכשלים בשקט, ולכן שניהם נספרים כאן.

   3. **שער התנאים.** מילוי כתובת השרת הוא הרגע שבו מידע מתחיל
      לצאת מהמכשיר, וזה בדיוק הרגע שבו LEGAL.version חייב לעלות.

   מריצים:  node .claude/qa/tutor.js
*/
const fs = require('fs'), path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const WORKER = 'file://' + path.join(ROOT, 'tutor-api', 'worker.js');
const CLIENT = path.join(ROOT, 'tutor', 'tutor.js');

/* שתים־עשרה. דף הבית אינו אפליקציית לימוד, ו״תאוריה מדברת״
   יושבת בריפו נפרד — ראו FINDINGS. */
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
              'lomda', 'english', 'history', 'ulpan', 'bagrut-806', 'reader',
              'kotvim'];
/* ״תאוריה מדברת״ אינה בריפו הזה, אבל היא באותו מקור וטוענת את
   /tutor/tutor.js מכאן — ולכן התפקיד שלה חייב להיות בשרת.
   החיווט שלה עצמו נבדק בריפו שלה, לא כאן. */
const EXTERNAL = ['theory'];
const LANGS = ['he', 'ar', 'ru', 'en'];

let bad = 0;
function t(name, got, want) {
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log(`✓ ${name}`); return }
  bad++;
  console.log(`✗ ${name}\n    קיבלנו: ${JSON.stringify(got)}\n    ציפינו: ${JSON.stringify(want)}`);
}

import(WORKER).then(async W => {
  const client = fs.readFileSync(CLIENT, 'utf8');

  /* ---------- 1. חשיפת התשובה ---------- */
  t('תשובה מספרית נתפסת',            W.revealsAnswer('התשובה היא 12', 12), true);
  t('מספר שמכיל את התשובה אינו נתפס', W.revealsAnswer('יש לנו 120 עיגולים', 12), false);
  t('12 בתוך 512 אינו נתפס',         W.revealsAnswer('קח 512', 12), false);
  t('רמז בלי התשובה עובר',            W.revealsAnswer('כמה זה 5 ועוד 5?', 12), false);
  t('תשובה מילולית נתפסת',            W.revealsAnswer('הכוונה היא המהפכה התעשייתית', 'המהפכה התעשייתית'), true);
  t('אות שימוש אינה מבריחה תשובה',     W.revealsAnswer('הכוונה למהפכה התעשייתית', 'המהפכה התעשייתית'), true);
  t('ניקוד אינו מבריח תשובה',          W.revealsAnswer('הכוונה לְמַהְפֵּכָה התעשייתית', 'המהפכה התעשייתית'), true);
  t('תשובה מילולית אחרת אינה נתפסת',   W.revealsAnswer('בוא נחשוב על הסיבות', 'המהפכה התעשייתית'), false);
  t('בלי תשובה אין מה לחסום',         W.revealsAnswer('טקסט כלשהו', null), false);
  t('תשובה קצרה מדי אינה חוסמת',      W.revealsAnswer('אל תשכח את זה', 'זה'), false);
  /* **נקודה בסוף משפט הבריחה את השומר.** הביטוי הוציא `.` משני
     הצדדים כדי ש-״15״ לא ייתפס בתוך ״0.15״ או ״15.7״ — אבל נקודה
     שמסיימת משפט אינה נקודה עשרונית, ו״התשובה היא 15.״ הוא בדיוק
     הדרך הטבעית ביותר שמודל מוסר תשובה. כל עשרת המקרים שקדמו כאן
     נכתבו בלי נקודה, ולכן הבדיקה עברה והבאג חי. נמדד 10.9.2026:
     מתוך אחת עשרה צורות מסירה טבעיות, שש חמקו. */
  t('נקודה בסוף משפט אינה מבריחה',     W.revealsAnswer('התשובה היא 15.', 15), true);
  t('נקודתיים ונקודה אינן מבריחות',    W.revealsAnswer('הפתרון: 15.', 15), true);
  t('תשובה עשרונית עם נקודת סיום',     W.revealsAnswer('התשובה היא 2.5.', '2.5'), true);
  t('אנגלית עם נקודת סיום',            W.revealsAnswer('The answer is 15.', 15), true);
  t('ערבית עם נקודת סיום',             W.revealsAnswer('يكون الجواب 15.', 15), true);
  t('עשרוני אינו נתפס בתוך עשרוני',    W.revealsAnswer('קח 12.5 מטר', '2.5'), false);
  t('15 בתוך 15.7 אינו נתפס',         W.revealsAnswer('המרחק 15.7 ק״מ', 15), false);
  t('15 בתוך 0.15 אינו נתפס',         W.revealsAnswer('הסיכוי 0.15', 15), false);

  /* ---------- 2. משוואה שגויה ---------- */
  t('חיבור שגוי נתפס',   W.badEquation('קודם כל 8 + 7 = 16'), true);
  t('חיבור נכון עובר',    W.badEquation('קודם כל 8 + 7 = 15'), false);
  t('חיסור שגוי נתפס',   W.badEquation('אז 20 − 6 = 15'), true);
  t('כפל שגוי נתפס',     W.badEquation('כלומר 3 × 4 = 13'), true);
  t('חילוק נכון עובר',    W.badEquation('ולכן 12 : 3 = 4'), false);
  t('חילוק באפס נתפס',   W.badEquation('נחלק 5 : 0 = 0'), true);
  t('טקסט בלי משוואה עובר', W.badEquation('בוא נספור על האצבעות'), false);
  /* תוצאה עשרונית נכונה נפסלה כשהביטוי קרא רק מספרים שלמים:
     ״1/2 = 0.5״ נקרא כ-״= 0״. המורה אמר דבר נכון והשומר זרק
     אותו, ואז נשלחה שאלה מנחה במקום ההסבר. נמדד 8.9.2026. */
  t('חצי עשרוני נכון עובר',  W.badEquation('חצי זה 1/2 = 0.5'), false);
  t('חילוק עם שארית עובר',   W.badEquation('אז 10 : 4 = 2.5'), false);
  t('עיגול לשתי ספרות עובר', W.badEquation('בערך 1 : 3 = 0.33'), false);
  t('עשרוני שגוי נתפס',      W.badEquation('אז 2.5 + 2.5 = 6'), true);
  t('עיגול רחוק מדי נתפס',   W.badEquation('אז 1 : 3 = 0.5'), true);
  /* ובכיוון השני: סבילות יחסית הייתה מחמיצה טעות של אחד
     במספרים גדולים, ולכן שלושה שלמים נבדקים בדיוק. */
  t('טעות של אחד במאות נתפסת', W.badEquation('כלומר 100 + 200 = 301'), true);
  t('מאות נכון עובר',          W.badEquation('כלומר 100 + 200 = 300'), false);

  /* ---------- 3. אימות הקלט ---------- */
  t('גוף ריק נדחה', W.readBody({}), null);
  t('אפליקציה שאינה ברשימה נדחית',
    W.readBody({ app: 'nope', messages: [{ role: 'user', text: 'היי' }] }), null);
  t('שיחה שנגמרת בבוט נדחית',
    W.readBody({ app: 'math-app', messages: [{ role: 'user', text: 'שלום' },
                                             { role: 'assistant', text: 'היי' }] }), null);
  const ok = W.readBody({ app: 'history', lang: 'ru',
    q: { expr: 'מה גרם למהפכה?', ans: 'תנאי המחיה' },
    messages: [{ role: 'user', text: 'לא הבנתי' }] });
  t('גוף תקין מתקבל', !!ok && ok.lang === 'ru' && ok.q.ans === 'תנאי המחיה', true);
  t('שפה לא מוכרת נופלת לעברית',
    W.readBody({ app: 'lomda', lang: 'zz', messages: [{ role: 'user', text: 'היי' }] }).lang, 'he');
  t('הודעה ארוכה נחתכת',
    W.readBody({ app: 'ulpan', messages: [{ role: 'user', text: 'א'.repeat(500) }] })
      .msgs[0].content.length, W.LIM.chars);
  t('שדה הקשר ארוך נחתך',
    W.readBody({ app: 'reader', q: { expr: 'ב'.repeat(900) },
                 messages: [{ role: 'user', text: 'היי' }] }).q.expr.length, W.LIM.ctx);
  t('שפה נלמדת לא מוכרת נזרקת',
    W.readBody({ app: 'english', target: 'zz', messages: [{ role: 'user', text: 'hi' }] }).target, null);

  /* ---------- 4. ההקשר שנשלח ---------- */
  const c0 = W.contextBlock({ app: 'math-app', lang: 'he', target: null,
    q: { expr: '8 + 7', ans: '15' } }, 0);
  t('בתור הראשון ההקשר אוסר את התשובה', /אל תכתוב את התשובה הזאת/.test(c0), true);
  const c3 = W.contextBlock({ app: 'math-app', lang: 'he', target: null,
    q: { expr: '8 + 7', ans: '15' } }, 3);
  t('בתור מאוחר האיסור מוסר', /אל תכתוב את התשובה הזאת/.test(c3), false);
  t('בלי תרגיל — מבקשים מהתלמיד לכתוב',
    /בקש מהתלמיד לכתוב/.test(W.contextBlock({ app: 'reader', lang: 'he', q: null }, 0)), true);
  t('שפת התשובה נאמרת במפורש',
    /כתוב את כל תשובתך ברוסית/.test(
      W.contextBlock({ app: 'lomda', lang: 'ru', q: null }, 0)), true);
  t('בלימודי שפה מופרדת שפת ההסבר מהשפה הנלמדת',
    /השפה הנלמדת היא אנגלית, ושפת ההסבר היא עברית/.test(
      W.contextBlock({ app: 'english', lang: 'he', target: 'en', q: null }, 0)), true);
  t('סימון « » מוסבר למודל',
    /« »/.test(W.contextBlock({ app: 'ulpan', lang: 'ru', target: 'he', q: null }, 0)), true);
  t('אין הפרדה כששפת ההסבר היא הנלמדת',
    /השפה הנלמדת/.test(W.contextBlock({ app: 'english', lang: 'en', target: 'en', q: null }, 0)), false);

  /* ---------- 4א. סימן הלמידה — שלב 4 ----------

     הגלאי יושב בדפדפן ואפשר לערוך אותו, ולכן הסימן הוא רמז ולא
     עובדה. שלוש הבדיקות הראשונות כאן שומרות שהוא יישאר בגבול
     הזה: שהוא מגיע רק כאחת משלוש מילים, שהוא משנה את **ההקשר**
     ולא את ההוראות הקבועות, ושהוא אינו מגיע ללומד כתווית.

     **ו-`ok` אינו ברשימה במתכוון.** הוא היעדר סימן, והלקוח אינו
     שולח אותו — נוכחות השדה היא המשמעות. */
  const mk = (sign) => W.readBody({ app: 'math-app', sign: sign,
    messages: [{ role: 'user', text: 'היי' }] });
  t('שלושה סימנים, ואין רביעי', W.SIGNS, ['slow', 'stuck', 'frustrated']);
  t('לכל סימן יש התאמה', Object.keys(W.ADAPT).sort(), W.SIGNS.slice().sort());
  W.SIGNS.forEach(sg => {
    if (mk(sg).sign !== sg) { bad++; console.log(`✗ הסימן ${sg} לא עבר את readBody`) }
  });
  console.log('✓ שלושת הסימנים עוברים את readBody');
  t('ok אינו סימן — הוא היעדר סימן', mk('ok').sign, null);
  t('סימן שאינו ברשימה נזרק בשקט', mk('exhausted').sign, null);
  t('בלי שדה כלל — אין סימן', mk(undefined).sign, null);
  /* סימן פגום אינו סיבה לא לענות ללומד: הבקשה ממשיכה, בלי התאמה. */
  t('סימן פגום אינו מפיל את הבקשה', mk('exhausted') === null, false);

  W.SIGNS.forEach(sg => {
    const c = W.contextBlock({ app: 'math-app', lang: 'he', sign: sg, q: null }, 0);
    if (c.indexOf(W.ADAPT[sg]) < 0) { bad++; console.log(`✗ ההתאמה ל-${sg} אינה בהקשר`) }
  });
  console.log('✓ כל סימן מוסיף את ההתאמה שלו להקשר');
  t('בלי סימן — אין שורת התאמה',
    /סימן למידה מהרגע/.test(W.contextBlock({ app: 'math-app', lang: 'he', q: null }, 0)), false);
  /* הסימן תקף גם בלי תרגיל: לומד שנתקע ואז הקליד שאלה חופשית
     הוא אותו לומד. */
  t('הסימן תקף גם כשאין תרגיל',
    /סימן למידה מהרגע/.test(
      W.contextBlock({ app: 'reader', lang: 'he', sign: 'stuck', q: null }, 0)), true);

  /* **הכלל שאין לרכך:** סימן למידה, לא אבחון. ג׳וש אינו אומר
     ללומד מה הסימן. זו שורה ב-CORE ולא בהקשר, מפני שהיא חייבת
     לחול בכל אפליקציה ובכל שפה — ובלוק משתנה אינו חל תמיד. */
  t('הגוף המשותף אוסר לומר ללומד מה הסימן',
    /אל תאמר ללומד מה הסימן ואל תתאר לו את מצבו/.test(W.CORE), true);
  /* ההתאמה עצמה חייבת להישאר בבלוק המשתנה: שורה שמשתנה מבקשה
     לבקשה בתוך CORE שוברת את המטמון של הגוף הקבוע. */
  W.SIGNS.forEach(sg => {
    if (W.CORE.indexOf(W.ADAPT[sg]) >= 0) {
      bad++; console.log(`✗ ההתאמה ל-${sg} נכנסה ל-CORE — היא שוברת את המטמון`);
    }
  });
  console.log('✓ ההתאמות יושבות בהקשר המשתנה ולא בגוף הקבוע');

  /* והלקוח — הוא זה ששולח. שדה שאין לו שולח הוא קוד מת. */
  t('הלקוח שולח את הסימן', /sign:\s*sign\(\)/.test(client), true);
  t('הלקוח אינו שולח ok', /s\s*!==\s*"ok"/.test(client), true);
  /* **הגלאי אינו חייב להיות שם, ואינו חייב לעבוד.** שתים־עשרה
     האפליקציות עדיין בלעדיו, והוא קוד בדפדפן שאפשר לשבור. בשני
     המקרים הבוט חייב לענות — בלי התאמה, אבל לענות. נמדד בדפדפן:
     גלאי שנמחק וגלאי שזורק החזירו שניהם `sign: null`. */
  t('הלקוח מוגן מהיעדר גלאי',
    /typeof\s+JOSHSTATE\s*===\s*"undefined"/.test(client), true);
  t('הלקוח מוגן מגלאי שזורק',
    /try\s*\{[\s\S]{0,200}JOSHSTATE\.state\(\)[\s\S]{0,200}catch/.test(client), true);

  /* ---------- 4ב. התיקון של ״תאוריה מדברת״ — שלב 7 ----------

     האפליקציה השתים־עשרה יושבת בריפו נפרד שאינו נגיש מכאן
     (`O-9`), ולכן החיווט שלה שמור כתיקון: `tutor-api/theory.patch`.
     **פקודה אחת של הבעלים מחילה אותו**, ואחרי זה אין הזדמנות
     שנייה זולה.

     **והתיקון הזה מתיישן בשקט.** הוא נכתב לפני שכבת הפנים, ולכן
     הוא הוסיף `/tutor/tutor.js` לבד. שתים־עשרה האפליקציות מצרפות
     מראש גם את `/tutor/josh-face.js` וגם את `/img/josh.jpg`, וכל
     נתיב משותף חדש שייכנס אליהן יחזור על אותה סחיפה: התיקון היה
     מביא לתאוריה בוט בלי פנים, בלי שגיאה ובלי שאיש ירגיש.

     לכן הבדיקה **נגזרת ואינה מונה**: היא אוספת את הנתיבים
     המוחלטים תחת `/tutor/` ו-`/img/` שרוב האפליקציות מצרפות
     מראש, ודורשת שהתיקון יישא את כולם. `josh-state.js` אינו
     נכנס — הוא בטייס באפליקציה אחת, וזה רוב של אחת. */
  const PATCH = path.join(ROOT, 'tutor-api', 'theory.patch');
  if (!fs.existsSync(PATCH)) { bad++; console.log('✗ tutor-api/theory.patch אינו קיים') }
  else {
    const pt = fs.readFileSync(PATCH, 'utf8');
    const count = {};
    for (const a of APPS) {
      const sw = path.join(ROOT, a, 'sw.js');
      if (!fs.existsSync(sw)) continue;
      for (const m of fs.readFileSync(sw, 'utf8').matchAll(/["'](\/(?:tutor|img)\/[^"']+)["']/g))
        count[m[1]] = (count[m[1]] || 0) + 1;
    }
    /* רוב האפליקציות, ולא כולן: נתיב טייס אינו חוב על התיקון. */
    const shared = Object.keys(count).filter(k => count[k] > APPS.length / 2).sort();
    /* **רק מה שנוסף ל-`sw.js`, ולא כל מופע בתיקון.** הניסוח
       הראשון חיפש את הנתיב בתיקון כולו, ואז תגית `<script>`
       הספיקה — נמדד: מחיקת `/tutor/josh-face.js` מה-`PRECACHE`
       **לא הפילה את הבדיקה**, מפני שהשם נשאר בתגית. לכן נחתך
       חלק ה-`sw.js` של התיקון, ונסרקות שורות ה-`+` שבו בלבד. */
    const swPart = pt.slice(pt.indexOf('+++ b/sw.js'));
    const pre = new Set();
    for (const m of swPart.matchAll(/^\+\s*["']([^"']+)["']\s*,/gm)) pre.add(m[1]);
    const missing = shared.filter(k => !pre.has(k));
    t('התיקון מצרף מראש את כל הנתיבים המשותפים', missing, []);
    /* וסדר הטעינה: `tutor.js` קורא ל-JOSHFACE, ולכן הפנים לפניו.
       בסדר הפוך אין שגיאה — הקריאה מוגנת ב-typeof — ופשוט אין
       פנים, וזה בדיוק סוג הכשל שאינו צועק. */
    const iFace = pt.indexOf('josh-face.js"></script>');
    const iTut  = pt.indexOf('tutor.js"></script>');
    t('בתיקון, josh-face.js נטען לפני tutor.js', iFace >= 0 && iTut > iFace, true);
    /* התיקון מעלה את BUILD של הריפו ההוא — שם הוא מקור אמת אחד
       ומפתח הקאש נגזר ממנו. בלי ההעלאה מי שהתקין לא יקבל כלום.

       **וההשוואה מספרית, ולא ״יש שורה״.** הניסוח הראשון חיפש
       `+const BUILD = 'vNN'` בלבד, ולכן החלפת `v99` ל-`v98`
       **לא הפילה אותו** — הוא ראה שורה שנוספה ולא שאל לאיזה
       ערך. שורה שמחזירה את אותו מספר אינה העלאה. */
    const bOld = pt.match(/^-const BUILD = 'v(\d+)';$/m);
    const bNew = pt.match(/^\+const BUILD = 'v(\d+)';$/m);
    t('התיקון מעלה את BUILD של הריפו הנפרד',
      !!(bOld && bNew) && +bNew[1] > +bOld[1], true);
  }

  /* ---------- 5. תפקיד לכל אפליקציה ---------- */
  t('לכל שתים־עשרה האפליקציות יש תפקיד',
    Object.keys(W.ROLE).sort(), APPS.concat(EXTERNAL).sort());
  const dup = new Set(Object.values(W.ROLE));
  t('אין שני תפקידים זהים', dup.size, APPS.length + EXTERNAL.length);
  APPS.concat(EXTERNAL).forEach(a => {
    const c = W.contextBlock({ app: a, lang: 'he', q: null }, 0);
    if (c.indexOf(W.ROLE[a]) !== 0) { bad++; console.log(`✗ ${a}: התפקיד אינו נשלח בראש ההקשר`) }
  });
  console.log('✓ התפקיד של כל אפליקציה נשלח בראש ההקשר');
  t('הגוף המשותף כולל את איסור הפרטים המזהים',
    /אל תבקש שם מלא, כתובת, טלפון או פרטים מזהים/.test(W.CORE), true);
  t('הגוף המשותף כולל רמז אחד בכל פעם',
    /התחל ברמז קטן והמתן לתשובת התלמיד/.test(W.CORE), true);
  t('הגוף המשותף אינו נוקב במקצוע', /חשבון|אנגלית|היסטוריה/.test(W.CORE), false);

  /* ---------- 5א. האישיות של ג׳וש ----------

     האישיות היא הגוף המשותף, ולכן היא נבדקת כאן ולא במקום אחר.
     שלוש הבדיקות הראשונות הן כללים שאפשר למדוד בטקסט; הרביעית
     היא זו שמחזיקה את `JOSH.md` צמוד לקוד.

     **למה כיוון אחד בלבד** — כל שורה בקוד חייבת להימצא במסמך,
     אבל לא להפך: המסמך הוא פרוזה שמנמקת, והוא מצטט גם שורה
     שהוסרה כדי להסביר למה. הכיוון שנשמר הוא זה שמונע את הנזק:
     שורה שנוספה לשרת ואיש אינו יודע למה היא שם. */
  const JOSH = fs.readFileSync(path.join(ROOT, 'JOSH.md'), 'utf8');
  t('הגוף המשותף נושא את השם ברק', /שמך ברק/.test(W.CORE), true);
  /* אמוג׳י וסימן קריאה נכשלים פעמיים: הם ילדותיים, וההקראה
     שבפאנל מקריאה אותם. ראו JOSH.md, ״איך הוא מדבר״. */
  t('אין אמוג׳י בגוף המשותף',
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(W.CORE), false);
  t('אין סימן קריאה בגוף המשותף', /!/.test(W.CORE), false);
  const missing = W.CORE.split('\n').filter(l => JOSH.indexOf(l) < 0);
  t('כל שורה בגוף המשותף מצוטטת ב-JOSH.md מילה במילה', missing, []);

  /* ---------- 5ב. ההקראה של הפאנל ----------

     הפאנל הוא קורא שנים עשר במאגר, והוא נבנה בלי ארבעת המנגנונים
     שכל אחת עשרה האפליקציות נושאות. ארבעתם מכסים כשלים שקטים של
     Web Speech שכולם נראים אותו דבר — הקול מפסיק באמצע — ותשובה
     של ג׳וש היא עד `MAX_TOKENS`, כלומר בקלות מעל חמש עשרה השניות
     שאחריהן Chrome בשולחן העבודה חותך. `voice.js` בודק את
     האפליקציות מול `speechSynthesis` מזויף ואינו מגיע לכאן. */
  [['שומר-ער', /startKeepAlive/], ['הפניה חיה ל-utterance', /_activeU/],
   ['שומר זמן', /ttsWatchdog/],  ['נפילה מקול רשת', /_netVoiceOK/]]
    .forEach(function(m){ t('ההקראה בפאנל: ' + m[0], m[1].test(client), true) });

  /* ---------- 5ג. מבנה התשובה, ומה נאמר ממנו ----------

     ג׳וש כותב נקודות והדגשה מהתור השלישי. שלוש שכבות, ושלושתן
     נבדקות: מה שנראה, מה שנאמר, ומה שאינו אף אחד מהם. */
  /* `tu-l` לבדו נמצא גם ב-`#tu-log` שקיים מזמן, ולכן הבדיקה הזאת
     הייתה עוברת גם בלי התיקון — כלומר לא בודקת דבר. הביטוי הוא
     התגית עצמה. */
  [['רשימת נקודות מצוירת', /<ul class=\\"tu-l\\">/], ['הדגשה מצוירת', /<strong>/],
   ['סימני מבנה מוסרים לפני ההקראה', /stripMd/],
   ['ההקראה מקבלת טקסט נקי', /segments\(stripMd\(/],
   ['הצעות ההמשך נפרדות מהתשובה', /splitSugg/],
   ['ההצעות הן כפתורים', /data-tu="sugg"/],
   ['החשיפה ההדרגתית קיימת', /startReveal/]]
    .forEach(function(m){ t('מבנה: ' + m[0], m[1].test(client), true) });
  /* ההזרמה היא של הטקסט שכבר אומת, ולא של המודל. בדיקה שהשומר
     לא נעקף בדרך: אין קריאת stream בצד הדפדפן. */
  t('אין הזרמה מהמודל — השומר בודק תשובה שלמה',
    /getReader\(|text\/event-stream/.test(client), false);
  t('הגוף המשותף מגדיר את סימון ההצעות', /\[\[\?\]\]/.test(W.CORE), true);

  /* ---------- 5b. הגוף שנשלח, לפי המודל ----------

     `effort` מחזיר שגיאה ב-Haiku, ו-`fallbacks` שייך למשפחת
     opus. החלפת MODEL לבדה הייתה שוברת כל פנייה ב-400 ביום
     הראשון — ואין כאן מפתח, ולכן שום בדיקה חיה לא הייתה תופסת
     את זה. הבדיקה הזאת היא התחליף. */
  const msgs = [{ role: 'user', content: 'היי' }];
  const hb = W.buildBody('claude-haiku-4-5', 'ctx', msgs, '');
  t('haiku — בלי effort',    hb.output_config, undefined);
  t('haiku — בלי fallbacks', hb.fallbacks, undefined);
  t('haiku — בלי כותרת beta',
    W.buildHeaders('claude-haiku-4-5', 'k')['anthropic-beta'], undefined);
  const ob = W.buildBody('claude-opus-5', 'ctx', msgs, '');
  t('opus — עם effort',    ob.output_config, { effort: 'low' });
  t('opus — עם fallbacks', ob.fallbacks, 'default');
  t('opus — עם כותרת beta',
    W.buildHeaders('claude-opus-5', 'k')['anthropic-beta'], 'server-side-fallback-2026-07-01');
  const sb = W.buildBody('claude-sonnet-5', 'ctx', msgs, '');
  t('sonnet — effort כן, fallbacks לא',
    [!!sb.output_config, sb.fallbacks === undefined], [true, true]);
  t('מודל לא מוכר מקבל גוף מינימלי',
    W.capOf('claude-something-new'), { effort: false, fallbacks: false });
  /* הגוף חייב להיות תקין תמיד, בכל מודל */
  ['claude-haiku-4-5', 'claude-opus-5', 'claude-sonnet-5'].forEach(m => {
    const b = W.buildBody(m, 'ctx', msgs, '');
    if (b.model !== m || b.max_tokens !== W.MAX_TOKENS || b.system.length !== 2
        || !b.system[0].cache_control) {
      bad++; console.log(`✗ ${m}: הגוף אינו תקין`);
    }
  });
  console.log('✓ הגוף תקין בכל שלושת המודלים');
  /* והמודל שנבחר בפועל חייב להיות ברשימה — אחרת הוא מקבל
     גוף מינימלי בשקט, וזה עלול להיות תקין אבל לא מכוון. */
  t('המודל שנבחר מוכר לטבלת היכולות',
    Object.prototype.hasOwnProperty.call(
      { 'claude-opus-5':1, 'claude-opus-4-8':1, 'claude-sonnet-5':1, 'claude-haiku-4-5':1 },
      W.MODEL), true);

  /* ---------- 5b·2. מגדר הקול ----------
     **ג׳וש מדבר בקול נשי (הוראת הבעלים, 13.9.2026), אבל לא על
     חשבון קול חי.** `voiceUsable` נשאר מפתח המיון הראשון: קול
     נוירלי שנבחר לפי מגדר בזמן שאין רשת הוא שקט, ושקט גרוע
     מקול גברי. הכלל כתוב ב-CLAUDE.md, וכאן הוא נבדק.

     שלוש הפונקציות נחלצות מהמקור ורצות ב-vm מול רשימת קולות
     מזויפת — אין כאן דפדפן עם קולות מותקנים, ובדיקה שהייתה
     מסתמכת על כאלה לא הייתה רצה אף פעם. */
  (function () {
    const grab = re => { const m = client.match(re); return m ? m[0] : '' };
    const src = [
      grab(/var VOICE_F=\/[\s\S]*?\/;/),
      grab(/var VOICE_M=\/[\s\S]*?\/;/),
      grab(/function femScore\(v\)\{[\s\S]*?\n\}/),
      grab(/function voiceUsable\(v\)\{[\s\S]*?\n\}/),
      /* **שלוש אלה נוספו 14.9.2026 עם בורר הקול.** `pickVoice`
         מתייעץ עכשיו עם הבחירה השמורה לפני כל מיון, ובלעדיהן
         הריצה ב-vm נופלת על `savedVoice is not defined` — כלומר
         הבדיקה הייתה אדומה מסיבה שאינה הבאג שהיא מחפשת. */
      /* בלעדיו savedVoices זורקת ReferenceError, וה-try/catch שלה
         בולע אותו ומחזיר {} — כלומר הבדיקה נכשלת בשקט
         מסיבה שאינה הבאג שהיא מחפשת. */
      grab(/var VOICE_KEY = "[^"]*";/),
      grab(/function savedVoices\(\)\{[\s\S]*?\n\}/),
      grab(/function savedVoice\(code\)\{[^\n]*\}/),
      grab(/function setVoice\(code, uri\)\{[\s\S]*?\n\}/),
      grab(/function voicesFor\(code\)\{[\s\S]*?\n\}/),
      grab(/function pickVoice\(code\)\{[\s\S]*?\n\}/)
    ];
    if (src.some(x => !x)) { t('נחלצו חלקי בחירת הקול', false, true); return }
    /* `localStorage` מזויף וריק: המיון האוטומטי הוא מה שנבדק
       ברוב השורות, והבחירה הידנית נבדקת בנפרד בסוף. */
    const store = {};
    const ctx = { _netVoiceOK: true, navigator: { onLine: true }, out: null,
                  localStorage: { getItem: k => (k in store ? store[k] : null),
                                  setItem: (k, v) => { store[k] = String(v) } },
                  voices: () => ctx.LIST };
    vm.createContext(ctx);
    vm.runInContext(src.join('\n') + '\nout = { pick: pickVoice, fem: femScore, save: setVoice };', ctx);
    /* `voiceURI` נוסף 14.9.2026: הבחירה הידנית נשמרת לפיו,
       ובלעדיו ההשוואה היא undefined === מחרוזת — כלומר הבדיקה
       נופלת על הקול המזויף ולא על הקוד. */
    const V = (name, local) => ({ name: name, voiceURI: name, lang: 'he-IL',
                                  localService: local !== false });

    /* **גברי, ושמו ברק — 15.9.2026.** זו ההפיכה הרביעית של השורה
       הזאת: 13.9 ביקשה נשי, 14.9 גברי, 14.9 בערב נשי (פאולה),
       ו-15.9 גברי שוב. **המבנה זהה בכל פעם ורק הערך מתהפך** —
       וזה בדיוק הסימן שהבדיקה בודקת את המנגנון ולא את ההחלטה. */
    ctx.LIST = [V('Carmit'), V('Google עברית'), V('Microsoft Asaf')];
    t('בוחר את הקול הגברי מבין קולות מקומיים',
      (ctx.out.pick('he-IL') || {}).name, 'Microsoft Asaf');

    /* קול גברי מת מול קול נשי חי — הנשי מנצח, וזה העיקר:
       voiceUsable נשאר מפתח המיון הראשון, והמגדר אחריו. קול מת
       הוא שקט, ושקט גרוע מקול במגדר הלא־מבוקש. */
    ctx.LIST = [V('Carmit'), V('Microsoft Avri Online (Natural)', false)];
    ctx._netVoiceOK = false;
    t('קול גברי שאינו זמין אינו גובר על קול נשי חי',
      (ctx.out.pick('he-IL') || {}).name, 'Carmit');
    ctx._netVoiceOK = true;
    t('כשהרשת חזרה — הגברי חוזר לנצח',
      (ctx.out.pick('he-IL') || {}).name, 'Microsoft Avri Online (Natural)');

    /* ״google״ הוא שם יצרן ולא מגדר. אם ייספר כנשי, ״Google עברית״
       — שהוא גברי בחלק מהמכשירים — ייבחר דווקא כשמבקשים נשי. */
    /* **הבחירה הידנית גוברת על כל מיון — 14.9.2026.**

       הבעלים שמע קול נשי גם אחרי שתוקן, מפני שרוב מנועי
       ההקראה באנדרואיד מתעלמים מ-`pitch`. התשובה אינה ניחוש
       טוב יותר אלא בורר, והבורר חייב לנצח — גם על `voiceUsable`.
       מי שבחר קול ושומע אחר לא יבין למה. */
    ctx.LIST = [V('Carmit'), V('Microsoft Asaf')];
    ctx.out.save('he-IL', 'Carmit');
    t('הקול שנבחר ביד גובר על המיון',
      (ctx.out.pick('he-IL') || {}).name, 'Carmit');
    ctx.out.save('he-IL', '');
    t('ביטול הבחירה מחזיר את המיון',
      (ctx.out.pick('he-IL') || {}).name, 'Microsoft Asaf');

    t('שם יצרן אינו מגדר', ctx.out.fem(V('Google עברית')), 1);
    t('שם גברי מזוהה כגברי', ctx.out.fem(V('Microsoft Asaf')), 2);
    t('שם נשי מזוהה כנשי', ctx.out.fem(V('Carmit')), 0);
  })();

  /* ---------- 5c. תקרות העלות ----------
     הן החסם היחיד בין הבעלים לבין חשבון פתוח. שינוי כלפי מעלה
     הוא החלטה עסקית, ולכן הוא צריך להיראות בדיף. */
  /* **שתי התקרות אינן אותו דבר, וזה מה שנבדק כאן.** עד
     13.9.2026 הגלובלית הייתה 100 — חמישה לומדים ברמת ה-`perDay`
     שלהם מילאו אותה, וגורם חיצוני אחד ב-`curl` היה משתיק את ג׳וש
     לכולם. לכן שלוש טענות ולא אחת: גלובלית שהיא חסם עלות (תקרה
     עליונה), תקרת לומד שנשארת קטנה, ו**היחס ביניהן** — לפחות
     פי עשר, אחרת פיצול התקרה קיים בשם בלבד. */
  t('חסם העלות הגלובלי קיים ואינו פתוח', W.LIM.globalPerDay <= 1000, true);
  t('תקרה יומית לכתובת אחת',             W.LIM.perDay <= 20, true);
  t('כתובת אחת אינה יכולה למלא את הגלובלית',
    W.LIM.globalPerDay >= W.LIM.perDay * 10, true);
  t('תקרת אורך התשובה',       W.MAX_TOKENS <= 700, true);

  /* ---------- 5d. איזו תקרה נגמרה ----------
     `overLimit` מחזיר מילה ולא בוליאני, מפני שההבדל מגיע ללומד:
     ״מספיק להיום״ נכון כשהוא מילא את שלו, ושקר כשמישהו אחר מילא
     את הגלובלית. בוליאני אחד לשני מצבים הוא הכשל השקט. */
  const kv = (map) => ({ RATE: {
    get: async k => (k in map ? String(map[k]) : null),
    put: async () => {}
  } });
  const day = new Date().toISOString().slice(0, 10);
  const K = ip => 'd:' + day + ':' + ip;
  await (async () => {
    t('יש מקום — overLimit מחזיר null', await W.overLimit(kv({}), '1.2.3.4'), null);
    t('תקרת הלומד נגמרה — "you"',
      await W.overLimit(kv({ [K('1.2.3.4')]: W.LIM.perDay }), '1.2.3.4'), 'you');
    t('חסם העלות נגמר — "all"',
      await W.overLimit(kv({ [K('ALL')]: W.LIM.globalPerDay }), '1.2.3.4'), 'all');
    /* לומד אחר, שהגלובלית פנויה והשלו ריקה — עובד. זו כל
       הנקודה של הפיצול: מי שמילא את שלו אינו חוסם את השני. */
    t('לומד שמילא אינו חוסם לומד אחר',
      await W.overLimit(kv({ [K('1.2.3.4')]: W.LIM.perDay }), '5.6.7.8'), null);
  })();
  /* בלי KV אין מונה, ובלי מונה אין תקרה יומית — כלומר כל ההגנה
     על העלות תלויה בקישור אחד שקל לשכוח בהקמה. נכשל־סגור. */
  t('בלי KV השירות מסרב',            W.noCounter({}), true);
  t('עם KV השירות עובד',             W.noCounter({ RATE: {} }), false);
  t('הצהרה מפורשת מתירה בלי KV',      W.noCounter({ ALLOW_NO_RATE_LIMIT: 'yes' }), false);
  t('הצהרה חלקית אינה מתירה',         W.noCounter({ ALLOW_NO_RATE_LIMIT: 'true' }), true);

  /* ---------- 6. התשתית בדפדפן ---------- */
  LANGS.forEach(l => {
    const re = new RegExp('^' + l + ':\\{', 'm');
    if (!re.test(client)) { bad++; console.log(`✗ tutor.js: אין מחרוזות בשפה ${l}`) }
  });
  console.log('✓ tutor.js: מחרוזות בארבע השפות');
  t('כיוון כתיבה לכל שפה',
    /DIR\s*=\s*\{ he:"rtl", ar:"rtl", ru:"ltr", en:"ltr" \}/.test(client), true);
  t('קול לכל שפה', /VOICE\s*=\s*\{ he:"he-IL", ar:"ar-SA", ru:"ru-RU", en:"en-US" \}/.test(client), true);
  t('יש כפתורי הקראה ועצירה', /data-tu="say"/.test(client) && /data-tu="stop"/.test(client), true);
  t('יש בורר מהירות', /id="tu-rate"/.test(client), true);
  t('יש בורר שפה לאפליקציה שאין בה אחד', /id="tu-lg"/.test(client), true);
  /* bagrut-806 עברית בלבד. בלי pickLang הבוט בה היה עברי בלבד,
     והדרישה היא ארבע שפות בכל אפליקציה. */
  t('bagrut-806 מסמנת pickLang',
    /pickLang:\s*true/.test(fs.readFileSync(path.join(ROOT, 'bagrut-806', 'app.js'), 'utf8')), true);
  /* **המיקרופון נפתח 14.9.2026 בהוראת הבעלים** — ״אני רוצה שתהיה
     אפשרות לדבר איתו מבלי להקליד״. השורה הקודמת כאן נקראה ״אין
     מיקרופון **בשלב הזה**״, כלומר החלטת שלב, והבעלים הכריע.

     מה שנשאר אסור, ומה שהבדיקה אוכפת במקומה:

     · **אין `getUserMedia`** — זרם אודיו שנפתח ביד הוא הקלטה
       שאנחנו מחזיקים. `SpeechRecognition` מחזיר טקסט ותו לא.
     · **לחיצה לכל אמירה** — `continuous` חייב להיות false.
       מיקרופון שנשאר פתוח הוא הבטחה אחרת לגמרי.
     · **התנאים אומרים את זה** — ההקלטה יוצאת אל יצרן הדפדפן,
       והנוסח הקודם הבטיח ״מה שכתבתם״ ו״אין צד שלישי נוסף״.
       לכן הגרסה חייבת להיות מעל 1.2. */
  t('אין getUserMedia — רק המרה לטקסט', /getUserMedia/.test(client), false);
  t('המיקרופון נסגר אחרי אמירה אחת', /continuous\s*=\s*false/.test(client), true);
  t('יש כפתור דיבור', /id="tu-mic"/.test(client), true);
  t('התנאים עודכנו מעל 1.2',
    parseFloat((fs.readFileSync(path.join(ROOT,"legal","terms.js"),"utf8")
      .match(/version:\s*"([\d.]+)"/)||[0,"0"])[1]) > 1.2, true);
  t('השיחה אינה נשמרת', /localStorage\.setItem\(\s*(RATE_KEY|DAY_KEY)/.test(client)
    && !/localStorage\.setItem\(\s*["'].*msg/i.test(client), true);

  /* ---------- 7. החיווט של כל אפליקציה ---------- */
  APPS.forEach(a => {
    const html = fs.readFileSync(path.join(ROOT, a, 'index.html'), 'utf8');
    const code = a === 'bagrut-806'
      ? fs.readFileSync(path.join(ROOT, a, 'app.js'), 'utf8') : html;
    const sw = fs.readFileSync(path.join(ROOT, a, 'sw.js'), 'utf8');
    const miss = [];
    if (html.indexOf('<script src="/tutor/tutor.js"></script>') < 0) miss.push('תגית סקריפט');
    if (!/TUTOR\.mount\(/.test(code)) miss.push('mount');
    if (!/TUTOR\.open\(/.test(code)) miss.push('open');
    if (sw.indexOf('"/tutor/tutor.js"') < 0) miss.push('PRE ב-sw.js');
    if (miss.length) { bad++; console.log(`✗ ${a}: חסר ${miss.join(', ')}`) }
  });
  console.log(`✓ שתים־עשרה האפליקציות מחווטות (תגית, mount, open, PRE)`);

  /* ---------- 8. שער התנאים ---------- */
  const url = (client.match(/var API\s*=\s*"([^"]*)"/) || [])[1];
  const ver = (fs.readFileSync(path.join(ROOT, 'legal', 'terms.js'), 'utf8')
               .match(/version:\s*"([^"]+)"/) || [])[1];
  if (url) {
    t('שירות מופעל — גרסת התנאים עלתה מעל 1.0', ver !== '1.0', true);
    if (ver === '1.0')
      console.log('    כתובת השרת מולאה ב-tutor/tutor.js, ולכן legal/terms.js צריך version "1.1"\n' +
                  '    ואת שנים־עשר מפתחות הקאש — אחרת המשתמשים לא יתבקשו לאשר מחדש.');
  } else {
    /* **״ריקה ⇒ אין כפתור״ היה אישור שגוי — תוקן 15.9.2026.**

       BRAIN = !!API || typeof JOSHLOCAL !== "undefined", ושתים־עשרה
       האפליקציות טוענות את josh-local.js. לכן כתובת ריקה אינה
       מכבה כלום: BRAIN אמת, הכפתור מופיע, והפאנל עונה מהמוח
       המקומי. נמדד בכרומיום — lomda, english ו-reader הציגו
       "ברק — עזרה מהמורה" עם API="".

       זה בדיוק מה ש-CLAUDE.md מתעד על הקובץ הזה בכיוון ההפוך:
       מי שקרא "אין כפתור" הסיק שאין מה לספר ללומד, וטעה. */
    const local = APPS.filter(a =>
      fs.readFileSync(path.join(ROOT, a, 'index.html'), 'utf8').indexOf('josh-local') >= 0);
    if (local.length) {
      console.log(`· כתובת השרת ריקה, אבל ${local.length} אפליקציות טוענות josh-local.js —`);
      console.log(`  BRAIN אמת בכולן, הכפתור מופיע, והמענה מקומי. תנאי השימוש: ${ver}.`);
      /* המוח המקומי אינו שולח דבר לרשת, ולכן אין כאן חובת גרסה
         בתנאים — אבל ההצהרה חייבת להיות נכונה, ולא "כבוי". */
    } else {
      console.log(`· כתובת השרת ריקה ואין מוח מקומי — אין כפתור באף אפליקציה, ותנאי השימוש (${ver}) נשארים. תקין.`);
    }
  }

  console.log(bad ? `\n✗ ${bad} בדיקות נכשלו` : '\n✓ כל בדיקות הבוט עברו');
  process.exit(bad ? 1 : 0);
});
