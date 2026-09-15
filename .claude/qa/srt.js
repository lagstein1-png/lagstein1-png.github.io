/* עטיפה: מריץ את מחולל הכתוביות במצב בדיקה בלבד, כדי ש-all.js
   לא יכתוב קבצים בזמן שהוא רק בודק. */
const { execFileSync } = require('child_process');
const path = require('path');
try {
  process.stdout.write(execFileSync(process.execPath,
    [path.resolve(__dirname, '..', '..', 'marketing', 'make-srt.js'), '--check'],
    { encoding: 'utf8' }));
} catch (e) {
  process.stdout.write((e.stdout || '') + (e.stderr || ''));
  process.exit(1);
}
