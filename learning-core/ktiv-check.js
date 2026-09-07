/* =====================================================================
   learning-core · ktiv-check.js
   מריץ כל רשומה במילון ההגייה דרך מנוע דיבור אמיתי, ומודד אם התיקון
   באמת משנה את ההגייה — או דווקא שובר אותה.

       node ktiv-check.js

   דורש espeak-ng. אין אחד — הכלי מדווח ויוצא בשקט, בלי להיכשל:
       apt-get install espeak-ng     (כלי פיתוח, לא תלות של האפליקציה)

   --------------------------------------------------------------------
   מה זה מוכיח, ומה לא
   --------------------------------------------------------------------
   espeak-ng אינו המנוע שרץ אצל המשתמשים. הוא ממפה אותיות לצליל, בעוד
   שהקולות של גוגל, אפל ומיקרוסופט מבינים מילים שלמות. לכן:

     · "שינה את הפונמות" הוא סימן חיובי אמיתי — התיקון לא סתם החליף
       מחרוזת, הוא הגיע למנוע.
     · "שובר" הוא **אזהרה ולא פסק דין**. הוא אומר שסימן הניקוד הזה
       מפיל מנוע מסוג letter-to-phoneme; ייתכן מאוד שקול מכשיר טוב
       דווקא ייהנה ממנו. זה בדיוק ההבדל שבגללו הוסרו ארבעת קולות
       Chirp3 מ"תאוריה מדברת", והוא הסיבה שהכלי הזה קיים.

   חמישה סימנים מפילים את espeak-ng 1.51 — במקום להגות, הוא מאיית את
   שמות האותיות ("חית, פתח, צדי"): חטף סגול (U+05B1), חולם חסר
   (U+05B9), דגש (U+05BC), ושתי נקודות השי"ן (U+05C1, U+05C2).
   חולם *מלא*, כלומר על ו', עובד — ולכן "צוֹמֶת" תקין ו-"צֹמֶת" נשבר.
   ===================================================================== */
'use strict';

var execFileSync = require('child_process').execFileSync;
var LC = require('./core.js').LC;

function phonemes(text, lang) {
  return execFileSync('espeak-ng', ['-v', lang || 'he', '-q', '-x', text],
                      { encoding: 'utf8' }).trim().replace(/\n/g, ' ');
}

try {
  phonemes('בדיקה');
} catch (e) {
  console.log('espeak-ng לא מותקן — מדלגים.');
  console.log('להתקנה (כלי פיתוח בלבד):  apt-get install espeak-ng');
  process.exit(0);
}

/* איות שמות אותיות במקום הגייה — זו החתימה של הכישלון */
var SPELLED_OUT = /_:\(en\)|h'i:bru:|d'agES|Sv'A|S'Ind0t|s'Ind0t/;

var table = LC.ktiv.table();
var keys = Object.keys(table).sort();
var changed = 0, inert = [], broken = [];

keys.forEach(function (bare) {
  var full = table[bare];
  var before = phonemes(bare);
  var after = phonemes(full);
  if (before === after) inert.push(bare + ' → ' + full);
  else changed++;
  if (SPELLED_OUT.test(after)) broken.push([bare, full, after.slice(0, 56)]);
});

console.log('רשומות במילון: ' + keys.length);
console.log('שינו את ההגייה בפועל: ' + changed);

if (inert.length) {
  console.log('\nלא שינו כלום (' + inert.length + ') — רשומה שאינה עושה דבר:');
  inert.forEach(function (x) { console.log('   ' + x); });
}

if (broken.length) {
  console.log('\nמפילות מנוע letter-to-phoneme (' + broken.length + ') — אזהרה, לא פסק דין:');
  broken.forEach(function (x) {
    console.log('   ' + x[0] + ' → ' + x[1]);
    console.log('      ' + x[2]);
  });
  console.log('\nהסימנים האשמים: חטף סגול, חולם חסר, דגש, ונקודות השי"ן.');
  console.log('שקול כתיב מלא במקומם — "צוֹמֶת" ולא "צֹמֶת".');
}

/* יציאה 0 תמיד: זה כלי מדידה, לא שער. אזהרה כאן אינה עילה לחסום
   commit, כי המנוע שנמדד אינו המנוע שמדבר אצל המשתמש. */
process.exit(0);
