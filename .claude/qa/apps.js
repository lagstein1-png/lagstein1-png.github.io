/* =====================================================================
   שבעת המקומות שאפליקציה חדשה נוגעת בהם — האם כולם עודכנו.

     node .claude/qa/apps.js

   למה הבדיקה הזאת קיימת
   ---------------------
   המניין בדף הבית כתוב **כמילה, בארבע שפות**, ו**אינו נגזר**
   מ-`DATA.APPS`:

       badge.he  "אחת־עשרה אפליקציות לימוד · …"
       badge.en  "Eleven learning apps · …"

   מי שמוסיף אפליקציה מעדכן את `DATA.APPS`, רואה שהכרטיס מופיע,
   וגומר. ארבע מחרוזות ה-`badge` נשארות על המספר הישן, והאתר מצהיר
   על אחת־עשרה בזמן שהוא מציג שתים־עשרה. שום דבר לא נשבר, שום שגיאה
   לא נזרקת, ואיש לא שם לב — עד שלקוח סופר.

   אותו דבר בדיוק ב-`ICONS`: אפליקציה בלי סמל מקבלת כרטיס ריק.

   הבדיקה קוראת קוד בלבד. אין דפדפן ואין שרת.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* מילות המספר בארבע השפות. אפליקציה שתים־עשרה מחייבת את השורה הבאה
   בטבלה — וזו בדיוק הנקודה: הבדיקה תיפול עד שהיא תתורגם. */
const WORDS = {
  10: { he: 'עשר',        ar: 'عشرة',     ru: 'Десять',       en: 'Ten' },
  11: { he: 'אחת־עשרה',   ar: 'أحد عشر',  ru: 'Одиннадцать',  en: 'Eleven' },
  12: { he: 'שתים־עשרה',  ar: 'اثنا عشر', ru: 'Двенадцать',   en: 'Twelve' },
  13: { he: 'שלוש־עשרה',  ar: 'ثلاثة عشر', ru: 'Тринадцать',  en: 'Thirteen' },
  14: { he: 'ארבע־עשרה',  ar: 'أربعة عشر', ru: 'Четырнадцать', en: 'Fourteen' },
  15: { he: 'חמש־עשרה',   ar: 'خمسة عشر', ru: 'Пятнадцать',   en: 'Fifteen' },
  16: { he: 'שש־עשרה',    ar: 'ستة عشر',    ru: 'Шестнадцать',  en: 'Sixteen' },
  17: { he: 'שבע־עשרה',   ar: 'سبعة عشر',   ru: 'Семнадцать',   en: 'Seventeen' },
  18: { he: 'שמונה־עשרה', ar: 'ثمانية عشر', ru: 'Восемнадцать', en: 'Eighteen' },
  19: { he: 'תשע־עשרה',   ar: 'تسعة عشر',   ru: 'Девятнадцать', en: 'Nineteen' },
  21: { he: 'עשרים ואחת', ar: 'واحد وعشرون', ru: 'Двадцать одно', en: 'Twenty-one' },
  22: { he: 'עשרים ושתיים', ar: 'اثنان وعشرون', ru: 'Двадцать два', en: 'Twenty-two' },
  23: { he: 'עשרים ושלוש', ar: 'ثلاثة وعشرون', ru: 'Двадцать три', en: 'Twenty-three' },
  24: { he: 'עשרים וארבע', ar: 'أربعة وعشرون', ru: 'Двадцать четыре', en: 'Twenty-four' },
  25: { he: 'עשרים וחמש', ar: 'خمسة وعشرون', ru: 'Двадцать пять', en: 'Twenty-five' },
  /* 26–40 נוספו 4.10.2026, לקראת פרסום אחת־עשרה אפליקציות ה-build
     וארבע ה-internal בהכרעת הבעלים (״את כולם לפרסם״). הטבלה נגמרה
     ב-25, והמניין החדש הוא 40 — בלי השורות האלה `apps.js` היה נופל
     על ״badge.he אינו אומר …״ ברגע שהשלב משתנה, והפרסום היה נעצר
     על טבלה ולא על תוכן. העברית במין נקבה, כי המילה היא ״אפליקציות״. */
  26: { he: 'עשרים ושש',    ar: 'ستة وعشرون',    ru: 'Двадцать шесть',  en: 'Twenty-six' },
  27: { he: 'עשרים ושבע',   ar: 'سبعة وعشرون',   ru: 'Двадцать семь',   en: 'Twenty-seven' },
  28: { he: 'עשרים ושמונה', ar: 'ثمانية وعشرون', ru: 'Двадцать восемь', en: 'Twenty-eight' },
  29: { he: 'עשרים ותשע',   ar: 'تسعة وعشرون',   ru: 'Двадцать девять', en: 'Twenty-nine' },
  30: { he: 'שלושים',       ar: 'ثلاثون',        ru: 'Тридцать',        en: 'Thirty' },
  31: { he: 'שלושים ואחת',  ar: 'واحد وثلاثون',  ru: 'Тридцать одно',   en: 'Thirty-one' },
  32: { he: 'שלושים ושתיים', ar: 'اثنان وثلاثون', ru: 'Тридцать два',   en: 'Thirty-two' },
  33: { he: 'שלושים ושלוש', ar: 'ثلاثة وثلاثون', ru: 'Тридцать три',    en: 'Thirty-three' },
  34: { he: 'שלושים וארבע', ar: 'أربعة وثلاثون', ru: 'Тридцать четыре', en: 'Thirty-four' },
  35: { he: 'שלושים וחמש',  ar: 'خمسة وثلاثون',  ru: 'Тридцать пять',   en: 'Thirty-five' },
  36: { he: 'שלושים ושש',   ar: 'ستة وثلاثون',   ru: 'Тридцать шесть',  en: 'Thirty-six' },
  37: { he: 'שלושים ושבע',  ar: 'سبعة وثلاثون',  ru: 'Тридцать семь',   en: 'Thirty-seven' },
  38: { he: 'שלושים ושמונה', ar: 'ثمانية وثلاثون', ru: 'Тридцать восемь', en: 'Thirty-eight' },
  39: { he: 'שלושים ותשע',  ar: 'تسعة وثلاثون',  ru: 'Тридцать девять', en: 'Thirty-nine' },
  40: { he: 'ארבעים',       ar: 'أربعون',        ru: 'Сорок',           en: 'Forty' },
};

