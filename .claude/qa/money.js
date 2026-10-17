/* =====================================================================
   money.js — אין מסחר באתר, ואין דרך להחזיר אותו בשקט

     node .claude/qa/money.js

   **ההחלטה.** הבעלים הכריע 14.9.2026: ״אין עלות כספית, תמחק כל
   קשר לכסף״. לא מחיר, לא דף קנייה, לא מבצע השקה שמרמז על חיוב
   עתידי, ולא שדה `price` ששוכב ומחכה.

   **למה זו בדיקה ולא רק מחיקה.** המסחר כאן נבנה בהדרגה ובשקט:
   קודם שדה `price` ברשומה, אחר כך תגית בכרטיס, אחר כך עמוד
   מחירים, ואז `launch.js` ששכתב את התגיות ו-`buy.html` עם טופס.
   כל שלב היה קטן והגיוני בפני עצמו. מחיקה בלי שער מזמינה את
   אותה הצטברות שוב, ואיש לא יראה אותה עד שהיא על המסך.

   **מה נשאר בכוונה, ואינו ממצא — שתי משפחות:**

   · **תוכן לימודי שעוסק בכסף.** `lomda/data/money.js` היא
     אוריינות פיננסית; במתמטיקה יש תרגילי מחיר בש״ח. מחיקת
     תוכן לימודי אסורה ב-`CLAUDE.md`, וזה גם אינו מה שהוחלט.
     לכן הבדיקה רצה על **הדפים והנתונים של האתר**, לא על
     `lomda/data/` ולא על בנקי השאלות.
   · **האמירה ״חינם״.** היא היעדר מחיר, לא מחיר — והיא בדיוק
     המסר. `badge`, `noAds` ו-`s4` אומרים אותה, והן נשארות.
     מחיקתן הייתה משאירה את הלומד בלי לדעת שזה חינם.

   ── חמש בדיקות ──

     1. אין קובץ מסחר: `pricing/`, `theory/buy.html`, `launch.js`,
        `launch.css`, `marketing/billing-model.md`
     2. אין שדה `price` או `once` באף רשומה ב-`DATA.APPS`
     3. אין מחרוזת מסחר ב-`DATA.STR` באף שפה
     4. אין סכום כסף בדף שהלומד רואה — ספרה צמודה ל-₪, ‎$‎ או ‎€‎
     5. אין תגית `description` שמבטיחה תשלום, ואין קישור קנייה
     6. אין הבטחת תשלום בפרוזה של דף הבית (DATA.STR, DATA.APPS)
     7. אין שדה הרשמה: `type="email"` באף מקום, ו-`type="password"` רק
        בקוד המורה (te-pin, te-pin2) ובשדה מפתח הקול (gk)          — O-171
     8. אין מילות הרשמה / חשבון משתמש / מנוי בארבע שפות בגוף הדפים  — O-171
     9. אין סכום כסף צמוד להבטחת תשלום או ל״לחודש/לשנה״ בגוף הדפים  — O-196
   בדיקות 8–9 רצות על כל .html/.js שהלומד טוען, ולכן הן פוגשות תוכן
   לימודי אמיתי (״להירשם במשרד הפנים״, ״דמי מנוי 50 שקלים״ בבגרות 3).
   אותו תוכן רשום ב-CONTENT למטה כמניין לכל קובץ, ומודפס בכל ריצה;
   מניין שעלה הוא ממצא, ומניין שירד נופל עד שהבסיס מעודכן — כך שאין
   ירוק שקט לשום כיוון.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const fail = [];
const F = m => fail.push(m);

/* --- 1. קבצים שנמחקו, ואסור שיחזרו --- */
const GONE = ['pricing', 'theory/buy.html', 'launch.js', 'launch.css',
              'marketing/billing-model.md', 'tests/launch.test.html'];
for (const rel of GONE)
  if (fs.existsSync(path.join(ROOT, rel)))
    F(`${rel} חזר — הוא נמחק בהכרעת הבעלים 14.9.2026`);

/* --- דף הבית --- */
const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dm = home.match(/var DATA=(\{[\s\S]*?\});\n/);
if (!dm) { console.log('✗ לא נמצא DATA= בדף הבית'); process.exit(1); }
const DATA = JSON.parse(dm[1]);

