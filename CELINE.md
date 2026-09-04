# משימות לסלין

**מי כותב:** סופר, מהנדס התוכנה ומנהל הפרויקט.
**למי:** סלין. **מתי נכתב:** 2026-09-04, מול `main` בגרסה `c828b24`.

זו רשימת עבודה, לא רשימת רעיונות. כל משימה כאן נולדה ממדידה
בריפו באותו יום, והמקור של כל מספר כתוב לידו. משימה שאין לה
מקור — לא נכנסה.

הסדר בכל פרק הוא סדר הביצוע. מתחילים בפיתוח 1, לא בעיצוב 4.

---

## קישורים שצריך כל יום

| מה | איפה |
|---|---|
| הריפו | https://github.com/lagstein1-png/lagstein1-png.github.io |
| האתר החי | https://lagstein1-png.github.io/ |
| כללי העבודה (חובה לפני הכול) | [`CLAUDE.md`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/CLAUDE.md) |
| תמונת מצב נמדדת | [`STATUS.md`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/STATUS.md) |
| מבנה הקוד | [`ARCHITECTURE.md`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/ARCHITECTURE.md) |
| כלי הבדיקה | [`.claude/qa/README.md`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/.claude/qa/README.md) |
| מה מותר להבטיח בשיווק | [`marketing/facts.md`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/marketing/facts.md) |
| לוח הפרסום | [`marketing/plan-weekly.md`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/marketing/plan-weekly.md) |
| ספריית הליבה המשותפת | [`learning-core/`](https://github.com/lagstein1-png/lagstein1-png.github.io/tree/main/learning-core) |

### שתים־עשרה האפליקציות — כתובת חיה וקובץ

| אפליקציה | חי | קוד |
|---|---|---|
| מתמטיקה לחכמים שמתקשים | https://lagstein1-png.github.io/math-app/ | [`math-app/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/math-app/index.html) |
| שלב — תיכון | https://lagstein1-png.github.io/math-teen/ | [`math-teen/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/math-teen/index.html) |
| אקסיומה — שנה א׳ | https://lagstein1-png.github.io/math-uni/ | [`math-uni/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/math-uni/index.html) |
| אקסיומה ב׳ | https://lagstein1-png.github.io/math-uni2/ | [`math-uni2/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/math-uni2/index.html) |
| אקסיומה ג׳ | https://lagstein1-png.github.io/math-uni3/ | [`math-uni3/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/math-uni3/index.html) |
| 806 — בגרות | https://lagstein1-png.github.io/bagrut-806/ | [`bagrut-806/`](https://github.com/lagstein1-png/lagstein1-png.github.io/tree/main/bagrut-806) |
| אולפן | https://lagstein1-png.github.io/ulpan/ | [`ulpan/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/ulpan/index.html) |
| ניב — אנגלית | https://lagstein1-png.github.io/english/ | [`english/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/english/index.html) |
| מפנה — היסטוריה | https://lagstein1-png.github.io/history/ | [`history/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/history/index.html) |
| לומדה | https://lagstein1-png.github.io/lomda/ | [`lomda/`](https://github.com/lagstein1-png/lagstein1-png.github.io/tree/main/lomda) |
| מקריא קולי | https://lagstein1-png.github.io/reader/ | [`reader/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/reader/index.html) |
| תאוריה מדברת | הקישור שבכרטיס בדף הבית (השדה `u` ב-`DATA.APPS`) | ריפו נפרד. אין תיקייה כאן, וזה תקין. השם האנגלי הישן אסור בכל מקום — `naming.js` אוכף. |

---

## חמישה כללים שאינם ניתנים למשא ומתן

1. **מספר בלי מקור הוא שקר.** כל מספר בדוח שלך מגיע מקובץ או
   מפקודה שהרצת, והמקור כתוב לידו. אין "בערך". אין "כנראה".
   אין לך גישה? כותבים: "אין לי גישה לנתון הזה."
2. **לא נוגעים במספרי גרסה.** לא ב-`BUILD` ולא ב-`sw.js?v=`.
   את בונה בענף ומשאירה את המספר כמו שהוא. אני מקצה מספר טרי
   במיזוג. בדוח את כותבת: "דורש העלאת גרסה ב-<אפליקציה>".
3. **`node .claude/qa/all.js` לפני כל commit.** היום זה נותן
   "13 בדיקות, כולן עברו". אם אחרי השינוי שלך זה נותן פחות —
   השינוי לא נגמר.
4. **ארבעה דברים שלא עושים ולא שואלים עליהם:** שירות בתשלום,
   מפתח API בריפו, תלות חיצונית חדשה, מחיקת תוכן קיים.
5. **ענף משלך לכל משימה:** `celine/<מספר-משימה>-<מילה>`.
   למשל `celine/d1-lineq`. לא דוחפים ל-`main`. לפני שמתחילים
   ולפני ה-commit: `git fetch origin main` ומסתכלים ב-log.

---

## פיתוח

### D1 · קריטי · שתי רמות באקסיומה מציגות פחות מארבע אפשרויות

**הממצא.** `node .claude/qa/all.js` היום, פרק `options`:

    math-uni  total=55200  under4=1200 (2.2%)
      lineq L2   100%
      logic L1   100%

כל שאלה ברמה 2 של "מערכות משוואות" ובכל רמה 1 של לוגיקה מציגה
פחות מארבע אפשרויות. תלמיד שמנחש שם מנחש מאחד משלושה או פחות.
המחולל: `genLinEq`, מוגדר ב-[`math-uni/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/math-uni/index.html)
שורה 4342 (`grep -n lineq`). את מחולל הלוגיקה תמצאי באותו קובץ.

**מה לעשות.** לפתוח את שני המחוללים ולהבין למה יש פחות מארבע.
אם השאלה היא מסוג "כמה פתרונות: 0 / 1 / אינסוף" — זה אולי מכוון,
ואז מוסיפים מסיח רביעי אמיתי (למשל "שניים") עם `why` שמסביר למה
הוא שגוי. אם זה באג במערבל — מתקנים אותו.

**סיום.** `node .claude/qa/options.js math-uni` מראה `under4=0`,
ו-`entropy` עדיין עובר. הסוכן `euclid` עובר על הניסוח אחרייך.

### D2 · קריטי · אפס תגיות שיתוף בכל האתר

**הממצא.** `grep -c 'property="og:'` על 14 קובצי `index.html`
מחזיר 0 בכולם. אין גם `twitter:`. פירוש: קישור שנשלח בוואטסאפ
או בפייסבוק — כל תוכנית השיווק — מגיע בלי תמונה ובלי כותרת.

**מה לעשות.** לכל אחד מ-13 הדפים (הבית ו-12 האפליקציות; `voice/`
ו-`legal/` לא) להוסיף ב-`<head>`: `og:title`, `og:description`,
`og:image`, `og:url`, `og:type`, ו-`twitter:card`. הכותרת והתיאור
נלקחים **מילה במילה** מ-`DATA.APPS` שבדף הבית (השדות `n.he` ו-`d.he`
בשורה 623 של `index.html`) — לא ממציאים ניסוח חדש. התמונה מגיעה
ממשימה E1, ועד שהיא קיימת משתמשים ב-`img/icon-512.png` של האפליקציה.

**סיום.** `grep -c 'property="og:'` מחזיר 5 בכל אחד מ-13 הדפים.
`node .claude/qa/all.js` עובר. בדוח: "דורש העלאת גרסה ב-13 דפים".

### D3 · חשוב · README ריק

**הממצא.** `cat README.md` מחזיר שורה אחת: `# lagstein1-png.github.io`.
זה הדף הראשון שכל מי שמגיע לריפו רואה.

**מה לעשות.** לכתוב README בעברית, קצר: מה זה, למי, טבלת 12
האפליקציות עם הקישורים החיים (הטבלה למעלה), איך מריצים בדיקות
(שלוש הפקודות מ-`STATUS.md`), ורישיון (יש קובץ `LICENSE`, קראי
אותו וכתבי מה הוא). כל מספר ב-README מגיע ממדידה, לא מזיכרון.
מה שכתוב ב-`marketing/facts.md` תחת "מה שאסור לכתוב" אסור גם כאן.

**סיום.** README שמישהו זר מבין בדקה. אני קורא ומאשר.

### D4 · חשוב · תרגומים חסרים ב"שלב" — יש כלי מדידה ולא משתמשים בו

**הממצא.** ב-[`math-teen/index.html`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/math-teen/index.html)
שורה 4596 מוגדר `TR_TODO`: מילון שאוסף בזמן ריצה כל מחרוזת עברית
שאין לה תרגום ב-`TR_AR`. הפונקציה `window.trTodo()` מדפיסה אותן.

**מה לעשות.** `node .claude/qa/serve.js`, לפתוח את "שלב" בדפדפן
בערבית, לעבור על כל 18 הנושאים ובכל אחד לפחות שאלה אחת עם רמז
והסבר, ואז בקונסולה `trTodo()`. כל מפתח שחוזר — לתרגם ולהוסיף
ל-`TR_AR`. **המחרוזת העברית היא המפתח** — לא משנים אותה.

**סיום.** `trTodo()` מחזיר רשימה ריקה אחרי אותו סיור. בדוח: כמה
מפתחות היו חסרים (מהפלט של `trTodo()`, לא מהערכה).

### D5 · חשוב · ספריית ליבה שאף אפליקציה לא טוענת

**הממצא.** `learning-core/` מכיל `core.js`, `core.css`, תבנית
ו-48 בדיקות. `node learning-core/test.js` היום: "48 עברו, 0 נפלו".
אבל `grep -rl "core.js" --include=*.html .` מחוץ לתיקייה מחזיר
כלום. אף אפליקציה לא משתמשת בה, ו-`CLAUDE.md` לא מזכיר אותה.

**מה לעשות.** לא לחווט אותה לשום אפליקציה. לקרוא את
[`learning-core/CORE-RULES.md`](https://github.com/lagstein1-png/lagstein1-png.github.io/blob/main/learning-core/CORE-RULES.md)
ואת `ARCHITECTURE.md`, ולכתוב פסקה אחת ב-`ARCHITECTURE.md` שאומרת
את האמת: מה יש שם, שאף אפליקציה לא טוענת אותה היום, ומה ההבדל
בינה לבין תשעת עותקי המנוע ש-`engine.js` משווה.

**סיום.** פסקה ב-`ARCHITECTURE.md`, ושורה ב-`CLAUDE.md` בפרק
"שתים־עשרה אפליקציות, שלוש־עשרה תיקיות" שמסבירה ש-`learning-core/`
אינה אפליקציה.

### D6 · זניח · קו הבסיס של eslint

**מה לעשות.** להריץ את שלוש הפקודות שבפרק eslint של
`.claude/qa/README.md` על **כל** האפליקציות, לא רק על השתיים
שבדוגמה. להשוות לטבלת קו הבסיס באותו קובץ (מתחילה בשורה 119).
כל שורה שאינה בטבלה: לתקן, או להוסיף לטבלה עם סיבה למה היא
שפירה.

**סיום.** הפלט זהה לטבלה, או שהטבלה עודכנה. בדוח: כמה ממצאים
חדשים, מהפלט.

---

## עיצוב

### E1 · חשוב · תמונת שיתוף לכל אפליקציה

**הממצא.** אין אף קובץ תמונה שאינו אייקון: `ls */img/` מראה
בדיוק ארבעה קבצים בכל תיקייה — `icon-192`, `icon-512`,
`icon-maskable-512`, `apple-touch-icon`. משימה D2 צריכה תמונה
בגודל 1200×630 והיא לא קיימת.

**מה לעשות.** 13 תמונות (בית + 12): רקע בצבע `theme_color` של
אותה אפליקציה מתוך ה-`manifest.json` שלה, האייקון, והשם העברי
מ-`DATA.APPS` באות גדולה וקריאה. בלי טקסט שיווקי. שמירה
כ-`<app>/img/og.png`. הסוכן `bezalel` הוא הכתובת לשאלות זהות
חזותית; הכללים שלו ב-`.claude/agents/bezalel.md`.

**סיום.** 13 קבצים, כל אחד 1200×630, כל אחד מתחת ל-200KB
(`ls -l` הוא המקור). D2 מצביע עליהם.

### E2 · חשוב · צילומי מסך ב-manifest

**הממצא.** `grep -l screenshots */manifest.json` מחזיר כלום.
בלי `screenshots` כרום מציג חלון התקנה דל, ואין מה לשלוח לאף
מכתב מהמכתבים שבשיווק.

**מה לעשות.** לכל אפליקציה שני צילומים מהאתר המקומי
(`node .claude/qa/serve.js`): טלפון 1080×1920 ומחשב 1920×1080,
ממסך שאלה עם רמז פתוח. לשמור ב-`<app>/img/shot-phone.png`
ו-`shot-desktop.png`, ולהוסיף למערך `screenshots` ב-`manifest.json`
עם `form_factor`. **לא** להוסיף אותם ל-`PRE` ב-`sw.js` — הם לא
נדרשים אופליין.

**סיום.** `grep -l screenshots */manifest.json` מחזיר 11 קבצים
(כל האפליקציות שבריפו). `node .claude/qa/cache.js` עובר.

### E3 · חשוב · ביקורת צבעי המותג

**הממצא.** `grep theme_color */manifest.json manifest.json`:
12 קבצים, 9 ערכים שונים, ו-`#5b56e0` מופיע שלוש פעמים. השאלה
אם זה מכוון או סחיפה.

**מה לעשות.** טבלה אחת: אפליקציה, `theme_color` מה-manifest,
הצבע הראשי בפועל מה-CSS (`--primary` או דומה ב-`index.html`),
הצבע הדומיננטי באייקון. שלוש עמודות, 12 שורות. איפה ששלושתן
לא תואמות — לסמן, ולהציע ערך אחד. **לא לשנות צבע לפני שאני
רואה את הטבלה** — שינוי צבע נוגע בפוטר של אפליקציה מותקנת.

**סיום.** הטבלה בדוח. אני מחליט, ואז את מבצעת.

### E4 · זניח · כרטיסי פתיחה לארבעת הסרטונים

**מה לעשות.** ב-`marketing/video-scripts.md` יש ארבעה תסריטים
(שורות 21, 40, 58, 79). לכל אחד כרטיס פתיחה 1920×1080 בצבעי
האפליקציה שהוא מציג, עם המשפט הראשון של הכתובית שלו. לשמור
ב-`marketing/img/`. זה מחכה עד שיש הקלטה (M3).

---

## שיווק

### M1 · קריטי · כל טקסטי השיווק סופרים שמונה אפליקציות, ויש שתים־עשרה

**הממצא.** `grep -n "שמונה" marketing/*.md`:

| קובץ | שורות |
|---|---|
| `copy-posts.md` | 18, 28, 68, 78, 149, 153, 209, 210 |
| `outreach-letters.md` | 54, 64, 99, 109, 118, 198, 226 |
| `plan-weekly.md` | 18, 19, 102 |
| `README.md` (של marketing) | 35, 36, 43 |

`facts.md` **כבר תוקן** — הוא אומר "תשע מתוך שתים־עשרה" לארבע
שפות ולמצב מורה. השאר לא. פוסט שאומר "שש מתוך שמונה" כשבאתר
כתוב "שתים־עשרה" שורף את הערוץ.

**מה לעשות.** לעבור על כל השורות בטבלה ולתקן לפי `facts.md`,
ורק לפיו. "שש מתוך שמונה" בארבע שפות → מה ש-`facts.md` אומר.
"שבע מתוך שמונה" במצב מורה → מה ש-`facts.md` אומר. לפני שכותבים
מספר על שפות — לפתוח את `var LANGS` ב-`index.html` של האפליקציה,
כמו ש-`facts.md` דורש.

**סיום.** `grep -n "שמונה" marketing/*.md` מחזיר רק שורות שבהן
"שמונה" אינו מניין אפליקציות (למשל "ארבע עד שמונה ספרות").

### M2 · חשוב · אימות המספרים ב-facts.md

**הממצא.** טבלת "לפי אפליקציה" ב-`facts.md` נושאת מספרים:
18 נושאים ב"שלב", 91 פריטים בלומדה, 279 פריטים ו-12 נושאים
באולפן, 1,273 / 553 / 6,823 בתאוריה. היום אימתתי אחד:
`node .claude/qa/banks.js` → "7 נושאים · 91 פריטים". השאר לא
אומתו בסשן הזה.

**מה לעשות.** לכל מספר בטבלה: למצוא את הפקודה או את הקובץ
שמוכיחים אותו, ולכתוב אותו ליד המספר בסוגריים. מספר שאין לו
מקור בריפו הזה (התאוריה יושבת בריפו אחר) — לסמן "לא אומת מכאן".
לא למחוק, לא לתקן לפי ניחוש.

**סיום.** כל שורה בטבלה נושאת מקור או סימון "לא אומת".

### M3 · חשוב · שבוע 0 של לוח הפרסום — חמש משבצות, אפס מסומנות

**הממצא.** ב-`plan-weekly.md`, פרק "שבוע 0", חמש תיבות ואף אחת
לא מסומנת. הלוח עצמו אומר: "לא מפרסמים דבר עד שחמשת אלה נעשו".

**מה לעשות.** לבצע את חמשת הסעיפים כלשונם. שני דגשים:
הסיור באפליקציות הוא על **שתים־עשרה** (לתקן את "שמונה" בסעיף
תוך כדי M1), בטלפון **ובמחשב**, ובודקים באוזן שההקראה מדברת.
כל אפליקציה שההקראה שלה שותקת או מבטאת לא נכון — שורה בדוח
עם המכשיר והדפדפן. זה התחום של הסוכנת `renana`.
ההקלטה של תסריט 1: 40 שניות, לפי הטבלה בשורה 21 של
`video-scripts.md`, מהאתר החי ולא מהמקומי.

**סיום.** חמש תיבות מסומנות ב-`plan-weekly.md`, קובץ הווידאו
בידי, וקובץ המעקב (למי פניתי, מתי, מה ענו) פתוח **מחוץ לריפו** —
`marketing/README.md` אוסר שם פרטים אישיים.

### M4 · חשוב · תיאור הריפו ב-GitHub

**הממצא.** אין לי גישה לשדה ה-About של הריפו מכאן. עם README
ריק (D3) ובלי תיאור, הריפו נראה נטוש.

**מה לעשות.** אחרי D3: תיאור בשורה אחת מתוך `badge` בדף הבית
("שתים־עשרה אפליקציות לימוד · חינם לגמרי · בארבע שפות"),
הכתובת `https://lagstein1-png.github.io/`, וכמה topics
(`pwa`, `hebrew`, `education`, `accessibility`, `vanilla-js`).

**סיום.** צילום מסך של דף הריפו בדוח.

### M5 · זניח · נוסח לחנות — לא לפני E2

הטקסט "לחנות" ב-`copy-posts.md` מחכה לצילומי המסך (E2)
ולתיקון המניין (M1). לא נוגעים בו קודם.

---

## סדר העבודה

| שבוע | מה נסגר |
|---|---|
| 1 | M1, D1, D2 (עם אייקון זמני), M3 |
| 2 | E1, ואז D2 מצביע עליו · D3 · M2 |
| 3 | E2, E3, D4, D5 |
| 4 | M4, D6, E4, M5 |

משימה שנתקעת לא עוצרת את הבאה. עוברים הלאה, ובדוח כותבים
מה חסר.

## הדוח היומי

בסוף כל יום, הודעה אחת, בעברית פשוטה:

    ## 2026-09-05
    נעשה: M1 — 21 שורות תוקנו (grep -n "שמונה" לפני: 21, אחרי: 2).
    ענף: celine/m1-count. QA: 13 בדיקות, כולן עברו.
    דורש העלאת גרסה: אין (קבצי marketing אינם נטענים).
    תקוע: —
    מחר: D1.

כל ממצא שאת מגלה בדרך ואינו ברשימה — שורה עם סימון:
**קריטי** (משתמש רואה שגיאה) / **חשוב** (משתמש רואה טעות) /
**זניח** (רק אנחנו רואים). לא מתקנים אותו בלי לכתוב אותו קודם.
