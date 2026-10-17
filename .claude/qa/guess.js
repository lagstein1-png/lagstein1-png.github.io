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

const { BASE } = require('./port.js');   /* QA_PORT, ברירת מחדל 8099 — O-197 */
/* **חמש מתוך תשע — הורחב 16.9.2026.** הרשימה נולדה עם משפחת
   המתמטיקה בלבד, ומשפחת החידון (ניב, מפנה, אולפן, לומדה) לא
   נמדדה מעולם — בדיוק המשפחה שבה התוכן **כתוב ביד** ולכן חשופה
   יותר ל״התשובה הנכונה היא הארוכה״: מסיח שנכתב בחיפזון קצר,
   והתשובה נושאת את ההסבר. `measure` גנרית מלכתחילה (buildQ +
   q.options), ויש בה מסלול `skip` לאפליקציה שאין בה את השניים —
   ולכן ההרחבה אינה קוד חדש אלא רשימה שלא עודכנה. */
/* 6.10.2026 — **ותשע מתוך עשרים ואחת.** ההערה למעלה מתעדת את
   ההרחבה הראשונה (חמש ⇒ תשע), ומאז נולדו שתים־עשרה אפליקציות
   חידון נוספות — `civics`, ‏`geography`, ‏`science`, ‏`tanakh`,
   ‏`literature`, ‏`motal`, ‏`hebrew-arab`, ‏`islam`, ‏`russian`,
   ‏`biology`, ‏`electric`, ‏`math-g7` — ואף אחת מהן לא נמדדה כאן.
   דווקא `science`, שהיום נמצא בה שהתשובה הנכונה היא הארוכה
   ב-48 מתוך 52 שורות (92%), הייתה מחוץ לרשימה.
   לכן הרשימה נגזרת מ-`stages.json` כמו ב-`content.js`: מי
   שיש לו `buildQ`/`UNITS`/`js/data.js` נכנס, ו-`measure`
   מדלגת בעצמה על מי שאין בו `buildQ` ו-`q.options`. זו הרשימה
   הכתובה־ביד הרביעית שנמצאה בסשן הזה. */
