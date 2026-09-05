/* =====================================================================
   Service worker ל-806. הגרסה מגיעה מ-index.html דרך ?v= בכתובת
   הרישום: שינוי שם משנה את כתובת הסקריפט, הדפדפן רואה worker חדש,
   מתקין אותו ומוחק את המטמון הישן. בלי זה שינוי בקוד לא מגיע למי
   שכבר התקין, וזו התקלה שהכי קשה לאבחן.

   שתי הערות שנכונות דווקא לאפליקציה הזאת:

   1. **`/legal/` נכנס גם לכאן, וזו מלכודת מוכרת.** שנים־עשר ה-sw
      בריפו מצרפים מראש את אותם `/legal/terms.js` ו-`/legal/protect.js`,
      כל אחד למטמון בשם משלו. ההגשה כאן נעשית מ-`CACHE` בלבד ולא
      דרך `caches.match` הגלובלי, ולכן עותק ישן במטמון של אפליקציה
      אחרת אינו עונה כאן. עדיין: נגעת ב-`legal/` — העלה את כל
      שנים־עשר המפתחות יחד, כי כל אפליקציה מחזיקה עותק משלה.
      השער נכנס
      כאן בכל זאת, כי אפליקציה שמתפרסמת בדף הבית בלי שער התנאים
      היא פער שהבעלים לא בחר בו.
   2. **KaTeX והגופנים שלו נכנסים למטמון במלואם.** בלי זה נוסחה
      נראית אופליין כשורת סימנים, וזה בדיוק המסך שהאפליקציה קיימת
      כדי למנוע. 604K, פעם אחת, בהתקנה.
   ===================================================================== */
const V = new URL(self.location).searchParams.get("v") || "dev";
const CACHE = "bagrut806-" + V;
const PRE = [
  "./", "./index.html", "./app.js",
  "./speech.js", "./data/exams.js", "./manifest.json",
  "./img/icon-192.png", "./img/icon-512.png", "./img/icon-maskable-512.png",
  "./img/apple-touch-icon.png", "./vendor/katex/katex.min.css", "./vendor/katex/katex.min.js",
  "/legal/terms.js", "/legal/protect.js",
  "./vendor/katex/fonts/KaTeX_AMS-Regular.woff2", "./vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2", "./vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2", "./vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2", "./vendor/katex/fonts/KaTeX_Main-Bold.woff2",
  "./vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2", "./vendor/katex/fonts/KaTeX_Main-Italic.woff2", "./vendor/katex/fonts/KaTeX_Main-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2", "./vendor/katex/fonts/KaTeX_Math-Italic.woff2", "./vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2",
  "./vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2", "./vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2", "./vendor/katex/fonts/KaTeX_Script-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Size1-Regular.woff2", "./vendor/katex/fonts/KaTeX_Size2-Regular.woff2", "./vendor/katex/fonts/KaTeX_Size3-Regular.woff2",
  "./vendor/katex/fonts/KaTeX_Size4-Regular.woff2", "./vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(PRE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith("bagrut806-") && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  /* ניווט: רשת קודם כדי שגרסה חדשה תגיע מיד, ומטמון כשאין רשת */
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      /* רק תשובה תקינה נשמרת. בלי הבדיקה, דף 404 של GitHub Pages נשמר
         כקליפת האפליקציה ומוגש אופליין במקומה. */
      if (r && r.status === 200) {
        const copy = r.clone();
        /* תחת כתובת הבקשה עצמה, לא תחת "./" — worker אחד מגיש כמה דפים,
           ו-"./" היה מקבל את התוכן של האחרון שנטען. */
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return r;
    }).catch(() => caches.open(CACHE).then(c =>
      c.match(req).then(r => r || c.match("./index.html")).then(r => r || c.match("./")))));
    return;
  }
  /* משאב: מטמון קודם — אבל רק המטמון של האפליקציה הזאת. caches.match
     הגלובלי סורק את כל המטמונים ב-origin, וזו בדיוק המלכודת שההערה
     בראש הקובץ מתארת: עותק ישן של legal/terms.js במטמון של אפליקציה
     אחרת היה עונה גם כאן, ותיקון שם היה נתקע לצמיתות. */
  e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && r.status === 200) {
      const copy = r.clone();
      c.put(req, copy).catch(() => {});
    }
    return r;
  }).catch(() => hit))));
});
