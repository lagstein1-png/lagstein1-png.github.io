/* =====================================================================
   simplify.js — ״גרסה פשוטה״ ב-reader: הטקסט יוצא רק בלחיצה, ורק
   במצב simplify; בלי שרת — חילוק למשפטים שנאמר בשמו

   מה זה בודק, בלי דפדפן ובלי רשת:
     1. השרת — `simplify` הוא מצב, `doc` מתקבל רק בו ונחתך ב-LIM.doc,
        ובלוק ההקשר במצב הזה: בשפת הממשק, בלי הצגה עצמית, והטקסט אחרון
     2. הלקוח — `DOC_MAX` שווה ל-`LIM.doc`, ו-`doc` נשלח רק במצב simplify
     3. המוח המקומי — מחלק למשפטים, מגביל, סופר מה נשאר, אומר שזה
        חילוק ולא קיצור, בארבע שפות, ובלי lookbehind (ספארי ישן)
     4. הפאנל — ארבע המחרוזות בארבע השפות, ו-`TUTOR.simplify` מיוצא
     5. reader — הכפתור, החיווט, ההסבר מתחת לתיבה בארבע שפות
     6. התנאים — 1.8 ומעלה, וארבע השפות מונות את הטקסט המודבק

   הוכחת נפילה: על העץ שלפני 17.9.2026 (tutor/, tutor-api/, reader/,
   legal/ ב-stash) — נופל כבר בבדיקה הראשונה. ראו FINDINGS.md.
   הרצה:  node .claude/qa/simplify.js
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
let bad = 0, n = 0;
function t(name, got, want) {
  n++;
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log('✓ ' + name); return }
  bad++; console.log('✗ ' + name + ' — קיבלתי ' + JSON.stringify(got) + ' במקום ' + JSON.stringify(want));
}

(async () => {
  /* ---------- 1. השרת ---------- */
  /* `pathToFileURL` ולא נתיב גולמי: בווינדוס `import()` מקבל נתיב
     כמו `C:\…` ודוחה אותו — ״Received protocol 'c:'״. זה בדיוק
     מה שקרה ל-`barak.js` (ראו שם שורה 77), והבדיקה הזאת נחתה
     עם אותו באג והפילה את `all.js` מקומית. על הרנר, שהוא לינוקס,
     היא עברה — ולכן אין לסמוך על ריצת ה-Actions לבדה כאן. */
  const W = await import(require('url').pathToFileURL(
    path.join(ROOT, 'tutor-api', 'worker.js')).href);
  t('simplify הוא מצב בשרת', (W.MODES || []).includes('simplify'), true);
  t('LIM.doc קיים', typeof W.LIM.doc, 'number');
  const ok = W.readBody({ app: 'reader', lang: 'ru', mode: 'simplify', doc: 'שלום.\r\n\r\n\r\nזה  טקסט.', userText: 'x' });
  t('readBody מקבל doc במצב simplify, ומנקה', ok && ok.doc, 'שלום.\n\nזה טקסט.');
  t('simplify בלי doc נדחה', W.readBody({ app: 'reader', mode: 'simplify', userText: 'x' }), null);
  t('doc נזרק מחוץ ל-simplify', W.readBody({ app: 'reader', mode: 'chat', doc: 'abc', userText: 'x' }).doc, null);
  t('doc נחתך ב-LIM.doc', W.readBody({ app: 'reader', mode: 'simplify', doc: 'א'.repeat(W.LIM.doc + 500), userText: 'x' }).doc.length, W.LIM.doc);
  const c = ok ? W.contextBlock(ok, 0) : '';
  t('ההוראה נוקבת בשפת הממשק', /ברוסית/.test(c), true);
  /* הטקסט אחרי כל ההוראות, ואחריו רק התזכורת — שורה אחת שאינה
     יכולה להכיל הוראה מהטקסט עצמו (barak-live ריצה 6). */
  t('הטקסט המודבק אחרי ההוראות', c.indexOf('זה טקסט.') > c.indexOf('אל תוסיף מידע'), true);
  t('ואחריו רק התזכורת', /\nתזכורת: [^\n]*$/.test(c.trimEnd()) && c.indexOf('זה טקסט.') < c.lastIndexOf('תזכורת:'), true);
  t('אין הצגה עצמית במצב simplify', /שמך, ומיד/.test(c), false);
  t('אין ״כתוב את התרגיל״ במצב simplify', /בקש מהתלמיד לכתוב/.test(c), false);
  t('ההוראה אוסרת להוסיף מידע', /אל תוסיף מידע/.test(c), true);

  /* ---------- 2. הלקוח ---------- */
  const core = R('tutor/barak-core.js'), loc = R('tutor/josh-local.js'), tut = R('tutor/tutor.js');
  t('DOC_MAX בלקוח = LIM.doc בשרת', (core.match(/var DOC_MAX = (\d+)/) || [])[1], String(W.LIM.doc));
  t('doc נשלח רק במצב simplify', /if \(opts\.mode === "simplify"\) body\.doc = /.test(core), true);

  /* ---------- 3. המוח המקומי, מורץ ---------- */
  t('אין lookbehind במוח המקומי', /\(\?<[=!]/.test(loc), false);
  const win = { navigator: { userAgent: '', onLine: true },
                document: { getElementById: () => null, createElement: () => ({}),
                            head: { appendChild() {} }, documentElement: { appendChild() {} } },
                setTimeout, clearTimeout, console };
  win.window = win; vm.createContext(win);
  vm.runInContext(loc, win); vm.runInContext(core, win);
  const doc = 'משפט ראשון. משפט שני! משפט שלישי? משפט רביעי.\nמשפט חמישי. שישי. שביעי. שמיני. תשיעי. עשירי.';
  const s = win.JOSHLOCAL.simplify(doc, 'he');
  t('המוח המקומי מחלק למשפטים, שמונה לכל היותר', s ? s.text.split('\n').filter(l => l.startsWith('- ')).length : -1, 8);
  t('ואומר כמה נשארו', !!s && /עוד 2 משפטים/.test(s.text), true);
  t('ואומר שזה חילוק ולא קיצור', !!s && /לא יכול לקצר/.test(s.text), true);
  for (const lg of ['ar', 'ru', 'en']) {
    const o = win.JOSHLOCAL.simplify('A. B.', lg);
    t('המוח המקומי ב-' + lg + ' — כותרת בשפה ושורות', !!o && o.text.indexOf('- A.') > 0 && !/לא יכול/.test(o.text), true);
  }
  t('טקסט ריק — אין תשובה', win.JOSHLOCAL.simplify('   ', 'he'), null);
  const local = await win.BARAK._local('x', { mode: 'simplify', doc: 'א. ב.', lang: 'he' }, 'offline');
  t('הנפילה המקומית במצב simplify היא JOSHLOCAL.simplify', local && local.kind, 'simplify');
  t('ומסומנת כמקומית', local && local.source, 'local-fallback');

  /* ---------- 4. הפאנל ---------- */
  for (const k of ['simplifyBtn', 'simplifyAsk', 'simplifyEmpty', 'simplifyCut'])
    t('tutor.js: ' + k + ' בארבע השפות', (tut.match(new RegExp(k + ':"', 'g')) || []).length, 4);
  t('TUTOR.simplify מיוצא', /simplify: simplify,/.test(tut), true);
  t('הפאנל שולח mode simplify עם doc חתוך', /mode: "simplify", doc: doc\.slice\(0, max\)/.test(tut), true);

  /* ---------- 5. reader ---------- */
  const html = R('reader/index.html');
  t('reader: יש כפתור', /id="btnSimple"/.test(html), true);
  t('reader: הכפתור קורא ל-TUTOR.simplify', /TUTOR\.simplify\(/.test(html), true);
  t('reader: ההסבר מתחת לתיבה אומר שהטקסט נשלח', /בלחיצה על ״גרסה פשוטה״ הטקסט נשלח/.test(html), true);
  const tm = html.match(/^var TR = (.*);$/m);
  const TR = tm ? JSON.parse(tm[1]) : {};
  for (const lg of ['ar', 'ru', 'en'])
    t('reader: ההסבר מתורגם ל-' + lg, Object.keys(TR[lg] || {}).some(k => /גרסה פשוטה/.test(k)), true);

  /* ---------- 6. התנאים ---------- */
  const terms = R('legal/terms.js');
  t('התנאים 1.8 ומעלה', parseFloat((terms.match(/version:\s*"([\d.]+)"/) || [0, '0'])[1]) >= 1.8, true);
  for (const [lg, word] of [['he', 'גרסה פשוטה'], ['ar', 'نسخة مبسّطة'], ['ru', 'Простая версия'], ['en', 'Simple version']])
    t('התנאים ב-' + lg + ' מונים את הטקסט המודבק', terms.indexOf(word) > 0, true);
  t('התנאים נוקבים בתקרה בארבע השפות', (terms.match(/3[, ]000/g) || []).length >= 4, true);

  console.log(bad ? `\n✗ גרסה פשוטה — ${bad} מתוך ${n} נכשלו` : `\n✓ גרסה פשוטה — ${n} בדיקות עברו`);
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log('✗ ' + e.message); process.exit(1) });
