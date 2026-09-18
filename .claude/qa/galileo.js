/* =====================================================================
   galileo.js — הדיוק של רקיע, נמדד ולא משוער

     node .claude/qa/galileo.js            סטייה מרבית לכל גוף מול Swiss Ephemeris
     node .claude/qa/galileo.js --table    אותו דבר, כטבלת Markdown (ל-FINDINGS ול״על הדיוק״)

   הייחוס: `.claude/qa/rakia/reference.json`, שנוצר פעם אחת
   ב-`mk-reference.py` מ-pyswisseph (Moshier) — אותו מנוע שמאחורי
   astro.com — ונשמר בריפו כדי שהבדיקה תרוץ בלי פייתון ובלי רשת.
   57 מקרים: שלוש מפות בדיקה, רשת 1900–2100 בשישה מקומות, פלוטו
   לפני 1885 ואחרי 2099 (O-3).

   מה נבדק:
   1. **קו אורך של כל גוף** — סטייה מרבית בשניות קשת, בתוך גבולות
      שנקבעו לכל גוף (למטה). הגבולות הם עובדה על הקיצוץ של
      ephem-data.js, ומי שמשנה סף שם רואה את זה כאן.
   2. **סימן המהירות** (נסיגה) — זהה בכל מקרה.
   3. **עולה, רום השמיים ושנים־עשר הבתים** (Placidus) — סטייה
      בשניות קשת. ברייקיאוויק (64°) Placidus קיים בשני המנועים.
   4. **Whole Sign** — זהה.
   5. **פלוטו מחוץ לתוקף** — המנוע מסמן lowPrecision, והסטייה
      שם נמדדת ומודפסת, לא נבלעת.
   6. **הזמן** — localToUtc על שלוש מפות הבדיקה מחזיר את ה-UT
      שנכתב ביד בקובץ הייחוס; selfTest של Intl עובר ב-node.

   קו הבסיס הוא אפס. הוכחת נפילה: FINDINGS.md, שלב A של רקיע.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const REF = JSON.parse(fs.readFileSync(path.join(__dirname, 'rakia', 'reference.json'), 'utf8'));
const table = process.argv.includes('--table');

const ctx = vm.createContext({ Intl, Date, Math });
vm.runInContext(fs.readFileSync(path.join(ROOT, 'rakia', 'ephem-data.js'), 'utf8') + '\n' +
                fs.readFileSync(path.join(ROOT, 'rakia', 'astro.js'), 'utf8'), ctx);
const A = ctx.ASTRO;

/* גבולות בשניות קשת — עובדה על הקיצוץ, לא שאיפה. ראו FINDINGS. */
const LIMIT = { sun: 2, moon: 8, mercury: 4, venus: 3, mars: 4, jupiter: 6, saturn: 8, uranus: 8, neptune: 8, pluto: 30,
                meanNode: 3, trueNode: 60, asc: 8, mc: 4, cusp: 12 };
/* ΔT: המנוע נמדד עם ה-ΔT של הייחוס, כדי שהסטייה תשקף את האפמריס ולא
   את מדיניות ההארכה של ΔT אחרי 2050. הפער ב-ΔT נמדד ומודפס בנפרד. */
