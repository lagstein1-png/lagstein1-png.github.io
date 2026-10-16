#!/usr/bin/env node
/* מנוע ההגייה העברי — /tutor/he-speech.js.
   הועתק מ״תאוריה מדברת״ 17.9.2026 בהוראת הבעלים: ״בתאוריה מדברת
   יש מנוע דיבור העתק אותו לשאר״, ואחריה ״רק בעברית״.

   ארבע בדיקות, ושתיים מהן הן העיקר:

   1. החיווט — תגית, PRE וקריאה ל-spoken בכל אפליקציה מקריאה
      (נגזר מ-stages.json, O-225), ו-PRE בשורש.
   2. הכללים עובדים על מה שהבעלים שמע.
   3. **ההומוגרפים נשארים בחוץ.** אחת־עשרה כניסות בקובץ המקור
      בטוחות בנהיגה ושגויות בלומדה — ״עגול״ במספר עגול, ״החד״
      במשולש חד-זווית, ״הרוח״ בבעיית פיזיקה. מי שיוסיף אותן
      ״כדי להשלים את ההעתקה״ ייצר שגיאות חדשות.
   4. **מספר האסימונים נשמר.** עליו נשענת ההדגשה מילה-במילה
      בכל האפליקציות — `charIndex` מצביע לתוך הנאמר, והמפה
      נמדדת עליו. אסימון שיתפצל ישבור הדגשה בלי שום שגיאה. */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
let bad = 0;
function t(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { console.log('✓ ' + name); return }
  bad++; console.log('✗ ' + name + '\n    קיבלנו: ' + g + '\n    ציפינו: ' + w);
}

require(path.join(ROOT, 'tutor', 'he-speech.js'));
const H = globalThis.HESPEECH;

/* 1 — החיווט

   **הרשימה נגזרת — O-225, 16.10.2026.** עד היום כאן ישבו שתים־עשרה
   אפליקציות בשם, ו-hebrew-arab — שמקריאה עברית בקול he-IL מאז O-163 —
   לא הייתה ביניהן. עכשיו: כל אפליקציה ב-stages.json שהקוד שלה נוגע
   ב-`speechSynthesis`. ושלוש שאלות לכל אחת, ולא שתיים: התגית וה-PRE
   אומרים רק שהקובץ **נטען**; השלישית שואלת אם מישהו **קורא** ל-
   `HESPEECH.spoken` — אותה פרצה שבדיקה 6 סוגרת בלימור. */
const AL = require('./applist.js');
const APPS = AL.pick(process.argv.slice(2), AL.local().filter(a => /speechSynthesis/.test(AL.sourceOf(a))));
/* **חריגים — טוענות ואינן קוראות, נמדד 16.10.2026.** שמונה־עשרה
   אפליקציות טוענות את `/tutor/he-speech.js` (תגית ו-PRE עוברים בכולן)
   ואף שורה בקוד שלהן אינה קוראת ל-`HESPEECH.spoken`: ״משלש״ ו״מאד״
   נאמרים בהן כמו שהם כתובים. הכלי אינו מתקן אפליקציות; הרשימה רק
   מתקצרת — אפליקציה שהתחילה לקרוא ונשארה כאן מפילה את הבדיקה. */
