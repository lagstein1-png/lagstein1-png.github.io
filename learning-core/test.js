/* =====================================================================
   learning-core · test.js
   בדיקות הלוגיקה של core.js, בלי דפדפן ובלי תלויות:

       node test.js

   מה זה כן בודק: המילון, הפיצול, הערבוב, האחסון, בנק הטעויות,
   ארבע השפות, ומזהה קובץ השמע. מה זה לא בודק — ולא יכול: שיש
   קול. אין ב-node מנוע דיבור, ולכן מסלול ההשמעה עצמו נבדק רק
   בדפדפן, ב-demo/index.html.

   core.js נטען כאן ישירות מפני שכל הגישות שלו ל-DOM עוברות דרך
   משתנה אחד (DOC) שהוא null כשאין מסמך.
   ===================================================================== */
'use strict';

var LC = require('./core.js').LC;

var pass = 0, fail = 0;

function eq(name, got, want) {
  if (String(got) === String(want)) { pass++; return; }
  fail++;
  console.log('  ✗ ' + name + '\n      התקבל: ' + got + '\n      ציפינו: ' + want);
}
function ok(name, cond, detail) {
  if (cond) { pass++; return; }
  fail++;
  console.log('  ✗ ' + name + (detail ? '\n      ' + detail : ''));
}

LC.init({ app: 'learning-core-test' });

/* --- מילון ההגייה: אותה תוצאה עם ניקוד ובלעדיו --- */
var plainIn = 'הרכב עוצר', voweledIn = 'הָרֶכֶב עוצר';
eq('מילון על טקסט לא מנוקד', LC.ktiv.apply(plainIn), 'הָרֶכֶב עוצר');
eq('מילון על טקסט מנוקד', LC.ktiv.apply(voweledIn), 'הָרֶכֶב עוצר');
ok('שני המסלולים זהים', LC.ktiv.apply(plainIn) === LC.ktiv.apply(voweledIn));
eq('אין חיפוש בתוך מילה', LC.ktiv.apply('הרכבת יצאה'), 'הרכבת יצאה');
eq('מפתח מנוקד שנוסף מאוחר',
   (function () { LC.ktiv.add({ 'מִשְׁפָּט': 'מִשְׁפָּט!' }); return LC.ktiv.apply('משפט'); })(),
   'מִשְׁפָּט!');
ok('פיסוק ורווחים נשמרים', LC.ktiv.apply('רכב, כביש.') === 'רֶכֶב, כְּבִישׁ.',
   LC.ktiv.apply('רכב, כביש.'));
eq('טקסט ריק', LC.ktiv.apply(null), '');

/* --- פיצול --- */
var LONG = 'כשמשפט ארוך מדי נשלח למנוע ההקראה בבת אחת, המנוע מאיץ ובולע את סופי המילים. ' +
           'לכן הטקסט נחתך כאן לפי סוף משפט, ורק אחר כך לפי פסיק — ולעולם לא באמצע מילה.';
var segs = LC.tts.segments(LONG);
var longest = segs.reduce(function (m, s) { return Math.max(m, s.text.length); }, 0);
ok('פיצול לפי סף ' + LC.tts.SEG_MAX, segs.length > 1 && longest <= LC.tts.SEG_MAX,
   segs.length + ' מקטעים, הארוך ' + longest);
eq('3.5 אינו נקודת חיתוך', LC.tts.segments('הגובה 3.5 מטר בלבד.').length, 1);
eq('3,500 אינו נקודת חיתוך', LC.tts.segments('העלות 3,500 שקלים.').length, 1);
ok('היסטים עולים', segs.every(function (s, i) { return i === 0 ? s.start === 0 : s.start >= segs[i - 1].start; }),
   segs.map(function (s) { return s.start; }).join(', '));
ok('הטקסט נשמר בשלמותו',
   segs.map(function (s) { return s.text; }).join('').replace(/\s+/g, ' ').trim() ===
   LONG.replace(/\s+/g, ' ').trim());
eq('מקטע יחיד לטקסט קצר', LC.tts.segments('שלום.').length, 1);
/* מילה אחת ארוכה מהסף נשארת שלמה ולא נחתכת באמצע */
var word = new Array(200).join('א');
eq('מילה ארוכה אינה נשברת', LC.tts.segments(word).length, 1);

/* --- ערבוב טרי --- */
var base = [];
for (var i = 0; i < 40; i++) base.push(i);
var same = 0;
for (var k = 0; k < 50; k++) {
  var a = LC.shuffle(base).join(), b = LC.shuffle(base).join();
  if (a === b) same++;
}
ok('ערבוב חדש בכל קריאה', same === 0, same + ' מתוך 50 יצאו זהים');
eq('הערבוב אינו הורס את המקור', base.join(), base.slice().sort(function (x, y) { return x - y; }).join());
eq('deck חותך לאורך', LC.deck(base, 7).length, 7);
eq('deck בלי אורך מחזיר הכול', LC.deck(base).length, 40);