let dtGapNear = 0, dtGapFar = 0;
const d180 = (a, b) => { let d = (a - b) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
const arcsec = d => Math.abs(d) * 3600;

const worst = {};   // body → {v, tag}
const note = (k, v, tag) => { if (!worst[k] || v > worst[k].v) worst[k] = { v, tag }; };
let bad = 0, n = 0, plutoLate = [];

for (const c of REF.cases) {
  n++;
  const ch = A.chart({ jdUt: c.jd, lat: c.lat, lon: c.lon, houseSystem: 'placidus', deltaT: c.deltaT });
  const gap = Math.abs(A.deltaT(c.y + (c.m - 0.5) / 12) - c.deltaT);
  if (c.y <= 2050) dtGapNear = Math.max(dtGapNear, gap); else dtGapFar = Math.max(dtGapFar, gap);
  const pos = {}; for (const b of ch.bodies) pos[b.id] = b;
  pos.meanNode = { lon: ch.meanNode, speed: -0.053, retro: true };
  for (const id of Object.keys(c.bodies)) {
    const mine = pos[id], ref = c.bodies[id];
    if (!mine) { bad++; console.log(`✗ ${c.tag}: אין ${id}`); continue; }
    const dev = arcsec(d180(mine.lon, ref.lon));
    if (id === 'pluto' && c.tag.startsWith('pluto-')) { plutoLate.push([c.y, dev, mine.lowPrecision]); if (!mine.lowPrecision) { bad++; console.log(`✗ ${c.tag}: פלוטו ${c.y} בלי סימון lowPrecision`); } continue; }
    note(id, dev, c.tag);
    if (dev > LIMIT[id]) { bad++; console.log(`✗ ${c.tag} ${c.y}: ${id} סטייה ${dev.toFixed(1)}″ > ${LIMIT[id]}″`); }
    /* ראש הדרקון האמיתי עוצר ומתהפך; כשהמהירות קטנה מ-0.02°/יום בשני המנועים הסימן אינו ממצא */
    const still = id === 'trueNode' && Math.abs(mine.speed) < 0.02 && Math.abs(ref.speed) < 0.02;
    if (id !== 'meanNode' && !still && (mine.speed < 0) !== (ref.speed < 0)) { bad++; console.log(`✗ ${c.tag} ${c.y}: ${id} סימן מהירות ${mine.speed.toFixed(4)} מול ${ref.speed.toFixed(4)}`); }
  }
  /* בתים */
  const H = ch.houses;
  if (!H || H.system !== 'placidus') { bad++; console.log(`✗ ${c.tag}: Placidus לא חושב (${H && H.fallback})`); continue; }
  const da = arcsec(d180(H.asc, c.asc)), dm = arcsec(d180(H.mc, c.mc));
  note('asc', da, c.tag); note('mc', dm, c.tag);
  if (da > LIMIT.asc) { bad++; console.log(`✗ ${c.tag} ${c.y}: עולה סטייה ${da.toFixed(1)}″`); }
  if (dm > LIMIT.mc) { bad++; console.log(`✗ ${c.tag} ${c.y}: MC סטייה ${dm.toFixed(1)}″`); }
  for (let i = 1; i <= 12; i++) {
    const dc = arcsec(d180(H.cusps[i], c.placidus[i - 1]));
    note('cusp', dc, c.tag + ' בית ' + i);
    if (dc > LIMIT.cusp) { bad++; console.log(`✗ ${c.tag} ${c.y}: בית ${i} סטייה ${dc.toFixed(1)}″`); }
  }
  const W = A.houses('whole', ch.lst, c.lat, ch.obliquity);
  for (let i = 1; i <= 12; i++) if (arcsec(d180(W.cusps[i], c.whole[i - 1])) > 1) { bad++; console.log(`✗ ${c.tag}: Whole Sign בית ${i}`); break; }
}
/* 6 — הזמן */
const T = [['test1-telaviv', 1990, 7, 1, 12, 0, 'Asia/Jerusalem'], ['test2-jerusalem', 1965, 11, 22, 6, 30, 'Asia/Jerusalem'], ['test3-newyork', 2010, 3, 14, 23, 45, 'America/New_York']];
for (const [tag, y, m, d, h, mi, tz] of T) {
  const c = REF.cases.find(x => x.tag === tag);
  const u = A.localToUtc(y, m, d, h, mi, tz), jd = A.jdFromMs(u.utcMs);
  if (Math.abs(jd - c.jd) * 86400 > 1) { bad++; console.log(`✗ ${tag}: localToUtc נתן JD ${jd} מול ${c.jd} (קיזוז ${u.offsetMinutes})`); }
}
const st = A.selfTest();
if (!st.ok) { bad++; console.log(`✗ selfTest של Intl נכשל ב-node: ${st.why}`); }

/* דוח */
const order = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'meanNode', 'trueNode', 'asc', 'mc', 'cusp'];
if (table) {
  console.log('| גוף | סטייה מרבית | גבול | היכן |\n|---|---|---|---|');
  for (const k of order) if (worst[k]) console.log(`| ${k} | ${worst[k].v.toFixed(1)}″ | ${LIMIT[k]}″ | ${worst[k].tag} |`);
} else {
  console.log(`== גלילאו · ${n} מקרים מול ${REF.source}`);
  for (const k of order) if (worst[k]) console.log(`   ${k.padEnd(9)} מרבי ${worst[k].v.toFixed(1).padStart(6)}″  גבול ${String(LIMIT[k]).padStart(3)}″   (${worst[k].tag})`);
}
console.log(`   ΔT: פער מרבי מול הייחוס ${dtGapNear.toFixed(1)}s עד 2050, ${dtGapFar.toFixed(1)}s אחרי (הארכה שונה; ראו ״על הדיוק״)`);
console.log(`   פלוטו מחוץ לתוקף (lowPrecision): ` + plutoLate.map(([y, d, lp]) => `${y}: ${(d / 60).toFixed(1)}′${lp ? '' : ' ✗'}`).join(' · '));
console.log(`${bad ? '✗' : '✓'} ${n} מקרים, ${bad} ממצאים`);
process.exit(bad ? 1 : 0);
