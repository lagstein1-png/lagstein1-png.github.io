# learning-core

קוד משותף לאפליקציות הלימוד של `lagstein1-png`, במקום להעתיק ידנית
מאפליקציה לאפליקציה.

Vanilla JS. אפס תלויות. אפס שלב build. אפס עלות חוזרת.

## מה יש כאן

| קובץ | מה זה |
|---|---|
| `core.js` | הספרייה. נטען בתגית אחת ומייצא `window.LC` |
| `core.css` | עיצוב משותף: RTL, ניגודיות גבוהה, גופן גדול, יעדי מגע, `prefers-reduced-motion` |
| `sw-template.js` | service worker עם קבוע גרסה אחד בראש הקובץ |
| `template/` | שלד לאפליקציה חדשה — בית, תרגול, סיכום |
| `demo/` | הוכחה שזה עובד: שלושה משפטים בעברית + 19 בדיקות עצמיות |
| `test.js` | 45 בדיקות לוגיקה שרצות ב-node, בלי דפדפן |
| `CORE-RULES.md` | **הכללים.** לקרוא לפני שכותבים שורה |

## בדיקה

```
node --check core.js
node test.js
```

`test.js` בודק את המילון, הפיצול, הערבוב, האחסון, בנק הטעויות
וארבע השפות. מה שהוא **לא** בודק, ולא יכול: שיש קול. אין ב-node
מנוע דיבור, ולכן מסלול ההשמעה נבדק רק בדפדפן — `demo/index.html`.

## הרצה

`file://` שובר `fetch`, את ה-service worker ואת ה-manifest. תמיד שרת:

```
cd learning-core
python3 -m http.server 8099
```

- הדגמה: <http://127.0.0.1:8099/demo/>
- שלד: <http://127.0.0.1:8099/template/>

השלד מצפה ל-`core.js` ול-`core.css` **לצידו**. בתיקייה הזאת הם יושבים
רמה אחת מעל, כי יש להם עותק אחד בלבד; כשפותחים אפליקציה חדשה
מעתיקים אותם פנימה, ואז השלד רץ.

## אפליקציה חדשה בחמישה צעדים

1. `cp -r template ../my-new-app`
2. `cp core.js core.css ../my-new-app/`
3. ב-`../my-new-app/sw.js` — לשנות את `APP` לשם ייחודי.
4. ב-`index.html` — לשנות את `LC.init({ app: ... })` לאותו שם, ולמלא
   את `QUESTIONS` ואת `STRINGS`.
5. `manifest.json` ואייקונים ב-`img/`.

## הממשק בקצרה

```js
LC.init({ app:'my-app', strings:STRINGS, root:'#main', ktiv:{} });

LC.tts.speak('הרכב עוצר לפני מעבר החצייה.');
LC.tts.queue([q.q].concat(q.o), { onDone:fn });
LC.tts.stop();

LC.ktiv.add({ 'משלש':'משולש' });
LC.ktiv.apply(text);              // עובד על מנוקד ועל לא מנוקד כאחד

LC.progress.record(id, correct);  // טעות נכנסת לבנק אוטומטית
LC.mistakes.drill(10, allIds);    // מקבץ תרגול מהטעויות האחרונות

LC.deck(questions, 10);           // ערבוב טרי — נקרא בפתיחת סשן
LC.nav.define('home', render).go('home');
LC.setLang('ar');  LC.t('start');
```
