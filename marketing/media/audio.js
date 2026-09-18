/* =====================================================================
   מוזיקת רקע לסרטונים — מסונתזת כאן, לא מורדת משום מקום.

   **למה זה קיים.** הכלל של הצוות (`video-scripts.md` כלל 2,
   `campaign.md` §7) אמר ״בלי מוזיקה״. הבעלים הכריע 18.9.2026:
   ״תיצר קול ומוזיקה או לפחות מוזיקה״. קול — אי אפשר מכאן (ראו
   `README.md`: מנועי הדיבור בענן חסומים ברשת הזאת, ואין מנוע
   מקומי). מוזיקה — כן, ובתנאי אחד: **בלי קובץ של מישהו אחר.**
   מוזיקה שמורידים היא רישיון שצריך לבדוק ותלות חיצונית; מוזיקה
   שמחושבת כאן ממתמטיקה היא של הריפו, כמו כל קוד אחר בו.

   **מה נשמע.** פד רך של ארבעה אקורדים (דו, סול, לה מינור, פה —
   מחזור של 16 שניות), הרמוניות סינוס עם מסנן, וארפג׳ו עדין
   מעל. בלי תופים, בלי מלודיה שמושכת אוזן — הכתוביות והמסך הם
   הסרטון, והמוזיקה יושבת מתחת, ב-‎−22 dB בממוצע (נמדד
   ב-`volumedetect`). היא מתפוגגת בשלוש השניות הראשונות והאחרונות.

   **איך.** לכל `.mp4` ב-`video/` מסונתז WAV באורך הסרטון, נערבל
   לתוך הקובץ (`-c:v copy`, הווידאו אינו מקודד מחדש) כרצועת AAC.
   הרצה על קובץ שכבר יש בו רצועה מחליפה אותה — ולכן הריצה
   אידמפוטנטית. `record.js` קורא לזה בסוף כל הקלטה.

     node marketing/media/audio.js             כל הסרטונים
     node marketing/media/audio.js reader      סרטון אחד
     node marketing/media/audio.js --check     לכל סרטון יש רצועת שמע

   **וקול — אם יש קובצי קול.** אין כאן מנוע דיבור עברי שמיש (ראו
   README), אבל מי שמקליט קריינות במקום אחר — קול האפליקציה מהטלפון,
   או קול נוירלי מהדפדפן — מניח קובץ לכל כתובית:

     marketing/media/voice/<שם הסרטון>/1.mp3, 2.mp3, …   לפי מספר השורה ב-.srt

   והריצה מניחה כל קובץ בזמן תחילת השורה שלו, מנמיכה את המוזיקה
   בזמן שהקול מדבר (sidechaincompress), ומערבלת. בלי תיקייה כזאת —
   מוזיקה בלבד.

   גרסה שקטה של כל סרטון היא `ffmpeg -i x.mp4 -c copy -an x-silent.mp4`.
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const VID = path.join(__dirname, 'video');
const SR = 44100;
const DB = -22;                      /* יעד עוצמה ממוצעת */

function findFfmpeg() {
  for (const f of [process.env.FFMPEG, 'ffmpeg'].filter(Boolean)) {
    if (spawnSync(f, ['-version'], { encoding: 'utf8' }).status === 0) return f;
  }
  return null;
}
function probe(ffmpeg, file) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const e = r.stderr || '';
  const d = e.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  return { seconds: d ? (+d[1]) * 3600 + (+d[2]) * 60 + (+d[3]) : 0, audio: /Stream #\d+:\d+.*Audio:/.test(e) };
}

/* ---- הסינתזה ------------------------------------------------------ */
const CHORDS = [[261.63, 329.63, 392.00], [196.00, 246.94, 293.66],
                [220.00, 261.63, 329.63], [174.61, 220.00, 261.63]];   /* C · G · Am · F */
const BAR = 4;                                                          /* שניות לאקורד */

function synth(seconds) {
  const N = Math.ceil(SR * seconds), out = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SR, ci = Math.floor(t / BAR) % CHORDS.length, ph = (t % BAR) / BAR;
    const env = Math.min(1, ph * 4) * Math.min(1, (1 - ph) * 4) * 0.8 + 0.2;
    let v = 0;
    for (const f of CHORDS[ci]) {
      v += Math.sin(2 * Math.PI * f * t) * 0.5 + Math.sin(2 * Math.PI * f * 2 * t) * 0.12 +
           Math.sin(2 * Math.PI * f * 0.5 * t) * 0.35;
    }
    const ARP = 8, slot = BAR / ARP, ai = Math.floor((t % BAR) / slot);
    const af = CHORDS[ci][ai % 3] * 2, aph = ((t % BAR) % slot) / slot;
    v = v * env * 0.11 + Math.sin(2 * Math.PI * af * t) * Math.exp(-aph * 6) * 0.125;
    const fade = Math.min(1, t / 3) * Math.min(1, Math.max(0, seconds - t) / 3);
    out[i] = v * fade;
  }
  let y = 0;                                                             /* מסנן מעביר־נמוכים */
  for (let i = 0; i < N; i++) { y += 0.15 * (out[i] - y); out[i] = y; }
  const buf = Buffer.alloc(44 + N * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(N * 2, 40);
  for (let i = 0; i < N; i++) buf.writeInt16LE(Math.max(-1, Math.min(1, out[i])) * 32767 | 0, 44 + i * 2);
  return buf;
}

