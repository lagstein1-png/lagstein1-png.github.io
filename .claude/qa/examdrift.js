/* =====================================================================
   examdrift.js — המבחן הכיתתי כשהמורה והתלמיד אינם באותו דפדפן.

     node .claude/qa/examdrift.js              כל אפליקציה עם function examId
     node .claude/qa/examdrift.js english      אפליקציות בשם

   **למה הכלי הזה קיים (O-176, 16.10.2026).** `exam.js` משווה מורה
   מול תלמיד באותו דף, ושם המאגר, המחולל והשפה זהים בהגדרה — ולכן
   הוא עיוור לכל מחלקת הבאגים שבה התלמיד בונה מבחן אחר: גרסה אחרת
   של המאגר, מחולל שהשתנה, היסטוריית למידה (class-exam.md). `examId`
   מגבב זרעים ולא תוכן, וסימולציה על science מצאה 1,867 מתוך 2,000
   שאלות שונות עם `examId` תואם 200/200 — ושום חיווי.

   כאן צד התלמיד נבנה ב-browser context **נפרד** (localStorage נפרד,
   דף נפרד), בשפת ממשק אחרת מזו של המורה, ופעמיים:

     נקי   — אותו קוד בדיוק. השאלות (בעברית) זהות למורה, הציון של
             המורה שווה לציון שהתלמיד ראה, ואין אזהרה. שפה אחרת אינה
             מבחן אחר — אזהרה כאן היא אזעקת שווא.
     סחיפה — בצד התלמיד בלבד: פריט ראשון במאגר של כל תא מנוטרל
             (poolOf), ובאפליקציה בלי מאגר — נוסח השאלה של המחולל
             משתנה. הכלי מוודא בעצמו שהשאלות אכן שונות, ודורש
             שהמורה יראה במסך הציונים את המשפט ״המבחן שהתלמיד קיבל
             שונה מזה שיצרתם״.

   הוכחת נפילה: אותו כלי מול עץ של HEAD (לפני החתימה) — הריצה הנקייה
   ירוקה, ובריצת הסחיפה ✗ ״עברה בשקט״ בכל אפליקציה. מול הקוד עם
   החתימה — ✓. הפלטים ב-FINDINGS.md תחת O-176.
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');
const { BASE } = require('./port.js');
const AL = require('./applist.js');

const APPS = AL.pick(process.argv.slice(2), AL.matching(/function examId\b/, AL.local()));
const DRIFT_HE = 'המבחן שהתלמיד קיבל שונה מזה שיצרתם';
const LANGS = ['ar', 'ru', 'en'];

/* קובע את שפת הממשק בכל אחת משלוש המשפחות: state.lang,
   state.settings.lang, או LG. רק מה שקיים באפליקציה נוגע. */
const SETL = `(function(l){
  if(typeof LG==="string")LG=l;
  if(typeof state==="object"&&state){
    if("lang" in state)state.lang=l;
    if(state.settings&&("lang" in state.settings))state.settings.lang=l;
  }
})`;
/* טקסט השאלות בעברית — האמת שהכלי משווה, בלי לסמוך על examSig. */
const HETEXTS = `(function(spec){
  var setL=${SETL}, keep=[typeof LG==="string"?LG:null,
    (typeof state==="object"&&state)?state.lang:null,
    (typeof state==="object"&&state&&state.settings)?state.settings.lang:null];
  setL("he");
  try{
    return examQuestions(spec).map(function(q){
      return q.topic+"|"+q.ask+"|"+(q.expr||"")+"|"+q.options.map(function(o){return (o.ok?"+":"-")+o.t}).join("~")});
  }finally{
    if(keep[0]!==null)LG=keep[0];
    if(keep[1]!==null&&state&&("lang" in state))state.lang=keep[1];
    if(keep[2]!==null&&state&&state.settings)state.settings.lang=keep[2];
  }
})`;

async function open(ctx, url, errs) {
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/net::ERR_FAILED|net::ERR_BLOCKED/.test(t)) return;
    errs.push('console: ' + t);
  });
  await page.route('**/*', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  try { await page.click('#lg-ok', { timeout: 2500 }); } catch (e) {}
  /* האונבורדינג — כמו ב-exam.js. בלעדיו math-uni נשארת במסך הפתיחה
     גם כש-view כבר "marks", ותיבת ההדבקה לא מצוירת. */
  for (let i = 0; i < 10; i++) {
    if (await page.$('[data-a="selpet"]')) await page.click('[data-a="selpet"]').catch(() => {});
    if (await page.$('[data-a="startpet"]')) { await page.click('[data-a="startpet"]').catch(() => {}); continue; }
    if (await page.$('[data-a="obnext"]')) { await page.click('[data-a="obnext"]').catch(() => {}); continue; }
    break;
  }
  await page.waitForFunction(() => typeof window.examQuestions === 'function', { timeout: 15000 });
  return page;
}

