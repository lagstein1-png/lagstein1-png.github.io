/* =====================================================================
   מתרגם תמליל סשן של Claude Code לטקסט קריא.

     node .claude/spy.js                    הסשן האחרון בתיקייה הזאת
     node .claude/spy.js <session-id>       סשן לפי מזהה
     node .claude/spy.js <path.jsonl>       קובץ תמליל מפורש
     node .claude/spy.js --full             בלי קיצור שורות

   למה הוא קיים
   ------------
   הדרך המתבקשת לתעד סשן היא `claude ... | tee log`, והיא לא עובדת
   משתי סיבות. ראשית, צינור על stdout מסלק את ה-TTY והממשק האינטראקטיבי
   לא עולה כמו שצריך. שנית, מה שנכתב למסך הוא ציור: רצפי ANSI, מסגרות
   וציור־מחדש של אותן שורות שוב ושוב. קובץ כזה אינו תמליל אלא צילום
   של האנימציה.

   התמליל האמיתי כבר קיים על הדיסק. Claude Code כותב אותו בעצמו אל
   ~/.claude/projects/<תיקיית-עבודה-מקודדת>/<session-id>.jsonl — שורה
   אחת של JSON לכל אירוע. הקובץ הזה קורא אותו, ומשאיר רק את מה שאדם
   רוצה לראות: מה המשתמש ביקש, מה הסוכן ענה, אילו כלים הוא הפעיל,
   ואילו קבצים נגע בהם.

   הקידוד של שם התיקייה הוא החלפת כל תו שאינו אות או ספרה במקף:
   /home/user/lagstein1-png.github.io  →  -home-user-lagstein1-png-github-io
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(os.homedir(), '.claude', 'projects');
const FULL = process.argv.includes('--full');
const CUT = FULL ? Infinity : 220;          /* אורך שורה מרבי בתקציר */
const arg = process.argv.slice(2).find(a => !a.startsWith('--'));

/* ---------- איתור התמליל ---------------------------------------- */

function slug(dir) { return dir.replace(/[^a-zA-Z0-9]/g, '-'); }

function jsonlIn(dir) {
  let names;
  try { names = fs.readdirSync(dir) } catch (e) { return [] }
  return names.filter(n => n.endsWith('.jsonl')).map(n => path.join(dir, n));
}

function allTranscripts() {
  let dirs;
  try { dirs = fs.readdirSync(ROOT) } catch (e) { return [] }
  return dirs.reduce((a, d) => a.concat(jsonlIn(path.join(ROOT, d))), []);
}

function newest(files) {
  const live = files.filter(f => { try { return fs.statSync(f).isFile() } catch (e) { return false } });
  if (!live.length) return null;
  return live.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

function locate(a) {
  if (a && a.endsWith('.jsonl')) return fs.existsSync(a) ? a : null;
  if (a) {                                   /* מזהה סשן: מחפשים בכל התיקיות */
    const hit = allTranscripts().find(f => path.basename(f) === a + '.jsonl');
    return hit || null;
  }
  /* בלי ארגומנט: האחרון בתיקיית העבודה הנוכחית, ואם אין — האחרון בכלל */
  return newest(jsonlIn(path.join(ROOT, slug(process.cwd())))) || newest(allTranscripts());
}

/* ---------- קריאה ------------------------------------------------ */

function clip(s, n) {
  s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n) + ' …' : s;
}

/* לכל כלי, השדה שמעניין בן אדם שקורא את התקציר. הראשון שקיים מנצח. */
const FIELD = {
  Bash: ['command'], Read: ['file_path'], Write: ['file_path'],
  Edit: ['file_path'], NotebookEdit: ['notebook_path'],
  Glob: ['pattern'], Grep: ['pattern'], Agent: ['description', 'prompt'],
  WebFetch: ['url'], WebSearch: ['query'], Skill: ['skill'],
  TaskCreate: ['description'], TaskUpdate: ['description'],
};
const WRITERS = ['Write', 'Edit', 'NotebookEdit'];

function detail(name, input) {
  if (!input || typeof input !== 'object') return '';
  for (const k of (FIELD[name] || [])) if (input[k] != null) return String(input[k]);
  return JSON.stringify(input);
}

/* מהן האפליקציות? לא רשימה קשיחה — כל תיקיית בת שיש בה index.html
   בתיקיית העבודה של הסשן. רשימה קשיחה כאן הייתה מתיישנת באפליקציה
   הבאה שנוספת, וזה בדיוק סוג הסחיפה שהפרויקט הזה נלחם בה. */
function appsUnder(cwd) {
  let names;
  try { names = fs.readdirSync(cwd, { withFileTypes: true }) } catch (e) { return [] }
  return names.filter(d => d.isDirectory() && fs.existsSync(path.join(cwd, d.name, 'index.html')))
              .map(d => d.name).sort();
}

