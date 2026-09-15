/* =====================================================================
   guess.js — האם אפשר לקלוע בלי לדעת את החומר

   `content.js` כבר מדווח `longest-answer` ו-`shortest-answer`, אבל
   כ-REVIEW — כלומר כשאלה שמופנית לאדם, שאפשר לדלג עליה. שני תאים
   הגיעו ככה ל-100% ונשארו בייצור: `math-uni condprob L2` ו-
   `math-uni3 err L1/L3`. תלמיד שבוחר תמיד את האפשרות הארוכה ביותר
   פתר אותם במלואם בלי לדעת הסתברות מותנית או תורת השגיאות.

   כאן זה שער חוסם. אורך התשובה אינו אמור לשאת מידע על נכונותה,
   וגם המיקום שלה לא.

   **המדד הוא ייחודיות, לא קיצוניות.** ״התשובה היא הארוכה ביותר״
   אינו ״אפשר לנחש לפי אורך״ — כששתי אפשרויות חולקות את המקסימום,
   האורך אינו אומר דבר. נספרת רק הגרלה שבה לאפשרות אחת בדיוק יש
   את האורך הקיצוני, והיא הנכונה. אותו לקח שהוריד את
   `shortest`/`longest` מ-~60 התראות ל-~8 אמיתיות.

   **ותא שחצה את הסף נמדד שוב לפני שהוא מפיל.** ארבעים הגרלות
   הן מדגם קטן: תא שהאמת שלו 50–60% חוצה 70% בחלק מהמדגמים, ולכן
   ב-10.9.2026 החבילה נפלה ארבע פעמים על ארבעה תאים שונים — בכל
   ריצה תא אחר, ובכל ריצה 73–75% מ-40. נמדד על העצים שנפלו, 200
   מדגמים לכל גודל (`FINDINGS.md`, 10.9): `matops L2` שאמיתו 59.9%
   חצה את הסף ב-10 מדגמים בני 40, באחד בן 120 ובאפס בני 400;
   `linear L4` (53.1%) ב-2, 0, 0; `cr L2` (49.9%) ב-1, 0, 0. ותא
   שבאמת ניתן לניחוש — `condprob L2` ב-100% — חצה ב-200 מתוך 200
   בכל גודל. לכן תא שחצה את הסף ב-`PER_CELL` הגרלות נבנה שוב
   `CONFIRM_N` פעמים, ורק אם גם שם הוא מעל הסף — הוא ממצא.
   `QA_BASE` מאפשר להריץ מול עץ ישן שמוגש בפורט אחר (`QA_PORT`
   ב-`serve.js`), וכך נעשתה ההוכחה.
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
/* **חמש מתוך תשע — הורחב 16.9.2026.** הרשימה נולדה עם משפחת
   המתמטיקה בלבד, ומשפחת החידון (ניב, מפנה, אולפן, לומדה) לא
   נמדדה מעולם — בדיוק המשפחה שבה התוכן **כתוב ביד** ולכן חשופה
   יותר ל״התשובה הנכונה היא הארוכה״: מסיח שנכתב בחיפזון קצר,
   והתשובה נושאת את ההסבר. `measure` גנרית מלכתחילה (buildQ +
   q.options), ויש בה מסלול `skip` לאפליקציה שאין בה את השניים —
   ולכן ההרחבה אינה קוד חדש אלא רשימה שלא עודכנה. */
const APPS = ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3',
              'english', 'history', 'ulpan', 'lomda'];
const PER_CELL = Number(process.env.QA_N || 40);
const CONFIRM_N = Number(process.env.QA_CONFIRM || PER_CELL * 10);

/* סף הכישלון זהה ל-content.js, כדי ששני הכלים לא יסתרו זה את זה.
   ניחוש עיוור מארבע אפשרויות הוא 25%.

   **ושכבת אזהרה מתחתיו, שאינה מפילה.** שמונת התאים שנסגרו ב-9.9
   לא הגיעו ל-100% ביום אחד — הם טיפסו, ואיש לא ראה אותם בדרך.
   אזהרה שמדפיסה בלי להפיל היא מה שהופך את הטיפוס לנראה.

   הסף נבחר מתוך מדידה ולא מהערכה: 224 תאים ב-math-app, math-teen,
   math-uni2 ו-math-uni3 (N=120) נתנו **אפס מעל 60%**, שישה ב-50–57%
   ו-211 מתחת ל-40%. 50% הוא לכן קו שמדבר על התא החריג ולא על הרעש,
   ובין 57% ל-70% יש מרווח שמונע הבהוב בין ריצות. */
