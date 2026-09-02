/* מקור האמת לזהות החזותית: גוון + סימן לכל אפליקציה.
   הסימן מצויר על קנבס 512 עם אזור בטוח 120..392. */

const W = 512;

/* קו לבן אחיד לכל הסימנים — זה מה שהופך תשעה ציורים למשפחה אחת */
const S = 'fill="none" stroke="#fff" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"';
const S_THIN = 'fill="none" stroke="#fff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"';

/* תג הספרה של סדרת אקסיומה — עיגול בפינה התחתונה, ספרה רומית בתוכו.
   רומית ולא א׳/١ כי קובץ אחד משרת ארבע שפות. */
/* TAGINK הוא מציין מקום: build.js מחליף אותו בצבע הכהה של האפליקציה,
   כי בתוך ליטרל האובייקט אין עדיין גישה ל-d של אותה רשומה. */
function tag(txt){
  return `<circle cx="392" cy="392" r="80" fill="#fff"/>` +
         `<text x="392" y="392" text-anchor="middle" dominant-baseline="central" ` +
         `font-family="DejaVu Serif, serif" font-size="${txt.length>2?60:86}" ` +
         `font-weight="700" fill="TAGINK">${txt}</text>`;
}

const APPS = {
  /* דף הבית — מקבץ תשע צורות: האוסף עצמו, לא עוד אפליקציה */
  home: { c:'#174c7e', d:'#0e3358', mark:
    [0,1,2].flatMap(r => [0,1,2].map(k =>
      `<rect x="${107+k*108}" y="${107+r*108}" width="82" height="82" rx="24" fill="#fff"/>`
    )).join('') },

  /* מתמטיקה לחכמים שמתקשים — סימן החילוק, כמו היום */
  'math-app': { c:'#0e9c8d', d:'#0a6f64', mark:
    `<rect x="132" y="238" width="248" height="38" rx="19" fill="#fff"/>` +
    `<circle cx="256" cy="168" r="30" fill="#fff"/>` +
    `<circle cx="256" cy="346" r="30" fill="#fff"/>` },

  /* שלב — מדרגות עולות על ציר. השם הוא הסימן. */
  'math-teen': { c:'#4f46e5', d:'#3a2fb8', mark:
    `<path d="M146 128 V382 H392" ${S_THIN}/>` +
    `<path d="M184 344 H240 V286 H296 V228 H352 V166" ${S}/>` },

  /* אקסיומה — אינטגרל, החדו״א של שנה א׳ */
  'math-uni': { c:'#6d28d9', d:'#4c1d95', mark:
    `<text x="248" y="262" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="DejaVu Serif, serif" font-size="400" fill="#fff">∫</text>` +
    tag('I') },

  /* אקסיומה ב׳ — נגזרת חלקית, המשוואות הדיפרנציאליות של שנה ב׳ */
  'math-uni2': { c:'#9333ea', d:'#6b21a8', mark:
    `<text x="248" y="256" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="DejaVu Serif, serif" font-size="330" fill="#fff">∂</text>` +
    tag('II') },

  /* אקסיומה ג׳ — סכום: אנליזה, טורים ואנליזה נומרית של שנה ג׳.
     שלושת האופרטורים ∫ ∂ ∑ הם סדרה אחת עם שלוש צורות שונות לגמרי. */
  'math-uni3': { c:'#b021b8', d:'#7e1a86', mark:
    `<text x="248" y="258" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="DejaVu Serif, serif" font-size="330" fill="#fff">\u2211</text>` +
    tag('III') },

  /* ניב — בועת דיבור עם גל קול: כל מילה נשמעת לפני שהיא נקראת */
  english: { c:'#0f766e', d:'#0a544e', mark:
    `<path d="M136 190 a54 54 0 0 1 54-54 h132 a54 54 0 0 1 54 54 v96 ` +
    `a54 54 0 0 1-54 54 h-84 l-72 62 v-62 h-30 a54 54 0 0 1-54-54 z" ${S}/>` +
    `<path d="M196 211 v60 M256 191 v100 M316 211 v60" ` +
    `fill="none" stroke="#fff" stroke-width="28" stroke-linecap="round"/>` },

  /* מפנה — ציר זמן שפונה למעלה בנקודה אחת. השם הוא הסימן. */
  history: { c:'#9a5b0f', d:'#6d400a', mark:
    `<path d="M124 336 H256 L388 176" ${S}/>` +
    `<circle cx="256" cy="336" r="30" fill="#fff"/>` +
    `<path d="M312 176 H388 V252" ${S}/>` },

  /* תאוריה מדברת — הגה. אין לה תיקייה במאגר הזה (היא חיה ב-/drivewise/),
     ולכן אין לה קובצי אייקון כאן; הגוון והסימן משמשים את כרטיס דף הבית. */
  drivewise: { c:'#1e7a48', d:'#125733', noFiles:true, mark:
    `<circle cx="256" cy="256" r="140" ${S}/>` +
    `<circle cx="256" cy="256" r="42" fill="#fff"/>` +
    `<path d="M256 116 V214 M136 326 L214 280 M376 326 L298 280" ${S}/>` },

  /* מקריא קולי — שורות טקסט והמילה שנקראת ברגע זה, עם גלי קול */
  reader: { c:'#5aa9e6', d:'#2f7cb8', mark:
    `<path d="M120 168 H300 M120 246 H236 M120 324 H300 M120 402 H262" ` +
    `fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round"/>` +
    `<path d="M330 210 a70 70 0 0 1 0 92" ${S_THIN}/>` +
    `<path d="M382 176 a118 118 0 0 1 0 160" ${S_THIN}/>` },
};


/* צבע המבטא בתוך האפליקציה — כאן, ולא בכל index.html בנפרד, כדי
   שהאייקון והממשק לא יתפצלו בשקט. light הוא גם theme_color במניפסט.
   soft הוא הרקע הרך של אותו מבטא, ו-dark הוא המבטא במצב כהה.
   מתמטיקה לחכמים ומקריא קולי אינם כאן: אין להם --accent, יש להם
   פלטה משלהם, ורק האייקון והמניפסט שלהם נגזרים מ-c. */
const ACCENT = {
  'math-teen': { light:'#4f46e5', soft:'#e9e8fd', dark:'#818cf8', softDark:'#232842' },
  'math-uni':  { light:'#6d28d9', soft:'#ede4fd', dark:'#a78bfa', softDark:'#2a1f45' },
  'math-uni2': { light:'#9333ea', soft:'#f3e6fd', dark:'#c084fc', softDark:'#331f47' },
  'math-uni3': { light:'#b021b8', soft:'#fae3fb', dark:'#e879f9', softDark:'#3d1640' },
  'english':   { light:'#0f766e', soft:'#d6f0eb', dark:'#5eead4', softDark:'#123c37' },
  'history':   { light:'#9a5b0f', soft:'#f7e9d2', dark:'#e8b45c', softDark:'#3d2a0c' },
};

/* לאן נכתבים ה-PNG. דף הבית לשורש, כל אפליקציה לתיקייה שלה. */
const DIR = { home:'img' };
for (const id of Object.keys(APPS))
  if (id !== 'home' && !APPS[id].noFiles) DIR[id] = id + '/img';

module.exports = { APPS, ACCENT, DIR, W };
