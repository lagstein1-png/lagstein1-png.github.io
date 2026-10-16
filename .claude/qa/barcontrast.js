/* =====================================================================
   ניגודיות פס הכותרת — חישוב WCAG על הצבעים שבקובץ, בלי דפדפן.

     node .claude/qa/barcontrast.js
     node .claude/qa/barcontrast.js tanakh-elem

   **למה סטטי, כשיש כבר `contrast.js`.** `contrast.js` מודד בדפדפן
   אמיתי וזו הבדיקה החזקה — אבל הוא דורש שרת ו-chromium, הוא מסומן
   `slow`, ו-`--fast` מדלג עליו. ארבעת הפקדים כאן הם צבע קבוע בקובץ
   CSS: אפשר לחשב אותם בלי להריץ כלום, ואז הם נבדקים בכל ריצה.

   **מה נמצא ב-5.10.2026, בשבע אפליקציות:** טקסט לבן על רקע בהיר
   מדי בארבעת הפקדים של פס הכותרת —

       כפתור ״לאט״     2.48:1     (בכולן)
       כפתורי השפה     1.84–1.96
       חזור / הגדרות   1.79–1.90
       הכותרת          2.23–3.04

   מול 3.0 הנדרשים לטקסט גדול ומודגש (WCAG 2.2, 1.4.3). כפתור
   ההאטה הוא **בדיוק** הפקד של הקהל הזה, ו-`hebrew-lit` כבר הייתה
   ציבורית. התיקון: הקצה הבהיר של המדרג הוכהה, השכבה השקופה שעל
   הפס הפכה משקופה-לבנה לשקופה-שחורה, ו-`.slow` הוכהה.

   **הסף 3.0 ולא 4.5** — כל ארבעת הפקדים הם טקסט מודגש מעל 18.66px
   (`font-weight:800`), וזה ״טקסט גדול״ בהגדרת התקן.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const AL = require('./applist.js');

const NEED = 3.0;

function hex(h) {
  h = String(h).replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}
function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
function lum(rgb) { const [r, g, b] = rgb.map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
function ratio(a, b) {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
/* שכבה שקופה מעל רקע אטום. rgba(0,0,0,.18) על כתום = כתום כהה. */
function over(layer, alpha, bg) { return bg.map((c, i) => Math.round(layer[i] * alpha + c * (1 - alpha))) }

const WHITE = [255, 255, 255];
const RGBA = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\.?\d+)\s*\)/;

/* הרקע בפועל של כלל: צבע אטום, או שכבה שקופה מעל הקצה הבהיר של
   המדרג — הקצה הבהיר הוא המקרה הגרוע, ולכן הוא זה שנמדד. */
function bgOf(decl, barLight) {
  if (!decl) return null;
  const m = RGBA.exec(decl);
  if (m) return over([+m[1], +m[2], +m[3]], parseFloat(m[4]), barLight);
  const h = /#([0-9a-f]{3}|[0-9a-f]{6})\b/i.exec(decl);
  return h ? hex(h[0]) : null;
}

const argv = process.argv.slice(2).filter(a => !a.startsWith('-'));

/* **ה-CSS של האפליקציה — `app.css` וגם `<style>` שב-`index.html`.**
   O-196, 16.10.2026: הסינון היה לפי `app.css` בלבד, ולכן ארבע
   אפליקציות שבהן `.slow{` מוטבע ב-`index.html` (domino, math-g7,
   math-elem, science-mid) לא נמדדו כלל — כפתור ״לאט״ בהיר בהן היה
   עובר בירוק. עכשיו נקראים שני המקורות, יחד. */