const LIMIT = 0.70;
const WARN  = 0.50;
const MIN_N = 20;

/* only — רשימת "tid|lv"; כשהיא נתונה נמדדים רק התאים האלה (האישור). */
async function measure(page, perCell, only, lang) {
  return page.evaluate(([n, only, lang]) => {
    if (typeof buildQ !== 'function' || typeof TOPICS === 'undefined')
      return { skip: true };

    /* שפה. `state.settings.lang` במשפחות המתמטיקה, `state.lang`
       בניב ובמפנה — נכתבות שתיהן, וזה מה ש-`content.js` עושה. */
    if (lang) {
      try {
        if (typeof state === 'object' && state) {
          if (state.settings) state.settings.lang = lang;
          if ('lang' in state) state.lang = lang;
        }
        if (typeof applyModes === 'function') applyModes();
        if (typeof lvlSync === 'function') lvlSync();
      } catch (e) { return { skip: true, langErr: String(e && e.message || e) }; }
    }

    /* **האורך נמדד על מה שמצויר, לא על פלט `buildQ`.** ב״שלב״
       התרגום קורה ב-`trHTML` ברגע הציור; מדידה על הפלט הגולמי
       הייתה מחזירה אורכים עבריים בכל ארבע השפות, כלומר בודקת
       שפה אחת ארבע פעמים. אותו לקח בדיוק שתועד ב-`content.js`. */
    const view = (typeof trHTML === 'function') ? trHTML : (h => h);
    const box = document.createElement('div');
    const plain = h => { box.innerHTML = String(h == null ? '' : h);
      return (box.textContent || '').replace(/\s+/g, ' ').trim(); };
    const HEB = /[א-ת]/;

    /* **מוזרע, מאותה סיבה שבגללה `content.js` מוזרע.** שכבת
       הכישלון כאן כבר מוגנת מרעש דגימה — תא שחצה את הסף נמדד
       שוב ב-`CONFIRM_N` — אבל **שכבת האזהרה לא הייתה**, והיא
       הבהבה: שתי ריצות רצופות ב-14.9.2026 החזירו `word L2 [ar]`
       ו-`word L2 [en]` באחת, ו-`word L2 [ru]` בלבד בשנייה.
       אזהרה שנועדה להראות טיפוס אטי אינה יכולה לרעוד בעצמה.

       הזרע נגזר מהשפה, מהנושא ומהרמה, ולכן כל תא־שפה מקבל זרם
       משלו והכיסוי אינו מצטמצם. `CONFIRM_N` נשאר מדגם גדול יותר
       של אותו תא — כלומר ראיה נוספת, לא ראיה אחרת. */
    const REAL_RANDOM = Math.random;
    const seedAt = str => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      let z = h >>> 0;
      Math.random = () => {
        z |= 0; z = z + 0x6D2B79F5 | 0;
        let x = Math.imul(z ^ z >>> 15, 1 | z);
        x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
        return ((x ^ x >>> 14) >>> 0) / 4294967296;
      };
    };

    const cells = [];
    for (const t of TOPICS) {
      for (let lv = 1; lv <= 4; lv++) {
        if (only && only.indexOf(t.id + '|' + lv) < 0) continue;
        seedAt((lang || 'he') + '|' + t.id + '|' + lv);
        let built = 0, longU = 0, shortU = 0, pos = [0, 0, 0, 0, 0, 0], verbal = false;
        for (let k = 0; k < n; k++) {
          let q;
          try { q = buildQ(t.id, lv); } catch (e) { continue; }
          if (!q || !q.options || q.options.length < 2) continue;

          const opts = q.options.map(o => {
            const raw = o.h !== undefined ? o.h : o.t;
            const txt = plain(view('<i>' + raw + '</i>'));
            /* **תא מילולי** הוא תא שאפשרותו נושאת אותיות ולא רק
               ספרות. רק בו תרגום משנה אורך: ‎−37‎ הוא ‎−37‎ בארבע
               השפות, ו״אין פתרון״ אינו. הסימון נלקח מהמעבר העברי,
               ולפיו נבחרים התאים שנמדדים גם בשאר השפות. */
            if (HEB.test(plain(String(o.t ?? o.h ?? '')))) verbal = true;
            return { len: txt.length, ok: !!o.ok };
          });
          if (!opts.some(o => o.ok)) continue;
          built++;

          const mx = Math.max(...opts.map(o => o.len));
          const mn = Math.min(...opts.map(o => o.len));
          /* ייחודי בלבד — תיקו אינו רמז */
          if (opts.filter(o => o.len === mx).length === 1 &&
              opts.find(o => o.len === mx).ok) longU++;
          if (opts.filter(o => o.len === mn).length === 1 &&
              opts.find(o => o.len === mn).ok) shortU++;

          const idx = opts.findIndex(o => o.ok);
          if (idx >= 0 && idx < pos.length) pos[idx]++;
        }
        if (built) cells.push({ tid: t.id, lv, n: built, longU, shortU, pos, verbal });
      }
    }
    Math.random = REAL_RANDOM;
    return { cells };
  }, [perCell, only || null, lang || null]);
}

