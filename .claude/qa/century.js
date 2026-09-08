/* =====================================================================
   המאה, בארבע השפות — בדיקה על הפונקציה האמיתית שבאפליקציה.

   הרמז וכרטיס המשוב מציגים את המאה של האירוע. המילה תורגמה לארבע
   שפות, אבל **הסדר ואופן כתיבת המספר לא**: הקוד בנה תמיד
   `<מילה> <ספרה רומית>`, ולכן באנגלית יצא "century XIX" — שאינו
   אנגלית — וברוסית "век XIX", שהוא היפוך של הכתיב המקובל.

   לכל שפה יש כאן תשובה אחת נכונה, ולכן זו בדיקה ולא העדפה:
     עברית   המאה ה-19    ספרה, ואין רומיות בעברית
     ערבית   القرن 19     ספרה, ואין רומיות בערבית
     רוסית   XIX век      רומית לפני המילה — הכתיב המקובל
     אנגלית  19th century סודר לפני המילה

   הבדיקה מחלצת את `centuryStr` ואת מה שהיא נשענת עליו מתוך
   ה-index.html עצמו ומריצה אותו, כדי שלא תיבדק העתקה של הקוד
   אלא הקוד שרץ אצל הלומד.
   ===================================================================== */
const fs = require('fs'), path = require('path');
const root = process.cwd();
const APPS = ['lomda', 'history'];

/* מה מצפים לראות, לכל שפה, עבור מאה 19 ועבור מאה 6 לפני הספירה */
const WANT = {
  he: { c19: 'המאה ה-19',    bce6: 'המאה ה-6 לפנה״ס' },
  ar: { c19: 'القرن 19',     bce6: 'القرن 6 ق.م' },
  ru: { c19: 'XIX век',      bce6: 'VI век до н. э.' },
  en: { c19: '19th century', bce6: '6th century BCE' }
};

let bad = 0;
function fail(m) { console.log('✗ ' + m); bad++; }

for (const app of APPS) {
  const file = path.join(root, app, 'index.html');
  if (!fs.existsSync(file)) { fail(app + ': אין index.html'); continue; }
  const src = fs.readFileSync(file, 'utf8');

  function grab(name) {
    const at = src.indexOf('function ' + name + '(');
    if (at < 0) return null;
    let depth = 0;
    for (let j = src.indexOf('{', at); j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') { depth--; if (!depth) return src.slice(at, j + 1); }
    }
    return null;
  }
  function grabVar(name) {
    const at = src.indexOf('var ' + name + '=');
    if (at < 0) return null;
    const end = src.indexOf(';', at);
    return end < 0 ? null : src.slice(at, end + 1);
  }

  /* המילון אינו גוש אחד: `var T={}` ריק, וכל שפה מוצבת בנפרד
     ב-`T.he={...}`. לוקחים כל הצבה כזאת בפני עצמה. */
  function grabLangs() {
    let out = 'var T={};\n';
    for (const lang of ['he', 'ar', 'ru', 'en']) {
      const at = src.indexOf('T.' + lang + '={');
      if (at < 0) return null;
      let depth = 0;
      for (let j = src.indexOf('{', at); j < src.length; j++) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}') {
          depth--;
          if (!depth) { out += src.slice(at, j + 1) + ';\n'; break; }
        }
      }
    }
    return out;
  }
  const tSrc = grabLangs();
  if (!tSrc) { fail(app + ': לא נמצאו ארבעת מילוני T'); continue; }

  const need = ['centuryOf', 'centuryStr', '_rom'];
  const missing = need.filter(n => !grab(n));
  if (missing.length) {
    fail(app + ': לא הצלחתי לחלץ ' + missing.join(', ') +
         ' — אם השמות השתנו, לעדכן את century.js. הבודק מסרב לנחש.');
    continue;
  }
  const ordSrc = grab('_ord') || '';   /* רשות: קיים רק אחרי התיקון */

  let centuryStr, setLang;
  try {
    const state = { lang: 'he' };
    const code =
      tSrc +
      (grabVar('ROM') || '') + '\n' +
      grab('_rom') + '\n' + ordSrc + '\n' +
      grab('centuryOf') + '\n' + grab('centuryStr') + '\n' +
      'function t(k){var d=T[state.lang]||T.he;' +
      'return d[k]!==undefined?d[k]:(T.he[k]!==undefined?T.he[k]:k)}\n' +
      'return {f:centuryStr, set:function(l){state.lang=l}};';
    const made = new Function('state', code)(state);
    centuryStr = made.f; setLang = made.set;
  } catch (e) {
    fail(app + ': הרצת הקוד שחולץ נכשלה — ' + e.message);
    continue;
  }

  for (const lang of Object.keys(WANT)) {
    setLang(lang);
    /* 1815 היא המאה ה-19; 586- היא המאה ה-6 לפני הספירה */
    const got19 = String(centuryStr(1815)), got6 = String(centuryStr(-586));
    if (got19 !== WANT[lang].c19)
      fail(app + ' · ' + lang + ': התקבל "' + got19 + '" במקום "' + WANT[lang].c19 + '"');
    if (got6 !== WANT[lang].bce6)
      fail(app + ' · ' + lang + ': התקבל "' + got6 + '" במקום "' + WANT[lang].bce6 + '"');
    /* רומיות מותרות ברוסית בלבד */
    if (lang !== 'ru' && /[IVX]{2,}/.test(got19))
      fail(app + ' · ' + lang + ': ספרה רומית על המסך — "' + got19 + '"');
  }
  if (!bad) console.log('· ' + app + ': ארבע השפות תקינות');
}

console.log(bad ? '\n' + bad + ' ממצאים' : '\nהמאה נכתבת נכון בארבע השפות, בשתי האפליקציות');
process.exit(bad ? 1 : 0);