const NOT_WIRED = new Set([
  'hebrew-arab',                     /* O-225 — המקור של הממצא */
  'math-g7', 'math-elem', 'hebrew-lit', 'civics', 'hebrew', 'literature', 'tanakh',
  'science-mid', 'motal', 'tanakh-elem', 'civics-elem', 'islam', 'russian',
  'culture-elem', 'history-elem', 'science-12', 'biology',
]);
const missTag = [], missPre = [], missUse = [], staleEx = [], excused = [];
for (const a of APPS) {
  const src = AL.sourceOf(a);
  const swf = path.join(ROOT, a, 'sw.js');
  const sw  = fs.existsSync(swf) ? fs.readFileSync(swf, 'utf8') : '';
  /* `onerror` מותר אחרי ה-src — משפחת ה-elem כותבת כך. */
  if (!/<script\s+src="\/tutor\/he-speech\.js"/.test(src)) missTag.push(a);
  if (sw.indexOf('/tutor/he-speech.js') < 0) missPre.push(a);
  const uses = /HESPEECH[\s\S]{0,120}?\.spoken\s*\(/.test(src);
  if (NOT_WIRED.has(a)) { if (uses) staleEx.push(a); else excused.push(a); }
  else if (!uses) missUse.push(a);
}
console.log('  ' + APPS.length + ' אפליקציות מקריאות (נגזרו מ-stages.json); ' + excused.length +
            ' טוענות ואינן קוראות — חריג מוצהר: ' + excused.join(', '));
t('תגית בכל האפליקציות המקריאות', missTag, []);
t('PRE בכל האפליקציות המקריאות', missPre, []);
t('ההקראה עוברת ב-HESPEECH.spoken', missUse, []);
t('חריג שכבר קורא — להסיר מ-NOT_WIRED', staleEx, []);
t('PRE בשורש', fs.readFileSync(path.join(ROOT,'sw.js'),'utf8').indexOf('/tutor/he-speech.js') >= 0, true);

/* 2 — מה שהבעלים שמע */
t('משלש → משולש',  H.spoken('שטח המשלש'), 'שטח המשולש');
t('נטייה: במשלש',   H.spoken('זווית במשלש'), 'זווית במשולש');
/* ״מהר״ לפני שם הר — מֵהַר; לבדו — מַהֵר. bible.js ״המסע מהר סיני״
   נשמע ״מַהֵר סיני״ עד 18.9.2026. */
t('מהר סיני → מֵהַר',  H.spoken('המסע מהר סיני'), 'המסע מֵהַר סיני');
t('מהר הביתה → מַהֵר', H.spoken('רוץ מהר הביתה'), 'רוץ מַהֵר הביתה');
t('מתמן → מתומן',   H.spoken('מתמן משוכלל'), 'מתומן משוכלל');
t('מאד → מאוד',     H.spoken('זה מאד קל'), 'זה מאוד קל');
t('מלה → מילה',     H.spoken('המלה הזאת'), 'המילה הזאת');

/* 3 — ההומוגרפים נשארים בחוץ */
const HOMO = ['עגול','החד','הרוח','כוון','לכוון','לעבר','רטב','ברטב','עבר'];
t('הומוגרפים אינם במילון', HOMO.filter(w => H._ktiv[w]), []);
t('מספר עגול נשאר',   H.spoken('מספר עגול'), 'מספר עגול');
t('חד-זווית נשאר',    H.spoken('משולש חד-זווית'), 'משולש חד-זווית');
t('הרוח נשארת רוח',   H.spoken('הרוח נושבת'), 'הרוח נושבת');

/* 4 — מספר האסימונים נשמר, ועליו נשענת ההדגשה */
const drift = [];
for (const s of ['שטח המשלש מאד מצין','המלה במשלש','זה מתמן, ולא משלש',
                 'a b c','שלום עולם','המשלשים והמתמנים']) {
  const a = s.split(/\s+/).filter(Boolean).length;
  const b = H.spoken(s).split(/\s+/).filter(Boolean).length;
  if (a !== b) drift.push(s + ' (' + a + '→' + b + ')');
}
t('מספר האסימונים נשמר', drift, []);

/* 5 — עברית בלבד: מה שאין בו עברית חוזר כמות שהוא */
t('אנגלית עוברת כמות שהיא', H.spoken('The area of the triangle'), 'The area of the triangle');
t('רוסית עוברת כמות שהיא',  H.spoken('Площадь треугольника'), 'Площадь треугольника');

/* 6 — **לימור מקריא דרך המנוע, ולא סביבו. 18.9.2026.**

   **מקור: דיווח הבעלים — ״העברית של לימור לא תקינה״.**
   חמש הטענות שלמעלה מאמתות שהמנוע **נטען** בשתים־עשרה
   האפליקציות ושהכללים שלו נכונים. אף אחת מהן לא בדקה שמישהו
   **קורא לו**, וזו הייתה הפרצה: שתים־עשרה האפליקציות מעבירות
   בו את ההקראה שלהן (`bagrut-806/speech.js` ועשר ה-`index.html`),
   ו-`tutor/tutor.js` — שמקריא את **תשובת לימור** — אינו מזכיר
   את `HESPEECH` באף שורה. נמדד ב-`grep`: אפס מופעים.

   **למה זה חשוב יותר ממה שהמספר אומר.** מתוך 169 המחרוזות
   הכתובות של לימור ארבע בלבד נשמעות אחרת דרך המנוע
   (לעבור, לעצור, חצי). אבל **תשובת המודל אינה כתובה
   מראש** — היא עברית חופשית, וכל 45 מילות המילון
   עלולות להופיע בה: ״משלש״, ״מצין״, ״מאד״, ״מלה״. בדיוק
   המילים שהבעלים שמע מוקראות לא נכון, ושבגללן הנחה
   להעתיק את המנוע מ-״תאוריה מדברת״ ב-17.9.

   ולכן הטענה היא על החיווט ולא על התוצאה: דרך
   ההקראה של לימור חייבת לקרוא ל-`spoken`, ורק על עברית.

   **והקריאה חייבת להיות מוגנת.** `tutor.js` נטען גם בדף
   הבית, שבו הפנים הן תצוגה בלבד, ובביקור ראשון אופליין
   הקובץ עשוי לא להיות טעון. תלות קשיחה היתה משתיקה
   את לימור לגמרי במקרה הזה. */
const TU = fs.readFileSync(path.join(ROOT, 'tutor', 'tutor.js'), 'utf8');
t('לימור קורא ל-spoken', /HESPEECH[\s\S]{0,120}?\.spoken\s*\(/.test(TU), true);
t('והקריאה מוגנת', /typeof\s+HESPEECH|window\.HESPEECH|g\.HESPEECH|HESPEECH\s*&&/.test(TU), true);

console.log(bad ? `✗ hespeech.js — ${bad} ממצאים` : '✓ מנוע ההגייה העברי — חיווט, כללים, הומוגרפים ואסימונים');
process.exit(bad ? 1 : 0);
