/* =====================================================================
   Service worker — אחת לכל אפליקציה, זהה בכולן חוץ משם המטמון.
   הגרסה מגיעה מ-index.html דרך ?v= בכתובת הרישום: שינוי הגרסה שם משנה
   את כתובת הסקריפט, הדפדפן רואה worker חדש, מתקין אותו ומוחק את המטמון
   הישן. עדכנת אחד — עדכן את השני.
   ===================================================================== */
const V = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "hebrew-" + V;
const PRE = ["./","./index.html","./manifest.json","./app.js","./bank.json",
             "./img/icon-192.png","./img/icon-512.png",
             "/legal/terms.js","/legal/protect.js",
             /* השכבה המוקלטת — /speech/recorded.js (2.10.2026) */
             "/speech/recorded.js",
             /* גופנים מקומיים — /fonts/fonts.css (1.10.2026) */
             "/fonts/fonts.css","/fonts/heebo-hebrew.woff2","/fonts/heebo-math.woff2","/fonts/heebo-latin.woff2","/fonts/noto-sans-arabic-arabic.woff2","/fonts/noto-sans-cyrillic.woff2","/fonts/noto-sans-greek.woff2","/fonts/noto-sans-latin.woff2"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(PRE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith("hebrew-") && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
/* ===== מקור קובצי הקול — 10.10.2026, הכרעת הבעלים =====
   22,406 קובצי ה-MP3 שקלו 984MB והאתר המפורסם חצה את מגבלת ה-1GB של
   GitHub Pages (O-191), ולכן הם עוברים לריפו Pages נפרד — כלומר הם
   מגיעים ממקור אחר. **בלי השורה הזאת הם נופלים מה-worker החוצה**, ומי
   שהתקין את האפליקציה מאבד את הקול המוקלט ברגע שאין רשת. המניפסט נשאר
   במקור הזה. ריק = הקבצים מקומיים, בדיוק כמו עד 10.10.2026. */
const AUDIO = "";
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin && !(AUDIO && url.origin === AUDIO)) return;
  /* הקראה בענן לא נכנסת למטמון, וכך גם כל מקור זר — חוץ ממקור הקול. */
  /* ניווט: רשת קודם כדי שגרסה חדשה תגיע מיד, ומטמון כשאין רשת */
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      if (r && r.status === 200) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return r;
    }).catch(() => caches.open(CACHE).then(c =>
      c.match(req).then(r => r || c.match("./index.html")).then(r => r || c.match("./")))));
    return;
  }
  /* משאב: מטמון קודם — אבל רק המטמון של האפליקציה הזאת. caches.match
     הגלובלי סורק את כל המטמונים ב-origin, ולכן היה מגיש עותק ש-worker
     של אפליקציה אחרת שמר. */
  /* המניפסט של ההקלטות חייב להישאר טרי: ריצת ההקלטה היומית מוסיפה
     קבצים, ומטמון-קודם כאן היה משאיר אצל הלקוח מניפסט ישן לצמיתות
     (מבדק חוסרים 30.9 סעיף 4). רשת קודם, והמטמון גיבוי אופליין. */
  if (url.pathname.indexOf("/audio/manifest.json") !== -1) {
    e.respondWith(fetch(req).then(r => {
      if (r && r.status === 200) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return r;
    }).catch(() => caches.open(CACHE).then(c => c.match(req))));
    return;
  }
  /* ‏`status === 200` שומר על מה ששמר עד היום: שדף 404 לא ייכנס למטמון.
     אבל בקשה למקור אחר — ו-`<audio src>` היא no-cors — חוזרת **אטומה**,
     ‏`status` הוא 0 ואין דרך לקרוא אותו. בלי התנאי השני אף קליפ מריפו
     הקול לא היה נשמר, והאופליין היה מת בשקט. אטום קורה רק במקור אחר,
     ולכן השומר הקיים אינו מתרופף כאן בכלום. */
  e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && (r.status === 200 || r.type === "opaque")) {
      const copy = r.clone();
      c.put(req, copy).catch(() => {});
    }
    return r;
  }).catch(() => hit))));
});