/* התלמיד: הקשר דפדפן חדש, נכנס מהקישור, מחליף שפה, נבחן ומגיש. */
async function student(b, app, code, lang, drift, errs) {
  const ctx = await b.newContext();
  try {
    const page = await open(ctx, `${BASE}/${app}/?internal=shlav-internal-${app}#x=${code}`, errs);
    await page.waitForFunction(() => typeof SIT === 'object' && SIT && SIT.spec, { timeout: 10000 });
    return await page.evaluate(([lang, drift, SETL, HETEXTS]) => {
      const setL = eval(SETL), heTexts = eval(HETEXTS);
      let how = '';
      if (drift) {
        /* הנטרול חל על הדף הזה בלבד. המורה, בהקשר אחר, לא רואה אותו. */
        if (typeof poolOf === 'function') {
          const real = poolOf;
          poolOf = function () { const p = real.apply(this, arguments); return p && p.length > 1 ? p.slice(1) : p; };
          how = 'pool-1';
        } else {
          const real = buildQ;
          buildQ = function () {
            const q = real.apply(this, arguments);
            if (q && typeof q.ask === 'string') q.ask = q.ask + ' (v2)';
            return q;
          };
          how = 'gen';
        }
      }
      setL(lang);
      SIT.name = drift ? 'בודק סחיפה' : 'בודק נקי';
      sitStart();
      const nm = drift ? 'בודק סחיפה' : 'בודק נקי';
      SIT.name = nm;
      SIT.answers = SIT.qs.map((q, i) => i % q.options.length);
      let self = 0;
      SIT.qs.forEach((q, i) => { if (q.options[SIT.answers[i]] && q.options[SIT.answers[i]].ok) self++; });
      sitFinish();
      return { code: SIT.code, self, n: SIT.qs.length, he: heTexts(SIT.spec), how, name: nm };
    }, [lang, drift, SETL, HETEXTS]);
  } finally { await ctx.close(); }
}

(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (let ai = 0; ai < APPS.length; ai++) {
    const app = APPS[ai], lang = LANGS[ai % LANGS.length], errs = [];
    const tctx = await b.newContext();
    let line = '', ok = true;
    try {
      const teacher = await open(tctx, `${BASE}/${app}/?internal=shlav-internal-${app}`, errs);
      const t = await teacher.evaluate(HETEXTS => {
        const heTexts = eval(HETEXTS);
        EB.q = null; EB.n = 10;
        const q = exSlots().slice();
        const spec = { v: GENV, t: 'בדיקת סחיפה', s: (Math.random() * 4294967295) >>> 0, l: EB.level, q, r: true, f: true, w: true };
        const id = examId(spec);
        if (!exFind(id)) { EX.list.unshift({ id, spec, date: todayIso(), subs: [] }); exSave(); }
        return { code: encodeExam(spec), id, he: heTexts(spec) };
      }, HETEXTS);

      /* קליטה דרך המסך, כמו מורה אמיתי: מסך הציונים, המבחן פתוח, הדבקת
         הקוד בתיבה ולחיצה על ״קליטה״. בחצי מהאפליקציות הקליטה כתובה
         בתוך המטפל ואין mkImport לקרוא לו. */
      const grade = async (s) => {
        await teacher.evaluate(id => {
          MK.open = id; MK.msg = null;
          if (typeof goto === 'function') goto('marks'); else { view = 'marks'; render(); }
        }, t.id);
        await teacher.fill('#mkPaste', s.code);
        await teacher.click(`[data-a="mkadd"][data-i="${t.id}"]`);
        await teacher.waitForTimeout(150);
        return teacher.evaluate(([code, name, id, DRIFT_HE]) => {
          const res = decodeResult(code), ex = exFind(id);
          const sub = (ex.subs || []).filter(x => x.name === name).pop() || {};
          const m = String((MK.msg && MK.msg.m) || '');
          const row = [...document.querySelectorAll('b')].some(e => e.textContent.includes(DRIFT_HE));
          return { msg: m, warnMsg: m.includes(DRIFT_HE), warnRow: row, ok: sub.ok, valid: sub.valid, hasH: !!(res && res.h) };
        }, [s.code, s.name, t.id, DRIFT_HE]);
      };

      /* נקי */
      const s1 = await student(b, app, t.code, lang, false, errs);
      const g1 = await grade(s1);
      const same1 = s1.he.join('§') === t.he.join('§');
      const c1 = same1 && g1.ok === s1.self && g1.valid && !g1.warnMsg && !g1.warnRow;

      /* סחיפה — אחרי הנקי, כדי ששורת האזהרה שתוצג שייכת רק להגשה הזאת. */
      const s2 = await student(b, app, t.code, lang, true, errs);
      const g2 = await grade(s2);
      const diff2 = s2.he.filter((x, k) => x !== t.he[k]).length;
      const c2 = diff2 > 0 && g2.warnMsg && g2.warnRow;

      ok = c1 && c2 && errs.length === 0;
      line = `נקי[${lang}] ${same1 ? 'זהה' : 'שונה!'} ציון ${g1.ok}/${s1.self} אזהרה=${g1.warnMsg || g1.warnRow}` +
        ` · סחיפה[${s2.how}] ${diff2}/${t.he.length} שונות, ` +
        (c2 ? 'המורה רואה אזהרה' : (diff2 ? 'עברה בשקט' : 'המוטציה לא שינתה דבר')) +
        (g2.hasH ? '' : ' (אין h בקוד)') + (ok ? '' : `\n    מורה: נקי «${g1.msg}» · סחיפה «${g2.msg}»`);
    } catch (e) {
      ok = false; line = 'נפל: ' + String(e).split('\n')[0];
    } finally { await tctx.close(); }
    if (!ok) bad++;
    console.log(`${ok ? '✓' : '✗'} ${app.padEnd(15)} ${line}` + (errs.length ? '\n    JS: ' + errs.slice(0, 3).join(' | ') : ''));
  }
  await b.close();
  console.log(`\n${APPS.length} אפליקציות, ${bad} נכשלו — מורה ותלמיד בשני הקשרי דפדפן נפרדים`);
  process.exit(bad ? 1 : 0);
})();
