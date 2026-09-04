/* =====================================================================
   מרגל חי: עוקב אחרי סשן שרץ *עכשיו*, ומדי כמה אירועים מסביר
   בשפה פשוטה מה קורה.

     node .claude/spy-live.js                 נצמד לסשן האחרון בתיקייה
     node .claude/spy-live.js <session-id>    נצמד לסשן מסוים, גם אם
                                              התמליל שלו עוד לא נוצר
     node .claude/spy-live.js <path.jsonl>    קובץ תמליל מפורש

     --every N   כמה אירועים חדשים לפני הסבר   (ברירת מחדל 12)
     --idle S    שניות שקט שגם הן מפעילות הסבר (ברירת מחדל 45)
     --show      בלי claude -p: רק מדפיס את האירועים החדשים
     --from-start  גם מה שכבר נכתב בתמליל, ולא רק מכאן והלאה
     --full      בלי קיצור שורות

   למה לא הצינור
   -------------
   הדרך המתבקשת היא `mkfifo` ו-`claude > pipe`, וקריאת השורות משם.
   זה לא עובד, ומאותה סיבה ש-`| tee` לא עובד: צינור על stdout מסלק
   את ה-TTY, והממשק האינטראקטיבי לא עולה. וגם אם היה עולה — מה שנכתב
   למסך הוא ציור. רצפי ANSI ומסגרות שמצוירות מחדש שוב ושוב אינם
   "שורות" שאפשר לספור עשר מהן ולסכם.

   המקור החי הנכון הוא אותו קובץ שהמרגל הרגיל קורא בסוף:
   ~/.claude/projects/<תיקייה-מקודדת>/<session-id>.jsonl. Claude Code
   מוסיף לו שורת JSON בכל אירוע, תוך כדי ריצה. כאן פשוט קוראים ממנו
   מה שנוסף מאז הפעם הקודמת. הפירוק לשורות קריאות הוא בדיוק זה של
   spy.js — אותו `feed`, ולא העתק שלו.

   איפה זה מוצג
   ------------
   לא באותו טרמינל של הסשן: הממשק של Claude Code מצייר את המסך שלו
   מחדש וידרוס כל דבר שיודפס לתוכו. `spy.sh --live` מפנה את הפלט
   לקובץ, ומי שרוצה לראות פותח טרמינל שני עם `tail -f`.

   וזה עולה כסף: כל הסבר הוא קריאה נוספת ל-claude. `--every` גדול
   יותר פירושו פחות קריאות.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const spy = require('./spy.js');

const argv = process.argv.slice(2);
const SHOW = argv.includes('--show');
const FROM_START = argv.includes('--from-start');
const VALUED = ['--every', '--idle'];      /* דגלים שאחריהם בא מספר */

/* מי שמפריד בין דגלים לארגומנט חייב לדעת אילו דגלים בולעים את המילה
   שאחריהם. בלי זה `--every 2` היה נקרא כאילו "2" הוא מזהה הסשן,
   והמרגל היה ממתין לנצח לתמליל בשם הזה. */
function opt(name, dflt) {
  for (let i = 0; i < argv.length; i++) {
    let v = null;
    if (argv[i] === '--' + name) v = argv[i + 1];
    else if (argv[i].indexOf('--' + name + '=') === 0) v = argv[i].split('=')[1];
    if (v == null) continue;
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return dflt;
}

const target = (function () {
  for (let i = 0; i < argv.length; i++) {
    if (VALUED.indexOf(argv[i]) >= 0) { i++; continue }
    if (argv[i].indexOf('--') === 0) continue;
    return argv[i];
  }
  return undefined;
})();
const EVERY = opt('every', 12);          /* אירועים */
const IDLE = opt('idle', 45) * 1000;     /* מילישניות */
const POLL = 1000;

const PROMPT = 'אתה מרגל שצופה בסשן פיתוח בזמן אמת (SPY-TRANSCRIPT-IGNORE).\n'
  + 'לפניך רק מה שקרה בדקות האחרונות, ולא הסשן כולו.\n'
  + 'כתוב שתיים עד ארבע שורות בעברית פשוטה, בלי מושגים טכניים:\n'
  + 'מה הסוכן עושה עכשיו, ובאילו קבצים הוא נוגע.\n'
  + 'אל תמציא שום פרט שאינו בטקסט. לא ברור מה קורה — כתוב "לא ברור מהקטע הזה".';

/* ---------- איתור הקובץ, כולל המתנה שייווצר -------------------- */

function expected(a) {
  if (!a) return null;
  if (a.endsWith('.jsonl')) return path.resolve(a);
  return path.join(spy.ROOT, spy.slug(process.cwd()), a + '.jsonl');
}

function resolveNow() {
  const hit = spy.locate(target);
  if (hit) return hit;
  const guess = expected(target);
  return guess && fs.existsSync(guess) ? guess : null;
}

/* ---------- הפלט ------------------------------------------------- */

function stamp() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, '0')).join(':');
}

