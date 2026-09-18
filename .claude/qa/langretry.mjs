/* =====================================================================
   הניסיון החוזר על תרגום מילולי — `node .claude/qa/langretry.mjs`

   **למה זו בדיקה נפרדת מ-`hebrew.js`.** `hebrew.js` בודק ש-`badLang`
   קיים, שהוא מחובר ל-`bad()`, ושהטקסט שלנו עובר אותו. הוא **אינו**
   מוכיח שהמנגנון עובד: שפונקציה מחוברת אינה אותו דבר כמו מסלול
   שמסתיים בעברית תקינה אצל הלומד.

   כאן `handleAsk` רץ באמת, עם `fetchFn` מוזרק שמחזיר תשובות
   שנקבעו מראש. אין רשת, אין מפתח, ואין מודל — ולכן זה דטרמיניסטי
   וחינם.

   **שלושה מצבים, וחמש טענות:**

       תשובה תקינה מיד        →  בקשה אחת, בלי ניסיון מיותר
       תרגום מילולי ואז תקין  →  שתי בקשות, והנוסח אומר מה נשבר
       תרגום מילולי פעמיים    →  שתי בקשות בלבד, והלומד מקבל
                                 נוסח גיבוי ולא טקסט שבור

   הטענה השלישית היא העיקר: **בלי בלם, ״כתוב מחדש״ הוא לולאה.**
   `retried` שב-`speakSeg` ו-`out.text = ""` כאן הם אותו רעיון.

   **והרתמה הראשונה שכתבתי לזה נכשלה בשלוש טענות, והקוד היה
   תקין.** שלחתי `q` ו-`msgs`, ו-`readBody` דורש `screen` ו-
   `userText`/`messages` — כלומר 400, אפס בקשות למודל, ופלט
   שנראה כמו שומר שאינו עובד. זו הפעם החמישית בסשן הזה שמדידה
   שלי האשימה קוד תקין, ולכן שמות השדות מתועדים בגוף הבדיקה.
   ===================================================================== */
import { pathToFileURL } from 'url';
import path from 'path';

const W = await import(pathToFileURL(path.resolve('tutor-api/worker.js')).href);

function geminiReply(text) {
  return {
    ok: true, status: 200,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
    text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }),
  };
}

function harness(replies) {
  let i = 0;
  const sent = [];
  return {
    sent,
    fetchFn: async (url, opts) => {
      const u = String(url);
      /* גילוי מודלים — רשימה מינימלית */
      if (u.includes('?pageSize=')) {
        return {
          ok: true, status: 200,
          json: async () => ({ models: [{ name: 'models/gemini-3.6-flash',
            supportedGenerationMethods: ['generateContent'] }] }),
        };
      }
      sent.push(JSON.parse(opts.body));
      const t = replies[Math.min(i++, replies.length - 1)];
      return geminiReply(t);
    },
  };
}

async function run(name, replies) {
  const h = harness(replies);
  const env = { GEMINI_KEY: 'x', PROVIDER: 'gemini' };
  /* שמות השדות הם של `readBody`: `screen` ולא `q`, ו-`userText`
     או `messages` ולא `msgs`. הרתמה הראשונה שלי שלחה `q`/`msgs`,
     ו-`readBody` החזיר `null` — 400, אפס בקשות למודל, ושלוש
     טענות שנראו כמו כשל בשומר והיו כשל ברתמה. */
  const body = {
    app: 'math-app', lang: 'he', mode: 'chat',
    screen: { q: 'כמה הוא 3+4?', correct: '7', topic: 'חיבור' },
    userText: 'לא מבין',
    actions: [],
  };
  const req = new Request('https://x/josh', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const res = await W.handleAsk(req, env, {}, 'https://lagstein1-png.github.io', h.fetchFn);
  const out = await res.json();
  const say = out.say || out.text || '';
  console.log('\n--- ' + name);
  console.log('    בקשות למודל: ' + h.sent.length);
  const nudged = h.sent.length > 1 &&
    JSON.stringify(h.sent[1]).includes('תרגום מילולי');
  console.log('    הנוסח החוזר נוקב בתרגום מילולי: ' + (nudged ? 'כן' : 'לא'));
  console.log('    מה שהגיע ללומד: ' + JSON.stringify(say).slice(0, 110));
  console.log('    עובר את השומר: ' + (W.badLang(say, 'he') ? 'לא ✗' : 'כן ✓'));
  return { calls: h.sent.length, nudged, say };
}

const CALQUE = 'מה שנעשה זה להשתמש ברמז הראשון.';
const CLEAN  = 'בוא נתחיל מהרמז הראשון.';

const a = await run('תשובה תקינה מיד', [CLEAN]);
const b = await run('תרגום מילולי, ואז תקין', [CALQUE, CLEAN]);
const c = await run('תרגום מילולי פעמיים', [CALQUE, CALQUE]);

let bad = 0;
const ck = (ok, what) => { console.log((ok ? '✓ ' : '✗ ') + what); if (!ok) bad++ };
console.log('');
ck(a.calls === 1, 'תשובה תקינה — בקשה אחת, בלי ניסיון מיותר');
ck(b.calls === 2 && b.nudged, 'תרגום מילולי — ניסיון שני עם נוסח שאומר מה נשבר');
ck(!W.badLang(b.say, 'he'), 'אחרי הניסיון השני — הלומד מקבל עברית תקינה');
ck(!W.badLang(c.say, 'he'), 'נכשל פעמיים — לא מגיע ללומד טקסט שבור');
ck(c.calls === 2, 'נכשל פעמיים — שתי בקשות בלבד, ולא לולאה');
console.log('\n' + (bad ? bad + ' כשלים' : 'חמש הטענות עברו'));
process.exit(bad ? 1 : 0);