const REG = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'stages.json'), 'utf8'));
const APPS = Object.keys(REG.apps)
  .filter(k => ['buildQ', 'UNITS', 'js/data.js'].includes(REG.apps[k].bank));
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
    /* 6.10.2026 — **ארבע רמות היו מספר קשיח, ושלוש אפליקציות
       מגדירות שלוש.** ‏`poolOf(tp,lv)` נופל בשקט ל-`tp.L[0]`
       כשאין רמה כזאת, ולכן רמה 4 נמדדה כהעתק של רמה 1 ודווחה
       בשם שני: 21 תאי פנטום ב-geography, ב-tanakh וב-biology,
       וכל ממצא ברמה 1 הופיע פעמיים. כך 9 תאים אמיתיים נקראו
       כ-12. הטווח נגזר מהמאגר, כמו ב-`density.js` וב-`content.js`:
       אורך `t.L` של הנושא, ואחריו `LVL`, ורק בלעדיהם 4. */
    const nl = (typeof LVL !== 'undefined' && LVL.length) || 0;
    for (const t of TOPICS) {
      const lvls = (t.L && t.L.length) || nl || 4;
      for (let lv = 1; lv <= lvls; lv++) {
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

/* =====================================================================
   משפחת `js/{app,data,engine,i18n,speech}.js` (O-174, 17.10.2026)

   `measure` למעלה דורשת `buildQ`+`TOPICS`, ולכן שמונה האפליקציות
   שבנויות על `js/engine.js` הודפסו ״אין buildQ/TOPICS — דולג״ ו-exit 0
   לא אמר עליהן דבר. באותו יום נוספו בהן 171 שאלות כתובות־ביד.

   **הן בנויות אחרת, אבל כולן חושפות `UNITS` ו-`buildRound(unit)`** —
   הפונקציה שהדף עצמו קורא לה בתחילת סבב. לכן מודדים דרכה, ולא
   דרך העתק של המנוע: שלוש צורות מנוע (STORIES ב-6, כרטיסי מילים
   ב-english-elem, מחוללים ב-hebrew-lit) נבדקות באותו מסלול.
   הטקסט של אפשרות נלקח מאותה פונקציה שמציירת אותה:
   `entText(k)[lang]` (= `optText` של STORIES), `optInfo(q,i,lang).text`
   (english-elem), ו-`o.t` (hebrew-lit — האפשרויות בעברית בכל שפה).

   תא = יחידה × שפה. בכל תא `PER_CELL` סבבים מוזרעים, ועליהם אותם
   שלושה מדדים ואותם ספים כמו בתאי buildQ. ושאלה כתובה (אותה קבוצת
   אפשרויות בכל הגרלותיה, לפחות FIXED_MIN פעמים) נבדקת גם לבדה:
   כפולה, פחות משלוש אפשרויות, ונכונה ארוכה בבירור — אותו (ג) של
   השיעור. ״ארוכה בבירור״ שבבסיס מודפסת ב-·, וחדשה — ✗.
   ===================================================================== */
const FIXED_MIN = 3;
/* הבסיס — מה שנמצא ביום שהמעבר נולד (17.10.2026, `QA_PORT=8223 node
   .claude/qa/guess.js`), כמניין לכל אפליקציה ולא כרשימת שאלות:
   `long` = זוגות שאלה×שפה שבהם הנכונה ארוכה בבירור, `cells` = תאי
   יחידה×שפה שחצו את LIMIT. **מניין שעלה — ✗**: שאלה חדשה שנכתבה ארוכה,
   או תרגום שהאריך את הנכונה. מניין שירד — · ״לעדכן את הבסיס״, כדי
   שהבסיס ירד יחד עם התיקון ולא יחזיק מקום לטעות הבאה. מניין ולא רשימה
   — כי 112 מזהים בעברית כאן היו קובץ בתוך קובץ; המחיר: תיקון של אחת
   ושבירה של אחרת באותו קומיט עוברים. התיקון עצמו הוא כתיבת מסיחים בארבע
   שפות (maayan), לא קוד. ״ארוכה בבירור״ = אותו (ג) של השיעור: יחידה
   באורך המרבי ולפחות פי LONG_RATIO מהשנייה — ולכן גם ״אלוהים״ מול
   ״משה״ (6 מול 4 תווים) נספרת. */
const WHY_ELEM = 'נכתבו לפני שהמעבר נמדד (O-174); רובן מילה או צירוף מול מסיחים קצרים, ' +
                 'וחלקן רק בתרגום — כתיבת מסיחים באורך דומה בארבע השפות';
const FAM_BASE = {
  'hebrew-lit':   { long: 14, cells: 0,  why: 'הבנת הנקרא (u11/u12/u15) ומשפט חסר אחד ב-u6 — מסיחים כתובים־ביד קצרים מהתשובה' },
  'tanakh-elem':  { long: 5,  cells: 1,  why: WHY_ELEM + '; והתא s2 [en] — הקצרה היא הנכונה ב-73%' },
  'civics-elem':  { long: 18, cells: 0,  why: WHY_ELEM },
  'culture-elem': { long: 27, cells: 0,  why: WHY_ELEM },
  'history-elem': { long: 14, cells: 0,  why: WHY_ELEM },
  'science-12':   { long: 9,  cells: 0,  why: WHY_ELEM },
  'net-elem':     { long: 0,  cells: 0,  why: 'נקייה מ-17.10.2026 — עד אז הנכונה הייתה הארוכה ב-35 מתוך 35 (100% בעברית); 13 מסיחים נכתבו מחדש בארבע שפות' },
};

async function measureFamily(page, n) {
  return page.evaluate(([n, ratio, fixedMin]) => {
    if (typeof buildRound !== 'function' || typeof UNITS === 'undefined') return { skip: true };
    const LG = ['he', 'ar', 'ru', 'en'];
    const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    const optsOf = (q, l) => {
      if (q.keys && typeof entText === 'function') return q.keys.map(k => entText(k)[l]);
      if (q.opts && typeof optInfo === 'function') return q.opts.map((_, i) => optInfo(q, i, l).text);
      if (q.opts) return q.opts.map(o => (o && typeof o === 'object') ? o.t : o);
      return null;
    };
    const ansOf = q => (typeof q.ans === 'number') ? q.ans : -1;
    const idOf = q => {
      const c = (optsOf(q, 'he') || [])[ansOf(q)];
      if (q.q && q.q.he) return q.q.he + ' → ' + c;
      if (q.prompt && typeof q.prompt === 'object') return (q.stim ? q.stim + ' | ' : '') + q.prompt.he + ' → ' + c;
      if (q.item) return (q.type || '') + ' | ' + norm(q.item.question || q.item.sentence || q.item.big || q.item.text || q.item.emoji || '') + ' → ' + c;
      if (q.w) return (q.kind || '') + ' | ' + q.w.en + ' → ' + c;
      return '? → ' + c;
    };
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
    const cells = [], errs = [], qs = {};
    const sameAsHe = { ar: true, ru: true, en: true };
    let nUnits = 0;
    for (const u of UNITS) {
      if (u.id === 'mix') continue;   /* סבב מעורב נבנה מהיחידות עצמן */
      nUnits++;
      seedAt(u.id);
      const per = {};
      for (const l of LG) per[l] = { tid: u.id, lv: 1, n: 0, longU: 0, shortU: 0, pos: [0, 0, 0, 0, 0, 0], verbal: true };
      for (let k = 0; k < n; k++) {
        let round;
        try { round = buildRound(u); } catch (e) { errs.push(`${u.id} — buildRound נפל: ${e.message}`); break; }
        for (const q of round || []) {
          const ci = ansOf(q);
          const id = u.id + ' · ' + idOf(q);
          const rec = qs[id] || (qs[id] = { unit: u.id, id, seen: 0, sig: null, fixed: true, by: {} });
          rec.seen++;
          for (const l of LG) {
            const o = optsOf(q, l);
            if (!o) { errs.push(`${u.id} — אין אפשרויות שאפשר לקרוא`); continue; }
            const txt = o.map(norm);
            if (l !== 'he' && txt.join('\u0001') !== optsOf(q, 'he').map(norm).join('\u0001')) sameAsHe[l] = false;
            if (l === 'he') {
              const sig = txt.slice().sort().join('\u0001') + '\u0002' + txt[ci];
              if (rec.sig === null) rec.sig = sig; else if (rec.sig !== sig) rec.fixed = false;
            }
            if (!rec.by[l]) rec.by[l] = { txt, ci };
            if (txt.length < 3) rec.by[l].few = txt.length;
            if (new Set(txt).size !== txt.length) rec.by[l].dup = txt;
            if (ci < 0 || ci >= txt.length) { rec.by[l].noans = true; continue; }
            const c = per[l]; c.n++;
            const L = txt.map(s => s.length), mx = Math.max(...L), mn = Math.min(...L);
            if (L.filter(x => x === mx).length === 1 && L[ci] === mx) c.longU++;
            if (L.filter(x => x === mn).length === 1 && L[ci] === mn) c.shortU++;
            if (ci < c.pos.length) c.pos[ci]++;
          }
        }
      }
      for (const l of LG) if (per[l].n) cells.push(Object.assign(per[l], { lang: l }));
    }
    Math.random = REAL_RANDOM;
    /* שאלות קבועות: (ג), כפולה, מעט אפשרויות */
    const fixed = [];
    for (const rec of Object.values(qs)) {
      const isFixed = rec.fixed && rec.seen >= fixedMin;
      for (const l of LG) {
        const b = rec.by[l]; if (!b) continue;
        let long = false, Ls = b.txt.map(s => s.length);
        if (isFixed && !b.noans) {
          const mx = Math.max(...Ls), second = Math.max(...Ls.filter((_, i) => i !== b.ci));
          long = Ls.filter(x => x === mx).length === 1 && Ls[b.ci] === mx && mx >= ratio * Math.max(second, 1);
        }
        fixed.push({ id: rec.id, unit: rec.unit, lang: l, isFixed, long, lens: Ls.join('/'), ci: b.ci,
                     longest: isFixed && !b.noans && Ls.filter(x => x === Math.max(...Ls)).length === 1 && Ls[b.ci] === Math.max(...Ls),
                     dup: b.dup || null, few: b.few || 0, noans: !!b.noans });
      }
    }
    const langs = LG.filter(l => l === 'he' || !sameAsHe[l]);
    return { cells: cells.filter(c => langs.includes(c.lang)), items: fixed.filter(f => langs.includes(f.lang)),
             errs, langs, nUnits };
  }, [n, LONG_RATIO, FIXED_MIN]);
}

async function judgeFamily(app, page) {
  const res = await measureFamily(page, PER_CELL);
  if (res.skip) return null;
  const errs = res.errs.slice(), warns = [], cellHits = [], longHits = [];
  if (!res.cells.length) errs.push('לא נמדד אף תא — הבדיקה שבורה, לא האפליקציה');
  let cellsN = 0;
  for (const c of res.cells) {
    if (c.n < MIN_N) continue;
    if (c.lang === 'he') cellsN++;
    const r = rates(c);
    for (const kind in r) {
      const tag = `${c.tid} [${c.lang}] — ${kind}`;
      if (r[kind] > LIMIT) cellHits.push(`${tag} היא התשובה ב-${pct(r[kind])}% מ-${c.n} שאלות (ניחוש עיוור: 25%)`);
      else if (r[kind] > WARN) warns.push(`${tag} ב-${pct(r[kind])}% (מתחת לסף ${pct(LIMIT)}%, מעל קו הראייה ${pct(WARN)}%)`);
    }
  }
  const agg = {};
  let nFixed = 0;
  for (const it of res.items) {
    if (it.isFixed && it.lang === 'he') nFixed++;
    if (it.noans) errs.push(`${it.id} [${it.lang}] — הנכונה אינה בין האפשרויות`);
    if (it.few) errs.push(`${it.id} [${it.lang}] — ${it.few} אפשרויות בלבד`);
    if (it.dup) errs.push(`${it.id} [${it.lang}] — שתי אפשרויות זהות: ${JSON.stringify(it.dup)}`);
    if (!it.isFixed) continue;
    const a = agg[it.lang] || (agg[it.lang] = [0, 0]); a[1]++;
    if (it.longest) a[0]++;
    if (it.long) longHits.push(`${it.id} [${it.lang}] — הנכונה ארוכה בבירור: ${it.lens} תווים, נכונה ${it.ci}`);
  }
  /* הבסיס: מניין שעלה — כל הרשימה מודפסת ב-✗, כי אין דרך לדעת מי החדשה */
  const base = FAM_BASE[app] || { long: 0, cells: 0 };
  const notes = [];
  for (const [kind, hits, label] of [['cells', cellHits, 'תאים מעל הסף'], ['long', longHits, 'נכונות ארוכות בבירור']]) {
    if (hits.length > base[kind]) {
      errs.push(`${hits.length} ${label}, ובבסיס ${base[kind]} — נוסף ממצא:`);
      for (const h of hits) errs.push('  ' + h);
    } else if (hits.length) {
      notes.push(`${hits.length} ${label} — בבסיס FAM_BASE: ${base.why}`);
      if (hits.length < base[kind]) notes.push(`${label}: ${hits.length} מתוך ${base[kind]} שבבסיס — תוקנו, להוריד את FAM_BASE['${app}'].${kind}`);
    } else if (base[kind]) notes.push(`${label}: אפס, ובבסיס ${base[kind]} — להוריד את FAM_BASE['${app}'].${kind} ל-0`);
  }
  console.log(`${errs.length ? '✗' : '✓'} ${app.padEnd(10)} engine.js: ${res.nUnits} יחידות · ${cellsN} תאים ` +
              `×${res.langs.length} שפות · ${nFixed} שאלות כתובות` +
              (errs.length ? ` · ${errs.length} ממצאים` : notes.length ? ' · אין ממצא מחוץ לבסיס' : ' · אין שאלה או תא שאפשר לנחש בהם'));
  for (const e of errs) console.log(`    ✗ ${e}`);
  for (const n of notes) console.log(`    · ${n}`);
  for (const w of warns) console.log(`    · ${w}`);
  if (res.langs.length < 4)
    console.log(`    · ${['ar', 'ru', 'en'].filter(l => !res.langs.includes(l)).join('/')}: האפשרויות זהות לעברית — לא נמדד שוב`);
  console.log(`    · הארוכה היא הנכונה (שאלות כתובות): ` +
              Object.entries(agg).map(([lg, [k, m]]) => `${lg} ${k}/${m} (${pct(k / m)}%)`).join(', '));
  const based = errs.length ? 0 : Math.min(cellHits.length, base.cells || 0) + Math.min(longHits.length, base.long || 0);
  return { bad: errs.length, warned: warns.length, checked: cellsN, based };
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

  /* `--lessons` — רק מעבר השיעור (O-188), בלי תאי buildQ */
  const ONLY_LESSONS = process.argv.includes('--lessons');
  const famDone = new Set();
  let famBased = 0;   /* ממצאי משפחת engine.js שבבסיס — לא ״אין תא״ */
  for (const app of (ONLY_LESSONS ? [] : APPS)) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**', r =>
      r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    await page.goto(`${BASE}/${app}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const res = await measure(page, PER_CELL);

    if (res.skip) {
      /* O-174 — משפחת js/engine.js נמדדת דרך buildRound(UNITS) */
      const fam = await judgeFamily(app, page);
      await ctx.close();
      if (fam) { famDone.add(app); bad += fam.bad; warned += fam.warned; checked += fam.checked; famBased += fam.based; continue; }
      console.log(`· ${app.padEnd(10)} אין buildQ/TOPICS ואין buildRound/UNITS — דולג`);
      continue;
    }

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

  /* O-174 — כל אפליקציה שיש לה js/engine.js חייבת להימדד. הרשימה נגזרת
     מ-stages.json ומהשרת (כמו `lessons`), לא נכתבת ביד; אפליקציה שהמנוע
     שלה לא נמדד (bank אחר, או buildRound שנעלם) היא ✗, לא שקט. */
  if (!ONLY_LESSONS) {
    const fam = [];
    for (const app of Object.keys(REG.apps)) {
      try { const r = await fetch(`${BASE}/${app}/js/engine.js`); if (r.ok) fam.push(app); } catch (e) {}
    }
    const miss = fam.filter(a => !famDone.has(a));
    for (const a of miss) console.log(`✗ ${a.padEnd(10)} יש js/engine.js, ולא נמדד — הבדיקה עיוורת לו`);
    bad += miss.length;
    console.log(`${miss.length ? '✗' : '✓'} משפחת js/engine.js: ${famDone.size} מתוך ${fam.length} נמדדו`);
  }

  bad += await lessons(browser);

  await browser.close();
  console.log();
  if (bad) {
    console.log(`${bad} תאים שאפשר לנחש בהם בלי לדעת את החומר`);
    process.exit(1);
  }
  if (ONLY_LESSONS) { console.log('✓ מסכי השיעור — אין מיקום צפוי, אין שאלה פגומה, ואין ארוכה בבירור מחוץ לבסיס'); return; }
  console.log(`✓ ${checked} תאים נמדדו בעברית, והמילוליים שבהם גם בשאר השפות — ` +
              `אין תא שאורך התשובה או מיקומה מסגירים אותה` +
              (warned ? ` (${warned} מעל קו הראייה — ראו למעלה)` : '') +
              (famBased ? `; ו-${famBased} ממצאים ישנים במשפחת js/engine.js שבבסיס FAM_BASE — לא נקיים, ראו ·` : ''));
}

/* =====================================================================
   מסכי השיעור המודרך — `lsOpts(list, answered, correctIdx, act)` (O-188)

   כל מה שלמעלה מודד את `buildQ`. שאלות השיעור אינן עוברות שם:
   הן כתובות ישירות בקריאות `lsOpts` בתוך `*LessonView`, ולכן אף
   כלי לא ראה אותן. ב-science, 42 קריאות: הנכונה עמדה במקום 0 או 1
   ב-40 מהן, ובמקום 2 רק בשתיים.

   **המקור נקרא מהשרת, לא מהדיסק.** כך `QA_BASE`/`QA_PORT` מול עץ
   ישן (worktree) מודד את העץ ההוא — וכך נעשתה הוכחת הנפילה.
   הקריאות מחולצות בביטוי רגולרי, ומספרן נבדק מול `lsOpts(` פחות
   ההגדרה: קריאה שהביטוי לא תפס היא ✗, לא שקט.

   **המיקום נמדד על מה שמצויר.** כל רשימה מוערכת בדף עצמו
   (`slt(...)` וחברותיה הן פונקציות גלובליות), עוברת ב-`lsOpts`
   האמיתי, ומהכפתורים נקרא סדר `data-i`. אין כאן העתק של הערבוב.

   שלושה כללים מפילים:
   (א) מיקום צפוי — מקום שמחזיק יותר מ-60% מהנכונות, או מקום
       שמקבל פחות מחצי ממה שערבוב הוגן היה נותן לו (ובלבד שהיה
       אמור לקבל 5 לפחות). לפני O-188: ‎21/19/2‎ — המקום השלישי
       קיבל 2 במקום 14.
   (ב) פחות משלוש אפשרויות, או שתי אפשרויות זהות (בכל שפה).
   (ג) הנכונה ארוכה בבירור — היחידה באורך המרבי, ולפחות פי 1.5
       מהשנייה באורכה, בשפה כלשהי.
   ושלוש שורות · שאינן מפילות: התפלגות מספר האפשרויות (שלוש היום —
   שלב התוכן של O-188 מוסיף רביעית), שיעור ״הארוכה היא הנכונה״
   בכל שפה, ושאלות (ג) שבבסיס.
   ===================================================================== */

/* (ג) — בסיס. 26 מסכים שבהם הנכונה ארוכה בבירור, נמדד 17.10.2026.
   תיקונם הוא כתיבת מסיחים בארבע שפות — שלב התוכן של O-188 — ולא
   קוד. מסך שנוסף לכאן חייב נימוק; מסך שתוקן מדווח, כדי שיימחק.
   מסך חדש שאינו כאן ונופל ב-(ג) — ✗. */
const LESSON_LONG_BASE = {
  /* science — 26 המסכים תוקנו 17.10.2026 (מסיחים באורך דומה בארבע
     השפות, maayan). הרשומה נמחקה; מסך שחוזר ונופל ב-(ג) — ✗. */
};
/* אפליקציה שיש בה `lsOpts` בלי ערבוב, ואינה בתחום התיקון שבו נוספה
   הבדיקה. מודפסת ב-·, ולא מפילה. כשהיא נקייה — מדווח, כדי שתימחק. */
const LESSON_OPEN = {
  /* math-app יצאה 17.10.2026: lsOrder הועתק מ-science, ו-(א) אינו נמדד
     מתחת ל-POS_MIN_N (שלושה מסכים בשיעור שלה). */
};
const LONG_RATIO = 1.5;
const POS_MIN_N = 6;

async function lessons(browser) {
  let bad = 0;
  const apps = Object.keys(REG.apps);
  for (const app of apps) {
    let src;
    try { const r = await fetch(`${BASE}/${app}/index.html`); if (!r.ok) continue; src = await r.text(); }
    catch (e) { continue; }
    if (!/function\s+lsOpts\s*\(/.test(src)) continue;

    const re = /lsOpts\((\[[^\]]*\]),\s*([^,()]+),\s*(\d+),\s*"([^"]+)"\)/g;
    const calls = []; let m;
    while ((m = re.exec(src)))
      calls.push({ expr: m[1], ci: +m[3], act: m[4], line: src.slice(0, m.index).split('\n').length });
    const total = (src.match(/lsOpts\(/g) || []).length - 1;
    const soft = !!LESSON_OPEN[app];
    const errs = [];
    if (calls.length !== total)
      errs.push(`חולצו ${calls.length} קריאות מתוך ${total} — הביטוי לא תפס קריאה, הבדיקה עיוורת לה`);

    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.route('**', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    await page.goto(`${BASE}/${app}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    const res = await page.evaluate((calls) => {
      const out = [];
      const box = document.createElement('div');
      const langs = (typeof LANGS !== 'undefined') ? Object.keys(LANGS) : ['he'];
      const st = (typeof state === 'object' && state && state.settings) ? state.settings : null;
      const keep = st ? st.lang : null;
      for (const lg of langs) {
        if (st) st.lang = lg;
        for (const c of calls) {
          let list;
          try { list = (0, eval)(c.expr); } catch (e) { out.push({ lg, act: c.act, err: String(e.message || e) }); continue; }
          box.innerHTML = lsOpts(list, -1, c.ci, c.act);
          const order = [...box.querySelectorAll('button[data-i]')].map(b => +b.getAttribute('data-i'));
          out.push({ lg, act: c.act, ci: c.ci, order, list: list.map(String) });
        }
      }
      if (st) st.lang = keep;
      return out;
    }, calls);
    await ctx.close();

    /* (א) — המיקום, פעם אחת (הסדר אינו תלוי בשפה) */
    const he = res.filter(r => r.lg === res[0].lg && !r.err);
    const obs = [], exp = [], nDist = {};
    for (const r of he) {
      const n = r.list.length;
      nDist[n] = (nDist[n] || 0) + 1;
      const p = r.order.indexOf(r.ci);
      if (p < 0) { errs.push(`${r.act} — הנכונה (${r.ci}) אינה בין הכפתורים`); continue; }
      if (r.order.length !== n || new Set(r.order).size !== n)
        errs.push(`${r.act} — מצוירים ${r.order.length} כפתורים ל-${n} אפשרויות`);
      obs[p] = (obs[p] || 0) + 1;
      for (let k = 0; k < n; k++) exp[k] = (exp[k] || 0) + 1 / n;
    }
    const N = he.length;
    /* (א) רק מ-POS_MIN_N שאלות. ב-3 שאלות אין ״מיקום צפוי״: כל חלוקה
       פרט ל-1/1/1 (2 מתוך 9 סדרים) עוברת 60%, והניחוש עצמו הוא אחד
       לשלושה בכל מקרה. הכרעה, 17.10.2026 (math-app, שלושה מסכים). */
    const posSkip = N < POS_MIN_N;
    for (let k = 0; k < exp.length && !posSkip; k++) {
      const o = obs[k] || 0, e = exp[k];
      if (o / N > 0.60) errs.push(`מיקום ${k} מחזיק ${o} מתוך ${N} נכונות (${pct(o / N)}%) — אפשר לנחש לפי מקום`);
      else if (e >= 5 && o < e / 2) errs.push(`מיקום ${k} מקבל ${o} נכונות, וערבוב הוגן היה נותן ~${Math.round(e)} — אפשר לפסול אותו בלי לדעת`);
    }

    /* (ב) ו-(ג) — בכל שפה */
    const base = new Set(LESSON_LONG_BASE[app] || []);
    const longKnown = new Set(), longAgg = {};
    for (const r of res) {
      if (r.err) { errs.push(`${r.act} [${r.lg}] — הרשימה לא הוערכה: ${r.err}`); continue; }
      const norm = r.list.map(s => s.replace(/\s+/g, ' ').trim());
      if (norm.length < 3) errs.push(`${r.act} [${r.lg}] — ${norm.length} אפשרויות בלבד`);
      if (new Set(norm).size !== norm.length) errs.push(`${r.act} [${r.lg}] — שתי אפשרויות זהות: ${JSON.stringify(norm)}`);
      const L = norm.map(s => s.length), mx = Math.max(...L);
      const second = Math.max(...L.filter((x, i) => i !== L.indexOf(mx)));
      const uniq = L.filter(x => x === mx).length === 1;
      const a = longAgg[r.lg] || (longAgg[r.lg] = [0, 0]); a[1]++;
      if (uniq && L[r.ci] === mx) {
        a[0]++;
        if (mx >= LONG_RATIO * Math.max(second, 1)) {
          if (base.has(r.act)) longKnown.add(r.act);
          else errs.push(`${r.act} [${r.lg}] — הנכונה ארוכה בבירור: ${L.join('/')} תווים, נכונה ${r.ci}`);
        }
      }
    }

    const posTxt = exp.map((_, k) => obs[k] || 0).join('/');
    const mark = errs.length ? (soft ? '·' : '✗') : '✓';
    console.log(`${mark} ${app.padEnd(10)} שיעור: ${N} שאלות · מיקום הנכונה ${posTxt}` +
                (errs.length ? ` · ${errs.length} ממצאים` : ''));
    for (const e of errs) console.log(`    ${soft ? '·' : '✗'} ${e}`);
    if (posSkip) console.log(`    · (א) לא נמדד: ${N} שאלות, פחות מ-${POS_MIN_N} — מעט מדי כדי לקבוע מיקום צפוי`);
    if (soft) console.log(`    · לא מפיל: ${LESSON_OPEN[app]}`);
    if (soft && !errs.length) console.log(`    · נקייה — למחוק את '${app}' מ-LESSON_OPEN`);
    console.log(`    · מספר אפשרויות לשאלה: ${JSON.stringify(nDist)}`);
    console.log(`    · הארוכה היא הנכונה: ` +
                Object.entries(longAgg).map(([lg, [k, n]]) => `${lg} ${k}/${n} (${pct(k / n)}%)`).join(', '));
    if (longKnown.size)
      console.log(`    · ${longKnown.size} מסכים בבסיס (ג) — הנכונה ארוכה בבירור; שלב התוכן של O-188`);
    const fixed = [...base].filter(a => !longKnown.has(a));
    if (fixed.length) console.log(`    · תוקנו, למחוק מ-LESSON_LONG_BASE: ${fixed.join(', ')}`);
    if (!soft) bad += errs.length;
  }
  return bad;
}

run().catch(e => { console.log('✗ ' + e.message); process.exit(1); });