/* שלושת המדדים של תא, לפי שם — אותו שם שמודפס */
function rates(c) {
  const tot = c.pos.reduce((a, b) => a + b, 0);
  return {
    'הארוכה ביותר': c.longU / c.n,
    'הקצרה ביותר':  c.shortU / c.n,
    'מיקום קבוע':   tot ? Math.max(...c.pos) / tot : 0,
  };
}
const pct = p => Math.round(p * 100);

async function run() {
  const browser = await chromium.launch();
  let bad = 0, checked = 0, warned = 0;

  for (const app of APPS) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**', r =>
      r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    await page.goto(`${BASE}/${app}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const res = await measure(page, PER_CELL);

    if (res.skip) { await ctx.close(); console.log(`· ${app.padEnd(10)} אין buildQ/TOPICS — דולג`); continue; }

    /* תא שלא נבנה בו כלום אינו "נקי" — הוא לא נמדד. */
    if (!res.cells.length) {
      await ctx.close();
      console.log(`✗ ${app.padEnd(10)} לא נמדד אף תא — הבדיקה שבורה, לא האפליקציה`);
      bad++;
      continue;
    }

    /* סף ואישור — אותה לוגיקה בדיוק לכל שפה, ולכן פונקציה אחת
       ולא העתק. `lang` ריק הוא המעבר העברי. */
    async function judge(cells, lang) {
      const raw = [], warns = [];
      for (const c of cells) {
        if (c.n < MIN_N) continue;
        if (!lang) checked++;
        const r = rates(c);
        for (const kind in r) {
          if (r[kind] > LIMIT) raw.push([c, kind, r[kind]]);
          else if (r[kind] > WARN) warns.push([c, kind, r[kind]]);
        }
      }
      const hits = [], cleared = [];
      if (raw.length) {
        const only = [...new Set(raw.map(([c]) => c.tid + '|' + c.lv))];
        const again = await measure(page, CONFIRM_N, only, lang);
        const byKey = {};
        for (const c of (again.cells || [])) byKey[c.tid + '|' + c.lv] = c;
        for (const [c, kind, p] of raw) {
          const d = byKey[c.tid + '|' + c.lv];
          /* לא נבנה שוב — אין במה לנקות, הממצא הראשון נשאר */
          if (!d || d.n < MIN_N) { hits.push([c, kind, p, null]); continue; }
          const p2 = rates(d)[kind];
          if (p2 > LIMIT) hits.push([c, kind, p, d, p2]);
          else { cleared.push([c, kind, p, d, p2]); if (p2 > WARN) warned++; }
        }
      }
      return { hits, cleared, warns };
    }

    const { hits, cleared, warns } = await judge(res.cells, null);

    /* ---- שאר השפות, ורק בתאים שתרגום יכול לשנות בהם אורך ----

       O-40: עד כאן נמדד הממשק העברי בלבד. בתא שארבע אפשרויותיו
       הן מחרוזות קבועות, סדר האורכים עצמו הוא הרמז — ותרגום
       שמקצר דווקא את האפשרות הנכונה מחזיר את הרמז בשפה ההיא
       בלי שאף בדיקה תתפוס זאת.

       **ההכרעה שהממצא השאיר פתוחה:** להריץ את כל השפות תמיד
       (פי ארבעה זמן ריצה) או רק בתאים שאפשרויותיהם קבועות.
       נמדד 14.9.2026 שמתוך 340 תאים בחמש האפליקציות **107
       מילוליים** — 31%: math-app אפס (אפשרויותיו מספרים בלבד,
       ולכן הוא אינו משלם כלום), math-teen 23, math-uni 32,
       math-uni2 35, math-uni3 17. לכן שלוש שפות על התאים האלה
       בלבד עולות כפי 1.9 ולא פי 4, והכיסוי של הסיכון מלא. */
    const langHits = [], langWarns = [];
    const verbalKeys = res.cells.filter(c => c.verbal && c.n >= MIN_N)
                                .map(c => c.tid + '|' + c.lv);
    const LANGS_ = await page.evaluate(() =>
      (typeof LANGS !== 'undefined' ? Object.keys(LANGS) : ['he']).filter(l => l !== 'he'));
    if (verbalKeys.length) {
      for (const lg of LANGS_) {
        const r2 = await measure(page, PER_CELL, verbalKeys, lg);
        if (r2.skip || !r2.cells || !r2.cells.length) continue;
        const j = await judge(r2.cells, lg);
        for (const h of j.hits) langHits.push([lg, ...h]);
        /* **נאסף, ולא מודפס כאן.** הדפסה בתוך הלולאה יוצאת לפני
           שורת הסיכום של האפליקציה, ולכן נראית כשייכת לאפליקציה
           שלפניה — `word L2` של ״שלב״ הודפס מתחת ל-math-app. */
        for (const w of j.warns) langWarns.push([lg, ...w]);
      }
    }
    /* מחזירים את הדף לעברית — הקשר הבא מקבל דף נקי */
    await measure(page, 1, ['__none__'], 'he');
    await ctx.close();

    bad += hits.length + langHits.length;
    const nAll = hits.length + langHits.length;
    console.log(
      `${nAll ? '✗' : '✓'} ${app.padEnd(10)} ${String(res.cells.length).padStart(3)} תאים · ` +
      (verbalKeys.length
         ? `${verbalKeys.length} מילוליים ×${LANGS_.length} שפות · `
         : `אין תא מילולי — שאר השפות אינן משנות אורך · `) +
      `${nAll ? nAll + ' ניתנים לניחוש' : 'אין תא שאפשר לנחש בו'}`
    );
    for (const [lg, c, kind, p, d, p2] of langHits) {
      console.log(`    ✗ ${c.tid} L${c.lv} [${lg}] — ${kind} היא התשובה ב-${pct(p)}% ` +
                  `מ-${c.n} הגרלות` + (d ? `, ו-${pct(p2)}% מ-${d.n} באישור` : '') +
                  ` — הרמז קיים בשפה הזאת ולא בעברית`);
    }
    for (const [c, kind, p, d, p2] of hits) {
      console.log(`    ✗ ${c.tid} L${c.lv} — ${kind} היא התשובה ב-${pct(p)}% מ-${c.n} הגרלות` +
                  (d ? `, ו-${pct(p2)}% מ-${d.n} באישור` : '') + ` (ניחוש עיוור: 25%)`);
    }
    for (const [c, kind, p, d, p2] of cleared) {
      console.log(`    · ${c.tid} L${c.lv} — ${kind} ב-${pct(p)}% מ-${c.n}, אבל ${pct(p2)}% מ-${d.n} ` +
                  `באישור — רעש דגימה, לא ממצא`);
    }
    /* אזהרות אינן מפילות, ולכן הן נספרות בנפרד ואינן נכנסות ל-bad. */
    warned += warns.length + langWarns.length;
    for (const [c, kind, p] of warns) {
      console.log(`    · ${c.tid} L${c.lv} — ${kind} ב-${pct(p)}% ` +
                  `(מתחת לסף ${pct(LIMIT)}%, מעל קו הראייה ${pct(WARN)}%)`);
    }
    for (const [lg, c, kind, p] of langWarns) {
      console.log(`    · ${c.tid} L${c.lv} [${lg}] — ${kind} ב-${pct(p)}% ` +
                  `(מתחת לסף ${pct(LIMIT)}%, מעל קו הראייה ${pct(WARN)}%)`);
    }
  }

  await browser.close();
  console.log();
  if (bad) {
    console.log(`${bad} תאים שאפשר לנחש בהם בלי לדעת את החומר`);
    process.exit(1);
  }
  console.log(`✓ ${checked} תאים נמדדו בעברית, והמילוליים שבהם גם בשאר השפות — ` +
              `אין תא שאורך התשובה או מיקומה מסגירים אותה` +
              (warned ? ` (${warned} מעל קו הראייה — ראו למעלה)` : ''));
}

run().catch(e => { console.log('✗ ' + e.message); process.exit(1); });