/* --- 2. שדות מחיר ברשומות --- */
for (const a of DATA.APPS)
  for (const k of ['price', 'once', 'cost', 'sale'])
    if (k in a) F(`${a.id}: השדה "${k}" חזר ל-DATA.APPS`);

/* --- 3. מחרוזות מסחר במילון --- */
const BAD_KEYS = ['lbar', 'nPricing', 'free', 'once', 'buy', 'price', 'pricing'];
for (const lg of Object.keys(DATA.STR))
  for (const k of BAD_KEYS)
    if (k in DATA.STR[lg]) F(`STR.${lg}.${k} — מחרוזת מסחר חזרה`);

/* --- 4. סכום כסף בטקסט שהלומד רואה --------------------------------
   ספרה שצמודה לסימן מטבע. ״חינם״, ״מجّاني״ ו-״Free״ אינם סכום
   ואינם נתפסים כאן — וזה בכוונה. */
const AMOUNT = /\d\s*[₪$€]|[₪$€]\s*\d/;
for (const lg of Object.keys(DATA.STR))
  for (const [k, v] of Object.entries(DATA.STR[lg]))
    if (typeof v === 'string' && AMOUNT.test(v))
      F(`STR.${lg}.${k} — סכום כסף: ${JSON.stringify(v).slice(0, 60)}`);
for (const a of DATA.APPS)
  for (const field of ['n', 'd'])
    for (const [lg, v] of Object.entries(a[field] || {}))
      if (typeof v === 'string' && AMOUNT.test(v))
        F(`${a.id}.${field}.${lg} — סכום כסף: ${v.slice(0, 50)}`);

/* --- 5. מה הדף מבטיח מחוץ לגוף: meta, וקישורי קנייה ---------------
   `promo.js` נולד מזה בדיוק: שתי תגיות `description` אמרו ״שמונה
   בתשלום״ בזמן שהחלון הקופץ אמר ״הכול חינם״, וחודשיים של בדיקות
   לא ראו זאת — כל הבדיקות הביטו במה שהקוד עושה, ואף אחת לא במה
   שהדף מבטיח. */
const PAGES = [];
(function walk(dir, depth) {
  if (depth > 2) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'marketing') walk(p, depth + 1); }
    else if (e.name.endsWith('.html')) PAGES.push(p);
  }
})(ROOT, 0);

