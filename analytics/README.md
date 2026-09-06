# מונה מבקרים — `analytics/`

ספירת ביקורים אמיתית ואנונימית, בלי שירות בתשלום ובלי ספרייה חיצונית.
שלושה חלקים, וכולם בתיקייה הזאת:

| קובץ | מה הוא |
|---|---|
| `visit.js` | צד הדפדפן. שורת `<script>` אחת בדף שרוצים למדוד. |
| `server.js` + `store.js` + `admin.html` | שרת Node קטן: קליטת ביקורים, סיכום לאדמין, מסך `/admin/analytics`. |
| `schema.sql` | הטבלאות, האינדקסים והפונקציות ב-Supabase. |
| `test.js`, `test-browser.js` | הבדיקות. `node --test analytics/test.js` ו-`node analytics/test-browser.js`. |

**GitHub Pages אינו מריץ שרת.** ולכן ב-`index.html` של דף הבית
`data-endpoint` ריק, והמדידה כבויה עד שהשרת רץ במקום כלשהו. השרת
הזה נועד לאותו מארח Node שמתואר ב-`marketing/launch.md` (Render), או
לכל מכונה שמריצה Node 18 ומעלה.

## איך זה עובד

1. הדף נטען. אחרי אירוע `load`, `visit.js` מגריל מזהה אקראי ושומר אותו
   ב-`sessionStorage` — נמחק כשהלשונית נסגרת. אם כבר נשלח ביקור עם
   המזהה הזה (רענון), לא נשלח שוב.
2. הדפדפן שולח `POST /api/analytics/visit` עם: מזהה, שם הדף, שפת
   הממשק, ושם המארח של הדף המפנה. לא כתובת מלאה, לא שם, לא סיסמה.
3. השרת מגביל קצב לפי hash של ה-IP (בזיכרון, לא נשמר), הופך את המזהה
   ל-HMAC עם `ANALYTICS_SECRET`, בודק שאותו hash לא נספר בחצי השעה
   האחרונה, ושומר: `session_id_hash, visited_at, page, language,
   referrer, user_agent_family`. משפחת הדפדפן בלבד — לא ה-user-agent.
4. כל דקה, כשהלשונית גלויה, נשלח פינג קצר ל-`/api/analytics/ping`.
   זה מה שמאחורי "פעילים עכשיו" (חמש דקות אחרונות). בזיכרון בלבד.
5. כל שש שעות השרת מסכם ימים שלמים לטבלה יומית ומוחק ביקורים גולמיים
   ישנים מ-90 יום. "סך הכול" נשאר נכון גם אחרי המחיקה.

כל כשל — שקט. הדף לעולם לא נשבר בגלל מדידה, וזה נבדק בדפדפן אמיתי
(`test-browser.js`, "שירות מדידה שאינו זמין").

## הפעלה

    ANALYTICS_SECRET=... ANALYTICS_ADMIN_PASSWORD=... node analytics/server.js

בלי Supabase השרת עובד: הביקורים בזיכרון (או בקובץ, עם
`ANALYTICS_DATA_FILE`), ומסך האדמין אומר זאת בשורה צהובה. `GET
/api/analytics/health` מחזיר `{store:"memory"|"file"|"supabase"}`.

### משתני סביבה

