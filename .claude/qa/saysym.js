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

const { BASE } = require('./port.js');   /* QA_PORT, ברירת מחדל 8099 — O-197 */
/* O-135, 21.10.2026: נגזרת — כל מי שמגדיר `speakMath`, כלומר מי שיש לו שכבת
   הקראה מתמטית למדוד. עד היום ארבעה שמות ביד, ו-electric (העתק של math-uni3
   מ-24.9.2026, עם אותה שכבה) לא נמדדה. שם בשורת הפקודה גובר. */
const AL = require('./applist.js');
const NAMED = AL.pick(process.argv.slice(2), []);
const APPS = NAMED.length ? NAMED : AL.family('saysym.js', /function speakMath\b/,
  { floor: 4, must: ['math-teen', 'math-uni', 'math-uni2', 'math-uni3'], why: 'אין בהן speakMath' });
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

/* **כשל ידוע — מוצהר, מודפס ב-`~`, ואינו מפיל.** O-135, 21.10.2026:
   כשהכלי הורחב מארבע אפליקציות לחמש, electric החזירה `I_ דלתא` —
   ‏`I<sub>Δ</sub>` (זרם הפחת) בצעדי הפתרון של `safety` רמות 2 ו-4.
   ‏`speakMath` שלה מקריא כתב תחתי באות לטינית (I_L ← ״איי אל״) ולא
   ביוונית. התיקון באפליקציה, לא כאן. כשל **אחר** באותה אפליקציה
   מפיל כרגיל, **וכשל ידוע שנעלם מפיל גם הוא** — כדי שהשורה תימחק. */
/* ״נעלם״ נקבע מול המקור ולא מול הדגימה: הדגימה אקראית (QA_N לתא), וריצה
   שלא הגרילה את השאלה אינה הוכחה שהבאג תוקן. */
const KNOWN = {
  'electric': { '_': { why: 'I<sub>Δ</sub> בממסר פחת (safety) — speakMath אינו מקריא כתב תחתי יווני',
                       src: /I<sub>Δ/ } },
};

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
    const known = KNOWN[app] || {};
    for (const name of Object.keys(known)) {
      const stillThere = known[name].src.test(AL.sourceOf(app));
      if (hits[name]) {
        const uniq = [...new Set(hits[name])];
        console.log(`~ ${app.padEnd(10)} ${name}: ${hits[name].length} מופעים ב-${uniq.slice(0, 5).join(', ')} — ידוע: ${known[name].why}`);
        delete hits[name];
      } else if (stillThere) {
        console.log(`~ ${app.padEnd(10)} ${name}: לא הוגרל בריצה הזאת, והמקור עדיין מכיל ${known[name].src} — ידוע`);
      } else {
        console.log(`✗ ${app.padEnd(10)} הכשל הידוע ״${name}״ נעלם — מחקו את השורה מ-KNOWN ב-saysym.js`);
        bad++;
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
  const nk = APPS.filter(a => KNOWN[a]).length;
  console.log(`\n✓ ${APPS.length} אפליקציות, ההקראה נקייה מסימנים גולמיים` + (nk ? ` (חוץ מ-${nk} ידועות, ~ למעלה)` : ''));
}

run().catch(e => { console.log('✗ ' + e.message); process.exit(1); });
