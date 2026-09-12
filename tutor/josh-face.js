/* =====================================================================
   josh-face.js — הפנים של ג׳וש. שכבת תצוגה, ותו לא.

   **מה הקובץ הזה אינו, ואסור שיהיה.** אין בו מוח, אין בו תשובות, אין
   בו חיפוש, אין `fetch`, אין `speechSynthesis`, אין בחירת קול ואין
   `ROLE`. הוא אינו יודע מה נלמד, אינו יודע מה נכון, ואינו מחליט דבר.
   הוא מקבל אירוע ומצייר פרצוף. המוח היחיד הוא `tutor-api/worker.js`,
   והממשק אליו הוא `tutor/tutor.js`.

   הכלל הזה אינו סגנון — הוא הסיבה שהקובץ נכתב. `josh-engine.js` היה
   שכבת פנים **ומוח באותו קובץ**, ומפני שהיו מחוברים, כל הודעה שלומד
   הקליד בדף הבית זרמה אל ויקיפדיה בלי שאיש התכוון לכך.
   `node .claude/qa/joshface.js` אוכף את ההפרדה בקוד ולא בהבטחה.

   שימוש:

     <script src="/tutor/josh-face.js"></script>

     html += JOSHFACE.markup(140);   // מחרוזת HTML לתוך render()
     JOSHFACE.attach();              // אחרי כל render — ראו למטה
     JOSHFACE.emit("correct");       // אירוע

   **למה `markup` ו-`attach` נפרדים.** כל האפליקציות כאן בונות את
   `#app` מחדש בכל `render()`, ולכן אלמנט שנשמר בזיכרון נמחק תחת
   הידיים. הפתרון: המצב חי במודול ולא ב-DOM, `markup()` מחזיר מחרוזת
   שנכנסת לפלט של `render()`, ו-`attach()` מוצא את הצומת שקיים עכשיו
   ומצייר עליו את המצב הנוכחי. זו אותה מלכודת ש-`tutor/tutor.js`
   מתאר בראשו, ופתרון אחר לה: הפאנל שם יושב על `document.body` מפני
   שהוא צף, והפנים כאן יושבות **בתוך** הפריסה.

   **אפס נכסים.** הפנים הן SVG מוטבע — אין PNG, אין גופן, אין בקשת
   רשת, ולכן אין מה לטעון בעצלתיים ואין מה שיאט את עליית האפליקציה.
   `josh-sprites.png` (21,797 בתים) אינו נטען כאן כלל: הוא רובוט
   צעצוע עם אנטנה, ועיצוב 2 הוא מורה אנושי. ראו O-52.

   **תנועה.** אין `requestAnimationFrame` ואין לולאה. מה שרץ תמיד הוא
   שרשרת `setTimeout` אחת למצמוץ, שנעצרת כשהלשונית מוסתרת או כשאין
   צומת מחובר. כל השאר הוא CSS. ב-`prefers-reduced-motion: reduce`
   הכול כבוי והפנים סטטיות.
   ===================================================================== */
