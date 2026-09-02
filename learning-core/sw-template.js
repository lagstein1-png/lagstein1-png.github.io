/* =====================================================================
   learning-core · sw-template.js
   מעתיקים לתיקיית האפליקציה בשם sw.js, ומשנים שני דברים בלבד:
   את VERSION שלמטה, ואת APP.

   --------------------------------------------------------------------
   קבוע גרסה אחד. לא שניים.
   --------------------------------------------------------------------
   באפליקציות הישנות מספר הגרסה חי בשני מקומות: BUILD ב-index.html,
   ומחרוזת ?v= בכתובת רישום ה-service worker. עדכון של אחד בלי השני
   פירושו שהמשתמש רואה מספר גרסה חדש ומקבל קוד ישן — או להפך.

   כאן יש קבוע אחד, כאן בקובץ הזה, והדף רושם את ה-worker בכתובת
   נקייה:   navigator.serviceWorker.register('./sw.js')
   שינוי VERSION משנה את הבייטים של הקובץ, הדפדפן רואה worker חדש,
   מתקין אותו, ו-activate מוחק את המטמון הישן. הדפדפן מושך את
   sw.js בעקיפת המטמון של HTTP, ולכן זה עובד בלי ?v=.

   ה-service worker עצמו לעולם אינו נכנס למטמון — ראו את הכלל
   ב-fetch למטה. worker שנשמר במטמון הוא בדיוק התקלה "שיניתי קוד
   ולא קרה כלום".
   ===================================================================== */

const VERSION = 'v1';
const APP     = 'my-app';          /* חייב להיות ייחודי לאפליקציה */

const CACHE = APP + '-' + VERSION;

/* נטען מראש: מה שבלעדיו אין אפליקציה. קבצים כבדים — תמונות, שמע —
   נכנסים תוך כדי שימוש; אי אפשר לעכב את ההתקנה עד שכולם יירדו. */
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './core.js',
  './core.css'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      /* addAll נכשל כולו אם קובץ אחד חסר — מוסיפים אחד-אחד */
      .then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      /* רק המטמונים של האפליקציה הזאת. מחיקה גורפת תמחק גם את
         המטמונים של האפליקציות האחרות שיושבות על אותו origin. */
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith(APP + '-') && k !== CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   /* מקור זר — לא נוגעים */

  /* ה-worker עצמו אף פעם לא מהמטמון */
  if (url.pathname.endsWith('/sw.js')) return;

  /* הדף עצמו: רשת קודם, מטמון כגיבוי. מטמון-קודם על ה-HTML הוא
     בדיוק התקלה "שיניתי קוד ולא קרה כלום". */
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put('./', copy)).catch(() => {});
        return r;
      }).catch(() =>
        caches.match('./index.html').then(r => r || caches.match('./'))
      )
    );
    return;
  }

  /* כל השאר: מטמון קודם, ורשת כשאין.
     caches.match(req, {cacheName:CACHE}) ולא caches.match(req) —
     בלי שם המטמון הקריאה סורקת את *כל* המטמונים של ה-origin, וקובץ
     משותף שנשמר במטמון של אפליקציה אחרת עלול לענות ראשון בגרסה
     ישנה. זו תקלה אמיתית שקרתה כאן, ולכן הכלל הזה. */
  e.respondWith(
    caches.match(req, { cacheName: CACHE }).then(hit =>
      hit || fetch(req).then(r => {
        if (r && r.status === 200 && r.type === 'basic') {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return r;
      }).catch(() => hit || Response.error())
    )
  );
});
