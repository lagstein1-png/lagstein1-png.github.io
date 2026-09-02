# vendor/

כאן אמור לשבת **KaTeX מקומי** — `vendor/katex/` עם `katex.min.css`,
`katex.min.js` והגופנים שבתיקיית `fonts/`. מורידים לריפו. לא CDN,
ולא שירות חיצוני בזמן ריצה.

**הוא עדיין לא כאן.** הרשת חסומה בסביבת הפיתוח: כל יציאה החוצה
נענית `CONNECT tunnel failed, response 403`, ולכן אי אפשר להוריד
את הקבצים מכאן. זו הסיבה היחידה.

עד שיגיע, `latexBox()` ב-`app.js` מציג את מקור ה-LaTeX ככתבו,
מסומן כמקור, ולידו המשפט מהשדה `speech`. שום נוסחה לא מתחזה
לנוסחה מסודרת.

## מה צריך לעשות כשיש רשת

1. להוריד את חבילת ההפצה של KaTeX ולפרוס אל `vendor/katex/`.
2. ב-`index.html`: `<link rel="stylesheet" href="vendor/katex/katex.min.css">`
   ו-`<script src="vendor/katex/katex.min.js"></script>`.
3. ב-`app.js`, ב-`latexBox()`: להחליף את הצגת המקור ב-
   `katex.renderToString(item.latex, {throwOnError:false})`.
   השדה `speech` נשאר ב-`aria-label` — **קורא מסך ומנוע ההקראה
   לעולם לא מקבלים את ה-LaTeX**, גם אחרי שהוא מרונדר יפה.
4. ב-`sw.js`: להוסיף ל-`PRE` את `katex.min.css`, `katex.min.js`
   ואת קובצי הגופנים. בלעדיהם הנוסחאות ייעלמו אופליין.
5. להעלות את `BUILD` ואת `?v=` של רישום ה-service worker — שניהם.