/* אפליקציות שנספרות בדף הבית אך אין להן תיקייה כאן — הן בריפו נפרד */
const EXTERNAL = new Set(['theory','english-bagrut']);

let findings = 0;
const bad = (m) => { console.log('✗ ' + m); findings++; };

/* --- DATA.APPS --- */
const m = src.match(/var DATA=(\{"APPS".*?\});\s*\nvar APPS/s);
if (!m) { bad('לא נמצא בלוק DATA ב-index.html'); process.exit(1); }

let DATA;
try { DATA = JSON.parse(m[1]); }
catch (e) { bad('DATA אינו JSON תקין: ' + e.message); process.exit(1); }

const apps = DATA.APPS;
const n = apps.length;
console.log(`DATA.APPS = ${n} אפליקציות`);

/* --- 1. ארבע מחרוזות badge נושאות את המניין הנכון --- */
const w = WORDS[n];
if (!w) {
  bad(`אין מילת מספר ל-${n} בטבלת WORDS — הוסף שורה, בארבע השפות`);
} else {
  for (const lg of ['he', 'ar', 'ru', 'en']) {
    const badge = (DATA.STR[lg] || {}).badge || '';
    if (!badge) { bad(`badge.${lg} חסר`); continue; }
    if (!badge.includes(w[lg])) {
      bad(`badge.${lg} אינו אומר "${w[lg]}" (${n}) — ${JSON.stringify(badge.slice(0, 48))}…`);
      /* מה הוא כן אומר, כדי שהתיקון יהיה מיידי. רק ההתאמה הארוכה
         ביותר: "אחת־עשרה" מכילה את "עשר", ושתי שורות היו מטעות. */
      const hit = Object.keys(WORDS)
        .filter(k => +k !== n && badge.includes(WORDS[k][lg]))
        .sort((a, b) => WORDS[b][lg].length - WORDS[a][lg].length)[0];
      if (hit) console.log(`     נשאר על "${WORDS[hit][lg]}" (${hit})`);
    }
  }
}

