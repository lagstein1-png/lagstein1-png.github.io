/* =====================================================================
   מחולל `marketing/index.html` — קובץ אחד שנפתח בלחיצה כפולה.

   **הבעיה שהוא פותר.** לווינדוס אין תוכנה שפותחת `.md`, ולכן
   לחיצה כפולה על הקבצים בתיקייה לא עושה כלום. הבעלים דיווח את
   זה ב-15.9.2026: ״לא מצליח לפתוח״.

   **ולמה קובץ אחד ולא תשעה.** דף שמושך את קובצי ה-`.md` ב-`fetch`
   לא יעבוד בלחיצה כפולה מהדיסק: כרום חוסם `fetch` על `file://`.
   לכן כל התוכן **מוטבע** בקובץ — הוא נפתח מהדיסק, מהאתר, ומכל
   מכשיר, בלי שרת ובלי רשת.

   הרינדור הוא ממיר מארקדאון מינימלי שנכתב כאן — אין ספרייה,
   אין CDN, ואין תלות חדשה.

   הרצה:  node .claude/qa/mkreader.js
   ===================================================================== */
const fs = require('fs'), path = require('path');
const DIR = 'marketing';

/* סדר הקריאה, ולא סדר אלפביתי: מה שקוראים ראשון קודם. */
const ORDER = ['README.md', 'facts.md', 'copy-posts.md', 'outreach-letters.md',
               'outreach-letters-ar.md',
               'video-scripts.md', 'plan-weekly.md', 'campaign.md',
               'wix-content.md', 'wix-migration.md'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* --- ממיר מארקדאון מינימלי ---------------------------------------
   מכסה בדיוק את מה שהקבצים האלה משתמשים בו: כותרות, הדגשה, קוד,
   רשימות, טבלאות, ציטוטים, קו מפריד וקישורים. מה שאינו מכוסה
   מוצג כטקסט — וזה עדיף על רינדור שגוי. */
function inline(t) {
  t = esc(t);
  t = t.replace(/`([^`]+)`/g, (m, c) => '<code>' + c + '</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return t;
}
function md2html(src) {
  const out = [];
  const lines = src.split('\n');
  let i = 0, inCode = false, listType = null, codeAt = -1;
  const closeList = () => { if (listType) { out.push('</' + listType + '>'); listType = null } };

  while (i < lines.length) {
    const l = lines[i];

    if (/^```/.test(l)) {
      if (inCode) {
        /* סוגרים, ומחליטים לפי מה שנצבר: עברית = טקסט להעתקה. */
        const buf = out.slice(codeAt + 1).join('\n');
        if (/[\u0590-\u05FF]/.test(buf)) out[codeAt] = '<pre class="he">';
        out.push('</pre>'); inCode = false;
      }
      else { closeList(); codeAt = out.length; out.push('<pre>'); inCode = true }
      i++; continue;
    }
    if (inCode) { out.push(esc(l)); i++; continue }

    if (/^\s*$/.test(l)) { closeList(); i++; continue }

    /* טבלה: שורה עם | ואחריה שורת מפריד */
    if (/^\s*\|/.test(l) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      closeList();
      const cells = r => r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      out.push('<table><thead><tr>' + cells(l).map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>');
      i += 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        out.push('<tr>' + cells(lines[i]).map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>');
        i++;
      }
      out.push('</tbody></table>');
      continue;
    }

    let m;
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) {
      closeList();
      const n = m[1].length;
      out.push('<h' + n + '>' + inline(m[2]) + '</h' + n + '>');
      i++; continue;
    }
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(l)) { closeList(); out.push('<hr>'); i++; continue }
    if ((m = l.match(/^\s*>\s?(.*)$/))) {
      closeList(); out.push('<blockquote>' + inline(m[1]) + '</blockquote>'); i++; continue;
    }
    if ((m = l.match(/^\s*[-*+]\s+(.*)$/))) {
      if (listType !== 'ul') { closeList(); out.push('<ul>'); listType = 'ul' }
      out.push('<li>' + inline(m[1]) + '</li>'); i++; continue;
    }
    if ((m = l.match(/^\s*\d+[.)]\s+(.*)$/))) {
      if (listType !== 'ol') { closeList(); out.push('<ol>'); listType = 'ol' }
      out.push('<li>' + inline(m[1]) + '</li>'); i++; continue;
    }
    /* **פסקה היא רצף שורות, לא שורה אחת.** הגרסה הראשונה עטפה כל
       שורת מקור ב-<p> משלה, ואז `**הדגשה שנשברת בין שתי שורות**`
       לא נסגרה לעולם וההדגשה הוצגה כטקסט. נמדד: שבע שורות כאלה
       בתשעת הקבצים. */
    closeList();
    /* שורה שפותחת בלוק אחר עוצרת את הפסקה. `BLOCK` מרכז
       את כולן במקום אחד, כדי שהתנאי לא יתפצל מהלולאה. */
    const BLOCK = new RegExp("^(\\s*$|```|#{1,6}\\s|\\s*\\||\\s*>|\\s*[-*+]\\s|\\s*\\d+[.)]\\s|\\s*([-*_])\\s*\\2\\s*\\2[\\s\\-*_]*$)");
    const par = [];
    while (i < lines.length && !BLOCK.test(lines[i])) { par.push(lines[i]); i++ }
    if (par.length) out.push('<p>' + inline(par.join(' ')) + '</p>');
    else i++;
  }
  closeList();
  if (inCode) out.push('</pre>');
  return out.join('\n');
}