function say(s) { process.stdout.write(s + '\n') }

function count(n, one, many) { return n + ' ' + (n === 1 ? one : many) }

function explain(lines) {
  const body = lines.join('\n').replace(/^\n+|\n+$/g, '');
  if (!body.trim()) return;
  say('');
  say('── ' + stamp() + ' · ' + count(lines.length, 'אירוע', 'אירועים') + ' ──');
  if (SHOW) { say(body); return }
  const r = spawnSync('claude', ['-p', '--output-format', 'text', PROMPT],
    { input: body, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (r.error || r.status !== 0) {
    say('(המרגל לא הצליח לסכם: ' + ((r.error && r.error.message) || ('קוד ' + r.status)) + ')');
    say(body);                      /* עדיף האירועים הגולמיים מכלום */
    return;
  }
  say(String(r.stdout).trim());
}

/* ---------- המעקב ------------------------------------------------ */

const ctx = spy.newCtx();
let file = null, offset = 0, tail = '', pending = [], lastEvent = 0, stopping = false;

function drain() {
  let st;
  try { st = fs.statSync(file) } catch (e) { return }
  if (st.size < offset) { offset = 0; tail = '' }   /* הקובץ נכתב מחדש */
  if (st.size === offset) return;

  let fd, text = '';
  try {
    fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(st.size - offset);
    const n = fs.readSync(fd, buf, 0, buf.length, offset);
    offset += n;
    text = buf.toString('utf8', 0, n);
  } catch (e) { return } finally { if (fd != null) try { fs.closeSync(fd) } catch (e) {} }

  const parts = (tail + text).split('\n');
  tail = parts.pop();                                /* שורה חלקית — לפעם הבאה */
  for (const line of parts) {
    if (!line.trim()) continue;
    const mark = ctx.out.length;
    if (spy.feed(ctx, line) > 0) {
      pending = pending.concat(ctx.out.slice(mark).filter(l => l.trim()));
      lastEvent = Date.now();
    }
  }
}

function flush(force) {
  if (!pending.length) return;
  if (!force && pending.length < EVERY && Date.now() - lastEvent < IDLE) return;
  const batch = pending;
  pending = [];
  explain(batch);
}

/* atEnd נקבע פעם אחת, בהתחלה, ולא ברגע שהקובץ נמצא: נצמדנו לסשן
   שכבר רץ — מדלגים על מה שכבר בקובץ, אחרת ההסבר הראשון היה כל הסשן
   עד כה, קריאה אחת גדולה ויקרה על מה שכבר קרה. אבל אם המתנּו שהקובץ
   ייווצר (spy.sh --live מקבע מזהה לפני שהסשן עולה), הכול בו חדש
   וחייבים לקרוא אותו מההתחלה — כולל הבקשה הראשונה של המשתמש. */
function attach(f, atEnd) {
  file = f;
  if (atEnd) { try { offset = fs.statSync(f).size } catch (e) {} }
  say('spy-live: עוקב אחרי ' + file);
  if (offset) say('spy-live: מתחיל מכאן והלאה (--from-start כדי לכלול גם את מה שקדם).');
  say('spy-live: הסבר כל ' + count(EVERY, 'אירוע', 'אירועים')
    + ', או אחרי ' + count(IDLE / 1000, 'שנייה', 'שניות') + ' של שקט.');
}

function tick() {
  if (!file) {
    const f = resolveNow();
    if (!f) return;                 /* עוד לא נוצר — ננסה בסיבוב הבא */
    attach(f, false);
  }
  drain();
  flush(false);
}

const existing = resolveNow();
if (!existing && !expected(target)) {
  console.error('spy-live: לא נמצא תמליל לתיקייה ' + process.cwd());
  console.error('spy-live: התמלילים יושבים תחת ' + spy.ROOT);
  process.exit(1);
}
if (existing) attach(existing, !FROM_START);

const timer = setInterval(tick, POLL);
tick();

/* סוף הסשן: קוראים את מה שנשאר ומסכמים אותו לפני היציאה */
function bye() {
  if (stopping) return;
  stopping = true;
  clearInterval(timer);
  if (file) { drain(); flush(true) }
  say('');
  say('spy-live: סיום. ' + count(ctx.tools, 'הפעלת כלי', 'הפעלות כלים')
    + ', ' + count(ctx.failed.length, 'כשל', 'כשלים') + '.');
  /* בלי process.exit: כשהפלט הוא צינור הכתיבה שלו אינה סינכרונית,
     ויציאה מיידית הייתה קוטעת את השורות האחרונות. מסירים את המאזינים
     ונותנים לתהליך להיגמר מעצמו אחרי שהכול נכתב. */
  process.removeAllListeners('SIGTERM');
  process.removeAllListeners('SIGINT');
  process.exitCode = 0;
}
process.on('SIGTERM', bye);
process.on('SIGINT', bye);