/* ---- קול לפי שורות ה-.srt ----------------------------------------- */
function srtStarts(srt) {
  if (!fs.existsSync(srt)) return [];
  return [...fs.readFileSync(srt, 'utf8').matchAll(/(\d+):(\d+):(\d+),(\d+) -->/g)]
    .map(m => (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000);
}
function voiceFiles(mp4) {
  const name = path.basename(mp4, '.mp4');
  const dir = path.join(__dirname, 'voice', name);
  if (!fs.existsSync(dir)) return [];
  const starts = srtStarts(path.join(VID, name + '.srt'));
  return fs.readdirSync(dir).filter(f => /^\d+\.(mp3|wav|m4a|ogg)$/.test(f))
    .map(f => ({ file: path.join(dir, f), row: parseInt(f, 10) }))
    .filter(v => v.row >= 1 && v.row <= starts.length)
    .map(v => ({ ...v, at: starts[v.row - 1] }))
    .sort((a, b) => a.row - b.row);
}

/* ---- ערבול לסרטון ------------------------------------------------- */
function addMusic(ffmpeg, mp4) {
  const p = probe(ffmpeg, mp4);
  if (!p.seconds) return { ok: false, err: 'אין משך' };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'music-'));
  const wav = path.join(tmp, 'bed.wav'), out = path.join(tmp, 'out.mp4');
  fs.writeFileSync(wav, synth(p.seconds + 0.5));
  const voices = voiceFiles(mp4);
  /* loudnorm היה משנה את האופי; volume קבוע שנמדד מספיק לפד קבוע */
  const gain = `volume=${DB - (-22.9)}dB`;
  let args = ['-y', '-loglevel', 'error', '-i', mp4, '-i', wav];
  if (!voices.length) {
    args = args.concat(['-map', '0:v:0', '-map', '1:a:0', '-af', gain]);
  } else {
    voices.forEach(v => args.push('-i', v.file));
    /* כל קול בזמן השורה שלו → סכום הקולות → המוזיקה מונמכת כשהם מדברים */
    const delayed = voices.map((v, i) => `[${i + 2}:a]aresample=${SR},aformat=channel_layouts=mono,adelay=${Math.round(v.at * 1000)}|${Math.round(v.at * 1000)}[v${i}]`).join(';');
    const vin = voices.map((v, i) => `[v${i}]`).join('');
    const graph = `${delayed};${vin}amix=inputs=${voices.length}:normalize=0:dropout_transition=0[voice];` +
      `[voice]apad=whole_dur=${(p.seconds + 0.5).toFixed(2)}[vpad];[vpad]asplit[vkey][vmix];` +
      `[1:a]${gain}[bed];[bed][vkey]sidechaincompress=threshold=0.02:ratio=8:attack=80:release=600[duck];` +
      `[duck][vmix]amix=inputs=2:normalize=0[mix]`;
    args = args.concat(['-filter_complex', graph, '-map', '0:v:0', '-map', '[mix]']);
  }
  args = args.concat(['-c:v', 'copy', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', out]);
  const r = spawnSync(ffmpeg, args, { encoding: 'utf8' });
  if (r.status !== 0) { fs.rmSync(tmp, { recursive: true, force: true }); return { ok: false, err: r.stderr }; }
  fs.copyFileSync(out, mp4);
  fs.rmSync(tmp, { recursive: true, force: true });
  return { ok: true, seconds: p.seconds, voices: voices.length };
}

function videos() {
  return fs.existsSync(VID) ? fs.readdirSync(VID).filter(f => f.endsWith('.mp4')).sort() : [];
}

function main() {
  const args = process.argv.slice(2);
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) { console.log('✗ אין ffmpeg — FFMPEG=<נתיב> או ffmpeg ב-PATH'); process.exit(1); }
  if (args.includes('--check')) {
    let bad = 0;
    for (const f of videos()) {
      const p = probe(ffmpeg, path.join(VID, f));
      if (!p.audio) { console.log(`✗ ${f}: אין רצועת שמע — הרץ node marketing/media/audio.js`); bad++; }
    }
    console.log(`${videos().length} סרטונים, ${bad} בלי מוזיקה`);
    process.exit(bad ? 1 : 0);
  }
  const want = args.filter(a => !a.startsWith('-'));
  const list = want.length ? want.map(w => w.endsWith('.mp4') ? w : w + '.mp4') : videos();
  let bad = 0;
  for (const f of list) {
    const file = path.join(VID, f);
    if (!fs.existsSync(file)) { console.log(`✗ ${f}: אין קובץ`); bad++; continue; }
    const r = addMusic(ffmpeg, file);
    if (r.ok) console.log(`✓ ${f} — ${r.seconds.toFixed(1)}s, פד ב-${DB} dB${r.voices ? `, ${r.voices} קובצי קול` : ''}`);
    else { console.log(`✗ ${f}: ${String(r.err).split('\n')[0]}`); bad++; }
  }
  process.exit(bad ? 1 : 0);
}

if (require.main === module) main();
module.exports = { addMusic, findFfmpeg, probe };
