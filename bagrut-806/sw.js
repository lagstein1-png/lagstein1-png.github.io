/* =====================================================================
   Service worker — זהה במבנה לשאר האפליקציות.
   הגרסה מגיעה מ-index.html דרך ?v= בכתובת הרישום: שינוי הגרסה שם
   משנה את כתובת הסקריפט, הדפדפן רואה worker חדש, מתקין אותו ומוחק
   את המטמון הישן. בלי זה שינוי בקוד לא מגיע למי שכבר התקין.

   שים לב: כאן, בשונה משאר האפליקציות, יש יותר מקובץ אחד. app.js,
   speech.js ו-data/exams.js חייבים להיות ברשימת ההקדמה — אחרת
   הדף ייטען אופליין ויישאר ריק.
   ===================================================================== */
const V = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "bagrut-806-" + V;
const PRE = ["./","./index.html","./manifest.json",
             "./app.js","./speech.js","./data/exams.js",
             "./img/icon-192.png","./img/icon-512.png",
             "/legal/terms.js","/legal/protect.js"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(PRE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith("bagrut-806-") && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put("./", copy)).catch(() => {});
      return r;
    }).catch(() => caches.match("./index.html").then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && r.status === 200) {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
    }
    return r;
  }).catch(() => hit)));
});