| משתנה | חובה | מה |
|---|---|---|
| `ANALYTICS_SECRET` | כן בייצור | מלח ל-HMAC של המזהים ושל cookie האדמין. מחרוזת אקראית ארוכה. בלעדיו השרת מגריל אחד באתחול, וה-hash משתנה בכל הפעלה. |
| `ANALYTICS_ADMIN_PASSWORD` | כן למסך האדמין | הסיסמה ל-`/admin/analytics`. בלעדיה המסך נעול לכולם (503 עם הסבר). |
| `ANALYTICS_ADMIN_TOKEN` | לא | Bearer לסקריפטים: `Authorization: Bearer …` על `/api/analytics/summary`. |
| `ANALYTICS_ALLOWED_ORIGINS` | כשהדף בדומיין אחר | רשימת מקורות מופרדת בפסיק ל-CORS, למשל `https://lagstein1-png.github.io`. ריק = אותו מקור בלבד. |
| `SUPABASE_URL` | לאחסון קבוע | `https://<project>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | לאחסון קבוע | מפתח ה-service role. **בשרת בלבד, לעולם לא בריפו ולא בדפדפן.** |
| `ANALYTICS_RETENTION_DAYS` | לא | ברירת מחדל 90. |
| `ANALYTICS_TZ` | לא | ברירת מחדל `Asia/Jerusalem` — קובע איפה עובר "היום". |
| `ANALYTICS_DATA_FILE` | לא | נתיב לקובץ JSON, כשאין Supabase ורוצים לשרוד אתחול. |
| `ANALYTICS_DEDUP_MINUTES` | לא | ברירת מחדל 30 — אותו session לא נספר פעמיים בחלון הזה. |
| `ANALYTICS_RATE_VISIT` / `_PING` / `_LOGIN` / `_SUMMARY` | לא | הגבלת קצב לכל IP: 30/דקה, 120/דקה, 5/15 דקות, 60/דקה. |
| `ANALYTICS_SECURE_COOKIE` | לא | `1` מכריח `Secure` על cookie האדמין גם בלי `X-Forwarded-Proto`. |
| `PORT` | לא | ברירת מחדל 8787. |

### הגדרת Supabase

1. פרויקט חדש (השכבה החינמית מספיקה). **Settings → API**: מעתיקים את
   ה-URL ואת ה-`service_role` key למשתני הסביבה שלמעלה. את מפתח
   ה-`anon` לא צריך בכלל.
2. **SQL Editor** → מדביקים את `analytics/schema.sql` → Run. בטוח להרצה
   חוזרת.
3. מה ה-SQL עושה: טבלת `analytics_visits` עם אינדקסים על
   `visited_at`, `session_id_hash`, `page`; טבלת `analytics_daily`
   לסיכום; שתי פונקציות (`analytics_summary`,
   `analytics_rollup_and_purge`); RLS דלוק בלי מדיניות, כך ש-`anon`
   ו-`authenticated` לא רואים כלום — רק ה-service role שבשרת.
4. אופציונלי: אם השרת אינו רץ ברציפות, מפעילים את ההרחבה `pg_cron`
   ומריצים את שורת ה-`cron.schedule` שבסוף הקובץ.

נבדק ב-2026-09-06 על Postgres 16 מקומי: הרצה כפולה של הקובץ עוברת,
`analytics_rollup_and_purge(90)` מחק שתי רשומות בנות 100 יום ושמר
אותן במניין הכולל, ו-`set role anon` נדחה בטבלה ובפונקציה.

## חיווט הדפים

דף הבית כבר מחווט (`index.html`, לפני רישום ה-service worker):

    <script src="/analytics/visit.js" data-endpoint="" data-page="/" async></script>

- אותו שרת מגיש את האתר: `data-endpoint="/api/analytics/visit"`.
- השרת בדומיין אחר: הכתובת המלאה, ומקור הדף ב-`ANALYTICS_ALLOWED_ORIGINS`.

**דף התמחור ודף ההרשמה אינם בריפו הזה** — הם בפרויקט ה-Express
(`marketing/launch.md`). שם מוסיפים את אותה שורה עם `data-page="/pricing"`
ו-`data-page="/signup"`, וקובץ `visit.js` מוגש מאותו מקום. הדף מזוהה
בשם שנותנים לו ב-`data-page`, לא בכתובת.

`data-consent="ask"` מוסיף שורת הסכמה לפני המדידה (ארבע שפות). כברירת
מחדל אין: המדידה בלי עוגיות ובלי מידע מזהה, ולפי הדין בישראל אינה
דורשת הסכמה. אם הקהל בחו"ל והדין שם דורש — מוסיפים את התכונה.

**אין מונה ציבורי.** המספרים מוצגים במסך האדמין בלבד.

## גישה לאדמין

`https://<השרת>/admin/analytics` → סיסמה (`ANALYTICS_ADMIN_PASSWORD`) →
cookie `HttpOnly; SameSite=Strict` ל-12 שעות, חתום ב-HMAC עם
`ANALYTICS_SECRET`. הכתובת אינה סוד: בלי cookie תקף, `summary` מחזיר
401, ולא משנה מי יודע את הכתובת. חמישה ניסיונות כניסה כושלים ל-IP
חוסמים לרבע שעה.

לסקריפט: `curl -H "Authorization: Bearer $ANALYTICS_ADMIN_TOKEN" https://<השרת>/api/analytics/summary?days=30`.

## פרטיות — מה כתוב ואיפה

- `legal/terms.js`, סעיף "מה נשמר עליכם", בארבע שפות: מה נשלח, מה לא,
  ומחיקה אחרי 90 יום. `updated` עלה ל-2026-09-06.
- אין Google Analytics ואין שירות צד שלישי. השרת הוא שלנו.
- IP אינו נשמר בשום מקום — לא בטבלה ולא בלוג. `test.js` בודק זאת
  על האחסון ועל התשובות.