/* --- אחסון --- */
LC.store.set('probe', '42');
eq('אחסון', LC.store.get('probe'), '42');
eq('תבנית המפתח', LC.store.key('probe'), 'lc:learning-core-test:probe');
LC.store.setJSON('obj', { a: 1 });
eq('JSON הלוך ושוב', LC.store.getJSON('obj').a, 1);
eq('מפתח חסר מחזיר ברירת מחדל', LC.store.getJSON('nope', 'x'), 'x');
LC.store.del('probe');
eq('מחיקה', String(LC.store.get('probe')), 'null');

/* --- בנק טעויות --- */
LC.mistakes.reset();
LC.mistakes.record('q7'); LC.mistakes.record('q7'); LC.mistakes.record('q3');
eq('הבנק סופר', LC.mistakes.all().q7.n, 2);
eq('כמה מזהים', LC.mistakes.count(), 2);
eq('מקבץ תרגול', LC.mistakes.drill(5).sort().join(), 'q3,q7');
eq('סינון למאגר קיים', LC.mistakes.drill(5, ['q3']).join(), 'q3');
eq('מזהה ריק לא נרשם',
   (function () { LC.mistakes.record(''); LC.mistakes.record(null); return LC.mistakes.count(); })(), 2);
LC.mistakes.clear('q3');
eq('מחיקת רשומה', LC.mistakes.count(), 1);

/* --- התקדמות. תשובה שגויה נכנסת לבנק לבד --- */
LC.mistakes.reset();
LC.progress.reset();
LC.progress.record('q1', true);
LC.progress.record('q2', false);
eq('נענו', LC.progress.get('answered'), 2);
eq('נכונות', LC.progress.get('correct'), 1);
eq('טעות נרשמה אוטומטית', LC.mistakes.count(), 1);
eq('מונה יומי', LC.progress.today(), 2);

/* --- ארבע שפות --- */
LC.addStrings({ he: { hi: 'שלום' }, ar: { hi: 'مرحبا' }, en: { hi: 'Hello' }, ru: { hi: 'Привет' } });
var seen = [];
['he', 'ar', 'en', 'ru'].forEach(function (c) {
  LC.setLang(c, { silent: true });
  seen.push(LC.t('hi') + '/' + LC.langs[c].dir);
});
eq('ארבע שפות + כיוון', seen.join(' '), 'שלום/rtl مرحبا/rtl Hello/ltr Привет/ltr');
LC.setLang('he', { silent: true });
eq('מפתח חסר מוצג כמו שהוא', LC.t('no_such_key'), 'no_such_key');
eq('נפילה לעברית', (function () { LC.setLang('ru', { silent: true }); var r = LC.t('hi'); LC.setLang('he', { silent: true }); return r; })(), 'Привет');
eq('החלפת ערכים במחרוזת', LC.t('אני בן {n}', { n: 7 }), 'אני בן 7');
eq('שפה לא מוכרת נדחית', LC.setLang('de'), 'he');

/* --- מזהה קובץ השמע --- */
eq('audioId יציב', LC.tts.audioId('הרכב עוצר'), LC.tts.audioId(' הרכב   עוצר '));
ok('audioId משתנה עם הטקסט', LC.tts.audioId('הרכב עוצר') !== LC.tts.audioId('הרכב נוסע'));

/* שלושת הווקטורים האלה אומתו מול הקבצים האמיתיים של "תאוריה מדברת",
   בתיקייה audio/he/gemini. הם כאן כדי שכל שינוי ב-audioId ייכשל
   מיד: 6,823 קובצי MP3 מוקלטים תלויים בפונקציה הזאת, וזיהוי שונה
   פירושו שאף אחד מהם לא יימצא — ושכבה 1 תשתוק בלי שום שגיאה. */
eq('תואם להקלטה קיימת · 1', LC.tts.audioId('מה פירוש התמרור?'), '1qmkimf4v27');
eq('תואם להקלטה קיימת · 2', LC.tts.audioId('המרחק עד הכביש הקרוב (בק"מ).'), '29dughdcg10');
eq('תואם להקלטה קיימת · 3',
   LC.tts.audioId('נהג רכב מתקרב למעבר חצייה והנהג שלפניו עצר לפני מעבר החצייה. לכן:'),
   '3c9agbngs');

/* --- עזרים --- */
eq('ניקוי תגיות', LC.util.plainText('<b>שלום</b> <span>עולם</span>'), 'שלום עולם');
eq('הסרת ניקוד', LC.util.stripNiqqud('הָרֶכֶב'), 'הרכב');
eq('escapeHTML', LC.util.escapeHTML('<a>&"'), '&lt;a&gt;&amp;&quot;');

/* --- הקראה כשאין מנוע: לא נתקע ולא זורק --- */
var doneCalls = 0;
LC.tts.speak('שלום.', { onDone: function () { doneCalls++; } });
setTimeout(function () {
  ok('שכבה 3 מסיימת ולא נתקעת', doneCalls === 1, 'onDone נקרא ' + doneCalls + ' פעמים');
  eq('השכבה שדיווחה', LC.tts.tier, 'none');

  console.log((fail === 0 ? '✓ ' : '') + pass + ' עברו, ' + fail + ' נפלו.');
  process.exit(fail ? 1 : 0);
}, 50);
