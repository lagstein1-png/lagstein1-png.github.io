/* =====================================================================
   רקיע — סכימת התוכן. קובץ נתונים אינו מכיר את המנוע ואינו נוגע בו.

   מבנה ארבע־שפות מהיום הראשון, גם כשיש עברית בלבד: כל טקסט הוא
   אובייקט {he, ar, ru, en}. T("…") יוצר אותו עם עברית בלבד, והמנוע
   קורא t[lang] || t.he. תרגום עתידי מוסיף מפתח ואינו משנה מבנה.

   ארבעה משפחות טקסט, 469 טקסטים:
     planetSign[planet][sign]        10 × 12 = 120
     planetHouse[planet][house]      10 × 12 = 120
     aspect["a-b"][aspect]           45 זוגות × 5 = 225
     element[element]                4
   ===================================================================== */
var RAKIA = (typeof window !== "undefined" ? (window.RAKIA = window.RAKIA || {}) : (globalThis.RAKIA = globalThis.RAKIA || {}));
RAKIA.PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
RAKIA.SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
RAKIA.ASPECTS = ["conjunction", "sextile", "square", "trine", "opposition"];
RAKIA.ELEMENTS = ["fire", "earth", "air", "water"];
RAKIA.HOUSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
RAKIA.TEXTS = RAKIA.TEXTS || { planetSign: {}, planetHouse: {}, aspect: {}, element: {} };
/* שמות בעברית — מקור אחד לכל המסכים */
RAKIA.NAMES = {
  planet: { sun: "שמש", moon: "ירח", mercury: "מרקורי", venus: "ונוס", mars: "מאדים", jupiter: "יופיטר", saturn: "סטורן", uranus: "אורנוס", neptune: "נפטון", pluto: "פלוטו", node: "ראש הדרקון", asc: "עולה", mc: "רום השמיים" },
  sign: { aries: "טלה", taurus: "שור", gemini: "תאומים", cancer: "סרטן", leo: "אריה", virgo: "בתולה", libra: "מאזניים", scorpio: "עקרב", sagittarius: "קשת", capricorn: "גדי", aquarius: "דלי", pisces: "דגים" },
  aspect: { conjunction: "צמידות", sextile: "שישית", square: "ריבוע", trine: "משולש", opposition: "ניגוד" },
  element: { fire: "אש", earth: "אדמה", air: "אוויר", water: "מים" },
  house: ["", "הבית הראשון", "הבית השני", "הבית השלישי", "הבית הרביעי", "הבית החמישי", "הבית השישי", "הבית השביעי", "הבית השמיני", "הבית התשיעי", "הבית העשירי", "הבית האחד־עשר", "הבית השנים־עשר"]
};
function T(he) { return { he: he }; }
/* מפתח זוג לאספקט: לפי סדר הפלנטות, "sun-moon" ולא "moon-sun" */
RAKIA.pairKey = function (a, b) {
  var P = RAKIA.PLANETS;
  return P.indexOf(a) < P.indexOf(b) ? a + "-" + b : b + "-" + a;
};
