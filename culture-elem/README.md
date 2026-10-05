# תרבות ומסורת יהודית-ישראלית לילדים (culture-elem) — שלב `build`

אפליקציית לימוד סטטית, בלי build step ובלי תלות חיצונית.
כתובת מיועדת: `bekol.co.il/culture-elem/`. **עדיין לא פורסמה** — שער פנימי
בראש `index.html`, ופתיחה רק עם `?internal=shlav-internal-culture-elem`.
השלב הרשום ב-`.claude/qa/stages.json` הוא `build`, ו-`contentQA` רשום שם
`not-run` — אף שהדוח ב-`.claude/qa/reports/culture-elem.md` הוא PASS מ-5.10.2026.
עדכון הרשומה אינו שייך לתיקייה הזאת.

## קבצים

`index.html`, `app.css`, `manifest.json`, `sw.js`,
`js/{i18n,data,engine,speech,app}.js`, `img/` (ארבעה אייקונים + og), `audio/`.

- `js/i18n.js` — 57 מפתחות ממשק, כל אחד `S(key, he, ar, ru, en)`. העברית היא
  המקור; ערבית/רוסית/אנגלית באיכות מכונה וממתינות לעין של דובר.
- `js/data.js` — כל התוכן בפורמט שורות עם `|`: 174 ישויות (`E`), 12 נושאים
  (`S`), 68 שורות תוכן (`L`) ו-69 שאלות (`Q`), כולן בארבע שפות.
- `js/engine.js` — מפרק את `data.js` ובונה סבב תרגול. התשובה הנכונה תמיד
  מגיעה מהנתונים. **לכל 69 השאלות יש שלושה מסיחים כתובים בשורה עצמה**;
  `poolFor` קיים כגיבוי ואינו בשימוש בפועל כאן.
- `js/speech.js` — ההקראה. חיתוך אמירה ב-`SEG_MAX=90`.
- `js/app.js` — חמישה מסכים: `home`, `lesson`, `practice`, `done`, `settings`.

## יחידות ומסכים

12 נושאים + יחידת ״ערבוב״ (`mix`) = 13 כרטיסים במסך הבית. סבב נושא = עד 10
שאלות; סבב ערבוב = 12 שאלות מכל המאגר.

הנושאים: שבת · ראש השנה ויום כיפור · סוכות ושמחת תורה · חנוכה · ט״ו בשבט ·
פורים · פסח · שבועות · הרבה קהילות, הרבה מנהגים · חגים של כולם בישראל ·
מקומות מיוחדים בירושלים ובחיפה · הלוח העברי והשפה העברית.

## מה כבר נעשה

- ארבע שפות מלאות בממשק ובתוכן.
- סריקת `content.js` במסלול STORIES: PASS, 69 שאלות, 0 ממצאים חוסמים,
  0 לבדיקה, 69 מתוך 69 עם הסבר בכל שפה. `node .claude/qa/fresh.js` מאשר
  שהדוח מתאר את העץ הנוכחי.
- מפתח מטמון ייחודי `cultureelem-`; ה-`activate` מוחק רק מפתחות שמתחילים
  ב-`cultureelem-`, ואין בריפו תחילית אחרת שהיא רישא שלו.
- מפתח `localStorage` ייחודי `culture-elem:v1` (`js/app.js:1`), ושער פנימי
  במגירה משלו `shlav-internal-culture-elem`.
  `node .claude/qa/storage.js` — 45 אפליקציות, 0 ממצאים.
- ארבעה אייקונים ב-`img/`, שלושתם במניפסט כולל `icon-maskable-512.png` עם
  `purpose: "maskable"`, ו-`apple-touch-icon` + `rel="icon"` בראש הדף.
- `/speech/recorded.js` בתגית ב-`index.html` וב-`PRE` של ה-sw, ו-`audio/manifest.json`
  קיים (ריק: `langs.he.count = 0`). `node .claude/qa/recorded.js` ו-
  `node .claude/qa/record.js --check` ירוקים.
- חלון עזרה של לימור שנבנה ב-`app.js` עם `role="dialog"`, `aria-modal`,
  סגירה ב-Escape והחזרת מיקוד. `node .claude/qa/aria.js culture-elem` ירוק.

## מה עוד לא נעשה

- **האייקונים הם אייקוני בילדר זמניים.** הרקע שלהם `#fff8ec` ו-`theme_color`
  במניפסט הוא `#d9480f`; `.claude/qa/icon.js` מחזיק עבור התיקייה הזאת חריג
  מפורש ב-`FOREIGN` שנוסחו ״אייקונים זמניים של הבילדר — לחדש עם icon.js לפני
  פרסום״. התנאי הזה עדיין לא מולא.
- **אין לאפליקציה הזאת מפתח ב-`ROLE` שב-`tutor-api/worker.js`** (19 מפתחות,
  ו-`culture-elem` אינו ביניהם). `app.js:210` קורא
  `TUTOR.mount({app:"culture-elem"})`, ובלי המפתח `readBody` מחזיר
  `400 {"error":"bad"}` (worker.js:935, 1355), והלקוח נופל למוח המקומי
  עם השורה ״התשובה מהמכשיר, לא מהשרת״. כלומר לימור לא תענה על תרבות ומסורת
  באתר החי עד שיתווסף מפתח.
- **ארבעה מששת מצבי הנגישות אינם קיימים כאן.** מסך ההגדרות מציע מהירות
  הקראה, ערכת צבע ושפה בלבד; ב-`app.css` אין סלקטור ל-`.hc`, `.clear`,
  `.spaced`, `.ts2`/`.ts3` ואין `--fs`. המצב היחיד שמחוץ לערכת הצבע הוא
  תנועה מופחתת, והוא דרך `@media(prefers-reduced-motion:reduce)` בלבד
  (`app.css:106`) ולא דרך מתג. `node .claude/qa/a11y.js culture-elem` מחזיר
  `✗ אין applyModes`. אותו מצב בכל משפחת `*-elem`.
- אין הקלטות MP3 — `node .claude/qa/record.js --check` מדווח ״אין הקלטות
  עדיין — קול המכשיר״. כל ההקראה נשענת על קול המכשיר.
- אין מצב מבחן כיתתי ואין מסך מורה — ולכן גם אין `GKEY_STORE` ואין
  `shlav-exams-*`. זו החלטה, לא השמטה.
- האפליקציה אינה רשומה ב-`DATA.APPS` שבדף הבית (`grep -c culture-elem
  index.html` = 0), ואינה נמנית ב-`badge`.
- `short_name` במניפסט זהה ל-`name` (״תרבות ומסורת לילדים״, 19 תווים) —
  ארוך למסך הבית של מכשיר. אותו דפוס ב-`civics-elem`, `tanakh-elem`
  ו-`english-elem`.
- ניגודיות הצבעים ב-`app.css` לא נמדדה — `contrast.js` דורש דפדפן ושרת.