/* --- בנייה -------------------------------------------------------- */
const files = ORDER.filter(f => fs.existsSync(path.join(DIR, f)))
  .concat(fs.readdirSync(DIR).filter(f => f.endsWith('.md') && ORDER.indexOf(f) < 0));

const nav = [], body = [];
files.forEach((f, k) => {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const title = (src.match(/^#\s+(.*)$/m) || [, f])[1];
  const id = 'f' + k;
  const kb = (fs.statSync(path.join(DIR, f)).size / 1024).toFixed(1);
  nav.push('<li><a href="#' + id + '"><b>' + esc(title) + '</b><span>' + esc(f) + ' · ' + kb + ' KB</span></a></li>');
  body.push('<section id="' + id + '"><p class="src">' + esc(f) + '</p>' + md2html(src) + '</section>');
});

const HTML = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>חומרי שיווק — למידה שנשמעת</title>
<style>
:root{--bg:#f6f5f2;--card:#fff;--ink:#1b1f24;--soft:#5b6670;--faint:#8b949e;
  --line:#e0ddd6;--accent:#2f5fd8;--accent-soft:#e8eeff;--code:#f0eeea}
@media (prefers-color-scheme:dark){:root{--bg:#14171b;--card:#1c2025;--ink:#e9ecf0;
  --soft:#a3adb8;--faint:#727c87;--line:#2b313a;--accent:#7ea3ff;--accent-soft:#1b2440;--code:#232830}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font:400 17px/1.75 "Heebo","Segoe UI",system-ui,Arial,sans-serif;
  padding:0 20px 80px;-webkit-font-smoothing:antialiased}
.wrap{max-width:820px;margin:0 auto}
header{padding:40px 0 22px;border-bottom:2px solid var(--line)}
h1{margin:0 0 8px;font-size:2rem;font-weight:800;letter-spacing:-.02em}
.sub{margin:0;color:var(--soft);font-size:.98rem}
nav{margin:26px 0 0}
nav ul{list-style:none;margin:0;padding:0;display:grid;gap:1px;
  background:var(--line);border:1px solid var(--line);border-radius:6px;overflow:hidden}
nav a{display:block;padding:13px 16px;background:var(--card);text-decoration:none;color:inherit}
nav a:hover{background:var(--accent-soft)}
nav b{display:block;font-weight:700}
nav span{display:block;color:var(--faint);font-size:.8rem;
  font-family:ui-monospace,Menlo,monospace;direction:ltr;unicode-bidi:isolate;margin-top:2px}
section{margin-top:52px;padding-top:26px;border-top:1px solid var(--line)}
.src{margin:0 0 6px;font-family:ui-monospace,Menlo,monospace;font-size:.76rem;
  color:var(--faint);direction:ltr;unicode-bidi:isolate;letter-spacing:.06em}
h2{margin:34px 0 10px;font-size:1.5rem;font-weight:800;letter-spacing:-.01em}
h3{margin:28px 0 8px;font-size:1.18rem;font-weight:700}
h4,h5,h6{margin:22px 0 6px;font-size:1rem;font-weight:700;color:var(--soft)}
section>h1{margin:0 0 14px;font-size:1.8rem}
p{margin:0 0 .9em}
ul,ol{margin:0 0 1em;padding-inline-start:1.5em}
li{margin:.3em 0}
code{font-family:ui-monospace,Menlo,monospace;font-size:.86em;background:var(--code);
  padding:2px 6px;border-radius:3px;direction:ltr;unicode-bidi:isolate;display:inline-block}
pre{background:var(--code);border:1px solid var(--line);border-radius:5px;
  padding:14px 16px;overflow-x:auto;direction:ltr;text-align:left;
  font:.82rem/1.6 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-word}
/* בלוק שיש בו עברית הוא טקסט להעתקה ולא קוד: כיוון ימין־לשמאל,
   וגופן רגיל שקריא יותר מגופן רוחב־קבוע לפסקה שלמה. */
pre.he{direction:rtl;text-align:start;font:.95rem/1.75 "Heebo","Segoe UI",system-ui,Arial,sans-serif}
blockquote{margin:0 0 1em;padding:10px 16px;background:var(--card);
  border-inline-start:4px solid var(--accent);border-radius:4px;color:var(--soft)}
hr{border:0;border-top:1px solid var(--line);margin:28px 0}
table{border-collapse:collapse;width:100%;margin:0 0 1.2em;font-size:.93rem;display:block;overflow-x:auto}
th,td{border:1px solid var(--line);padding:8px 11px;text-align:start;vertical-align:top}
th{background:var(--code);font-weight:700}
a{color:var(--accent)}
.top{position:fixed;inset-block-end:18px;inset-inline-end:18px;background:var(--accent);
  color:#fff;text-decoration:none;padding:10px 15px;border-radius:99px;font-size:.85rem;
  font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,.2)}
</style></head><body><div class="wrap">
<header>
  <h1>חומרי שיווק</h1>
  <p class="sub">${files.length} קבצים · נוצר ב-<code>node .claude/qa/mkreader.js</code> · כל התוכן בקובץ הזה, בלי רשת</p>
  <nav><ul>${nav.join('')}</ul></nav>
</header>
${body.join('\n')}
</div><a class="top" href="#">למעלה ↑</a></body></html>`;

fs.writeFileSync(path.join(DIR, 'index.html'), HTML);
console.log('✓ ' + path.join(DIR, 'index.html') + '  ' +
            (Buffer.byteLength(HTML) / 1024).toFixed(0) + ' KB, ' + files.length + ' קבצים');
