/* =====================================================================
   מנגנון 4 מול בחירת קול ידנית — `tutor/tutor.js`

   **הממצא, 17.9.2026.** `pickVoice` מחזיר את הקול שהלומד בחר
   **לפני** כל מיון, וזו הכוונה: מי שבחר קול ושומע אחר לא יבין
   למה, והשקט גרוע מקול לא-אידאלי. אבל הבחירה עקפה גם את
   `voiceUsable`, ולכן:

       לומד נועץ קול רשת  →  האינטרנט נופל  →  הקול שותק
       →  מנגנון 4 מכבה את הדגל ומנסה שוב
       →  `pickVoice` מחזיר **את אותו קול המת**

   הבלם היחיד היה `retried`, ולכן ללומד זה נשמע כשקט מוחלט —
   בדיוק מה שארבעת המנגנונים קיימים כדי למנוע.

   **למה כאן ולא ב-`voice.js`.** נכתבה שם בדיקה בדפדפן, והיא
   עברה ירוק **גם כשהבאג הוחזר** — כלומר לא הבחינה בין המצבים.
   `_netVoiceOK` פרטי למודול ואין לו איפוס ציבורי, ולכן בדפדפן
   אי אפשר להעמיד את המצב המדויק שבו הממצא חי. לפי כלל 3
   ב-`FINDINGS.md` — בדיקה שלא נראתה אדומה אינה בודקת כלום —
   היא הוסרה, וזו באה במקומה.

   כאן `tutor.js` רץ ב-`vm` עם `speechSynthesis` מזויף ועם
   `localStorage` שבשליטתנו, ולכן אפשר להעמיד בדיוק את שלושת
   המצבים ולשאול את `TUTOR._voice` מה הוא מחזיר. אין דפדפן,
   אין שרת, ואין תלות בתזמון.

   שבור → אדום, תוקן → ירוק — שני הפלטים ב-`FINDINGS.md`.
   ===================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'tutor', 'tutor.js');

const VOICES = [
  { name: 'Microsoft Avri Online (Natural)', lang: 'he-IL', voiceURI: 'net-avri',   localService: false },
  { name: 'Google עברית',                    lang: 'he-IL', voiceURI: 'loc-google', localService: true  },
  { name: 'Carmit',                          lang: 'he-IL', voiceURI: 'loc-carmit', localService: true  },
];

/* חלון מינימלי. `tutor.js` נוגע בהרבה דברים בטעינה, וכל מה שהוא
   צריך כאן הוא שלא ייפול — הבדיקה שואלת רק את בחירת הקול. */
function fakeWindow(pin) {
  const store = { 'tutor-voice-v1': JSON.stringify({ 'he-IL': pin }) };
  const el = () => ({
    style: {}, classList: { add(){}, remove(){}, toggle(){}, contains: () => false },
    appendChild(){}, setAttribute(){}, removeAttribute(){}, addEventListener(){},
    querySelector: () => null, querySelectorAll: () => [],
  });
  const win = {
    navigator: { onLine: true, language: 'he', userAgent: 'qa' },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v) },
      removeItem: k => { delete store[k] },
    },
    speechSynthesis: {
      getVoices: () => VOICES, speak(){}, cancel(){}, pause(){}, resume(){},
      speaking: false, pending: false, addEventListener(){}, onvoiceschanged: null,
    },
    SpeechSynthesisUtterance: function (t) { this.text = t },
    document: Object.assign(el(), {
      head: el(), body: el(), readyState: 'complete', createElement: el,
      addEventListener(){}, documentElement: el(),
    }),
    addEventListener(){}, removeEventListener(){},
    setTimeout, clearTimeout, setInterval, clearInterval, console,
    fetch: () => Promise.reject(new Error('אין רשת בבדיקה')),
    location: { href: 'http://127.0.0.1/', origin: 'http://127.0.0.1' },
    matchMedia: () => ({ matches: false, addEventListener(){}, addListener(){} }),
  };
  win.window = win;
  return win;
}

function pickWith(pin, online) {
  const win = fakeWindow(pin);
  const ctx = vm.createContext(win);
  vm.runInContext(fs.readFileSync(SRC, 'utf8'), ctx);
  if (!win.TUTOR || !win.TUTOR._voice) throw new Error('אין TUTOR._voice — החוזה השתנה');
  /* `_netVoiceOK` פרטי; `voiceUsable` בודק גם אותו וגם את
     `navigator.onLine`, ולכן ניתוק הרשת מעמיד את אותו מצב
     בדיוק מהצד שכן נגיש מבחוץ. */
  win.navigator.onLine = online;
  const v = win.TUTOR._voice('he-IL');
  return v ? v : null;
}

const CASES = [
  { pin: 'net-avri',   online: true,  net: true,  what: 'קול רשת נעוץ, הרשת פעילה' },
  { pin: 'net-avri',   online: false, net: false, what: 'קול רשת נעוץ, הרשת נותקה' },
  { pin: 'loc-carmit', online: false, net: false, what: 'קול מקומי נעוץ, הרשת נותקה', uri: 'loc-carmit' },
];

let bad = 0;
for (const c of CASES) {
  let v;
  try { v = pickWith(c.pin, c.online) }
  catch (e) { console.log('✗ ' + c.what + ' — ' + e.message); bad++; continue }

  if (!v) { console.log('✗ ' + c.what + ' — לא נבחר קול כלל'); bad++; continue }
  const isNet = v.localService === false;
  const kind = isNet ? 'רשת' : 'מקומי';

  if (isNet !== c.net) {
    bad++;
    console.log('✗ ' + c.what.padEnd(26) + ' → ' + v.voiceURI + ' (' + kind + ')' +
      (c.net ? ' — ציפינו לקול רשת' :
               ' — קול רשת נבחר כשאי אפשר להשתמש בו; הבחירה הידנית מנטרלת את מנגנון 4'));
    continue;
  }
  if (c.uri && v.voiceURI !== c.uri) {
    bad++;
    console.log('✗ ' + c.what.padEnd(26) + ' → ' + v.voiceURI +
      ' — הבחירה הידנית בקול מקומי נדרסה, והיא חייבת להישמר תמיד');
    continue;
  }
  console.log('✓ ' + c.what.padEnd(26) + ' → ' + v.voiceURI + ' (' + kind + ')');
}

console.log('\n' + CASES.length + ' מצבים, ' + bad + ' ממצאים');
process.exit(bad ? 1 : 0);
