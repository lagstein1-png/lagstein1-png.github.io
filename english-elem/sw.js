/* =====================================================================
   Service worker — אחת לכל אפליקציה, זהה בכולן חוץ משם המטמון.
   הגרסה מגיעה מ-index.html דרך ?v= בכתובת הרישום: שינוי הגרסה שם משנה
   את כתובת הסקריפט, הדפדפן רואה worker חדש, מתקין אותו ומוחק את המטמון
   הישן. עדכון BUILD לבדו לא מנקה את המטמון — עדכנת אחד, עדכן את השני.
   שם המטמון "englishelem-" ולא "english-elem-": התחילית "english-" שייכת
   לאפליקציית english (ניב), וה-activate שלה היה מוחק את המטמון הזה.
   ===================================================================== */
const V = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "englishelem-" + V;
const PRE = ["./","./index.html","./app.css","./manifest.json",
             "./js/i18n.js","./js/data.js","./js/engine.js","./js/speech.js","./js/app.js",
             "./img/icon-192.png","./img/icon-512.png",
             "/img/limor.jpg","/img/josh.jpg",
             "/tutor/he-speech.js","/speech/recorded.js","/tutor/josh-face.js","/tutor/josh-state.js",
             "/tutor/josh-local.js","/tutor/tutor.js","/tutor/barak-core.js",
             "/legal/terms.js","/legal/protect.js",
             "/fonts/fonts.css","/fonts/heebo-hebrew.woff2","/fonts/heebo-math.woff2","/fonts/heebo-latin.woff2","/fonts/noto-sans-arabic-arabic.woff2","/fonts/noto-sans-cyrillic.woff2","/fonts/noto-sans-greek.woff2","/fonts/noto-sans-latin.woff2"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(PRE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith("englishelem-") && k !== CACHE).map(k => caches.delete(k))
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
  /* ניווט: רשת קודם, ומטמון כשאין רשת. רק תשובה 200 נשמרת. */
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
  /* מניפסט ההקלטות טרי: רשת קודם, מטמון גיבוי אופליין */
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
  /* משאב: המטמון של האפליקציה הזאת בלבד (לא caches.match גלובלי) */
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
