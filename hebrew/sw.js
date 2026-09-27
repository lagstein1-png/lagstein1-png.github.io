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
             "/legal/terms.js","/legal/protect.js"];

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
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   /* הקראה בענן לא נכנסת למטמון */
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
  e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && r.status === 200) {
      const copy = r.clone();
      c.put(req, copy).catch(() => {});
    }
    return r;
  }).catch(() => hit))));
});