/* --- 2. לכל אפליקציה סמל ב-ICONS --- */
const icons = new Set();
const ire = /"([a-z0-9-]+)"\s*:\s*IC\(/g;
let im;
while ((im = ire.exec(src))) icons.add(im[1]);
for (const a of apps) if (!icons.has(a.id)) bad(`${a.id}: אין סמל ב-ICONS`);
for (const i of icons) if (!apps.some(a => a.id === i)) bad(`ICONS."${i}" — סמל בלי אפליקציה ב-DATA.APPS`);

/* --- 2ב. STAGE_IDS ו-SUBJECT_IDS — שתי נקודות החיווט שנשכחו ---

   נמצא ב-4.10.2026 (בוט 107): אלה שתי הרשימות שבאמת מציירות את
   הדף, והן לא נבדקו. `STAGE_IDS` קובע באיזו משבצת שלב הכרטיס
   מופיע, ו-`SUBJECT_IDS` איזו תווית נושא נכתבת עליו. אפליקציה
   שנוספה ל-`DATA.APPS` ול-`ICONS` בלבד **עוברת את כל הבדיקות
   בירוק ואינה מוצגת כלל** — `STAGE_IDS.map` לעולם אינו מגיע
   אליה. וחסר ב-`SUBJECT_IDS` נותן `labels.subjects[undefined]`,
   כלומר תווית ריקה על הכרטיס.

   שתי הרשימות נקראות מתוך הקובץ בלי `eval` גלובלי: שם זהה
   שכבר קיים כאן היה מפיל את הבדיקה עצמה. */
const idsLine = /^var STAGE_IDS=.*$/m.exec(src);
const subjLine = /^var SUBJECT_IDS=.*$/m.exec(src);
if (!idsLine) bad('לא נמצא STAGE_IDS ב-index.html');
if (!subjLine) bad('לא נמצא SUBJECT_IDS ב-index.html');
if (idsLine && subjLine) {
  const g = {};
  try {
    new Function('g', 'with(g){' + idsLine[0] + subjLine[0] +
      'g._s = STAGE_IDS; g._j = SUBJECT_IDS}')(g);
  } catch (e) { bad('STAGE_IDS/SUBJECT_IDS אינם נקראים: ' + e.message); }
  if (g._s && g._j) {
    const flat = [].concat.apply([], g._s);
    const dup = flat.filter((x, i) => flat.indexOf(x) !== i);
    for (const d of new Set(dup)) bad(`STAGE_IDS: "${d}" מופיע ביותר ממשבצת שלב אחת`);
    for (const a of apps) {
      if (!flat.includes(a.id)) bad(`${a.id}: אינו ב-STAGE_IDS — הכרטיס לא ייבנה כלל`);
      if (!(a.id in g._j)) bad(`${a.id}: אינו ב-SUBJECT_IDS — תווית הנושא תצא ריקה`);
    }
    for (const i of flat) if (!apps.some(a => a.id === i)) bad(`STAGE_IDS."${i}" — מזהה בלי אפליקציה ב-DATA.APPS`);
    for (const i of Object.keys(g._j)) if (!apps.some(a => a.id === i)) bad(`SUBJECT_IDS."${i}" — מזהה בלי אפליקציה ב-DATA.APPS`);
  }
}

/* --- 3. שם ותיאור בארבע שפות --- */
for (const a of apps) {
  for (const lg of ['he', 'ar', 'ru', 'en']) {
    if (!(a.n && a.n[lg])) bad(`${a.id}: אין שם בשפה ${lg}`);
    if (!(a.d && a.d[lg])) bad(`${a.id}: אין תיאור בשפה ${lg}`);
  }
}

/* --- 4. הקבצים שהאפליקציה חייבת --- */
for (const a of apps) {
  if (EXTERNAL.has(a.id)) continue;
  const dir = path.join(ROOT, a.id);
  if (!fs.existsSync(dir)) { bad(`${a.id}: אין תיקייה`); continue; }
  for (const f of ['index.html', 'manifest.json', 'sw.js']) {
    if (!fs.existsSync(path.join(dir, f))) bad(`${a.id}: חסר ${f}`);
  }
  for (const ic of ['img/icon-192.png', 'img/icon-512.png']) {
    if (!fs.existsSync(path.join(dir, ic))) bad(`${a.id}: חסר ${ic}`);
  }
}

/* --- 4.5. אפליקציה בריפו נפרד חייבת נתיב מפורש --- */
/* הכרטיס בונה את הקישור כ-`a.u || "/" + a.id + "/"`. לאפליקציה
   שאין לה תיקייה כאן, המזהה לבדו מוביל ל-404 — נמדד ב-5.9.2026,
   ואותו מחיקה בוצעה פעמיים בטעות. השדה נמחק רק אחרי ששם הריפו
   הנפרד ישונה, ואז הבדיקה הזאת נמחקת איתו. הנימוק המלא ב-NAMING.md. */
for (const id of EXTERNAL) {
  const a = apps.find(x => x.id === id);
  if (!a) { bad(`${id}: מופיע ב-EXTERNAL ואינו ב-DATA.APPS`); continue; }
  if (!a.u) bad(`${id}: אין נתיב מפורש בכרטיס. המזהה לבדו מוביל ל-404 — ראה NAMING.md, והענף naming/theory-rename-ready`);
  else console.log(`· ${id} — בריפו נפרד, נתיב מפורש קיים. תקין.`);
}

/* --- 5. שם המטמון ב-sw.js ייחודי לאפליקציה --- */
const caches = new Map();
for (const a of apps) {
  if (EXTERNAL.has(a.id)) continue;
  const sw = path.join(ROOT, a.id, 'sw.js');
  if (!fs.existsSync(sw)) continue;
  const t = fs.readFileSync(sw, 'utf8');
  const c = t.match(/const CACHE\s*=\s*["']([^"']+?)-?["']\s*\+/);
  if (!c) { bad(`${a.id}/sw.js: לא נמצא שם מטמון`); continue; }
  if (caches.has(c[1])) bad(`${a.id}/sw.js: שם המטמון "${c[1]}" כבר בשימוש ב-${caches.get(c[1])}`);
  else caches.set(c[1], a.id);
}

/* --- 6. מפתחות האחסון ייחודיים --- */
const keys = new Map();
for (const a of apps) {
  if (EXTERNAL.has(a.id)) continue;
  const f = path.join(ROOT, a.id, 'index.html');
  if (!fs.existsSync(f)) continue;
  const t = fs.readFileSync(f, 'utf8');
  const k = t.match(/var SKEY\s*=\s*"([^"]+)"/);
  if (!k) continue;                       /* לא כל משפחה משתמשת ב-SKEY */
  if (keys.has(k[1])) bad(`${a.id}: SKEY "${k[1]}" כבר בשימוש ב-${keys.get(k[1])} — שתיהן ידרסו זו את זו`);
  else keys.set(k[1], a.id);
}

