'use strict';
/* record-quality.js — שני שומרים לשכבה המוקלטת, בשימוש record.js.

   1. קליפ קיים נשאר מנגן עד שתחליף תקין מוכן: התחליף נכתב לקובץ
      זמני, נבדק (קצב היעד + פענוח נקי) ורק אז מחליף את הישן.
   2. מונה ניסיונות לכל קליפ (attempts.json ליד המניפסט). קליפ שנכשל
      MAX_TRIES פעמים יוצא מהתור, כדי שקליפ תקול אחד לא יחסום את
      --next לתמיד. שגיאת מכסה אינה נספרת — היא לא אשמת הקליפ. */
const fs = require('fs'), path = require('path');
const {spawnSync} = require('child_process');
const MAX_TRIES = 3;
const FFPROBE = process.env.FFPROBE || 'ffprobe';

/* ffprobe חסר מחזיר 0 לכל קובץ, ואז אף קובץ אינו ״מוכן״ — בודקים פעם אחת ועוצרים בהודעה */
function probeOk() {
  const r = spawnSync(FFPROBE, ['-version'], {encoding:'utf8'});
  return !r.error && r.status === 0;
}
function bitrate(file) {
  const r = spawnSync(FFPROBE, ['-v','error','-select_streams','a:0','-show_entries','stream=bit_rate','-of','default=nw=1:nk=1',file], {encoding:'utf8'});
  return r.status === 0 ? Math.round(Number(String(r.stdout).trim()) / 1000) || 0 : 0;
}
function ready(file, target) { return fs.existsSync(file) && bitrate(file) === target; }
function install(file, bytes, target, ffmpeg) {
  const temp = file + '.pending-' + process.pid + '.mp3';
  try {
    fs.writeFileSync(temp, bytes);
    if (!ready(temp, target)) throw new Error('התחליף אינו ב-' + target + 'k');
    const r = spawnSync(ffmpeg, ['-v','error','-i',temp,'-f','null','-'], {encoding:'utf8'});
    if (r.status !== 0 || String(r.stderr).trim()) throw new Error('התחליף אינו מתפענח נקי');
    fs.renameSync(temp, file);
  } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
}

function attemptsFile(dir) { return path.join(dir, 'attempts.json'); }
function loadAttempts(dir) {
  try { return JSON.parse(fs.readFileSync(attemptsFile(dir), 'utf8')) || {}; } catch (e) { return {}; }
}
/* קובץ ריק אינו נשמר: אפליקציה בלי כישלונות נשארת בלי attempts.json */
function saveAttempts(dir, a) {
  const f = attemptsFile(dir);
  if (!Object.keys(a).length) { if (fs.existsSync(f)) fs.unlinkSync(f); return; }
  fs.mkdirSync(dir, {recursive: true});
  const sorted = Object.fromEntries(Object.keys(a).sort().map(k => [k, a[k]]));
  fs.writeFileSync(f, JSON.stringify(sorted, null, 0) + '\n');
}
function fail(a, id, err) {
  const e = a[id] || {n: 0};
  a[id] = {n: e.n + 1, last: new Date().toISOString().slice(0, 10), err: String(err || '').slice(0, 120)};
}
function exhausted(a, id) { return ((a[id] || {}).n || 0) >= MAX_TRIES; }

module.exports = {MAX_TRIES, probeOk, bitrate, ready, install, loadAttempts, saveAttempts, fail, exhausted};