function textOf(block) {
  if (block.type === 'text') return block.text || '';
  if (block.type === 'thinking') return block.thinking || '';
  return '';
}

function render(file) {
  const raw = fs.readFileSync(file, 'utf8').split('\n').filter(l => l.trim());
  const out = [];
  const touched = [];        /* קבצים שנכתבו, לפי סדר ראשון */
  const failed = [];         /* כלים שהחזירו שגיאה */
  const byId = {};           /* tool_use_id → שם הכלי, כדי לשייך תוצאה */
  const mentions = {};       /* שם אפליקציה → כמה פעמים נזכרה בקלט של כלי */
  let apps = [];
  let head = null, first = null, last = null, turns = 0, tools = 0;

  for (const line of raw) {
    let o;
    try { o = JSON.parse(line) } catch (e) { continue }
    if (o.timestamp) { first = first || o.timestamp; last = o.timestamp }
    if (!head && o.sessionId && o.cwd) { head = o; apps = appsUnder(o.cwd) }
    if (o.type !== 'user' && o.type !== 'assistant') continue;

    const c = o.message && o.message.content;
    const blocks = typeof c === 'string' ? [{ type: 'text', text: c }] : (Array.isArray(c) ? c : []);

    for (const b of blocks) {
      if (b.type === 'tool_use') {
        tools++;
        byId[b.id] = b.name;
        if (WRITERS.indexOf(b.name) >= 0) {
          const p = b.input && (b.input.file_path || b.input.notebook_path);
          if (p && touched.indexOf(p) < 0) touched.push(p);
        }
        const blob = JSON.stringify(b.input || '');
        for (const app of apps) {
          const hits = blob.split(app + '/').length - 1;
          if (hits) mentions[app] = (mentions[app] || 0) + hits;
        }
        out.push('  [' + b.name + '] ' + clip(detail(b.name, b.input), CUT));
      } else if (b.type === 'tool_result') {
        if (b.is_error) {
          const who = byId[b.tool_use_id] || 'כלי';
          const body = typeof b.content === 'string' ? b.content
            : (Array.isArray(b.content) ? b.content.map(x => x.text || '').join(' ') : '');
          failed.push(who + ': ' + clip(body, 160));
          out.push('  [!] ' + who + ' נכשל: ' + clip(body, CUT));
        }
      } else {
        const t = textOf(b).trim();
        if (!t) continue;
        if (o.type === 'user') { turns++; out.push('', '>>> משתמש: ' + clip(t, FULL ? Infinity : 2000)) }
        else out.push('    ' + clip(t, FULL ? Infinity : 1200));
      }
    }
  }

  const L = [];
  L.push('=== תמליל סשן ===');
  L.push('קובץ:   ' + file);
  if (head) {
    L.push('סשן:    ' + head.sessionId);
    L.push('תיקייה: ' + head.cwd);
    if (head.gitBranch) L.push('ענף:    ' + head.gitBranch);
    if (head.version) L.push('גרסה:   ' + head.version);
  }
  if (first) L.push('התחלה:  ' + first);
  if (last) L.push('סיום:   ' + last);
  L.push('פניות משתמש: ' + turns + ' · הפעלות כלים: ' + tools + ' · כשלים: ' + failed.length);
  L.push('');
  L.push(out.join('\n').replace(/\n{3,}/g, '\n\n').trim());
  L.push('');
  const ranked = Object.keys(mentions).sort((a, b) => mentions[b] - mentions[a]);
  L.push('=== אפליקציות שנזכרו בפקודות ===');
  L.push('(אזכור של "<שם>/" בקלט של כלי — לא הוכחה שהאפליקציה שונתה)');
  L.push(ranked.length
    ? ranked.map(a => '· ' + a + ' — ' + mentions[a]).join('\n')
    : (apps.length ? '(אף אחת מ-' + apps.length + ' התיקיות עם index.html)'
                   : '(תיקיית העבודה של הסשן אינה נגישה מכאן)'));
  L.push('');
  L.push('=== קבצים שנכתבו (לפי כלי Write / Edit) ===');
  L.push(touched.length ? touched.map(f => '· ' + f).join('\n')
    : '(אין. שים לב: קובץ שנכתב בתוך פקודת Bash — heredoc, sed -i, הפניה —\n'
    + ' אינו מופיע כאן. הרשימה המלאה היא git status.)');
  if (failed.length) {
    L.push('');
    L.push('=== כלים שנכשלו ===');
    L.push(failed.map(f => '· ' + f).join('\n'));
  }
  return L.join('\n');
}

/* ---------- הרצה ------------------------------------------------- */

const file = locate(arg);
if (!file) {
  console.error('spy: לא נמצא תמליל' + (arg ? ' עבור ' + arg : ' לתיקייה ' + process.cwd()));
  console.error('spy: התמלילים יושבים תחת ' + ROOT);
  process.exit(1);
}
process.stdout.write(render(file) + '\n');