const PAY_META = /(בתשלום|לרכישה|רכישה|מנוי|شراء|مدفوع|اشتراك|платн|подписк|купить|paid|purchase|subscription|checkout)/i;
for (const p of PAGES) {
  const src = fs.readFileSync(p, 'utf8');
  const rel = path.relative(ROOT, p);
  const meta = src.match(/<meta[^>]+name=["']description["'][^>]*>/gi) || [];
  for (const tag of meta)
    if (PAY_META.test(tag)) F(`${rel} — תגית description מבטיחה תשלום: ${tag.slice(0, 80)}`);
  if (/href=["'][^"']*\/(pricing|buy|checkout)\b/i.test(src))
    F(`${rel} — קישור קנייה`);
}

/* --- 6. הבטחת תשלום שכתובה כפרוזה, להיום או לעתיד -----------------
   **הכרעת הבעלים 15.9.2026:** ״אין תשלום גם לא בעתיד, אנו פרויקט
   חברתי כשירות לציבור.״

   בדיקות 2–4 מחפשות **שדה** בשם `price` ו**סכום** צמוד למטבע, ולכן
   המשפט שעמד באותו רגע בדף הבית בארבע שפות חמק מכולן:

     ״שמונה נוספות במחיר של ספר לימוד אחד, למשפחה שלמה.״

   אין בו מספר, אין בו ₪, ואין בו שדה — יש בו רק הבטחה. הוא שרד את
   מחיקת המסחר של 14.9 והמשיך להופיע ללומדים, מפני ששער שבודק
   מבנה אינו רואה משמעות.

   **והמלכודת שכאן היא ההפך מהרגיל: המסר הנכון מכיל את אותן מילים
   בדיוק.** ״אין תשלום, אין מנוי ואין פרסומות״ הוא בדיוק מה שצריך
   לכתוב, ורשימת מילים תמימה הייתה מפילה אותו ומאמנת את העין
   להתעלם. לכן כל התאמה נבדקת מול המילה שלפניה: שלילה מכשירה,
   והיעדר שלילה הוא ממצא.

   הוכחת נפילה: על עץ העבודה שלפני התיקון — ארבעה ממצאים, אחד לכל
   שפה. אחרי — אפס. */
const PROMISE = new RegExp([
  'במחיר', 'בתשלום', 'תשלום', 'מנוי', 'בעלות', 'יעלה כסף', 'לעת עתה', 'תקופת ניסיון', 'מבצע השקה',
  'بثمن', 'مدفوع', 'اشتراك', 'رسوم', 'فترة تجريبية',
  /* ברוסית ״חינם״ היא בדיוק ״תשלום״ עם קידומת: **бес**платно.
     ו-`\b` של JS אינו עוזר כאן — הוא מוגדר על `[A-Za-z0-9_]`, ולכן
     כל אות קירילית היא ״לא־מילה״ ואין גבול בשום מקום. לכן מבט
     לאחור מפורש: אות קירילית לפני השורש פוסלת את ההתאמה. */
  'по цене', '(?<![а-яё])плат', '(?<![а-яё])оплат', '(?<![а-яё])подписк', 'пробный период',
  'for the price of', 'paid', 'subscription', 'free trial', 'free for now', 'currently free'
].join('|'), 'gi');

/* שלילה בארבע השפות. ״חינם״ אינה שלילה — היא אמירה עצמאית, ולכן
   ״חינם לזמן מוגבל״ חייב להיתפס. */
const NEG = /(אין|ללא|בלי|לא)\s*$|(بلا|بدون|دون|لا|ولا)\s*$|(без|ни|не)\s*$|(no|not|never|without)\s+$/i;

const scan = (where, v) => {
  if (typeof v !== 'string') return;
  let m;
  PROMISE.lastIndex = 0;
  while ((m = PROMISE.exec(v)) !== null) {
    const before = v.slice(Math.max(0, m.index - 14), m.index);
    if (NEG.test(before)) continue;
    F(`${where} — הבטחת תשלום: ${JSON.stringify(v.slice(Math.max(0, m.index - 30), m.index + 40))}`);
  }
};

for (const lg of Object.keys(DATA.STR))
  for (const [k, v] of Object.entries(DATA.STR[lg])) scan(`STR.${lg}.${k}`, v);
for (const a of DATA.APPS)
  for (const field of ['n', 'd'])
    for (const [lg, v] of Object.entries(a[field] || {})) scan(`${a.id}.${field}.${lg}`, v);

/* --- 7–9. גוף הדפים: טופס הרשמה, מילות הרשמה, וסכום שמבטיח תשלום ---
   O-171 (7.10.2026): ״חשבון משתמש״ ו״הרשמה״ לא נאכפו כלל — טופס
   <input type="email"><input type="password"> עם ״צור חשבון משתמש״
   הוזרק לעץ נקי וחזר ✓. O-196: ״המנוי עולה 49 ₪ לחודש״ בגוף דף
   אפליקציה חזר ✓, כי AMOUNT ו-PROMISE רצו על דף הבית בלבד.

   מה נסרק: כל .html/.js בשורש ובכל תיקייה שהלומד מגיע אליה. מה לא:
   כל תיקיית `data/`, כמו `lomda/data/` (בנקי תוכן — אוריינות פיננסית, מוחרג
   מבנית ומתועד ב-O-171), `marketing/`, `promo/`, `docs/`,
   `learning-core/`, `tutor-api/` (אינם דף שהלומד רואה), `vendor/`,
   ו-`sw.js`. */
const SKIP = new Set(['node_modules', 'vendor', 'audio', 'img', 'fonts', 'reports', 'docs',
                      'marketing', 'promo', 'learning-core', 'tutor-api', 'data']);
const BODY = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(html|js)$/.test(e.name) && e.name !== 'sw.js') BODY.push(p);
  }
})(ROOT);
if (BODY.length < 60) F(`נסרקו ${BODY.length} קבצים בלבד בגוף הדפים — הסריקה נשברה`);