/* --- 6.5. מניין התחומים של הלומדה, בארבע שפות --- */
/* אותה מלכודת של ה-`badge` בדיוק, במקום שני: כרטיס הלומדה ופסקת
   הפתיחה אומרים ״שמונה־עשר תחומים״ **כמילה**, והמספר אינו נגזר
   מ-`lomda/data/`. ב-8.9.2026 נוסף מאגר שמונה־עשר ושתי המחרוזות
   נשארו על ״שבעה־עשר״ בכל ארבע השפות — הבדיקות היו ירוקות, והדף
   הצהיר על מספר שאינו נכון. מאגר תשעה־עשר יפיל את הבדיקה הזאת.

   שים לב לרוסית: ״Восемнадцать״ מכיל בתוכו את ״семнадцать״, ולכן
   המילה הנכונה ממוסכת לפני החיפוש אחרי מילה ישנה. בלי זה כל 18
   נראה כמו 17 שנשאר מאחור. */
const FIELDS = {
  14: { he: 'ארבעה־עשר', ar: 'أربعة عشر', ru: 'четырнадцать', en: 'fourteen' },
  15: { he: 'חמישה־עשר', ar: 'خمسة عشر',  ru: 'пятнадцать',   en: 'fifteen' },
  16: { he: 'שישה־עשר',  ar: 'ستة عشر',   ru: 'шестнадцать',  en: 'sixteen' },
  17: { he: 'שבעה־עשר',  ar: 'سبعة عشر',  ru: 'семнадцать',   en: 'seventeen' },
  18: { he: 'שמונה־עשר', ar: 'ثمانية عشر', ru: 'восемнадцать', en: 'eighteen' },
  19: { he: 'תשעה־עשר',  ar: 'تسعة عشر',  ru: 'девятнадцать', en: 'nineteen' },
  20: { he: 'עשרים',     ar: 'عشرون',     ru: 'двадцать',     en: 'twenty' },
  21: { he: 'עשרים ואחד', ar: 'واحد وعشرون', ru: 'двадцать одна', en: 'twenty-one' },
  22: { he: 'עשרים ושניים', ar: 'اثنان وعشرون', ru: 'двадцать две', en: 'twenty-two' },
  23: { he: 'עשרים ושלושה', ar: 'ثلاثة وعشرون', ru: 'двадцать три', en: 'twenty-three' },
};

