/* =====================================================================
   i18n.js — המחרוזת העברית היא המפתח: כל _("…") יושבת ב-TR_KEYS

   הכלל כתוב ב-CLAUDE.md, ״תרגום — המחרוזת העברית היא המפתח״:
   באפליקציות האוניברסיטה _() מחפשת את המחרוזת העברית עצמה במילון,
   ושינוי מילה בעברית בלי לעדכן את המפתח מוחק את התרגום בשקט — אין
   שגיאה, _() מחזירה עברית לערבי ולרוסי. הכלל היה כתוב בלבד.

   מה נמצא כשהוא נכתב (16.9.2026): ב-math-uni3 המסיח ״זה מספר
   הספרות, לא החסם״ הוחלף ב-״עיגלתם לספרה אחת יותר מדי…״ — ההערה
   שליד השינוי מסבירה למה — והמפתח הישן נשאר ב-TR_KEYS בלי שהחדש
   נוסף. הלומד בערבית, ברוסית ובאנגלית ראה את המסיח הזה בעברית.

   הבדיקה, בשלוש אפליקציות האוניברסיטה:
     1. כל מחרוזת בתוך _("…") או _f("…") קיימת ב-TR_KEYS  ← מפיל
     2. כל מפתח ב-TR_KEYS מתורגם לערבית, לרוסית ולאנגלית     ← מפיל
   הסעיף השני היה ״מידע בלבד״ ומנה 155 מפתחות חסרים (O-69). הם לא
   היו חסרים: הספירה פענחה את trAt בביטוי רגולרי שנשבר על פסיק בתוך
   TR_KEYS.indexOf("…"). נמדד 18.9.2026 — כשהקריאות מורצות, החוב
   הוא אפס בשלוש האפליקציות, ולכן הסעיף הפך למפיל. סטטית, בלי דפדפן.

   הוכחת נפילה: סעיף 1 — על 308786f, math-uni3, מפתח אחד; אחרי התיקון 0.
   סעיף 2 — תרגום ערבי אחד שרוקן ב-math-uni2, ומפתח חדש בלי תרגום
   ב-math-uni: שניהם אדומים; העץ עצמו ירוק. הפלט ב-FINDINGS.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
/* 6.10.2026 — **והרשימה החמישית.** ‏`electric` משתמשת באותו מנגנון
   בדיוק (`_()` + `TR_KEYS` + `trAt`) ומעולם לא נבדקה כאן, מפני
   שהרשימה מנתה שלושה שמות. נמצא כשהרחבת רמה 4 הוסיפה מחרוזות
   חדשות: `content.js` דיווח `lang-untranslated` ×122 — מחרוזות
   שהלומד הערבי, הרוסי והאנגלי רואה בעברית. הרשימה נגזרת עכשיו
   מהקוד עצמו: כל אפליקציה שיש בה `var TR_KEYS = [` נכנסת. */
