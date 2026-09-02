/* =====================================================================
   Service worker — זהה במבנה לשאר האפליקציות.
   הגרסה מגיעה מ-app.js דרך ?v= בכתובת הרישום שב-index.html: שינוי
   הגרסה שם משנה את כתובת הסקריפט, הדפדפן רואה worker חדש, מתקין
   אותו ומוחק את המטמון הישן. בלי זה שינוי בקוד לא מגיע למי שכבר
   התקין את האפליקציה.

   שתי סטיות מן השאר, ושתיהן נובעות מכך שזו האפליקציה הראשונה כאן
   שאינה קובץ HTML יחיד:

   1. app.js, speech.js ו-data/exams.js חייבים להיות בהקדמה. בלעדיהם
      הדף נטען אופליין ונשאר ריק, בלי שגיאה שרואים.

   2. כל עשרים גופני KaTeX מוקדמים, ולא רק ה-CSS וה-JS. הדפדפן מוריד
      גופן רק כשגליף ממנו נדרש, ולכן בלי הקדמה התלמיד היה רואה
      נוסחה אופליין בגופן חלופי — בדיוק התקלה שהאפליקציה הזאת נבנתה
      כדי למנוע. המחיר הוא כ-560 קילובייט בהתקנה, פעם אחת.
   ===================================================================== */
const V = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "bagrut-806-" + V;
const PRE = ["./","./index.html","./manifest.json",
             "./app.js","./speech.js","./data/exams.js",
             "./vendor/katex/katex.min.css","./vendor/katex/katex.min.js",
             "./vendor/katex/fonts/KaTeX_AMS-Regular.woff2","./vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2",
             "./vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2","./vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2",
             "./vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2","./vendor/katex/fonts/KaTeX_Main-Bold.woff2",
             "./vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2","./vendor/katex/fonts/KaTeX_Main-Italic.woff2",
             "./vendor/katex/fonts/KaTeX_Main-Regular.woff2","./vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2",
             "./vendor/katex/fonts/KaTeX_Math-Italic.woff2","./vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2",
             "./vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2","./vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2",
             "./vendor/katex/fonts/KaTeX_Script-Regular.woff2","./vendor/katex/fonts/KaTeX_Size1-Regular.woff2",
             "./vendor/katex/fonts/KaTeX_Size2-Regular.woff2","./vendor/katex/fonts/KaTeX_Size3-Regular.woff2",
             "./vendor/katex/fonts/KaTeX_Size4-Regular.woff2","./vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2",
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