/* 7. טופס הרשמה. כל תגית <input — גם כשהיא בונה מחרוזת ב-JS. */
const PW_OK = /\bid=["'](te-pin2?|gk)["']/;
for (const p of BODY) {
  const src = fs.readFileSync(p, 'utf8');
  const rel = path.relative(ROOT, p);
  for (const m of src.matchAll(/<input\b[^>]*/gi)) {
    const tag = m[0].slice(0, 300);
    const line = src.slice(0, m.index).split('\n').length;
    if (/type\s*=\s*["']?email/i.test(tag)) F(`${rel}:${line} — שדה דוא״ל (type=email): אין חשבון משתמש ואין הרשמה`);
    else if (/type\s*=\s*["']?[^>]{0,30}password/i.test(tag) && !PW_OK.test(tag))
      F(`${rel}:${line} — שדה סיסמה שאינו קוד המורה או מפתח הקול: ${tag.slice(0, 70)}`);
    if (/autocomplete\s*=\s*["']?(username|email|new-password|current-password)/i.test(tag))
      F(`${rel}:${line} — autocomplete של חשבון משתמש`);
  }
  for (const m of src.matchAll(/(?:\.type\s*=|setAttribute\(\s*["']type["']\s*,)\s*["'](email|password)["']/g))
    F(`${rel}:${src.slice(0, m.index).split('\n').length} — שדה ${m[1]} שנוצר ב-JS`);
}

/* 8. מילות הרשמה, חשבון ומנוי — בארבע שפות. שלילה לפני המילה מכשירה
   (״בלי הרשמה״, ״без регистрации״, ״no sign-up״, ״بدون تسجيل الدخول״). */
const SIGNUP = new RegExp([
  'הרשמה', 'ההרשמה', 'להירשם', 'הירשמו', 'הירשם', 'הרשמו', 'צרו? חשבון', 'חשבון משתמש', 'פתיחת חשבון',
  'פתחו? חשבון', 'התחברו? לחשבון', 'כניסה לחשבון', 'שם משתמש', 'למנוי', 'הצטרפו למנוי',
  'sign[ -]?up', 'create (?:an |your )?account', 'user account', 'register (?:now|here|for|to)', 'registration',
  'log ?in to your account', 'username', 'subscribe',
  'إنشاء حساب', 'أنشئ حساب', 'حساب (?:ال)?مستخدم', 'تسجيل الدخول', 'سجّ?ل الدخول', 'اسم المستخدم', 'اشترك',
  '(?<![а-яё])регистрац', 'зарегистр', 'создать аккаунт', 'создайте аккаунт', 'уч[её]тн(?:ая|ую|ой) запис',
  'личный кабинет', 'войти в аккаунт', 'имя пользователя', '(?<![а-яё])подпиш'
].join('|'), 'gi');
const NEG2 = /(אין|ללא|בלי|לא|ולא|אין צורך ב|לא צריך|אין צורך)\s*$|(بلا|بدون|دون|لا|ولا|ليس)\s*$|(без|ни|не|нет)\s*$|(no|not|never|without|nor)\s+$/i;

/* 9. סכום כסף שצמוד להבטחת תשלום, או ל״לחודש/לשנה״. */
const AMT2 = /\d[\d,.]*\s*(?:₪|\$|€|ש["״]ח|שקל|NIS|ILS|shekel|шекел|شيكل|دولار|руб|dollars?)|[₪$€]\s*\d/gi;
const PROMISE1 = new RegExp(PROMISE.source, 'i');
const PER = /^\s*(?:ל?חודש|לשנה|בחודש|בשנה|per (?:month|year)|a month|a year|\/\s*(?:mo|month|yr|year)|في الشهر|شهري|سنوي|в месяц|в год|ежемесяч)/i;

/* תוכן לימודי אמיתי שנמדד 16.10.2026 — מניין לכל קובץ. כל אחד נקרא
   בעין: שאלות ומשפטי קריאה, לא ממשק. */
const CONTENT = {
  signup: {
    'net-elem/js/data.js': [1, 'הסבר בטיחות ברשת (ru): ״кто-то пытается войти в аккаунт״ — חשבון של הלומד במשחק, לא באתר (O-174, 17.10.2026)'],
    'civics/index.html': [2, 'רישום נישואין בישראל — שאלת אזרחות (ru)'],
    'english/index.html': [6, 'קטע קריאה ״A youth center tested online sign-up״ (6 מ-16.10.2026: מסיח ״The paper sign-up forms disappeared״, O-222)'],
    'geography/index.html': [4, 'חובת רישום של מהגר — שאלת הגירה בארבע שפות'],
    'hebrew/app.js': [2, 'מסיח ״להירשם לשיעור״ ותרגומו ״Sign up for a lesson״ (O-223, 16.10.2026)'],
    'hebrew-arab/index.html': [4, 'מודעה במרכז הקהילתי — ״צריך להירשם מראש״'],
    'kotvim/index.html': [1, 'משפט ״I will sign up again״'],
    'teachers/index.html': [2, 'דף המורים: כניסה לאתר משרד החינוך (ar), ו״регистрация … не нужны״ (השלילה אחרי המילה)'],
  },
  amount: {
    'math-elem/index.html': [2, 'שאלת מטבעות — ״משלמים בשקלים״ (ru/ar)'],
    'math-teen/bagrut3.js': [5, 'בגרות 3 — דמי מנוי במכון כושר, שאלה והסבר'],
    'motal/index.html': [6, 'החזר השקעה של מקרר ושל מערכת סולארית'],
  },
};
const seen = { signup: {}, amount: {} };
const hit = (kind, rel, line, ctx) => {
  seen[kind][rel] = (seen[kind][rel] || 0) + 1;
  (seen[kind]['@' + rel] = seen[kind]['@' + rel] || []).push(`${rel}:${line} ${JSON.stringify(ctx)}`);
};
for (const p of BODY) {
  const src = fs.readFileSync(p, 'utf8');
  const rel = path.relative(ROOT, p);
  const lineOf = i => src.slice(0, i).split('\n').length;
  let m;
  SIGNUP.lastIndex = 0;
  while ((m = SIGNUP.exec(src))) {
    if (NEG2.test(src.slice(Math.max(0, m.index - 16), m.index))) continue;
    hit('signup', rel, lineOf(m.index), src.slice(Math.max(0, m.index - 25), m.index + 30));
  }
  AMT2.lastIndex = 0;
  while ((m = AMT2.exec(src))) {
    const end = m.index + m[0].length;
    const win = src.slice(Math.max(0, m.index - 40), end + 40);
    const pm = win.match(PROMISE1);
    const promised = pm && !NEG.test(win.slice(Math.max(0, pm.index - 14), pm.index));
    if (PER.test(src.slice(end, end + 20)) || promised) hit('amount', rel, lineOf(m.index), win);
  }
}
const LABEL = { signup: 'מילת הרשמה / חשבון / מנוי', amount: 'סכום כסף ליד הבטחת תשלום או ״לחודש״' };
const known = [];
for (const kind of ['signup', 'amount']) {
  const files = new Set(Object.keys(seen[kind]).filter(k => k[0] !== '@').concat(Object.keys(CONTENT[kind])));
  for (const rel of files) {
    const got = seen[kind][rel] || 0;
    const [want, why] = CONTENT[kind][rel] || [0, ''];
    if (got === want) { if (got) known.push(`${rel} — ${LABEL[kind]} ×${got}: ${why}`); continue; }
    if (got > want) {
      F(`${rel} — ${LABEL[kind]}: ${got} מופעים, והתוכן הלימודי הרשום הוא ${want}`);
      for (const l of seen[kind]['@' + rel] || []) fail.push('     ' + l.slice(0, 140));
    } else {
      F(`${rel} — ${LABEL[kind]}: ${got} מופעים, והבסיס הרשום ב-CONTENT הוא ${want}. התוכן השתנה — עדכן את המניין ב-money.js`);
    }
  }
}

/* --- דוח --- */
console.log(`== אין מסחר · ${DATA.APPS.length} אפליקציות · ${PAGES.length} דפים (meta) · ${BODY.length} קבצים (גוף הדף)`);
for (const k of known) console.log('   · תוכן לימודי, ידוע: ' + k);
if (fail.length) {
  console.log(`\n   FAIL (${fail.length}):`);
  for (const l of fail) console.log('   ✗ ' + l);
  process.exit(1);
}
console.log('   ✓ אין מחיר, אין דף קנייה, אין הבטחת תשלום, ואין הרשמה, חשבון משתמש או מנוי באף דף');