function cssOf(app) {
  let css = '';
  const ac = path.join(AL.ROOT, app, 'app.css');
  if (fs.existsSync(ac)) css += fs.readFileSync(ac, 'utf8') + '\n';
  const ix = path.join(AL.ROOT, app, 'index.html');
  if (fs.existsSync(ix))
    for (const m of fs.readFileSync(ix, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css += m[1] + '\n';
  return css;
}
/* `var(--x)` → הצבע שהוגדר לו. הגדרה ראשונה גוברת (`:root` בראש הקובץ). */
function resolveVars(decl, css) {
  return decl && decl.replace(/var\(\s*(--[\w-]+)\s*\)/g, (all, v) => {
    const m = new RegExp(v.replace(/[-]/g, '\\-') + '\\s*:\\s*([^;}]+)').exec(css);
    return m ? m[1].trim() : all;
  });
}
/* הכלל הראשון `.n{…}` שקובע את התכונה — כמו קודם, הראשון ולא
   המאוחר: הכללים המאוחרים הם מצבים (`html.hi-contrast .lg`, מסך
   הגדרות) ולא הפס עצמו. סלקטור מורכב נתפס: `.btn.slow{` (domino),
   ולא רק `.slow{`. */
function prop(css, sel, name) {
  for (const m of css.matchAll(new RegExp('(?:^|[\\s,}>]|\\.[\\w-]+)\\.' + sel + '\\s*\\{([^}]*)\\}', 'g'))) {
    const d = new RegExp('(?:^|;)\\s*' + name + '\\s*:\\s*([^;]+)').exec(m[1]);
    if (d) return resolveVars(d[1].trim(), css);
  }
  return null;
}
function colorOf(decl) {
  if (!decl) return null;
  const h = /#([0-9a-f]{3}|[0-9a-f]{6})\b/i.exec(decl);
  if (h) return hex(h[0]);
  return /^(#fff|white)\b/i.test(decl) ? WHITE : null;
}

/* מי שיש לו `.slow` — בכל אחד משני המקורות. נגזר מהקוד ולא מרשימת שמות. */
const apps = (argv.length ? argv : AL.local()).filter(a => /\.slow\s*\{/.test(cssOf(a)));

let findings = 0, pairs = 0;
for (const app of apps) {
  const css = cssOf(app);
  const g = /linear-gradient\(90deg,\s*(#[0-9a-f]{3,6})\s*,\s*(#[0-9a-f]{3,6})\s*\)/i.exec(css);
  const light = g ? hex(g[1]) : null;
  /* צבע הטקסט של ״לאט״: מה ש-`.slow` קובע, אחרת `.btn` (הכפתור הוא
     `class="btn slow"`), ואחרת לבן — ההנחה של משפחת ה-elem. */
  const slowFg = colorOf(prop(css, 'slow', 'color')) || colorOf(prop(css, 'btn', 'color')) || WHITE;
  /* בלי מדרג אין ״קצה בהיר״ — ולכן רק רקע אטום נמדד. שכבה שקופה
     בלי רקע ידוע אינה ניתנת לחישוב, והיא מודפסת ולא מושתקת. */
  const bg = decl => {
    if (!decl) return null;
    if (light) return bgOf(decl, light);
    return RGBA.test(decl) ? null : bgOf(decl, WHITE);
  };
  const checks = light ? [
    ['הכותרת',        WHITE, light],
    ['כפתורי השפה',   WHITE, bg(prop(css, 'lg', 'background'))],
    ['חזור/הגדרות',   WHITE, bg(prop(css, 'gear', 'background'))],
    ['כפתור ״לאט״',   slowFg, bg(prop(css, 'slow', 'background'))],
  ] : [
    ['כפתור ״לאט״',   slowFg, bg(prop(css, 'slow', 'background'))],
  ];
  const bad = [];
  let n = 0;
  for (const [name, fg, b] of checks) {
    if (!b) continue;
    pairs++; n++;
    const v = ratio(fg, b);
    if (v < NEED) bad.push(`${name} ${v.toFixed(2)}:1`);
  }
  if (!n) { console.log(`· ${app.padEnd(14)} אין צבע אטום למדידה — דולג`); continue }
  if (bad.length) { findings += bad.length; console.log(`✗ ${app.padEnd(14)} ${bad.join(' · ')} (נדרש ${NEED})`) }
  else console.log(`✓ ${app.padEnd(14)} ${light ? 'ארבעת הפקדים עוברים' : 'כפתור ״לאט״ עובר (אין מדרג בפס)'} ${NEED}:1`);
}

console.log(`\n${apps.length} אפליקציות · ${pairs} צמדי צבע · ${findings} ממצאים`);
process.exit(findings ? 1 : 0);