(function (g) {
"use strict";

/* ---------------------------------------------------------------
   האירועים. עשרה, ואין אחד־עשר — כל אחד משנה מצב פנים ותו לא.

   ארבעה הם **מצב בסיס** שנשאר עד שמחליפים אותו, שלושה הם **רגע**
   שחוזר מעצמו למצב הבסיס, ושלושה מתארים את **הלומד** ולא את ג׳וש:
   הם וריאציה רגועה יותר של הקשבה, ולא הבעה שלישית. לומד מתוסכל
   אינו צריך פרצוף מודאג מולו.
   --------------------------------------------------------------- */
var BASE = { idle:1, listening:1, thinking:1, speaking:1,
             frustrated:1, stuck:1, slow:1 };
var MOMENT = { correct:1400, wrong:1600, encourage:1600 };   /* מילישניות החזקה */

/* המצב שאליו חוזרים אחרי רגע. נקבע בכניסה לרגע ולא בסופו, אחרת
   שני רגעים רצופים היו מאבדים את הבסיס. */
var base = "idle", cur = "idle", node = null, moTimer = null, blTimer = null;

var MOTION_Q = "(prefers-reduced-motion: reduce)";
function reduced() {
  try { return g.matchMedia && g.matchMedia(MOTION_Q).matches } catch (e) { return false }
}

/* ---------------------------------------------------------------
   הסגנון. מוזרק פעם אחת ולא בקובץ נפרד: קובץ CSS נוסף הוא בקשה
   נוספת, רשומה נוספת ב-`PRE` של כל `sw.js`, ומפתח קאש נוסף שאפשר
   לשכוח. כאן הכול נוסע יחד עם הקוד שמשתמש בו.
   --------------------------------------------------------------- */
var CSS = [
".jf{display:inline-block;line-height:0;position:relative}",
".jf svg{display:block;width:100%;height:auto;overflow:visible}",

/* ההטיה והנשימה — טרנספורם על השורש בלבד, לא על כל צומת */
".jf__head{transform-origin:50% 80%;transition:transform .5s cubic-bezier(.22,.8,.3,1)}",
'.jf[data-state="listening"] .jf__head,.jf[data-state="stuck"] .jf__head{transform:rotate(-4deg)}',
'.jf[data-state="thinking"] .jf__head{transform:rotate(3deg) translateY(-1px)}',
'.jf[data-state="correct"] .jf__head,.jf[data-state="encourage"] .jf__head{transform:translateY(-2px)}',
'.jf[data-state="frustrated"] .jf__head,.jf[data-state="slow"] .jf__head{transform:rotate(-2deg)}',
".jf.is-tilt .jf__head{transform:rotate(-2.5deg)}",

/* מצמוץ. אינו אנימציית CSS מחזורית אלא מחלקה שנדלקת לרגע —
   מצמוץ בקצב קבוע נראה מכני, ובני אדם ממצמצים בפרקי זמן לא שווים. */
/* `transform-box: fill-box` הוא תיקון ולא נוי: בלי הצהרה כזאת
   אחוזי `transform-origin` על אלמנט SVG נמדדים מול חלון ה-SVG
   כולו ולא מול האלמנט עצמו, והעפעף היה נסגר מהקצה העליון של
   הציור במקום מקצה העין. */
".jf__lid{transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);transition:transform .09s ease-out}",
".jf.is-blink .jf__lid{transform:scaleY(1)}",

/* האישונים — מבט. 'חושב' מסיט מבט הצידה ומעלה, כמו אדם שנזכר. */
".jf__eyes{transition:transform .45s cubic-bezier(.22,.8,.3,1)}",
'.jf[data-state="thinking"] .jf__eyes{transform:translate(3.5px,-2px)}',
'.jf[data-state="listening"] .jf__eyes{transform:translate(-1.5px,.5px)}',

/* הגבות — ההבדל בין 'מקשיב' ל'שואל'. תנועה קטנה, לא קריקטורה. */
".jf__brows{transition:transform .35s ease}",
'.jf[data-state="thinking"] .jf__brows{transform:translateY(-2.2px)}',
'.jf[data-state="wrong"] .jf__brows,.jf[data-state="encourage"] .jf__brows{transform:translateY(-1.4px)}',
'.jf[data-state="frustrated"] .jf__brows{transform:translateY(-1px)}',

/* הפה. מצב אחד גלוי בכל רגע — פשוט יותר מלמזג צורות, וקריא יותר. */
".jf__m{opacity:0;transition:opacity .18s linear}",
".jf__m.is-on{opacity:1}",
'.jf[data-state="speaking"] .jf__m--talk{transform-box:fill-box;transform-origin:50% 40%;animation:jf-talk .26s ease-in-out infinite alternate}',
"@keyframes jf-talk{from{transform:scaleY(.55)}to{transform:scaleY(1.15)}}",

/* הנגיעה הטכנולוגית: קשת אוזנייה דקה מאחורי האוזן, ונורית קטנה.
   זה הכול. הגרסה הראשונה שמה כאן הילה מעל הראש — והילה היא
   מסקוט, בעוד אוזנייה היא מישהו שעובד. */
".jf__ring{fill:none;stroke-width:2;opacity:.34;transition:stroke .4s ease,opacity .4s ease}",
'.jf[data-state="listening"] .jf__ring,.jf[data-state="stuck"] .jf__ring{opacity:.8}',
'.jf[data-state="thinking"] .jf__ring{opacity:.66}',
".jf__led{transition:fill .4s ease,opacity .4s ease;opacity:.75}",
'.jf[data-state="listening"] .jf__led{animation:jf-led 1.9s ease-in-out infinite}',
'.jf[data-state="thinking"] .jf__led{animation:jf-led 2.8s ease-in-out infinite}',
"@keyframes jf-led{0%,100%{opacity:.35}50%{opacity:1}}",

/* נכון/עידוד — הנהון אחד, לא ריקוד. */
'.jf[data-state="correct"]{animation:jf-nod .5s ease-in-out}',
"@keyframes jf-nod{0%,100%{transform:translateY(0)}45%{transform:translateY(3px)}}",

/* וזה מכבה את הכול. `animation:none` על הצאצאים מכסה גם את
   הקשת ואת ההנהון, ולא רק את הפה. */
"@media (prefers-reduced-motion: reduce){",
"  .jf *,.jf{animation:none!important;transition:none!important}",
"  .jf__head{transform:none!important}",
"}"
].join("");

function injectCSS() {
  if (document.getElementById("jf-css")) return;
  var s = document.createElement("style");
  s.id = "jf-css";
  s.textContent = CSS;
  (document.head || document.documentElement).appendChild(s);
}

/* ---------------------------------------------------------------
   הפנים.

   מורה אנושי: ראש, שיער קצר, צוואר וצווארון חולצה. הגוונים באים
   מ-`currentColor` ומשלושה צבעים קבועים וחמים, ולא ממשתני נושא של
   אפליקציה מסוימת — הקובץ הזה משותף, והוא אינו מכיר את הפלטה של
   מי שטוען אותו.

   `aria-hidden` מפני שאלה פנים ולא מידע: מה שיש לג׳וש לומר יושב
   בטקסט שלידו, ומקריא מסך שיקריא גם פרצוף יקרא אותו דבר פעמיים.
   ובלי טקסט בתוך ה-SVG גם אין כאן עברית סטטית — `aria.js` בדיקה 6
   מפילה כל מילה עברית שאינה עוברת ב-`lgChrome`.
   --------------------------------------------------------------- */
var SKIN   = "#e3b28d",   /* גוון בסיס */
    SKIN_M = "#cf9a73",   /* צל בינוני — אוזניים, צוואר, אף */
    SKIN_D = "#b57f58",   /* צל עמוק — מתחת ללסת ובנחיריים */
    HAIR   = "#2e2a31", HAIR_HI = "#433c48",
    SHIRT  = "#35566e", COLLAR = "#2a4459",
    LIP    = "#a96754", TECH = "#4aa8a0";

/* `width` ו-`height` יושבים כתכונות ולא ב-CSS בלבד, וזו חגורה ולא
   כפילות: נמדד בכרומיום — בלי גיליון הסגנון ה-SVG קורס ל-0×0, מפני
   ש-`height:auto` על SVG מוטבע אינו נגזר מ-`viewBox` כשאין לו רוחב.
   פנים בגודל אפס אינן שגיאה ואינן נראות בשום בדיקת DOM: הצומת קיים,
   האירועים עובדים, והמסך ריק. התכונות מבטיחות שהוא ייראה גם אם
   הסגנון לא הגיע.

   **הציור נבנה מחדש 12.9.2026, אחרי שהגרסה הראשונה נפסלה.** היא
   נראתה כמו אימוג׳י: ראש עגול, עיניים גדולות ולבנות, ואפס הצללה.
   ההבדל בין ״ציור של דמות״ ל״אדם״ אינו כמות הפרטים אלא ארבעה
   דברים, וכולם כאן:

     · **פרופורציה** — הראש גבוה מרוחבו (49×71 ביחידות ה-viewBox)
       ויש לו לסת. עיגול הוא תמיד תינוק או אימוג׳י.
     · **עיניים שקדיות וקטנות** — עין אנושית היא כשישית מרוחב הפנים
       ורובה מכוסה בעפעף. לובן גדול ועגול הוא קריקטורה.
     · **הצללה** — לחיים, מתחת ללסת, זיפים קלים וצל אף. בלעדיה כל
       ציור שטוח נקרא כמדבקה.
     · **פה קטן בגוון שפתיים** — לא קו שחור מחייך מאוזן לאוזן.

   הנגיעה הטכנולוגית ירדה מהילה מעל הראש לקשת אוזנייה דקה מאחורי
   האוזן. הילה מעל הראש היא מסקוט; אוזנייה היא מישהו שעובד. */
function faceSVG(px) {
  return '<svg viewBox="0 0 120 120" width="' + px + '" height="' + px + '" aria-hidden="true" focusable="false">' +

    /* ---- גוף: חולצה עם צווארון פתוח ---- */
    '<path fill="' + SHIRT + '" d="M 21 120 C 23 104 31 97.5 46.5 93.5 L 73.5 93.5 C 89 97.5 97 104 99 120 Z"/>' +
    '<path fill="' + SKIN_M + '" d="M 51 78 h 18 v 16 q -9 7 -18 0 Z"/>' +
    '<path fill="' + SKIN_D + '" opacity=".45" d="M 51 78 q 9 11 18 0 v 5 q -9 9 -18 0 Z"/>' +
    /* פתח הצווארון ושתי הדשים */
    '<path fill="' + SKIN_M + '" d="M 53.5 93.5 L 60 104 L 66.5 93.5 Z"/>' +
    '<path fill="' + COLLAR + '" d="M 46.5 92 L 60.5 105 L 54 92 Z"/>' +
    '<path fill="' + COLLAR + '" d="M 73.5 92 L 59.5 105 L 66 92 Z"/>' +

    '<g class="jf__head">' +
      /* ---- שיער אחורי, ואוזניים ---- */
      '<path fill="' + HAIR + '" d="M 33 55 C 31 26 43.5 14 60 14 C 76.5 14 89 26 87 55 C 86 45 84 39.5 82 36 L 38 36 C 36 39.5 34 45 33 55 Z"/>' +
      '<path fill="' + SKIN_M + '" d="M 36.5 52.5 C 32 51.5 30 55.5 31.2 60 C 32.2 63.6 34.2 66 36.8 66.2 Z"/>' +
      '<path fill="' + SKIN_M + '" d="M 83.5 52.5 C 88 51.5 90 55.5 88.8 60 C 87.8 63.6 85.8 66 83.2 66.2 Z"/>' +
      '<path d="M 34.4 56 c 1.2 1.4 1.4 4 .6 5.8" stroke="' + SKIN_D + '" stroke-width="1" fill="none" opacity=".8"/>' +
      '<path d="M 85.6 56 c -1.2 1.4 -1.4 4 -.6 5.8" stroke="' + SKIN_D + '" stroke-width="1" fill="none" opacity=".8"/>' +

      /* ---- הפנים: גבוה מרוחבו, עם לסת ---- */
      '<path fill="' + SKIN + '" d="M 35.5 50 C 35.5 27 44 17.5 60 17.5 C 76 17.5 84.5 27 84.5 50 C 84.5 61 83 68.5 79.5 74.5 C 75 82 67.5 88.5 60 88.5 C 52.5 88.5 45 82 40.5 74.5 C 37 68.5 35.5 61 35.5 50 Z"/>' +
      /* הצללה: לחיים, ולסת עם זיפים קלים */
      '<ellipse cx="42.5" cy="65" rx="4.6" ry="7" fill="' + SKIN_D + '" opacity=".13"/>' +
      '<ellipse cx="77.5" cy="65" rx="4.6" ry="7" fill="' + SKIN_D + '" opacity=".13"/>' +
      '<path fill="#6d4b33" opacity=".11" d="M 40.5 64 C 44 80 52 88.5 60 88.5 C 68 88.5 76 80 79.5 64 C 77 74.5 70 80.5 60 80.5 C 50 80.5 43 74.5 40.5 64 Z"/>' +

      /* ---- שיער קדמי: קו שיער סרוק לצד, ורקות ---- */
      '<path fill="' + HAIR + '" d="M 34 52 C 32 25 44 15.5 60 15.5 C 76 15.5 88 25 86 52 C 85 44 83.5 39.5 82 37 C 76 31 66 33.5 56 36.5 C 48 39 42 40.5 38.5 44 C 36.5 46.2 35 49 34 52 Z"/>' +
      '<path fill="' + HAIR_HI + '" opacity=".45" d="M 63 18.5 C 71 20 78 25.5 81 34 C 77 26.5 70 21 63 18.5 Z"/>' +
      '<path fill="' + HAIR + '" d="M 35.6 45.5 c 1.6 1 2 6.5 1.4 11.5 l -2.6 -1.6 c -0.4 -4.4 -0.2 -7.6 1.2 -9.9 Z"/>' +
      '<path fill="' + HAIR + '" d="M 84.4 45.5 c -1.6 1 -2 6.5 -1.4 11.5 l 2.6 -1.6 c 0.4 -4.4 0.2 -7.6 -1.2 -9.9 Z"/>' +

      /* ---- אוזנייה: הנגיעה הטכנולוגית היחידה ---- */
      '<path class="jf__ring" stroke="' + TECH + '" d="M 84.6 49.5 C 90.4 51 92.6 56.4 91.4 62.2"/>' +
      '<circle class="jf__led" cx="91" cy="63.8" r="1.9" fill="' + TECH + '"/>' +

      '<g class="jf__brows">' +
        '<path d="M 42.6 45.4 C 46 42.5 53 42.5 56.6 45" stroke="' + HAIR + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M 63.4 45 C 67 42.5 74 42.5 77.4 45.4" stroke="' + HAIR + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '</g>' +

      '<g class="jf__eyes">' +
        /* שקד ולא עיגול, ועליו קו ריסים שנותן עומק */
        '<path fill="#f7f3ef" d="M 43 54.2 C 45 50.2 54 50.2 56 54.2 C 54 57.9 45 57.9 43 54.2 Z"/>' +
        '<path fill="#f7f3ef" d="M 64 54.2 C 66 50.2 75 50.2 77 54.2 C 75 57.9 66 57.9 64 54.2 Z"/>' +
        '<circle cx="49.9" cy="54.3" r="3.3" fill="#4e3a2e"/>' +
        '<circle cx="70.1" cy="54.3" r="3.3" fill="#4e3a2e"/>' +
        '<circle cx="49.9" cy="54.3" r="1.6" fill="#181410"/>' +
        '<circle cx="70.1" cy="54.3" r="1.6" fill="#181410"/>' +
        '<circle cx="51.1" cy="52.9" r=".85" fill="#ffffff" opacity=".95"/>' +
        '<circle cx="71.3" cy="52.9" r=".85" fill="#ffffff" opacity=".95"/>' +
        '<path d="M 43 54.2 C 45 50 54 50 56 54.2" stroke="#332721" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M 64 54.2 C 66 50 75 50 77 54.2" stroke="#332721" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M 44.6 56.8 C 47 58.2 52 58.2 55 56.8" stroke="' + SKIN_D + '" stroke-width=".9" fill="none" opacity=".6"/>' +
        '<path d="M 65.6 56.8 C 68 58.2 73 58.2 76 56.8" stroke="' + SKIN_D + '" stroke-width=".9" fill="none" opacity=".6"/>' +
        /* העפעפיים — נסגרים בקנה מידה אנכי, ולכן אין ציור שני */
        '<path class="jf__lid" fill="' + SKIN + '" d="M 42.4 49.6 h 14.2 v 8.8 c -2.6 2.4 -11.6 2.4 -14.2 0 Z"/>' +
        '<path class="jf__lid" fill="' + SKIN + '" d="M 63.4 49.6 h 14.2 v 8.8 c -2.6 2.4 -11.6 2.4 -14.2 0 Z"/>' +
      '</g>' +

      /* ---- אף: גשר, בסיס ושני נחיריים ---- */
      '<path d="M 57.6 55.5 C 56.7 62 56.3 66 57.7 68.6" stroke="' + SKIN_M + '" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M 55.9 69.3 C 57.6 71.3 62.4 71.3 64.1 69.3" stroke="' + SKIN_D + '" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".85"/>' +
      '<ellipse cx="56.7" cy="69.7" rx=".9" ry=".65" fill="' + SKIN_D + '" opacity=".65"/>' +
      '<ellipse cx="63.3" cy="69.7" rx=".9" ry=".65" fill="' + SKIN_D + '" opacity=".65"/>' +

      /* ---- חמישה פיות, אחד גלוי בכל רגע ---- */
      '<g class="jf__mouths">' +
        '<path class="jf__m jf__m--calm is-on" d="M 53.2 78.4 C 56 79.9 64 79.9 66.8 78.4" stroke="' + LIP + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--smile" d="M 52.2 77.6 C 55.6 82.6 64.4 82.6 67.8 77.6" stroke="' + LIP + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--soft" d="M 53.6 78.8 C 56.4 80 63.6 80 66.4 78.2" stroke="' + LIP + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--think" d="M 54 78.6 C 56.6 77.2 59 79.1 61.6 78.7 C 64 78.3 65.6 77.6 66.6 77" stroke="' + LIP + '" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
        '<path class="jf__m jf__m--talk" fill="#7a3f35" d="M 54.4 77.6 C 57.2 76.3 62.8 76.3 65.6 77.6 C 64.6 82.6 55.4 82.6 54.4 77.6 Z"/>' +
      '</g>' +
    '</g>' +
  '</svg>';
}

/* איזה פה לכל מצב. טעות אינה מקבלת פרצוף עצוב: הכלל שנמסר הוא
   שלא מביישים מי שטעה, ופה נופל מול ילד הוא בדיוק זה. */
var MOUTH = {
  idle:"calm", listening:"soft", thinking:"think", speaking:"talk",
  correct:"smile", encourage:"smile", wrong:"soft",
  frustrated:"soft", stuck:"soft", slow:"calm"
};

/* ---------------------------------------------------------------
   ציור
   --------------------------------------------------------------- */
function paint() {
  if (!node) return;
  node.setAttribute("data-state", cur);
  var want = MOUTH[cur] || "calm", list = node.querySelectorAll(".jf__m"), i;
  for (i = 0; i < list.length; i++) {
    list[i].classList.toggle("is-on", list[i].classList.contains("jf__m--" + want));
  }
}

/* המצמוץ. פרק זמן אקראי בין שלוש לשבע שניות, ולפעמים גם הטיית ראש
   זעירה — שתיהן באותה שרשרת, כדי שלא ירוצו שני טיימרים. */
function scheduleBlink() {
  clearTimeout(blTimer);
  if (!node || reduced()) return;
  blTimer = setTimeout(function () {
    if (!node) return;
    if (!document.hidden) {
      node.classList.add("is-blink");
      setTimeout(function () { if (node) node.classList.remove("is-blink") }, 120);
      /* הטיה קלה רק כשאין מה לעשות. באמצע דיבור היא נראית כמו תקלה. */
      if (cur === "idle" && Math.random() < 0.28) {
        node.classList.add("is-tilt");
        setTimeout(function () { if (node) node.classList.remove("is-tilt") }, 1500);
      }
    }
    scheduleBlink();
  }, 3000 + Math.random() * 4000);
}

/* ---------------------------------------------------------------
   הממשק הציבורי
   --------------------------------------------------------------- */
var JOSHFACE = {

  /** מחרוזת HTML לתוך הפלט של render(). אינה נוגעת ב-DOM. */
  markup: function (size) {
    /* הסגנון מוזרק כאן ולא רק ב-`attach`. מי שקורא ל-`markup` ושוכח
       את `attach` היה מקבל פנים שקיימות ב-DOM ואינן נראות — כשל שקט
       בדיוק כמו זה שהקובץ הזה נכתב כדי למנוע. ההזרקה מוגנת מכפילות. */
    injectCSS();
    var px = Math.max(48, Math.min(320, parseInt(size, 10) || 140));
    return '<span class="jf" data-state="' + cur + '" style="width:' + px + 'px">' + faceSVG(px) + '</span>';
  },

  /** מחבר את המודול לצומת שקיים עכשיו. נקרא אחרי כל render(). */
  attach: function (el) {
    injectCSS();
    node = el || document.querySelector(".jf");
    if (!node) return false;
    paint();
    scheduleBlink();
    return true;
  },

  detach: function () {
    clearTimeout(blTimer); blTimer = null;
    clearTimeout(moTimer); moTimer = null;
    node = null;
  },

  /**
   * אירוע אחד מתוך עשרה. מצב לא מוכר מוחזר כ-false ואינו משנה דבר,
   * כדי שקריאה שגויה לא תשאיר פרצוף תקוע.
   */
  emit: function (ev) {
    if (MOMENT[ev]) {
      cur = ev; paint();
      clearTimeout(moTimer);
      moTimer = setTimeout(function () { cur = base; paint() }, MOMENT[ev]);
      return true;
    }
    if (BASE[ev]) {
      clearTimeout(moTimer); moTimer = null;
      base = ev; cur = ev; paint();
      return true;
    }
    return false;
  },

  /** המצב המוצג כרגע, ומצב הבסיס שאליו יחזור אחרי רגע. */
  state: function () { return { current: cur, base: base } },

  /**
   * וו לסנכרון שפתיים, ו**רק וו**. הוא אינו מקריא ואינו יודע מה
   * נאמר: מי שמקריא הוא `tutor/tutor.js`, ואם וכאשר יוחלט לחבר —
   * הוא יקרא לכאן מתוך `onboundary` שכבר קיים אצלו. עד אז הפה נע
   * ב-CSS, וזה מספיק. אין כאן `speechSynthesis` ואין בחירת קול.
   */
  boundary: function () {
    if (!node || cur !== "speaking" || reduced()) return false;
    var m = node.querySelector(".jf__m--talk");
    if (!m) return false;
    m.style.transform = "scaleY(" + (0.6 + Math.random() * 0.6).toFixed(2) + ")";
    return true;
  },

  reduced: reduced
};

/* לשונית מוסתרת — אין למי לצייר, והטיימר נעצר. */
document.addEventListener("visibilitychange", function () {
  if (document.hidden) { clearTimeout(blTimer); blTimer = null; }
  else if (node) scheduleBlink();
});

g.JOSHFACE = JOSHFACE;

})(window);
