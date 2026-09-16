/* =====================================================================
   agents.js — סוכן אינו קורא לסוכן: קובץ סוכן אינו נושא את כלי
   הסוכנים, ואינו מבטיח את זה

   הכלל כתוב ב-CLAUDE.md, ״הצוות״: אף קובץ ב-.claude/agents/ אינו
   נושא את כלי הסוכנים בשורת tools:, ולכן סוכן אינו יכול לקרוא לסוכן
   אחר. עד 9.9.2026 כל שבעת הקבצים טענו ״אתה רשאי לקרוא לכל סוכן
   אחר בצוות״ — הבטחה שאין דרך לקיים, וסוכן שהאמין לה תיקן בעצמו
   דבר שאינו בתחומו, או שתק. המשפט הוסר ביד, ואיש לא בדק שהוא לא
   חוזר עם הסוכן הבא שנולד מהעתקה.

   הבדיקה, על כל .claude/agents/*.md שיש לו כותרת --- (MARKETING.md
   שם הוא מסמך, לא סוכן):
     1. יש שורת tools: בכותרת
     2. היא אינה כוללת Agent או Task — כלי זימון סוכנים
     3. הגוף אינו מבטיח ״רשאי לקרוא לכל סוכן״ / ״לזמן סוכן״
   סטטית, בלי דפדפן.

   הוכחת נפילה: על 308786f — 0. עם ״Agent״ שנוסף זמנית ל-tools:
   של maayan.md — 1, וגם עם המשפט הישן שהוחזר — 1. הוסרו, 0.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '..', 'agents');
/* סוכן הוא קובץ .md עם כותרת ---; MARKETING.md שם הוא מסמך ולא סוכן */
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md') && /^---\n/.test(fs.readFileSync(path.join(DIR, f), 'utf8'))).sort();
const CLAIM = /רשאי לקרוא לכל סוכן|לזמן סוכן אחר|קרא לסוכן|call another agent|invoke (?:the|another) agent/;

let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const head = (src.match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  const tools = (head.match(/^tools:\s*(.*)$/m) || [])[1];
  const errs = [];
  if (tools === undefined) errs.push('אין שורת tools: בכותרת');
  else {
    const list = tools.split(',').map(s => s.trim());
    for (const t of list) if (/^(Agent|Task)$/.test(t)) errs.push(`tools: כולל ${t} — סוכן שיכול לזמן סוכן`);
  }
  const cm = src.match(CLAIM);
  if (cm) errs.push(`מבטיח ״${cm[0]}״ — הבטחה שאין כלי לקיים`);
  if (errs.length) { bad++; errs.forEach(e => console.log(`✗ agents/${f}: ${e}`)); }
  else console.log(`✓ agents/${f}: ${tools}`);
}
console.log(`${bad ? '✗' : '✓'} ${files.length} סוכנים, ${bad} שיכולים או מבטיחים לזמן סוכן`);
process.exit(bad ? 1 : 0);
