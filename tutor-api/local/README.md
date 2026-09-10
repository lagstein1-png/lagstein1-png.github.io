# ג׳וש — שרת מקומי · Josh — local dev server

**עברית למטה בהמשך גם באנגלית.**

---

## מה זה, ומה זה לא

`server.js` מריץ את **ג׳וש הקיים** על המחשב שלך. הוא אינו מכיל
אישיות, תפקידים או בדיקות משלו: הוא מייבא את
[`../worker.js`](../worker.js) ומריץ את ה-handler שלו כמו שהוא.

לכן מה שאתה שומע כאן הוא מה שירוץ בייצור — ולא העתק שיתיישן.

    tutor-api/worker.js     ← האישיות, 13 התפקידים, בדיקות הנכונות, התקרות
    tutor-api/local/server.js  ← מריץ אותו מקומית. אין בו לוגיקה משלו
    tutor/tutor.js          ← הממשק שכבר מחווט בכל האפליקציות

**למה זה נחוץ:** `tutor/tutor.js` נשמר במאגר עם `var API = ""`,
ולכן ג׳וש כבוי בכל האפליקציות עד שנפרס Worker. השרת הזה נותן
כתובת מקומית, כדי שאפשר יהיה לשמוע את ג׳וש ולתקן אותו **לפני**
שמשלמים על פריסה.

## הרצה — שני צעדים

**1. מפתח.** קובץ `.env` בשורש המאגר, שורה אחת:

    ANTHROPIC_API_KEY=sk-ant-...

`.gitignore` שבשורש כבר חוסם `.env`. אל תשנה את זה.

**2. הרצה.** אין `npm install` — אין תלויות:

    node tutor-api/local/server.js

ואז:

| כתובת | מה יש שם |
|---|---|
| `http://127.0.0.1:3000/josh` | מסך הבדיקה — כפתור צף, הקראה, זיהוי שפה |
| `http://127.0.0.1:3000/math-app/` | האפליקציה עצמה, עם ג׳וש **דלוק** |
| `http://127.0.0.1:3000/health` | מצב השרת. אינו פונה ל-Anthropic ואינו עולה כסף |
| `POST /api/josh/chat` | ה-endpoint |

השרת מגיש את כל המאגר, ומזריק את כתובת ה-API אל `/tutor/tutor.js`
**בזמן ההגשה בלבד**. הקובץ שעל הדיסק אינו משתנה, ולכן
`node .claude/qa/tutor.js` ממשיך לראות את ג׳וש כבוי — כפי שצריך
להיות במאגר.

## גוף הבקשה

```json
{
  "app": "math-app",
  "lang": "he",
  "target": null,
  "q": { "expr": "8 + 7 =", "ans": "15", "topic": null, "level": null },
  "messages": [{ "role": "user", "text": "לא הבנתי" }]
}
```

`app` חייב להיות אחד משלושה־עשר המפתחות של `ROLE`; אחר — 400.
`q` אינו חובה. התשובה: `{"text":"..."}`.

## תקרות ועלות

התקרות אינן חדשות — הן `LIM` שב-`worker.js`: 20 פניות ליום לכתובת
IP, 100 לכל השירות, 300 תווים להודעה, 2000 לשיחה, 700 טוקני פלט.

בייצור המונה הוא KV של Cloudflare. מקומית `server.js` מספק אותו
בזיכרון — אותו ממשק, שתי מתודות — **ולכן התקרה חלה גם כאן.**
המונה מתאפס כשעוצרים את השרת.

**המודל** הוא `claude-haiku-4-5` (נקבע ב-`worker.js`, שורת `MODEL`).
כל פנייה עולה כסף אמיתי. המספר האמיתי נמצא בדף Cost שבקונסולת
Anthropic — לא כאן.

## ארבע אזהרות

1. **`ALLOW_ORIGIN` כאן הוא `*`.** זה נכון לשרת שמאזין ל-127.0.0.1
   בלבד, ו**שגוי בייצור**. ב-Worker ברירת המחדל היא המקור של האתר.
2. **`http://127.0.0.1:3000` אינו נגיש מ-GitHub Pages.** דף ב-https
   אינו רשאי לפנות ל-http, והדפדפן חוסם את זה בשקט (mixed content).
   הכתובת המקומית משרתת פיתוח בלבד.
3. **אל תריץ `enable-tutor.js` עם כתובת localhost.** הוא כותב את
   הכתובת אל `tutor/tutor.js` שבמאגר, וכתובת מקומית שם פירושה ג׳וש
   שבור אצל כל לומד.
4. **המפתח לעולם לא נכנס למאגר.** לא ב-`.env` שנדחף, לא בקוד ולא
   בהערה. בייצור הוא Secret של Cloudflare.

## מכאן לייצור

השרת הזה אינו מסלול הייצור. הייצור הוא Cloudflare Workers, והנוהל
המלא — שלושה צעדים — נמצא ב-[`../README.md`](../README.md).

---

# English

## What this is

`server.js` runs **the existing Josh** on your machine. It holds no
personality, roles or checks of its own: it imports
[`../worker.js`](../worker.js) and runs that handler as-is, so what
you hear locally is what production will do.

It exists because `tutor/tutor.js` ships with `var API = ""` — Josh is
switched off in every app until a Worker is deployed. This server
provides a local address so you can hear Josh and fix him *before*
paying to deploy.

## Running it — two steps

**1. Key.** A `.env` file at the repository root, one line:

    ANTHROPIC_API_KEY=sk-ant-...

The root `.gitignore` already blocks `.env`.

**2. Run.** There is no `npm install` — there are no dependencies:

    node tutor-api/local/server.js

| URL | What's there |
|---|---|
| `http://127.0.0.1:3000/josh` | Test console — floating button, TTS, language detection |
| `http://127.0.0.1:3000/math-app/` | The real app, with Josh **on** |
| `http://127.0.0.1:3000/health` | Server state. Never calls Anthropic, never costs money |
| `POST /api/josh/chat` | The endpoint |

The server serves the whole repository and injects the API address
into `/tutor/tutor.js` **at serve time only** — the file on disk is
untouched, so `node .claude/qa/tutor.js` still sees Josh switched off,
which is how the repository should stay.

## Request body

```json
{
  "app": "math-app",
  "lang": "he",
  "q": { "expr": "8 + 7 =", "ans": "15" },
  "messages": [{ "role": "user", "text": "I don't get it" }]
}
```

`app` must be one of the thirteen `ROLE` keys; anything else is a 400.
Response: `{"text":"..."}`.

## Limits and cost

The limits are not new — they are `LIM` in `worker.js`: 20 requests
per day per IP, 100 for the whole service, 300 chars per message,
2000 per conversation, 700 output tokens.

In production the counter is Cloudflare KV. Locally `server.js`
supplies an in-memory one with the same two-method interface, so the
cap applies here too. It resets when you stop the server.

The model is `claude-haiku-4-5`, set in `worker.js`. Every request
costs real money; the real figure is on the Cost page of the Anthropic
console, not here.

## Four warnings

1. `ALLOW_ORIGIN` is `*` here. Correct for a server bound to
   127.0.0.1, wrong in production.
2. `http://127.0.0.1:3000` is unreachable from GitHub Pages — an
   https page may not call http, and browsers block it silently.
3. Never run `enable-tutor.js` with a localhost address: it writes
   that address into the repository, which means a broken Josh for
   every learner.
4. The key never enters the repository. In production it is a
   Cloudflare Secret.

## Going to production

This server is not the production path. Production is Cloudflare
Workers; the full three-step procedure is in
[`../README.md`](../README.md).
