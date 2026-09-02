/* =====================================================================
   Service worker — אחת לכל אפליקציה, זהה בכולן חוץ משם המטמון.
   הגרסה מגיעה מ-index.html דרך ?v= בכתובת הרישום: שינוי הגרסה שם משנה
   את כתובת הסקריפט, הדפדפן רואה worker חדש, מתקין אותו ומוחק את המטמון
   הישן. בלי זה שינוי בקוד לא מגיע למי שכבר התקין את האפליקציה, וזו
   התקלה שהכי קשה לאבחן.

   שים לב: אין כאן מקור אמת אחד. מחרוזת ה-?v= שברישום מקודדת קשיח
   ב-index.html ואינה נגזרת מ-var BUILD. עדכון BUILD לבדו לא מנקה את
   המטמון. עדכנת אחד — עדכן את השני.
   ===================================================================== */
const V = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "history-" + V;
const PRE = ["./","./index.html","./manifest.json",
             "./img/icon-192.png","./img/icon-512.png",
             "/legal/terms.js","/legal/protect.js"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(PRE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith("history-") && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   /* הקראה בענן לא נכנסת למטמון */
  /* ניווט: רשת קודם כדי שגרסה חדשה תגיע מיד, ומטמון כשאין רשת */
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      /* רק תשובה תקינה נשמרת. בלי הבדיקה, דף 404 של GitHub Pages נשמר
         כקליפת האפליקציה ומוגש אופליין במקומה. */
      if (r && r.status === 200) {
        const copy = r.clone();
        /* תחת כתובת הבקשה עצמה, לא תחת "./" — worker אחד מגיש כמה דפים
           (/legal/, /voice/), ו-"./" היה מקבל את התוכן של האחרון שנטען. */
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return r;
    }).catch(() => caches.open(CACHE).then(c =>
      c.match(req).then(r => r || c.match("./index.html")).then(r => r || c.match("./")))));
    return;
  }
  /* משאב: מטמון קודם — אבל רק המטמון של האפליקציה הזאת. caches.match
     הגלובלי סורק את כל המטמונים ב-origin, ולכן היה מגיש עותק ש-worker
     של אפליקציה אחרת שמר. תשע אפליקציות מקדימות-קאשינג את legal/terms.js,
     וה-activate של כל אחת מוחק רק את התחילית שלה — כך שתיקון שם היה
     נתקע לצמיתות מאחורי עותק זר. */
  e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && r.status === 200) {
      const copy = r.clone();
      c.put(req, copy).catch(() => {});
    }
    return r;
  }).catch(() => hit))));
});
