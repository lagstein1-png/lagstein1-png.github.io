/* עטיפה: מריץ את מקליט ההדגמות במצב בדיקה בלבד — חתימת כל סרטון
   ב-marketing/media/manifest.json מול DEMO_SCRIPT שבאפליקציה, וקיום
   צילומי המסך בארבע שפות. all.js אינו מקליט דבר; הקלטה היא
   node marketing/media/record.js, ביד, ודורשת ffmpeg. */
const { execFileSync } = require('child_process');
const path = require('path');
try {
  process.stdout.write(execFileSync(process.execPath,
    [path.resolve(__dirname, '..', '..', 'marketing', 'media', 'record.js'), '--check'],
    { encoding: 'utf8' }));
  /* ולכל סרטון יש רצועת מוזיקה (audio.js). דורש ffmpeg — בלעדיו מדלגים, ואומרים. */
  try {
    process.stdout.write(execFileSync(process.execPath,
      [path.resolve(__dirname, '..', '..', 'marketing', 'media', 'audio.js'), '--check'], { encoding: 'utf8' }));
  } catch (e) {
    if (/אין ffmpeg/.test((e.stdout || '') + (e.stderr || ''))) process.stdout.write('· audio: אין ffmpeg כאן — בדיקת רצועת השמע דולגה\n');
    else throw e;
  }
} catch (e) {
  process.stdout.write((e.stdout || '') + (e.stderr || ''));
  process.exit(1);
}