const dataDir = path.join(ROOT, 'lomda', 'data');
if (fs.existsSync(dataDir)) {
  const banks = fs.readdirSync(dataDir).filter(f => f.endsWith('.js') && f !== 'schema.js').length;
  const fw = FIELDS[banks];
  if (!fw) {
    bad(`lomda: ${banks} מאגרים ואין מילת מספר בטבלת FIELDS — הוסף שורה, בארבע השפות`);
  } else {
    const card = (apps.find(a => a.id === 'lomda') || {}).d || {};
    for (const lg of ['he', 'ar', 'ru', 'en']) {
      const lead = ((DATA.STR[lg] || {}).lead) || '';
      for (const [what, text] of [['כרטיס הלומדה', card[lg] || ''], ['פסקת הפתיחה', lead]]) {
        if (!text) { bad(`lomda ${what} ${lg}: אין טקסט`); continue; }
        const low = text.toLowerCase();
        if (low.indexOf(fw[lg].toLowerCase()) < 0) {
          bad(`lomda ${what} ${lg}: אינו אומר "${fw[lg]}" (${banks} מאגרים)`);
          continue;
        }
        /* המילה הנכונה ממוסכת, ורק אז מחפשים מילה של מספר אחר */
        const masked = low.split(fw[lg].toLowerCase()).join('·');
        const stale = Object.keys(FIELDS)
          .filter(k => +k !== banks && masked.indexOf(FIELDS[k][lg].toLowerCase()) >= 0)
          .sort((a, b) => FIELDS[b][lg].length - FIELDS[a][lg].length)[0];
        if (stale) bad(`lomda ${what} ${lg}: נשאר בו גם "${FIELDS[stale][lg]}" (${stale})`);
      }
    }
    console.log(`· lomda — ${banks} מאגרים, והמניין במילה תואם בארבע השפות`);
  }
}

/* --- 7. תיקיות שאינן אפליקציות לימוד — לא ממצא, רק תזכורת --- */
const dirs = fs.readdirSync(ROOT).filter(d =>
  fs.existsSync(path.join(ROOT, d, 'index.html')) && !d.startsWith('.'));
const notApps = dirs.filter(d => !apps.some(a => a.id === d));
if (notApps.length) console.log(`· ${notApps.join(', ')} — יש בהן index.html ואינן אפליקציות לימוד. תקין.`);

console.log(`\n${n} אפליקציות נבדקו, ${findings} ממצאים`);
process.exit(findings ? 1 : 0);
