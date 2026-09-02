/* בונה את כל האייקונים מ-marks.js.
   הרצה:  node brand/build.js
   דורש כרומיום מקומי; אין תלות רשת ואין חבילות npm.
   הפלט: brand/svg/*.svg (המקור הקריא) ו-PNG לכל תיקיית אפליקציה. */

const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const { APPS, DIR } = require('./marks.js');

const ROOT = path.join(__dirname, '..');
const SVG  = path.join(__dirname, 'svg');
const TMP  = fs.mkdtempSync(path.join(require('os').tmpdir(), 'icons-'));

const CHROME = process.env.CHROME || [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('לא נמצא כרומיום. הגדירו CHROME=/path/to/chrome'); process.exit(1); }

/* שתי וריאציות מאותו סימן:
   icon     — ריבוע מעוגל, מה שרואים במסך הבית ובלשונית
   maskable — מלוא הריבוע והסימן מוקטן ל-72%, כי אנדרואיד חותך בעיגול */
function svg(id, kind){
  const a = APPS[id];
  const mark = a.mark.replace(/TAGINK/g, a.d);
  const bg = kind === 'maskable'
    ? `<rect width="512" height="512" fill="url(#g-${id})"/>`
    : `<rect x="16" y="16" width="480" height="480" rx="116" fill="url(#g-${id})"/>`;
  const inner = kind === 'maskable'
    ? `<g transform="translate(256,256) scale(.72) translate(-256,-256)">${mark}</g>`
    : mark;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs><linearGradient id="g-${id}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${a.c}"/><stop offset="1" stop-color="${a.d}"/></linearGradient></defs>
${bg}
${inner}
</svg>`;
}

/* הקנבס תמיד 512; העטיפה מותחת אותו לגודל היעד כדי שהקטנה
   תהיה וקטורית ולא דגימה מחדש של PNG גדול. */
function png(svgFile, outFile, size){
  const html = path.join(TMP, 'w.html');
  fs.writeFileSync(html,
    `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:none}` +
    `svg{display:block;width:${size}px;height:${size}px}</style>` +
    fs.readFileSync(svgFile, 'utf8'));
  execFileSync(CHROME, ['--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
    '--default-background-color=00000000', `--screenshot=${outFile}`,
    `--window-size=${size},${size}`, 'file://' + html], { stdio: 'ignore' });
}

fs.mkdirSync(SVG, { recursive: true });
let n = 0;
for (const id of Object.keys(APPS)) {
  const plain = path.join(SVG, id + '.svg'), mask = path.join(SVG, id + '-maskable.svg');
  fs.writeFileSync(plain, svg(id, 'icon'));
  fs.writeFileSync(mask,  svg(id, 'maskable'));

  /* תאוריה מדברת חיה מחוץ למאגר הזה: יש לה SVG לכרטיס בדף הבית,
     אבל אין לאן לכתוב לה PNG. */
  if (!DIR[id]) { console.log(id.padEnd(16), 'SVG בלבד — אין תיקייה במאגר'); continue; }

  const out = path.join(ROOT, DIR[id]);
  fs.mkdirSync(out, { recursive: true });
  png(plain, path.join(out, 'icon-512.png'), 512);
  png(plain, path.join(out, 'icon-192.png'), 192);
  png(plain, path.join(out, 'apple-touch-icon.png'), 180);
  png(mask,  path.join(out, 'icon-maskable-512.png'), 512);
  n += 4;
  console.log(DIR[id].padEnd(16), '4 קבצים');
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log('\nסה״כ', n, 'קובצי PNG מתוך', Object.keys(APPS).length, 'סימנים');
