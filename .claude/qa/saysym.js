/* =====================================================================
   saysym.js — מה באמת מגיע למנוע ההקראה

   `content.js` כבר בודק `symbol-in-say`, והוא פספס את הבאג שהוליד
   את הקובץ הזה: `math-uni2` חזר **PASS** בזמן ש-"x → 0⁺" הוקרא
   ללומד כ״אפס ועוד״ ו-"x⁻ᵖ" כ״איקס ^ מינוס פי״.

   ההבדל הוא נקודת המדידה. `content.js` מודד שדה של שאלה שנדגמה;
   כאן נבנות שאלות מכל נושא וכל רמה, **ומורצת עליהן שכבת ההקראה
   האמיתית של האפליקציה** — `speakMath` ו-`speakProse` — ואז נבדק
   מה יצא. זה בדיוק הכשל שגרם ל-5,601 התראות שווא בכיוון ההפוך
   (`typeof toSpoken==='function'` שנפל תמיד ל-raw): המדד הביט בייצוג
   שטוח במקום במה שנשמע.

   סימן גולמי בהקראה אינו קוסמטיקה. ״אפס ועוד״ במקום ״אפס מימין״
   הוא משפט מתמטי אחר, והלומד שומע אותו בלי שום סימן שמשהו לא בסדר.
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');

const BASE = 'http://127.0.0.1:8099';
const APPS = ['math-teen', 'math-uni', 'math-uni2', 'math-uni3'];
/* דגימות לכל תא (נושא × רמה). ללא תקרה על סך השאלות: תקרה כזאת
   חתכה את הריצה לפני הנושאים האחרונים ברשימה, ושני באגים
   אמיתיים — cont L3 ו-lagrange3 L4 — הוסתרו מאחוריה. */
const PER_CELL = Number(process.env.QA_N || 6);

/* מה שאסור להישמע. שניים הראשונים הם הבקשה המקורית; השאר
   באותה משפחה ונבדקים באותה עלות. */
const BAD = [
  ['_',        /_/],
  ['^',        /\^/],
  ['±',        /±/],
  ['ספרה תחתית', /[₀-₉]/],
  ['תגית HTML', /<[a-zA-Z/]/],
  ['LaTeX',    /\\[a-zA-Z]+|\$\$?/],
  ['∫ גולמי',  /∫/],
  ['Σ גולמי',  /Σ/],
  ['∞ גולמי',  /∞/],
];

async function audit(page, n) {
  return page.evaluate((perCell) => {
    const out = [];
    let built = 0, failed = 0;
    const topics = (typeof TOPICS !== 'undefined' ? TOPICS : []).map(t => t.id);
    for (const tid of topics) {
      for (let lv = 1; lv <= 4; lv++) {
        for (let k = 0; k < perCell; k++) {
          let q;
          try { q = buildQ(tid, lv); } catch (e) { failed++; continue; }
          if (!q) continue;
          built++;
          const parts = [];
          if (q.ask)  parts.push(speakProse(plainOf(q.ask)));
          if (q.expr) parts.push(speakMath(plainOf(q.expr)));
          if (q.hint) parts.push(speakMath(plainOf(q.hint)));
          (q.steps || []).forEach(s => {
            if (s.m) parts.push(speakMath(plainOf(s.m)));
            if (s.d) parts.push(speakProse(plainOf(s.d)));
          });
          (q.wrong || []).forEach(w => { if (w.t) parts.push(speakMath(String(w.t))); });
          out.push({ tid, lv, say: parts.join(' . ') });
        }
      }
    }
    return { spoken: out, built, failed, topics: topics.length };
  }, n);
}

async function run() {
  const browser = await chromium.launch();
  let bad = 0;

  for (const app of APPS) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**', r =>
      r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    await page.goto(`${BASE}/${app}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const res = await audit(page, PER_CELL);

    /* בדיקה שלא בנתה שאלה אינה בודקת כלום, וחייבת ליפול ולא לדווח
       אפס נקי. זה קרה בגרסה הראשונה של הקובץ הזה: החתימה הייתה
       buildQuestion(tid,lv,avoid,pure) ולא buildQ(tid,lv), אפס שאלות
       נבנו, והפלט היה "0 ממצאים". */
    if (!res.built) {
      console.log(`✗ ${app.padEnd(10)} לא נבנתה אף שאלה — הבדיקה שבורה, לא האפליקציה`);
      bad++;
      await ctx.close();
      continue;
    }

    const hits = {};
    for (const item of res.spoken) {
      for (const [name, re] of BAD) {
        if (re.test(item.say)) (hits[name] = hits[name] || []).push(`${item.tid} L${item.lv}`);
      }
    }
    const n = Object.values(hits).reduce((a, v) => a + v.length, 0);
    bad += n;
    const chars = res.spoken.reduce((a, s) => a + s.say.length, 0);

    console.log(
      `${n ? '✗' : '✓'} ${app.padEnd(10)} ${String(res.built).padStart(3)} שאלות · ` +
      `${res.topics} נושאים · ${chars.toLocaleString()} תווים בהקראה · ` +
      `${n ? n + ' סימנים גולמיים' : 'אין סימן גולמי'}`
    );
    for (const [name, cells] of Object.entries(hits)) {
      const uniq = [...new Set(cells)];
      console.log(`    ✗ ${name}: ${cells.length} מופעים ב-${uniq.length} תאים — ` +
                  uniq.slice(0, 5).join(', '));
    }
    await ctx.close();
  }

  await browser.close();

  if (bad) {
    console.log(`\n${bad} ממצאים — סימן גולמי מגיע ללומד`);
    process.exit(1);
  }
  console.log(`\n✓ ${APPS.length} אפליקציות, ההקראה נקייה מסימנים גולמיים`);
}

run().catch(e => { console.log('✗ ' + e.message); process.exit(1); });
