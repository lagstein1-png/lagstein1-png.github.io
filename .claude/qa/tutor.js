/* ״עזרה מהמורה״ — השומרים, החיווט ושער התנאים.

   שלוש שכבות נבדקות כאן:

   1. **השומרים שבשרת.** הם ההבדל בין בוט שנותן רמז לבין בוט
      שנותן את התשובה בשורה הראשונה, ובין הסבר נכון לבין
      8+7=16 שנכתב בביטחון. לכן הם נבדקים, ולא נסמכים על
      ההוראות למודל בלבד.

   2. **החיווט של אחת עשרה האפליקציות.** אפליקציה שיש בה כפתור
      אבל אין בה תגית סקריפט תיראה תקינה עד שמישהו ילחץ; אפליקציה
      שאין לה את הקובץ ב-PRE תעבוד ברשת ותישבר אופליין. שניהם
      נכשלים בשקט, ולכן שניהם נספרים כאן.

   3. **שער התנאים.** מילוי כתובת השרת הוא הרגע שבו מידע מתחיל
      לצאת מהמכשיר, וזה בדיוק הרגע שבו LEGAL.version חייב לעלות.

   מריצים:  node .claude/qa/tutor.js
*/
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const WORKER = 'file://' + path.join(ROOT, 'tutor-api', 'worker.js');
const CLIENT = path.join(ROOT, 'tutor', 'tutor.js');

/* אחת עשרה. דף הבית אינו אפליקציית לימוד, ו״תאוריה מדברת״
   יושבת בריפו נפרד — ראו FINDINGS. */
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
              'lomda', 'english', 'history', 'ulpan', 'bagrut-806', 'reader'];
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

import(WORKER).then(W => {
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
  t('הגוף המשותף נושא את השם ג׳וש', /שמך ג׳וש/.test(W.CORE), true);
  /* אמוג׳י וסימן קריאה נכשלים פעמיים: הם ילדותיים, וההקראה
     שבפאנל מקריאה אותם. ראו JOSH.md, ״איך הוא מדבר״. */
  t('אין אמוג׳י בגוף המשותף',
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(W.CORE), false);
  t('אין סימן קריאה בגוף המשותף', /!/.test(W.CORE), false);
  const missing = W.CORE.split('\n').filter(l => JOSH.indexOf(l) < 0);
  t('כל שורה בגוף המשותף מצוטטת ב-JOSH.md מילה במילה', missing, []);

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

  /* ---------- 5c. תקרות העלות ----------
     הן החסם היחיד בין הבעלים לבין חשבון פתוח. שינוי כלפי מעלה
     הוא החלטה עסקית, ולכן הוא צריך להיראות בדיף. */
  t('תקרה יומית לשירות כולו', W.LIM.globalPerDay <= 100, true);
  t('תקרה יומית לכתובת אחת',  W.LIM.perDay <= 20, true);
  t('תקרת אורך התשובה',       W.MAX_TOKENS <= 700, true);
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
  t('אין מיקרופון בשלב הזה',
    /getUserMedia|SpeechRecognition|webkitSpeechRecognition/.test(client), false);
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
  console.log(`✓ אחת עשרה האפליקציות מחווטות (תגית, mount, open, PRE)`);

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
    console.log(`· כתובת השרת ריקה — אין כפתור באף אפליקציה, ותנאי השימוש (${ver}) נשארים. תקין.`);
  }

  console.log(bad ? `\n✗ ${bad} בדיקות נכשלו` : '\n✓ כל בדיקות הבוט עברו');
  process.exit(bad ? 1 : 0);
});
