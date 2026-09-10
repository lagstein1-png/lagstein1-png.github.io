# כותבים ביחד — פיגום כתיבה

פיגום לכתיבה: הלומד בוחר, מרכיב, ורואה טקסט שלם שהוא בנה בעצמו.
**האפליקציה הזאת עדיין אינה מפורסמת.**

**מזהה:** `kotvim` · **שלב:** `internal` · **קובץ:** `index.html`, 3,122 שורות

## היא בשלב `internal` — ומה זה אומר

    build → internal → content-qa → approved → public

היא בשלב השני. **היא אינה ב-`DATA.APPS` שבדף הבית, והיא נושאת את
השער הפנימי** מ-`.claude/qa/internal-gate.html` (מפתח
`shlav-internal-kotvim`). היא מגיעה ללומד אמיתי רק אחרי `approved`.

השער אינו הגנה קריפטוגרפית ואינו מתיימר להיות — אין שרת, והכול
HTML גלוי. הוא מונע מלומד להיתקל באפליקציה לא בשלה.

מקור האמת הוא `.claude/qa/stages.json`, ו-`node .claude/qa/stage.js`
**נופל** אם הרישום, דף הבית וקובץ האפליקציה אינם מסכימים.
התהליך המלא, ומה נדרש כדי לצאת מכל שלב, ב-`PIPELINE.md`.

## התוכן

`content.js` אינו סורק אותה — תשע המשפחות שלו מודדות **שאלה**,
ואין כאן שאלה. הסורק שלה הוא:

    node .claude/qa/kotvim.js

והוא בודק ארבע שפות בכל קטע, מספיק קטעים לכל בחירה חוקית, ושאין
קטע שחוזר בשני נושאים.

## מפתחות `localStorage`

| מפתח | מה |
|---|---|
| `kotvim-state-v1` | התקדמות הלומד |
| `kotvim-gkey` | מפתח הקראה טבעית — במכשיר בלבד |
| `kotvim-teacher` | מצב מורה |
| `shlav-internal-kotvim` | השער הפנימי |

## בדיקות שנוגעות לה

    node .claude/qa/serve.js
    node .claude/qa/kotvim.js         # התוכן
    node .claude/qa/stage.js          # השער — מי מותר ללומד
    node .claude/qa/smoke.js kotvim
    node .claude/qa/all.js

## PWA — מה שהופך אותה לאפליקציה

`manifest.json` (‎3‎ אייקונים, `display: standalone`, `lang: he`, `dir: rtl`)
ו-`sw.js` שמצרף מראש **5 נכסים**. אחרי טעינה ראשונה היא עובדת
בלי אינטרנט, ואפשר להתקין אותה על מסך הבית.

**המטמון שלה הוא `kotvim-` ושלה בלבד.** שנים־עשר קובצי ה-`sw.js`
מצרפים את אותם `/legal/terms.js` ו-`/legal/protect.js`, כל אחד
למטמון משלו — ולכן נגיעה ב-`legal/` מחייבת להעלות את **כל**
המפתחות יחד. ההסבר המלא ב-`CLAUDE.md`, ״מלכודת הקאש של `legal/`״.

## גרסה — שתי מחרוזות, לא אחת

    var BUILD="k7 · 2026-09-10";
    navigator.serviceWorker.register("sw.js?v=k7-pwa1");

`sw.js` גוזר את שם המטמון מ-`?v=` שבכתובת הרישום, **לא** מ-`BUILD`.
עדכון של אחד בלי השני משאיר את הלומד עם הקוד הישן.
`node .claude/qa/cache.js` נופל על אי־התאמה, וגם על מפתח שכבר
קיים ב-`origin/main` עם תוכן אחר.

## ״עזרה מהמורה״ (ג׳וש)

מחווטת בארבע נקודות: תגית `<script src="/tutor/tutor.js">`,
`TUTOR.mount(...)`, קריאת `TUTOR.open()` מהנתב, והנתיב ב-`PRE`
שב-`sw.js`. **הכפתור אינו מוצג** כל עוד `API` ריק ב-`tutor/tutor.js`;
ההפעלה היא `node .claude/qa/enable-tutor.js <כתובת>`. הצד השרתי
כולו ב-`tutor-api/worker.js`, והתפקיד של האפליקציה הזאת נמצא שם
ב-`ROLE`.

## מה אין כאן

אין `npm install`, אין build step, אין framework ואין תלות חיצונית.


---

*נוצר מקריאה בקוד ובדוחות ה-QA, 10.9.2026. כל מספר כאן נמדד בפקודה — אין הערכות.*