const APPS = require('./applist.js').local().filter(a => {
  try { return /var TR_KEYS\s*=\s*\[/.test(fs.readFileSync(path.join(ROOT, a, 'index.html'), 'utf8')); }
  catch (e) { return false; }
});
const LANGS = ['ar', 'ru', 'en'];
const { execFileSync } = require('child_process');

/* ===== O-202, 16.10.2026 — שלושה חורים, ושלושתם ירוקים בשקט =====
   1. **גרש בודד.** הסריקה קראה `_("…")` בלבד. ב-math-uni, ‏math-uni2,
      ‏math-uni3 ו-electric יש 63–64 קריאות `_('…')` כל אחת — ובהן
      ״לדף הבית״ — ושינוי של אחת מהן היה עובר בירוק.
   2. **מילון לפי מפתח עברי, בלי TR_KEYS.** ‏`reader/TR` (‏`{ar:{…},ru:{…},
      en:{…}}`) ו-`rakia/EN_DICT` הם אותו כלל — ״המחרוזת העברית היא
      המפתח״ — והגזירה חיפשה `var TR_KEYS`, ולכן לא ראתה אותם. הם נגזרים
      עכשיו לפי המנגנון: ליטרל אובייקט שהמפתחות שלו עברית והערכים לא.
   3. **מפתח שנוסף באמצע.** ‏`trAt(l, N, […])` מצמיד תרגום לפי מקום.
      מפתח שנכנס באמצע הליטרל מזיז כל עוגן מספרי שאחריו, והתרגומים
      נצמדים למחרוזות הלא נכונות — וכולם עדיין ״מתורגמים״, כלומר ירוק.
      זה התרחיש של O-159. כאן המילון נבנה גם מהבסיס (`git show HEAD`
      כשהקובץ שונה ממנו, אחרת `HEAD~1`; או `--base=<dir>`), ותרגום
      **שעבר ממפתח אחר** למפתח שהיה קיים גם קודם — מפיל.
   יציאה 3 (״עבר, וחלק לא נבדק״ — O-210) כשאין בסיס להשוואה. */
const BASE_DIR = (process.argv.find(a => a.startsWith('--base=')) || '').slice(7) || null;
let unchecked = 0;

/* מחרוזת JS בגרש או במרכאות — מפוענחת כקוד, לא ב-JSON.parse (שאינו
   מכיר `\'`). */
const LIT = /\b_f?\(\s*(?:"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)')/g;
function litsOf(src) {
  const out = new Map();
  for (const m of src.matchAll(LIT)) {
    let s;
    try { s = vm.runInNewContext(m[1] !== undefined ? '"' + m[1] + '"' : "'" + m[2] + "'"); }
    catch (e) { continue; }
    if (!out.has(s)) out.set(s, src.slice(0, m.index).split('\n').length);
  }
  return out;
}

/* המילון של אפליקציית TR_KEYS, בסדר הריצה. מוחזר כדי שאפשר יהיה
   לבנות אותו פעמיים — מהעץ ומהבסיס — ולהשוות. */
function buildTR(src, app, say) {
  const km = src.match(/var TR_KEYS\s*=\s*(\[[\s\S]*?\]);\s*\n/);
  if (!km) return null;
  /* 6.10.2026 — **המערך נבנה בסדר הריצה, ולא מהליטרל בלבד.**
     ‏`TR_KEYS.push("…")` אחרי `load()` הוא קוד, והבודק קרא רק את
     הליטרל: 283 מחרוזות ב-`electric` דווחו ״אין מפתח כזה״ בזמן
     שהיה להן מפתח ותרגום מלא. וגרוע מזה — `trAt("ar",
     TR_KEYS.length-3, […])` נמדד מול אורך הליטרל ולא מול האורך
     בדפדפן, ולכן הצמיד תרגומי זנב למפתחות אחרים לגמרי **ועבר
     בירוק**, כי אותם מפתחות היו מתורגמים ממילא. בודק שבונה
     מילון שגוי ומדווח ירוק גרוע מבודק שאינו קיים.
     כאן הליטרל וה-push מורצים בסדר שבו הם מופיעים בקובץ — בדיוק
     כמו הדפדפן. נמצא ב-math-uni, ב-math-uni2 וב-math-uni3. */
  const KEYS = vm.runInNewContext(km[1]);
  /* `push` ו-`trAt` מורצים **בסדר שבו הם מופיעים בקובץ**, ולא זה
     אחרי זה. ב-math-uni3 יש שני בלוקי push, והאחרון שבהם מופיע
     **אחרי** קריאות ה-trAt שביניהם: להריץ את שניהם קודם מזיז את
     `TR_KEYS.length-3` באחד, וממציא ״מפתח בלי תרגום״ שאינו קיים. */
  const EVENTS = [];
  for (const m of src.matchAll(/^[ \t]*TR_KEYS\.push\(([\s\S]*?)\);[ \t]*$/gm))
    EVENTS.push({ at: m.index, push: m[1] });
  for (const m of src.matchAll(/^[ \t]*tr(?:At|Part)\("(?:ar|ru|en)"/gm))
    EVENTS.push({ at: m.index, call: true });
  EVENTS.sort((a, b) => a.at - b.at);

  const D = { ar: {}, ru: {}, en: {} };
  const ctx = vm.createContext({
    TR_KEYS: KEYS,
    trAt(l, start, arr) { if (start >= 0) arr.forEach((v, i) => { if (v) D[l][KEYS[start + i]] = v; }); },
    trPart(l, arr) { ctx.trAt(l, 0, arr); },
  });
  let calls = 0, broken = 0;
  for (const ev of EVENTS) {
    if (ev.push) {
      try { KEYS.push(...vm.runInNewContext('[' + ev.push + ']')); }
      catch (e) { say(`✗ ${app}: TR_KEYS.push שלא נקרא — ${e.message}`); }
      continue;
    }
    /* הקריאות ל-trAt מורצות כקוד ולא מפוענחות בביטוי רגולרי. הגרסה
       הקודמת קראה את הארגומנט השני ב-([^,]+), ומפתח שנמסר כ-
       TR_KEYS.indexOf("…, …") — עם פסיק בתוך המחרוזת — נשבר באמצעו
       ולא נספר. כך נרשמו 155 מפתחות ״בלי תרגום״ (O-69) שכולם מתורגמים. */
    let end = ev.at, ok = false;
    while ((end = src.indexOf(']);', end)) !== -1) {
      end += 3;
      try { vm.runInContext(src.slice(ev.at, end), ctx); ok = true; break; }
      catch (e) { if (!(e instanceof SyntaxError)) throw e; }
    }
    if (ok) calls++; else broken++;
  }
  return { KEYS, D, calls, broken };
}

/* תוכן הקובץ בבסיס. null = אין בסיס (שיבוט רדוד, קובץ חדש). */
function baseOf(rel) {
  if (BASE_DIR) { try { return fs.readFileSync(path.join(BASE_DIR, rel), 'utf8'); } catch (e) { return null; } }
  const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
  let ref = 'HEAD';
  try { execFileSync('git', ['diff', '--quiet', 'HEAD', '--', rel], { cwd: ROOT, stdio: 'ignore' }); ref = 'HEAD~1'; }
  catch (e) { /* שונה מ-HEAD — משווים ל-HEAD */ }
  try { return git('show', ref + ':' + rel); } catch (e) { return null; }
}

let bad = 0;
for (const app of APPS) {
  const rel = app + '/index.html';
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const T = buildTR(src, app, m => { console.log(m); bad++; });
  if (!T) { console.log(`✗ ${app}: אין TR_KEYS`); bad++; continue; }
  const { KEYS, D, calls, broken } = T;
  const set = new Set(KEYS);

  /* 1 — כל מחרוזת שנקראת ב-_() — במרכאות או בגרש — קיימת כמפתח */
  const lits = litsOf(src);
  let miss = 0;
  for (const [s, line] of lits) {
    if (!set.has(s)) { miss++; console.log(`✗ ${app}/index.html:${line}: _("${s.slice(0, 50)}…") — אין מפתח כזה ב-TR_KEYS, הלומד יראה עברית`); }
  }
  if (miss) bad++;
  else console.log(`✓ ${app}: ${lits.size} מחרוזות ב-_() (מרכאות וגרש), כולן ב-TR_KEYS (${KEYS.length} מפתחות)`);

  /* 2 — כל מפתח מתורגם בשלוש השפות  ← מפיל.
     המילון נבנה למעלה, יחד עם המערך, בסדר הריצה. */
  /* ועוגן שאינו קבוע נאמר בקול, ואינו מפיל: המודל כאן כבר נאמן
     לדפדפן, ולכן זו שבירוּת ולא שגיאה. מפתח שיתווסף לסוף הליטרל
     **יזיז** כל `TR_KEYS.length-N` שאחריו, בלי שאיש ירגיש.
     `TR_KEYS.indexOf("…")` אינו זז לעולם. */
  let drifty = 0;
  for (const m of src.matchAll(/tr(?:At|Part)\(\s*"(?:ar|ru|en)"\s*,\s*([^,[]+),/g)) {
    const a = m[1].trim();
    if (/^\d+$/.test(a) || /^TR_KEYS\.indexOf\(\s*"/.test(a)) continue;
    drifty++;
  }
  if (drifty) console.log(`· ${app}: ${drifty} עוגני trAt שאינם קבועים (\`TR_KEYS.length-N\`) — ` +
    `מפתח שיתווסף לסוף יזיז אותם בשקט. \`TR_KEYS.indexOf("…")\` אינו זז.`);

  const debt = LANGS.map(l => [l, KEYS.filter(k => !D[l][k])]);
  const total = debt.reduce((n, [, ks]) => n + ks.length, 0);
  if (total || broken || !calls) {
    bad++;
    console.log(`✗ ${app}: מפתחות בלי תרגום — ${debt.map(([l, ks]) => `${l} ${ks.length}`).join(' · ')}` +
      (broken ? ` · ${broken} קריאות trAt שלא נקראו` : ''));
    for (const [l, ks] of debt) for (const k of ks.slice(0, 5))
      console.log(`    ${l} #${KEYS.indexOf(k)}: ${k.slice(0, 60)}`);
  } else {
    console.log(`✓ ${app}: ${calls} קריאות trAt, כל ${KEYS.length} המפתחות מתורגמים לשלוש השפות`);
  }

  /* 3 — תרגום שעבר ממפתח אחר (O-202). מפתח שקיים גם בבסיס, שהתרגום שלו
     השתנה, והתרגום החדש הוא בדיוק מה שהיה בבסיס של מפתח **אחר** — זה
     עוגן שזז, לא ניסוח חדש. ניסוח חדש הוא טקסט שלא היה בשום מקום. */
  const bsrc = baseOf(rel);
  const B = bsrc && buildTR(bsrc, app + '@base', () => {});
  if (!B) { unchecked++; console.log(`· ${app}: אין בסיס להשוואה (שיבוט רדוד או קובץ חדש) — הזזת עוגן לא נבדקה`); }
  else {
    const bset = new Set(B.KEYS);
    const moved = [];
    for (const l of LANGS) {
      const owner = new Map();
      for (const k of B.KEYS) if (B.D[l][k] && !owner.has(B.D[l][k])) owner.set(B.D[l][k], k);
      for (const k of KEYS) {
        if (!bset.has(k)) continue;
        const now = D[l][k], was = B.D[l][k];
        if (!now || now === was) continue;
        const from = owner.get(now);
        if (from !== undefined && from !== k) moved.push([l, k, from]);
      }
    }
    const firstDiff = KEYS.findIndex((k, i) => B.KEYS[i] !== k);
    if (moved.length) {
      bad++;
      console.log(`✗ ${app}: ${moved.length} תרגומים עברו ממפתח אחר מאז הבסיס — מפתח נוסף, נמחק או הוזז באמצע TR_KEYS` +
        (firstDiff >= 0 ? ` (הסטייה הראשונה במקום #${firstDiff})` : '') + ', ועוגני trAt זזו');
      for (const [l, k, from] of moved.slice(0, 4))
        console.log(`    ${l}: ״${k.slice(0, 40)}״ קיבל את התרגום של ״${from.slice(0, 40)}״`);
    } else if (KEYS.length !== B.KEYS.length || firstDiff >= 0) {
      console.log(`· ${app}: TR_KEYS השתנה מאז הבסיס (${B.KEYS.length}→${KEYS.length}), ואף תרגום לא עבר ממפתח אחר`);
    }
  }
}
/* ===== המנגנון השני: מילון לפי מפתח עברי (O-202) =====
   אין כאן אינדקס, ולכן אין עוגן שזז; מה שנשבר הוא המפתח עצמו —
   עברית שנוסחה מחדש בממשק, ומפתח שנשאר בנוסח הישן. הלומד רואה עברית.
   נגזר לפי המנגנון: ליטרל אובייקט שמוצב למשתנה, שעשרה מפתחות לפחות
   בו עברית (אורך ≥ 3 — טבלת תעתיק של אות־אות אינה מילון ממשק),
   והערכים אינם עברית. צורה מקוננת `{ar:{…},ru:{…},en:{…}}` — מילון
   לכל שפה. נבדק בכל קובץ JS/HTML של אפליקציה מקומית.

   הבדיקות:
     א. צורה מקוננת — כל מפתח קיים בכל השפות            ← מפיל
     ב. כל `_('…')`/`_("…")` באפליקציה בלי TR_KEYS — מפתח ← מפיל
     ג. כל טקסט עברי סטטי ב-<body> (וגם placeholder, aria-label,
        title, alt) — מפתח                                ← מפיל
     ד. מפתח שאינו מופיע בשום מקום במקור — יתום          ← מידע
   החריגים בשם ובנימוק, למטה. */
const DICT_SKIP = {
  /* שלושה מילונים נפרדים (TR_AR/TR_RU/TR_EN) ועוד ארבעה מקורות שנבנים
     בזמן ריצה — XQ, מערך T ו-TR_AR["…"]=… — ומה שהלומד רואה בהם נבדק
     בדפדפן אמיתי ב-teen-i18n.js. בנייה סטטית כאן הייתה מודל חלקי שלו. */
  'math-teen': 'נבדקת בדפדפן ב-teen-i18n.js; המילון נבנה מארבעה מקורות בזמן ריצה',
};
/* טקסט סטטי שאינו מפתח במכוון. אפליקציה → טקסט → נימוק. */
const STATIC_OK = {
  rakia: {
    'עברית': 'שם השפה על כפתור הבחירה שלה — נשאר בשפתו בכל ממשק (כמו "العربية" ב-langbtn.js)',
    'שפה / Language': 'תווית דו־לשונית מראש — מי שאינו קורא עברית מוצא בה את המילה Language',
  },
};
const HEB = /[֐-׿]/;
function filesOf(app) {
  const out = [];
  (function walk(d) {
    let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
    for (const e of ents) {
      if (['img', 'audio', 'vendor', 'node_modules'].includes(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|html)$/.test(e.name) && e.name !== 'sw.js') out.push(p);
    }
  })(path.join(ROOT, app));
  return out;
}
/* הליטרל שמתחיל ב-`{` שבמקום at — נסגר כשהוא נפרס כקוד. */
function objAt(src, at) {
  let end = at;
  while ((end = src.indexOf('}', end)) !== -1) {
    end++;
    try { const o = vm.runInNewContext('(' + src.slice(at, end) + ')'); if (o && typeof o === 'object') Object.defineProperty(o, '__end', { value: end }); return o; } catch (e) { if (e.name !== 'SyntaxError') return null; }   /* שגיאה מ-vm היא מ-realm אחר — instanceof אינו תופס */
  }
  return null;
}
const isDict = o => {
  if (!o || typeof o !== 'object') return false;
  const ks = Object.keys(o).filter(k => HEB.test(k) && k.trim().length >= 3);
  return ks.length >= 10 && ks.every(k => typeof o[k] === 'string' && !HEB.test(o[k]));
};
function findDicts(app) {
  const out = [];
  for (const f of filesOf(app)) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/([A-Za-z_$][\w$.]*)\s*=\s*\{/g)) {
      const at = m.index + m[0].length - 1;
      const o = objAt(src, at);
      if (!o) continue;
      const span = [at, o.__end];
      const langs = LANGS.filter(l => isDict(o[l]));
      if (langs.length) out.push({ name: m[1], file: f, span, per: Object.fromEntries(langs.map(l => [l, o[l]])) });
      else if (isDict(o)) out.push({ name: m[1], file: f, span, per: { '*': o } });
    }
  }
  return out;
}
function staticTexts(html) {
  let b = html.slice(Math.max(0, html.search(/<body[\s>]/i)));
  b = b.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
       .replace(/<!--[\s\S]*?-->/g, '').replace(/<textarea[\s\S]*?<\/textarea>/gi, '');
  const out = [];
  const norm = t => t.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  for (const m of b.matchAll(/>([^<>]+)</g)) { const t = norm(m[1]); if (HEB.test(t)) out.push(t); }
  for (const m of b.matchAll(/\s(?:placeholder|aria-label|title|alt)="([^"]*)"/g)) { const t = norm(m[1]); if (HEB.test(t)) out.push(t); }
  return [...new Set(out)];
}
const DAPPS = require('./applist.js').local().filter(a => !APPS.includes(a));
let dictApps = 0;
for (const app of DAPPS) {
  const dicts = findDicts(app);
  if (!dicts.length) continue;
  if (DICT_SKIP[app]) { console.log(`· ${app}: ${dicts.map(d => d.name).join(', ')} — חריג: ${DICT_SKIP[app]}`); continue; }
  dictApps++;
  const where = dicts.map(d => `${d.name} (${path.relative(ROOT, d.file)})`).join(', ');
  const KEYSET = new Set();
  const per = {};
  for (const d of dicts) for (const [l, o] of Object.entries(d.per)) {
    per[l] = Object.assign(per[l] || {}, o);
    Object.keys(o).forEach(k => KEYSET.add(k));
  }
  const langs = Object.keys(per);
  let fails = 0;
  /* א */
  if (langs.some(l => l !== '*')) for (const l of langs) {
    const miss = [...KEYSET].filter(k => !per[l][k]);
    if (miss.length) { fails++; console.log(`✗ ${app}: ${miss.length} מפתחות בלי תרגום ל-${l} — ״${miss[0].slice(0, 50)}״…`); }
  }
  /* ב */
  const html = fs.readFileSync(path.join(ROOT, app, 'index.html'), 'utf8');
  const lits = litsOf(html);
  for (const [s, line] of lits) if (!KEYSET.has(s)) { fails++; console.log(`✗ ${app}/index.html:${line}: _("${s.slice(0, 50)}") — אין מפתח כזה ב-${dicts[0].name}, הלומד יראה עברית`); }
  /* ג */
  const ok = STATIC_OK[app] || {};
  const st = staticTexts(html);
  for (const t of st) {
    if (KEYSET.has(t)) continue;
    if (ok[t]) { console.log(`· ${app}: ״${t}״ — חריג: ${ok[t]}`); continue; }
    fails++; console.log(`✗ ${app}/index.html: ״${t.slice(0, 60)}״ — טקסט עברי על המסך שאינו מפתח, הלומד יראה עברית`);
  }
  for (const t of Object.keys(ok)) if (!st.includes(t)) console.log(`· ${app}: החריג ״${t}״ כבר אינו בדף — מחק אותו מ-STATIC_OK`);
  /* ד */
  /* המקור בלי ליטרל המילון עצמו — אחרת כל מפתח ״מופיע״ במילון שלו. */
  const all = filesOf(app).map(f => {
    let t = fs.readFileSync(f, 'utf8');
    for (const d of dicts.filter(d => d.file === f).sort((a, b) => b.span[0] - a.span[0]))
      t = t.slice(0, d.span[0]) + t.slice(d.span[1]);
    return t.replace(/\s+/g, ' ');   /* טקסט ב-HTML מפוצל לשורות; המפתח — שורה אחת */
  }).join('\n');
  const orphans = [...KEYSET].filter(k => !all.includes(k));
  if (process.env.I18N_ORPHANS) orphans.forEach(k => console.log("    יתום: " + k.slice(0, 90)));
  if (orphans.length) console.log(`· ${app}: ${orphans.length} מפתחות שאינם מופיעים בשום מקום במקור (יתומים, מידע) — ״${orphans[0].slice(0, 40)}״…`);
  if (fails) bad++;
  else console.log(`✓ ${app}: ${where} — ${KEYSET.size} מפתחות, ${langs.join('/')}; ${lits.size} קריאות _(), ${st.length} טקסטים סטטיים — כולם מפתחות`);
}

console.log(`${bad ? '✗' : '✓'} ${APPS.length} אפליקציות TR_KEYS ו-${dictApps} אפליקציות מילון, ${bad} כשלים`);
process.exit(bad ? 1 : unchecked ? 3 : 0);
