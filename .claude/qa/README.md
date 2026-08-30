# כלי הבדיקה

כולם וניל node, בלי התקנה. playwright ו-chromium כבר קיימים בסביבה
(`require('/opt/node22/lib/node_modules/playwright')`).

הרצה: קודם מרימים שרת, ואז כל השאר.

    node .claude/qa/serve.js &          # 127.0.0.1:8099, שורש = הריפו

| כלי | מה הוא עונה עליו |
|---|---|
| `parse.js <file...>` | האם כל בלוק סקריפט בקובץ בכלל נפרס. אחרי כל עריכה. |
| `extract.js <outdir> <file...>` | מחלץ את הסקריפטים לקבצי js, כדי להריץ עליהם eslint |
| `entropy.js <app...>` | **האם יש רמה שהתשובה הנכונה בה קבועה** |
| `smoke.js <page...>` | טוען כל דף, עובר שער תנאים ואונבורדינג, לוחץ על כל כפתור, אוסף שגיאות JS |

eslint:

    node .claude/qa/extract.js /tmp/js english/index.html math-uni/index.html
    cp .claude/qa/eslint.config.mjs /tmp/js/
    cd /tmp/js && npx --no-install eslint --config eslint.config.mjs .

**קו הבסיס של eslint אינו אפס.** יש שגיאות `no-redeclare` על `var id`
ועל `var lg` שקיימות מזמן ואינן באג (הצהרת `var` חוזרת באותו scope),
ו-`'tDesc' is not defined` ב-math-app שהוא `typeof tDesc==="function"`,
כלומר שמירה חוקית על תכונה אופציונלית. השוו לקו הבסיס, לא לאפס.

**חסימת רשת חיצונית חובה** בכל הרצת דפדפן, אחרת כל דף נתקע על
הגופנים של גוגל:

    await page.route('**/*', r =>
      r.request().url().startsWith('http://127.0.0.1:8099') ? r.continue() : r.abort());

## אזהרה על `entropy.js`

הוא משטח את האפשרויות ב-`textContent`, ולכן שבר `3/x` והמכפלה `3x`
נראים לו זהים. `dupe` שאינו אפס ב-math-uni מגיע מ-`deriv` רמה 2 והוא
**כוזב** — על המסך אלה שבר עם קו וביטוי רגיל, שתי אפשרויות שונות
לגמרי. `noAns`, `multi` ו-`constant-answer levels` אינם סובלים מזה
והם המדדים שחשובים.
