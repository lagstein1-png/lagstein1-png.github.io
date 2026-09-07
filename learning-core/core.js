/* =====================================================================
   learning-core · core.js
   קוד משותף לאפליקציות הלימוד. Vanilla JS, אפס תלויות, אפס build.

   נטען בתגית <script> אחת ומייצא אובייקט אחד: window.LearningCore
   (ובקיצור window.LC). אין מודולים, אין import, אין bundler —
   הקובץ אמור לעבוד גם כשפותחים אותו משרת סטטי פשוט.

   מה יש כאן:
     1. עזרים כלליים
     2. אחסון עם מרחב שמות לפי שם אפליקציה
     3. שפות ותרגום ממשק (עברית / ערבית / אנגלית / רוסית)
     4. מילון KTIV לתיקוני הגייה
     5. מנוע ההקראה בשלוש שכבות
     6. שמירת התקדמות
     7. בנק טעויות ומקבץ תרגול
     8. ערבוב
     9. ניווט בין מסכים
    10. init

   מקורות: מנוע ההקראה נלקח מ"תאוריה מדברת", שהוא הבשל
   מבין השניים — מילון הגייה, מיפוי מילה-מול-מילה להדגשה, שומר זמן,
   ונפילה מקול רשת לקול מקומי. איחוד מקטעים זעירים ועצירת הקול
   ביציאה מהדף נלקחו מ-math-teen. שכבת ה-Gemini שב-math-teen לא
   נכנסה לכאן במכוון: היא דורשת מפתח API בתוך הדף, וזה אסור.
   ===================================================================== */
(function (global) {
  'use strict';

  var CORE_VERSION = '1.0.0';

  /* ===================================================================
     1. עזרים כלליים
     =================================================================== */

  /* המסמך, או null כשאין כזה. כל הגישות ל-DOM עוברות דרכו, ולכן
     אפשר לטעון את core.js גם ב-node ולהריץ עליו בדיקות לוגיקה
     בלי דפדפן — ראו test.js. */
  var DOC = (typeof document !== 'undefined') ? document : null;

  function isStr(x) { return typeof x === 'string'; }
  function nonEmpty(x) { return isStr(x) && x.trim() !== ''; }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* מסיר תגיות. כל טקסט שנשלח להקראה עובר כאן — אחרת מנוע ההקראה
     אומר בקול "span class" באמצע המשפט. */
  function plainText(s) {
    return String(s == null ? '' : s)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }

  /* ===================================================================
     2. אחסון — localStorage עם מרחב שמות לפי שם אפליקציה
     כל מפתח נשמר כ-  lc:<שם האפליקציה>:<מפתח>  , ולכן שתי אפליקציות
     על אותו origin (וזה בדיוק המצב ב-GitHub Pages) אינן דורסות זו את
     נתוני זו. במצב פרטי או ב-iframe שבו localStorage חסום — נופלים
     לזיכרון בלבד, והאפליקציה ממשיכה לעבוד בלי לזרוק שגיאה.
     =================================================================== */

  function makeStore(ns) {
    var mem = {}, ok = false;
    try {
      localStorage.setItem('__lc_probe', '1');
      localStorage.removeItem('__lc_probe');
      ok = true;
    } catch (e) { ok = false; }

    var pre = 'lc:' + ns + ':';

    return {
      namespace: ns,
      prefix: pre,
      persistent: ok,
      key: function (k) { return pre + k; },
      get: function (k) {
        try { return ok ? localStorage.getItem(pre + k)
                        : (Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null); }
        catch (e) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; }
      },
      set: function (k, v) {
        var s = String(v);
        try { if (ok) { localStorage.setItem(pre + k, s); } else { mem[k] = s; } }
        catch (e) { mem[k] = s; }   /* מכסה גם QuotaExceeded */
      },
      del: function (k) {
        try { if (ok) { localStorage.removeItem(pre + k); } } catch (e) {}
        delete mem[k];
      },
      getJSON: function (k, dflt) {
        var raw = this.get(k);
        if (raw == null) return dflt;
        try { var o = JSON.parse(raw); return o == null ? dflt : o; }
        catch (e) { return dflt; }   /* נתון פגום — מתחילים נקי, בלי לזרוק */
      },
      setJSON: function (k, o) { try { this.set(k, JSON.stringify(o)); } catch (e) {} },
      /* מוחק רק את המפתחות של האפליקציה הזאת. */
      clear: function () {
        mem = {};
        if (!ok) return;
        try {
          var doomed = [], i, k;
          for (i = 0; i < localStorage.length; i++) {
            k = localStorage.key(i);
            if (k && k.indexOf(pre) === 0) doomed.push(k);
          }
          for (i = 0; i < doomed.length; i++) localStorage.removeItem(doomed[i]);
        } catch (e) {}
      }
    };
  }

  /* מרחב השמות האמיתי נקבע ב-init. עד אז יש מרחב זמני, כדי ששימוש
     מוקדם לא יזרוק. */
  var store = makeStore('app');

  /* ===================================================================
     3. שפות ותרגום ממשק
     =================================================================== */

  var LANGS = {
    he: { dir: 'rtl', tts: 'he-IL', name: 'עברית' },
    ar: { dir: 'rtl', tts: 'ar-SA', name: 'العربية' },
    en: { dir: 'ltr', tts: 'en-US', name: 'English' },
    ru: { dir: 'ltr', tts: 'ru-RU', name: 'Русский' }
  };

  var i18n = {
    lang: 'he',
    fallback: 'he',
    strings: { he: {}, ar: {}, en: {}, ru: {} },
    listeners: []
  };

  /* טבלת מחרוזות בצורה  {he:{key:val}, ar:{...}}  */
  function addStrings(table) {
    if (!table) return;
    Object.keys(table).forEach(function (lang) {
      if (!i18n.strings[lang]) i18n.strings[lang] = {};
      var src = table[lang] || {};
      Object.keys(src).forEach(function (k) { i18n.strings[lang][k] = src[k]; });
    });
  }

  /* שרשרת נפילה: השפה הנוכחית ← שפת הבסיס ← המפתח עצמו.
     מפתח שאין לו תרגום מוצג כמו שהוא ולא כ-undefined, כדי
     שמחרוזת חסרה תיראה על המסך ולא תעלים את הכפתור. */
  function t(key, vars) {
    var tbl = i18n.strings[i18n.lang] || {};
    var out = tbl[key];
    if (out == null) {
      var fb = i18n.strings[i18n.fallback] || {};
      out = fb[key];
    }
    if (out == null) out = key;
    if (typeof out === 'function') return out(vars);
    if (vars) {
      out = String(out).replace(/\{(\w+)\}/g, function (m, name) {
        return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : m;
      });
    }
    return out;
  }

  function setLang(lang, opts) {
    if (!LANGS[lang]) return i18n.lang;
    i18n.lang = lang;
    store.set('lang', lang);
    try {
      if (DOC) {
        DOC.documentElement.setAttribute('lang', lang);
        DOC.documentElement.setAttribute('dir', LANGS[lang].dir);
      }
    } catch (e) {}
    /* השפה השתנתה — הקול הנוכחי כבר לא מתאים לטקסט שעל המסך. */
    try { tts.stop(); } catch (e) {}
    tts.lang = lang;
    tts.pickedVoice = null;
    if (!(opts && opts.silent)) {
      i18n.listeners.forEach(function (fn) { try { fn(lang); } catch (e) {} });
    }
    return lang;
  }

  function onLangChange(fn) { if (typeof fn === 'function') i18n.listeners.push(fn); }

  /* ===================================================================
     4. מילון KTIV — תיקוני הגייה
     ---------------------------------------------------------------
     המנוע קורא כתיב חסר לא נכון: "אָדֹם" בלי ניקוד הוא "אדם", והמנוע
     אומר "אָדָם". המילון מחזיר את המילה לצורה שנשמעת נכון — כתיב מלא
     או ניקוד, לפי מה שעובד באותה מילה.

     הבאג שלא הועתק לכאן:
     ב"תאוריה מדברת" יש שני מסלולים שמפעילים את אותה טבלה בשתי דרכים.
     במסלול שבתוך האפליקציה (speechMap) האסימון מנוקה מניקוד לפני
     החיפוש, ולכן "רֶכֶב" מוצא את המפתח 'רכב'. במסלול הבנייה
     (tools/ktiv.js, applyKtiv) החיפוש נעשה על האסימון הגולמי —
     KTIV[w] — ולכן מילה שכבר נוקדה בשלב קודם אינה מוצאת מפתח כלל,
     והמילון פשוט לא חל עליה. אותה טבלה, שתי התנהגויות.

     כאן יש חיפוש אחד: גם המפתחות במילון וגם האסימון הנבדק מנוקים
     מניקוד לפני ההשוואה. לכן "רכב", "רֶכֶב" ו-"רֶ֫כֶב" מגיעים כולם
     לאותה רשומה, ואפשר גם לרשום מפתח מנוקד במילון בלי לשבור דבר.
     =================================================================== */

  /* טווח הניקוד והטעמים בעברית */
  var NIQQUD = /[֑-ׇ]/g;

  function stripNiqqud(s) { return String(s == null ? '' : s).replace(NIQQUD, ''); }

  /* גבול מילה: כל רצף שאינו אות, ספרה או סימן משולב.
     \p{M} משאיר את הניקוד בתוך המילה ולא שובר אותה; מקף וגרשיים הם
     מפרידים, ולכן "דו-סטרי" הוא שתי מילים ומגיע אליו חוק ההגייה.
     יש מנועי JS ישנים שאין בהם \p{...} — שם נופלים לתבנית פשוטה. */
  var WORD_SPLIT, SEP_ONLY;
  try {
    WORD_SPLIT = new RegExp('([^\\p{L}\\p{N}\\p{M}]+)', 'u');
    SEP_ONLY = new RegExp('^[^\\p{L}\\p{N}\\p{M}]+$', 'u');
  } catch (e) {
    WORD_SPLIT = /([^0-9A-Za-z֐-׿؀-ۿЀ-ӿ]+)/;
    SEP_ONLY = /^[^0-9A-Za-z֐-׿؀-ۿЀ-ӿ]+$/;
  }

  /* הטבלה הבסיסית. מפתח = המילה בלי ניקוד. ערך = איך היא נאמרת.
     כל אפליקציה מוסיפה את שלה עם LC.ktiv.add().

     המקור: ב"תאוריה מדברת" יש *שתי* טבלאות KTIV שאינן זהות — אחת בתוך
     index.html ואחת ב-tools/ktiv.js, והן נבדלות בשבעה ערכים
     (חצייה, החצייה, בחצייה, לחצייה, צומת, לנסוע, מותר). בפועל רצה
     זו של tools: היא מיוצאת ל-data/speech-rules.json, הקובץ נטען
     מראש, והקוד מעדיף אותו על הטבלה שבדף (R.ktiv || KTIV). היא גם
     זו שנצרבה להקלטות ה-MP3.
     לכן נלקחו כאן הערכים של tools/ktiv.js, ולא אלה שבדף. בכל שבעת
     המקרים הם אותו כלל: כתיב מלא עם ו' או י' עדיף על ניקוד טהור,
     מפני שמנוע שממפה אותיות לצליל נשבר על ניקוד במקום להיעזר בו. */
  var KTIV_BASE = {
    /* כתיב חסר ← כתיב מלא */
    'לעצר': 'לעצור', 'בעצר': 'בעצור', 'לעבר': 'לעבור', 'לצפר': 'לצפור',
    'האדמה': 'האדומה', 'רטב': 'רטוב', 'ברטב': 'ברטוב',
    'מתמן': 'מתומן', 'משלש': 'משולש', 'המשלש': 'המשולש', 'החד': 'החוד',
    'מצין': 'מצוין', 'מאד': 'מאוד', 'הרוח': 'הרווח',
    'כוון': 'כיוון', 'לכוון': 'לכיוון', 'מלה': 'מילה', 'המלה': 'המילה',
    'עגול': 'עיגול',
    /* מילים שהמנוע קורא בהטעמה שגויה — כאן הניקוד הוא התיקון */
    'חצייה': 'חֲצִיָּיה', 'החצייה': 'הַחֲצִיָּיה', 'בחצייה': 'בַּחֲצִיָּיה', 'לחצייה': 'לַחֲצִיָּיה',
    'תמרור': 'תַּמְרוּר', 'תמרורים': 'תַּמְרוּרִים',
    'רמזור': 'רַמְזוֹר', 'רמזורים': 'רַמְזוֹרִים', 'צומת': 'צוֹמֶת',
    'נסע': 'נָסַע', 'לנסוע': 'לִנְסוֹעַ', 'עבר': 'עָבַר', 'לעבור': 'לַעֲבוֹר',
    'ירד': 'יָרַד', 'לרדת': 'לָרֶדֶת', 'עלה': 'עָלָה', 'לעלות': 'לַעֲלוֹת',
    'מהר': 'מַהֵר', 'חצי': 'חֲצִי', 'דרך': 'דֶּרֶךְ',
    'בנסיעה': 'בִּנְסִיעָה', 'כבש': 'כֶּבֶשׁ', 'מהירות': 'מְהִירוּת',
    'עצירה': 'עֲצִירָה', 'לעצור': 'לַעֲצוֹר', 'בעצירה': 'בַּעֲצִירָה',
    'אסור': 'אָסוּר', 'מותר': 'מוּתָּר', 'חובה': 'חוֹבָה',
    'רכב': 'רֶכֶב', 'הרכב': 'הָרֶכֶב', 'ברכב': 'בָּרֶכֶב',
    'כביש': 'כְּבִישׁ', 'הכביש': 'הַכְּבִישׁ', 'בכביש': 'בַּכְּבִישׁ',
    'נהג': 'נַהָג', 'הנהג': 'הַנַּהָג', 'לנהוג': 'לִנְהוֹג'
  };

  var ktivTable = Object.create(null);

  /* המפתח נשמר תמיד בלי ניקוד — זו כל התרופה לבאג שלמעלה. */
  function ktivAdd(map) {
    if (!map) return;
    Object.keys(map).forEach(function (k) {
      var bare = stripNiqqud(k).trim();
      if (bare) ktivTable[bare] = String(map[k]);
    });
  }
  ktivAdd(KTIV_BASE);

  function ktivLookup(word) {
    var bare = stripNiqqud(word);
    return Object.prototype.hasOwnProperty.call(ktivTable, bare) ? ktivTable[bare] : null;
  }

  /* מחיל את המילון על טקסט שלם, מילה שלמה בלבד — כדי ש"רכב" לא ייגע
     ב"הרכבת". עובד זהה על טקסט מנוקד ועל טקסט לא מנוקד. */
  function ktivApply(text) {
    var s = String(text == null ? '' : text);
    if (!s) return '';
    return s.split(WORD_SPLIT).map(function (tok) {
      if (!tok || SEP_ONLY.test(tok)) return tok;
      var hit = ktivLookup(tok);
      return hit === null ? tok : hit;
    }).join('');
  }

  /* ===================================================================
     5. מנוע ההקראה — שלוש שכבות
     ---------------------------------------------------------------
     שכבה 1: קובץ MP3 סטטי שהוכן מראש. עובד אופליין, נשמע הכי טוב,
             עלות שוטפת אפס. הנתיב:  <base>/<שפה>/<קול>/<מזהה>.mp3
             המזהה נגזר מהטקסט עצמו, ולכן עריכת ניסוח יוצרת מזהה חדש
             ולעולם לא מנוגן קובץ ישן על טקסט שהשתנה.
     שכבה 2: speechSynthesis של המכשיר. תמיד קיים, איכות משתנה.
     שכבה 3: אין הקראה בכלל (דפדפן בלי המנוע, או שהמנוע נכשל) —
             מדווחים למי שקרא ומסמנים את הטקסט כ"נקרא", כדי שהתור
             לא ייתקע והכפתור לא יקפא. בלי השכבה הזאת האפליקציה
             פשוט שותקת ואי אפשר לדעת למה.

     כל שכבה שנכשלת נופלת לזו שאחריה, בלי הודעת שגיאה למשתמש.
     =================================================================== */

  var synth = (typeof window !== 'undefined' && window.speechSynthesis) || null;

  var tts = {
    lang: 'he',
    rate: 1,
    enabled: true,
    pickedVoice: null,
    /* שכבה 1 */
    staticOn: false,
    staticBase: 'audio',
    staticVoice: '',
    staticMissing: null,   /* Set של כתובות שכבר התבררו כחסרות */
    /* מצב */
    speaking: false,
    lastTier: '',
    el: null,              /* אלמנט Audio אחד וקבוע — ראו TTS_UNLOCK */
    audio: null,
    onTier: null           /* callback אופציונלי: מי דיבר בפועל */
  };

  var manualStop = false;
  /* שני מונים ולא אחד. speakGen שייך לאמירה בודדת, queueGen לתור.
     כשהיה מונה אחד, ttsSpeak שנקרא מתוך התור קידם אותו — והתור מצא
     שהדור שלו כבר לא עדכני ועצר את עצמו אחרי הפריט הראשון. */
  var speakGen = 0;
  var queueGen = 0;
  var speakTimer = null;
  /* Chrome אוסף utterance שאין אליו הפניה, ואיתו נעלמים onend
     ו-onboundary — וההקראה "נתקעת" באמצע. */
  var activeUtterance = null;

  function safeVoices() {
    try { return (synth && synth.getVoices()) || []; }
    catch (e) { return []; }
  }

  /* ---- 5.1 המתנה ל-voiceschanged ----
     getVoices מחזיר רשימה ריקה עד שהמנוע נטען, ורק אז נורה
     voiceschanged. מי שמקריא לפני כן מקבל את קול ברירת המחדל של
     הדפדפן — לרוב אנגלי, גם כשמותקן קול עברי טוב.
     שלוש הגנות יחד: האירוע עצמו, דגימה לדפדפנים שלא יורים אותו
     (Safari), ותקרת זמן כדי שלא ניתקע בהמתנה לנצח. */
  var voicesPromise = null;
  function voicesReady() {
    if (voicesPromise) return voicesPromise;
    voicesPromise = new Promise(function (resolve) {
      if (!synth) { resolve([]); return; }
      var poll = null, cap = null, done = false;
      function finish() {
        if (done) return;
        done = true;
        if (poll) clearInterval(poll);
        if (cap) clearTimeout(cap);
        try { synth.removeEventListener('voiceschanged', finish); } catch (e) {}
        tts.pickedVoice = pickVoice();
        resolve(safeVoices());
      }
      if (safeVoices().length) { finish(); return; }
      try { synth.addEventListener('voiceschanged', finish); } catch (e) {}
      poll = setInterval(function () { if (safeVoices().length) finish(); }, 120);
      cap = setTimeout(finish, 4000);
    });
    return voicesPromise;
  }

  /* הרשימה משתנה גם אחרי הטעינה הראשונה — התקנת קול חדש או החלפת
     מנוע במערכת. מרעננים את הבחירה, לא רק בפעם הראשונה. */
  if (synth) {
    try {
      synth.addEventListener('voiceschanged', function () {
        tts.pickedVoice = pickVoice();
      });
    } catch (e) {}
  }

  /* ---- 5.2 בחירת קול ----
     מדרגים ולא לוקחים את הראשון: במכשיר אחד יושבים כמה קולות באותה
     שפה באיכות שונה מאוד, והראשון ברשימה הוא לרוב של יצרן המכשיר.
     אין קול בשפה הנכונה? מחזירים null ולא קול בשפה אחרת — קול אנגלי
     שקורא עברית הוא רעש, וזה גרוע מקול ברירת מחדל בינוני. */
  var LANG_HINT = {
    he: /עברית|hebrew|ivrit/i,
    ar: /العربية|arabic/i,
    en: /english/i,
    ru: /русский|russian/i
  };
  var FEMALE_VOICE = /(female|woman|#female|\bfem\b|carmit|hila|\bmiri\b|\bdana\b|shira|samantha|karen|moira|tessa|serena|victoria|\bava\b|allison|susan|vicki|nicky|\bzoe\b|fiona|\bkate\b|shelley|zira|hazel|aria|jenny|michelle|\bana\b|\beva\b|emma|libby|sonia|natasha|clara|irina|milena|svetlana|\belena\b|katja|ekaterina|tatyana|hoda|salma|amina|\bhala\b|noura|laila|layla|fatima|zeina|maryam|asma|heera|raveena|neerja)/i;
  var MALE_VOICE = /(\bmale\b|\bman\b|#male|asaf|avri|yoni|moshe|\balex\b|daniel|\bfred\b|\btom\b|aaron|arthur|oliver|rishi|gordon|\blee\b|ralph|bruce|david|\bmark\b|\bguy\b|ryan|christopher|\beric\b|brian|andrew|roger|liam|william|george|james|\bthomas\b|benjamin|dmitry|pavel|\byuri\b|maxim|nikolai|maged|tarik|hamed|shakir|\bomar\b|tarek|\bali\b|saleh|abdullah|yasser|hemant|madhur)/i;
  var PREFER_FEMALE = true;
  /* נכבה ברגע שקול רשת נכשל, ואז הדירוג מעדיף מקומי לשארית הסשן. */
  var netVoiceOK = true;

  function voiceScore(v, code, base, hint) {
    var lang = String(v.lang || '').replace('_', '-');
    var s = 0;
    if (lang === code) s += 10;                          /* he-IL מדויק */
    else if (lang.split('-')[0] === base) s += 8;        /* he כללי */
    else if (hint && hint.test(v.name || '')) s += 1;    /* רק השם רומז */
    else return -99;

    var n = v.name || '';
    if (/google/i.test(n)) s += 4;
    if (/microsoft/i.test(n)) s += 4;
    if (/natural|enhanced|premium|neural|wavenet/i.test(n)) s += 2;
    /* קול רשת נשמע טוב יותר אבל שותק בלי אינטרנט. באפליקציה שמבטיחה
       עבודה אופליין זה קריטי. */
    if (v.localService === false) {
      s += (netVoiceOK && navigator.onLine !== false) ? 2 : -8;
    }
    if (/espeak|compact|pico/i.test(n)) s -= 6;
    if (PREFER_FEMALE) {
      if (FEMALE_VOICE.test(n)) s += 2;
      else if (MALE_VOICE.test(n)) s -= 1;
    }
    return s;
  }

  function pickVoice(lang) {
    var use = lang || tts.lang;
    var cfg = LANGS[use] || LANGS.he;
    var list = safeVoices();
    if (!list.length) return null;
    var code = cfg.tts, base = code.split('-')[0], hint = LANG_HINT[use] || null;
    var best = null, bestScore = -1, i, s;
    for (i = 0; i < list.length; i++) {
      try { s = voiceScore(list[i], code, base, hint); } catch (e) { continue; }
      if (s > bestScore) { best = list[i]; bestScore = s; }
    }
    return bestScore >= 0 ? best : null;
  }

  /* ---- 5.3 שחרור הקול במגע הראשון (iOS) ----
     בלי זה אין קול בנייד בכלל, ובשקט: ב-iOS ההיתר להשמיע תלוי באישור
     משתמש שתקף רק בתוך ה-handler של המגע. שני מסלולי ההקראה כאן
     מאבדים אותו — הקובץ המוקלט מושמע אחרי fetch, וקול המכשיר אחרי
     voicesReady(). שניהם נדחים בלי חריגה ובלי לוג. */
  var SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
  function installUnlock() {
    if (!DOC) return;
    DOC.addEventListener('pointerdown', function unlock() {
      try {
        if (!tts.el) tts.el = new Audio();
        tts.el.src = SILENT_WAV;
        var pr = tts.el.play();
        if (pr && pr.then) {
          pr.then(function () { try { tts.el.pause(); tts.el.currentTime = 0; } catch (e) {} },
                  function () {});
        }
      } catch (e) {}
      /* קריאה ישירה, בלי await — הבטחה שוברת את שרשרת המגע
         ו-Safari כבר לא מזהה את האמירה כיוזמת משתמש. */
      try { if (synth) synth.speak(new SpeechSynthesisUtterance('')); } catch (e) {}
    }, { once: true });
  }

  /* ---- 5.4 עצירה ביציאה מהדף ----
     עוזבים את הטאב והקול ממשיך ברקע, ולפעמים נתקע עד סגירת הדפדפן.
     synth.cancel() כאן הוא מה שמונע את זה. */
  function installVisibility() {
    if (!DOC) return;
    DOC.addEventListener('visibilitychange', function () {
      if (DOC.hidden) {
        ttsStop();
        try { if (synth) synth.cancel(); } catch (e) {}
      }
    });
    window.addEventListener('pagehide', function () {
      try { if (synth) synth.cancel(); } catch (e) {}
    });
  }

  /* ---- 5.5 שומר-ער ל-Chrome בשולחן העבודה ----
     באג ותיק: ההקראה נחתכת אחרי ~15 שניות. pause+resume תקופתי מחזיק
     את המנוע ער. במובייל אין את הבאג ופעולה כזאת דווקא מקרטעת שם. */
  var NEEDS_KEEPALIVE = typeof navigator !== 'undefined' &&
    /Chrome|Chromium|Edg\//.test(navigator.userAgent) &&
    !/Android|Mobile/i.test(navigator.userAgent);
  var keepAliveTimer = null;
  function startKeepAlive() {
    if (!NEEDS_KEEPALIVE || !synth || keepAliveTimer) return;
    keepAliveTimer = setInterval(function () {
      try {
        if (!synth.speaking) { stopKeepAlive(); return; }
        if (synth.paused) return;           /* עצירה מכוונת — לא נוגעים */
        synth.pause(); synth.resume();
      } catch (e) { stopKeepAlive(); }
    }, 9000);
  }
  function stopKeepAlive() {
    if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
  }
  function maybeStopKeepAlive() {
    try { if (synth && (synth.speaking || synth.pending)) return; } catch (e) {}
    stopKeepAlive();
  }

  /* ---- 5.6 פיצול לאמירות קצרות ----
     מנועי מכשיר מאיצים ובולעים סופי מילים במשפט ארוך. הסף כאן הוא
     120 תווים: קודם חותכים על סוף משפט, ורק מקטע שנשאר ארוך מזה
     נחתך שוב — על פסיק, ואם אין, על רווח. לעולם לא באמצע מילה.
     כל מקטע נושא את ההיסט שלו במחרוזת המלאה, כי charIndex מתאפס
     בכל אמירה ובלעדיו ההדגשה קופצת לתחילת המשפט בכל מקטע. */
  var SEG_MAX = 120;
  var SEG_GAP = 260;      /* הפסקה בין מקטעים, במילישניות */
  var SENTENCE_END = '.!?:;';

  /* סימן פיסוק בין שתי ספרות הוא חלק מהמספר — מפריד אלפים או נקודה
     עשרונית — ולא מקום לחתוך בו. בלי זה "3,500" נשבר לשניים והמנוע
     קורא "שלוש, חמש מאות". */
  function insideNumber(str, i) {
    return i > 0 && i + 1 < str.length &&
           /[0-9]/.test(str[i - 1]) && /[0-9]/.test(str[i + 1]);
  }

  function segments(spoken) {
    var out = [], parts = [], from = 0, i, j, k;
    function push(txt, start) { if (String(txt).trim()) out.push({ text: txt, start: start }); }

    /* שלב א: על סוף משפט. הסימן נשאר עם המקטע שלפניו. */
    for (i = 0; i < spoken.length; i++) {
      if (SENTENCE_END.indexOf(spoken[i]) < 0) continue;
      if (insideNumber(spoken, i)) continue;          /* 3.5 אינו סוף משפט */
      j = i + 1;
      while (j < spoken.length && /\s/.test(spoken[j])) j++;
      parts.push({ text: spoken.slice(from, j), start: from });
      from = j;
      i = j - 1;
    }
    if (from < spoken.length) parts.push({ text: spoken.slice(from), start: from });

    /* שלב ב: מקטע שעדיין ארוך מהסף — על פסיק, ואם אין, על רווח. */
    for (k = 0; k < parts.length; k++) {
      var p = parts[k];
      if (p.text.length <= SEG_MAX) { push(p.text, p.start); continue; }
      var rest = p.text, base = p.start;
      while (rest.length > SEG_MAX) {
        var cut = rest.lastIndexOf(',', SEG_MAX);
        while (cut > 0 && insideNumber(rest, cut)) cut = rest.lastIndexOf(',', cut - 1);
        if (cut < SEG_MAX * 0.4) cut = rest.lastIndexOf(' ', SEG_MAX);
        if (cut <= 0) break;                          /* מילה אחת ארוכה — משאירים שלמה */
        push(rest.slice(0, cut + 1), base);
        base += cut + 1;
        rest = rest.slice(cut + 1);
      }
      push(rest, base);
    }

    /* שלב ג: מקטע זעיר — "12." או ")" — עם הפסקה של רבע שנייה אחריו
       נשמע כמו גמגום. מאחדים אותו לשכן. */
    var merged = [];
    for (i = 0; i < out.length; i++) {
      if (merged.length && out[i].text.trim().length < 12 &&
          merged[merged.length - 1].text.length + out[i].text.length <= SEG_MAX * 1.4) {
        merged[merged.length - 1].text += out[i].text;
        continue;
      }
      if (out[i].text.trim().length < 12 && i + 1 < out.length) {
        out[i + 1] = { text: out[i].text + out[i + 1].text, start: out[i].start };
        continue;
      }
      merged.push(out[i]);
    }

    return merged.length ? merged : [{ text: spoken, start: 0 }];
  }

  /* ---- 5.7 שכבה 1: קובץ MP3 סטטי ----
     המזהה נגזר מהתוכן ולא מהמיקום במאגר: טקסט זהה בשתי שאלות מקבל
     קובץ אחד, ועריכת ניסוח יוצרת מזהה חדש. הכלי שמייצר את הקבצים
     חייב להשתמש בדיוק באותה פונקציה. */
  function audioId(text) {
    var s = String(text).trim().replace(/\s+/g, ' ');
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57, i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 2654435761);
      h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  function staticUrl(text, lang) {
    if (!tts.staticOn || !tts.staticVoice) return null;
    var url = tts.staticBase + '/' + (lang || tts.lang) + '/' + tts.staticVoice +
              '/' + audioId(text) + '.mp3';
    if (!tts.staticMissing) tts.staticMissing = {};
    return tts.staticMissing[url] ? null : url;
  }

  /* מנסה למשוך קובץ מוקלט. מחזיר Blob, או null אם אין קובץ כזה.
     כתובת שכבר נכשלה אינה מנוסה שוב — אחרת כל שאלה משלמת עוד 404. */
  function fetchStatic(text, lang) {
    var url = staticUrl(text, lang);
    if (!url) return Promise.resolve(null);
    return fetch(url).then(function (r) {
      if (!r.ok) { tts.staticMissing[url] = 1; return null; }
      return r.blob();
    }).then(function (b) {
      /* קובץ ריק או דף שגיאה שהוגש כ-200 */
      if (!b || b.size < 512) { tts.staticMissing[url] = 1; return null; }
      return b;
    }).catch(function () { tts.staticMissing[url] = 1; return null; });
  }

  /* בודקים פעם אחת אם באמת יש קבצים. בלי זה כל משפט מנסה fetch,
     נכשל, וממתין — עיכוב לפני כל הקראה. */
  function probeStatic(sampleText, opts) {
    opts = opts || {};
    tts.staticBase = opts.base || tts.staticBase;
    tts.staticVoice = opts.voice || tts.staticVoice;
    tts.staticMissing = {};
    if (!nonEmpty(sampleText) || !tts.staticVoice) {
      tts.staticOn = false;
      return Promise.resolve(false);
    }
    var url = tts.staticBase + '/' + tts.lang + '/' + tts.staticVoice +
              '/' + audioId(sampleText) + '.mp3';
    return fetch(url, { method: 'HEAD' })
      .then(function (r) { tts.staticOn = !!(r && r.ok); return tts.staticOn; })
      .catch(function () { tts.staticOn = false; return false; });
  }

  /* ---- 5.8 שכבה 2: קול המכשיר ---- */
  var VOICE_TUNE = { he: 0.82, ar: 0.85, en: 0.90, ru: 0.88 };
  function tuneRate(lang) {
    var b = VOICE_TUNE[String(lang || 'he').split('-')[0]] || 0.88;
    return clamp(Math.round(b * (tts.rate || 1) * 100) / 100, 0.5, 1.6);
  }

  function speakDevice(text, opts) {
    opts = opts || {};
    var onDone = opts.onDone, onError = opts.onError, onWord = opts.onWord;

    if (!synth) { tierFallback(text, opts); return; }

    voicesReady().then(function () {
      speakDeviceNow(text, opts, onDone, onError, onWord);
    }).catch(function () {
      tierFallback(text, opts);
    });
  }

  function speakDeviceNow(text, opts, onDone, onError, onWord) {
    var u = null, watchdog = null, finished = false, retried = false;
    var lang = opts.lang || tts.lang;

    function finish(failed) {
      if (finished) return;
      finished = true;
      if (watchdog) { clearInterval(watchdog); watchdog = null; }
      if (activeUtterance === u) activeUtterance = null;
      maybeStopKeepAlive();
      tts.speaking = false;
      if (failed) { if (onError) onError(); else if (!manualStop && onDone) onDone(); return; }
      if (!manualStop && onDone) onDone();
    }

    /* יש מכשירים שבהם onend פשוט לא נורה. בלי השומר הזה התור נתקע
       וכפתור ההשמעה קופא. */
    function armWatchdog() {
      var idle = 0;
      watchdog = setInterval(function () {
        var busy = false;
        try { busy = !!(synth.speaking || synth.pending); } catch (e) {}
        if (busy) { idle = 0; return; }
        if (++idle >= 4) finish(false);
      }, 1000);
    }

    try {
      if (!tts.pickedVoice) tts.pickedVoice = pickVoice(lang);
      var v = tts.pickedVoice;
      var segs = segments(String(text));
      var si = 0, seg = segs[0];

      u = new SpeechSynthesisUtterance(seg.text);
      /* כשנפלנו לקול בשפה אחרת, u.lang חייב להתאים לקול עצמו — אחרת
         חלק מהמנועים מתבלבלים ושותקים לגמרי. */
      u.lang = ((v && v.lang) || (LANGS[lang] || LANGS.he).tts).replace('_', '-');
      u.rate = tuneRate(u.lang);
      /* אין קול נשי בשפה הזאת במכשיר? מרימים את הגובה. לא קול נשי
         אמיתי, אבל זו הדרך היחידה בדפדפן להתקרב בלי הקלטות. */
      var male = v && MALE_VOICE.test(v.name || '') && !FEMALE_VOICE.test(v.name || '');
      u.pitch = male ? 1.35 : 1;
      u.volume = 1;
      if (v) { try { u.voice = v; } catch (e) {} }

      if (onWord) {
        u.onboundary = function (ev) {
          if (ev && ev.name && ev.name !== 'word') return;
          try { onWord(seg.start + (ev ? ev.charIndex : 0)); } catch (e) {}
        };
      }

      /* סוף מקטע אינו סוף ההקראה. מקדמים, ורק אחרי האחרון מסיימים.
         ההפסקה ביניהם מונעת מהמנוע לרוץ קדימה ולבלוע סופי מילים. */
      u.onend = function () {
        if (finished || manualStop) return;
        if (si + 1 >= segs.length) { finish(false); return; }
        si++;
        seg = segs[si];
        setTimeout(function () {
          if (finished || manualStop) return;
          try {
            var nu = new SpeechSynthesisUtterance(seg.text);
            nu.lang = u.lang; nu.rate = u.rate; nu.pitch = u.pitch; nu.volume = 1;
            if (u.voice) nu.voice = u.voice;
            nu.onboundary = u.onboundary;
            nu.onend = u.onend;
            nu.onerror = u.onerror;
            u = nu;
            activeUtterance = u;
            synth.speak(u);
          } catch (e) { finish(true); }
        }, SEG_GAP);
      };

      u.onerror = function (ev) {
        var err = (ev && ev.error) || '';
        /* ביטול יזום אינו תקלה — stopSpeech או תור חדש כבר ניקו אחריו */
        var real = !(err === 'canceled' || err === 'interrupted');

        /* קול רשת שנכשל פירושו כמעט תמיד שאין אינטרנט. עוברים לקול
           מקומי וחוזרים על אותו משפט, פעם אחת. */
        if (real && !retried && v && v.localService === false) {
          retried = true;
          netVoiceOK = false;
          finished = true;
          if (watchdog) { clearInterval(watchdog); watchdog = null; }
          if (activeUtterance === u) activeUtterance = null;
          tts.pickedVoice = pickVoice(lang);
          speakDeviceNow(text, opts, onDone, onError, onWord);
          return;
        }
        finish(real);
      };

      tts.lastTier = 'device';
      if (tts.onTier) { try { tts.onTier('device', text); } catch (e) {} }
      activeUtterance = u;
      tts.speaking = true;
      try { if (synth.paused) synth.resume(); } catch (e) {}
      synth.speak(u);
      startKeepAlive();
      armWatchdog();
    } catch (e) {
      finish(true);
    }
  }

  /* ---- 5.9 שכבה 3: אין הקראה ----
     לא זורקים, לא מציגים שגיאה, ולא נתקעים: מדווחים מי לא דיבר
     ומסיימים את הפריט, כדי שהתור ימשיך והכפתור יחזור למצב "נגן". */
  function tierFallback(text, opts) {
    tts.lastTier = 'none';
    tts.speaking = false;
    if (tts.onTier) { try { tts.onTier('none', text); } catch (e) {} }
    if (!manualStop && opts && opts.onDone) opts.onDone();
  }

  /* ---- 5.10 נקודת הכניסה היחידה ---- */
  function ttsSpeak(rawText, opts) {
    opts = opts || {};
    var text = plainText(rawText);
    if (!tts.enabled || !nonEmpty(text)) {
      if (opts.onDone) opts.onDone();
      return;
    }
    /* המילון חל כאן, פעם אחת, על כל טקסט שנשלח להקראה. */
    var spoken = (opts.lang || tts.lang) === 'he' ? ktivApply(text) : text;
    var lang = opts.lang || tts.lang;

    manualStop = false;
    var gen = ++speakGen;

    function fallbackToDevice() {
      if (manualStop || gen !== speakGen) return;
      speakDevice(spoken, {
        lang: lang,
        onWord: opts.onWord,
        onDone: opts.onDone,
        onError: function () { tierFallback(text, opts); }
      });
    }

    fetchStatic(text, lang).then(function (blob) {
      if (manualStop || gen !== speakGen) return;
      if (!blob) { fallbackToDevice(); return; }

      var url = URL.createObjectURL(blob);
      /* משתמשים באלמנט ששוחרר במגע, ולא יוצרים חדש — אחרת ב-iOS
         ה-play() נדחה, וגם הנפילה לקול המכשיר נדחית, והתוצאה שקט. */
      if (!tts.el) tts.el = new Audio();
      var a = tts.el;
      a.onended = null; a.onerror = null;
      a.src = url;
      a.playbackRate = tts.rate;
      tts.audio = a;
      tts.lastTier = 'static';
      tts.speaking = true;
      if (tts.onTier) { try { tts.onTier('static', text); } catch (e) {} }

      function cleanup() {
        try { URL.revokeObjectURL(url); } catch (e) {}
        if (tts.audio === a) tts.audio = null;
        tts.speaking = false;
      }
      a.onended = function () { cleanup(); if (!manualStop && opts.onDone) opts.onDone(); };
      a.onerror = function () { cleanup(); fallbackToDevice(); };
      a.play().catch(function () { cleanup(); fallbackToDevice(); });
    }).catch(fallbackToDevice);
  }

  /* תור: שאלה, ואחריה התשובות. ההפסקה ביניהן היא מה שמאפשר למי
     שנעזר רק בהקראה לדעת איפה נגמרת תשובה ומתחילה הבאה. */
  var QUEUE_GAP = 320;
  function ttsSpeakQueue(list, opts) {
    opts = opts || {};
    var items = (list || []).filter(nonEmpty);
    ttsStop();
    manualStop = false;
    var gen = ++queueGen;
    var k = 0;

    function step() {
      if (manualStop || gen !== queueGen) return;
      if (k >= items.length) {
        tts.speaking = false;
        if (opts.onDone) opts.onDone();
        return;
      }
      var i = k++;
      ttsSpeak(items[i], {
        lang: opts.lang,
        onWord: opts.onWord ? function (pos) { opts.onWord(pos, i); } : null,
        onDone: next
      });
    }
    function next() {
      if (manualStop || gen !== queueGen) return;
      speakTimer = setTimeout(step, QUEUE_GAP);
    }
    tts.speaking = true;
    speakTimer = setTimeout(step, 60);
  }

  function ttsStop() {
    manualStop = true;
    speakGen++;                                  /* מבטל אמירה תלויה */
    queueGen++;                                  /* ומבטל את התור כולו */
    stopKeepAlive();
    activeUtterance = null;
    if (speakTimer) { clearTimeout(speakTimer); speakTimer = null; }
    /* מנוע שנשאר במצב paused מתעלם מ-cancel ואז שותק לשארית הסשן */
    try { if (synth) { if (synth.paused) synth.resume(); synth.cancel(); } } catch (e) {}
    if (tts.audio) {
      try { tts.audio.pause(); } catch (e) {}
      tts.audio = null;
    }
    tts.speaking = false;
  }

  /* ===================================================================
     6. שמירת התקדמות
     כל האפליקציות חולקות origin אחד ב-GitHub Pages, ולכן המפתחות
     כאן עוברים דרך ה-store הממורחב.
     =================================================================== */

  var progress = {
    data: null,

    load: function () {
      this.data = store.getJSON('progress', null) || {
        answered: 0, correct: 0, seen: {}, days: {}, updated: ''
      };
      if (!this.data.seen) this.data.seen = {};
      if (!this.data.days) this.data.days = {};
      return this.data;
    },
    save: function () {
      if (!this.data) this.load();
      this.data.updated = new Date().toISOString();
      store.setJSON('progress', this.data);
    },
    get: function (key, dflt) {
      if (!this.data) this.load();
      return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : dflt;
    },
    set: function (key, val) {
      if (!this.data) this.load();
      this.data[key] = val;
      this.save();
    },
    /* מדווחים תשובה אחת. מחזיר את המצב אחרי העדכון. */
    record: function (id, correct) {
      if (!this.data) this.load();
      var d = this.data, day = todayKey();
      d.answered++;
      if (correct) d.correct++;
      d.days[day] = (d.days[day] || 0) + 1;
      if (id != null) {
        var e = d.seen[id] || (d.seen[id] = { n: 0, ok: 0 });
        e.n++;
        if (correct) e.ok++;
      }
      if (!correct && id != null) mistakes.record(id);
      this.save();
      return d;
    },
    today: function () {
      if (!this.data) this.load();
      return this.data.days[todayKey()] || 0;
    },
    reset: function () {
      this.data = null;
      store.del('progress');
      this.load();
    }
  };

  /* ===================================================================
     7. בנק טעויות
     המבנה:  { <מזהה>: { n: כמה פעמים, last: 'YYYY-MM-DD' } }
     הבנק לא מתרוקן ברגע שתיקנת: לתקן שאלה שהתשובה שלה מולך על המסך
     זה לא לדעת אותה. החזרה האמיתית קורית מאוחר יותר.
     =================================================================== */

  var DRILL_LEN = 15;

  var mistakes = {
    items: null,

    load: function () {
      var raw = store.getJSON('mistakes', null);
      var out = {};
      if (raw && typeof raw === 'object') {
        Object.keys(raw).forEach(function (id) {
          var x = raw[id];
          if (!x || typeof x !== 'object') return;
          var n = Math.floor(Number(x.n));
          if (!isFinite(n) || n <= 0) return;      /* רשומה פגומה — מדלגים עליה בלבד */
          out[id] = { n: n, last: isStr(x.last) ? x.last : '' };
        });
      }
      this.items = out;
      return out;
    },
    save: function () { store.setJSON('mistakes', this.items || {}); },
    all: function () { if (!this.items) this.load(); return this.items; },
    count: function () { return Object.keys(this.all()).length; },

    record: function (id) {
      if (id == null || id === '') return;        /* בלי מזהה — לא ממציאים אחד */
      if (!this.items) this.load();
      var m = this.items[id] || (this.items[id] = { n: 0, last: '' });
      m.n++;
      m.last = todayKey();
      this.save();
    },
    clear: function (id) {
      if (!this.items) this.load();
      delete this.items[id];
      this.save();
    },
    reset: function () { this.items = {}; this.save(); },

    /* המזהים מסודרים: האחרון שנטעה ראשון, ובאותו יום — הרבים קודם.
       "אחרונות" הוא מה שהמשתמש עוד זוכר ולכן מה שכדאי לתקן עכשיו. */
    recent: function () {
      var items = this.all();
      return Object.keys(items).sort(function (a, b) {
        var A = items[a], B = items[b];
        return String(B.last || '').localeCompare(String(A.last || '')) || (B.n - A.n);
      });
    },

    /* מקבץ תרגול מהטעויות האחרונות.
       pool אופציונלי: רשימת המזהים שקיימים באמת במאגר כרגע. מסננים
       בזמן קריאה ולא מוחקים בטעינה — כשהמאגר המלא עוד בדרך, מחיקה
       עכשיו מאבדת טעויות אמיתיות.
       הערבוב נעשה כאן, בכל קריאה, ולא פעם אחת בטעינת הקובץ. */
    drill: function (n, pool) {
      var ids = this.recent();
      if (pool && pool.length) {
        var ok = {};
        pool.forEach(function (x) { ok[x] = 1; });
        ids = ids.filter(function (id) { return ok[id]; });
      }
      return shuffle(ids.slice(0, n || DRILL_LEN));
    }
  };

  /* ===================================================================
     8. ערבוב
     Fisher-Yates על עותק. הפונקציה לא שומרת מצב ולא זוכרת סדר קודם,
     ולכן כל קריאה נותנת סדר חדש — זה מה שמונע את התקלה שבה החפיסה
     עורבבה פעם אחת בטעינת הקובץ וכל סשן ראה בדיוק את אותו סדר.
     קוראים לה בפתיחת סשן תרגול, לא ברמת המודול.
     =================================================================== */

  function shuffle(list) {
    var a = (list || []).slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* חפיסה לסשן: ערבוב טרי, וחיתוך לאורך המבוקש. */
  function deck(list, len) {
    var a = shuffle(list);
    return (len && len > 0) ? a.slice(0, len) : a;
  }

  /* ===================================================================
     9. ניווט בין מסכים
     המסכים הם אלמנטים עם data-screen בתוך מיכל אחד. go() מסתיר את
     כולם, מציג אחד, עוצר את הקול, ומעביר מיקוד לכותרת — כדי שקורא
     מסך יידע שהמסך התחלף ולא ימשיך להקריא את הקודם.
     =================================================================== */

  var nav = {
    root: null,
    current: '',
    screens: {},        /* שם ← callback רינדור אופציונלי */
    listeners: [],

    init: function (rootSel) {
      this.root = (typeof rootSel === 'string')
        ? (DOC ? DOC.querySelector(rootSel) : null)
        : (rootSel || (DOC ? DOC.body : null));
      return this;
    },
    define: function (name, renderFn) {
      this.screens[name] = renderFn || null;
      return this;
    },
    /* שם לא מוכר לא מפיל את האפליקציה — חוזרים לבית. */
    go: function (name, arg) {
      if (!Object.prototype.hasOwnProperty.call(this.screens, name)) {
        name = Object.prototype.hasOwnProperty.call(this.screens, 'home')
          ? 'home' : Object.keys(this.screens)[0];
      }
      if (!name) return;
      ttsStop();
      this.current = name;

      var root = this.root || DOC;
      if (root) {
        var all = root.querySelectorAll('[data-screen]');
        for (var i = 0; i < all.length; i++) {
          var on = all[i].getAttribute('data-screen') === name;
          all[i].hidden = !on;
          all[i].setAttribute('aria-hidden', on ? 'false' : 'true');
        }
      }

      var fn = this.screens[name];
      if (typeof fn === 'function') { try { fn(arg); } catch (e) {} }

      /* מיקוד לכותרת המסך החדש. tabindex="-1" בתבנית מאפשר את זה
         בלי להוסיף את הכותרת לסדר ה-Tab. */
      if (root) {
        var pane = root.querySelector('[data-screen="' + name + '"]');
        var h = pane && pane.querySelector('h1,h2,[data-focus]');
        if (h) { try { h.focus(); } catch (e) {} }
      }

      this.listeners.forEach(function (cb) { try { cb(name, arg); } catch (e) {} });
      return name;
    },
    onChange: function (fn) { if (typeof fn === 'function') this.listeners.push(fn); }
  };

  /* ===================================================================
     10. init
     =================================================================== */

  var inited = false;

  /* opts:
       app      — שם האפליקציה. קובע את מרחב השמות באחסון. חובה.
       lang     — שפת פתיחה. ברירת מחדל: מה שנשמר, ואם אין — 'he'.
       strings  — טבלת מחרוזות {he:{}, ar:{}, en:{}, ru:{}}
       ktiv     — תוספות למילון ההגייה
       root     — הסלקטור של מיכל המסכים (ברירת מחדל: body)
       audio    — {base, voice, sample} לשכבת ה-MP3 הסטטי
       rate     — מהירות הקראה (1 = רגיל)
  */
  function init(opts) {
    opts = opts || {};
    var app = nonEmpty(opts.app) ? opts.app : 'app';
    store = makeStore(app);

    if (opts.strings) addStrings(opts.strings);
    if (opts.ktiv) ktivAdd(opts.ktiv);
    if (typeof opts.rate === 'number') tts.rate = opts.rate;

    var saved = store.get('lang');
    setLang(LANGS[opts.lang] ? opts.lang : (LANGS[saved] ? saved : 'he'), { silent: true });

    progress.load();
    mistakes.load();
    nav.init(opts.root || null);

    if (!inited) {
      installUnlock();
      installVisibility();
      inited = true;
    }
    /* מחממים את רשימת הקולות כבר בטעינה, כדי שההקראה הראשונה לא
       תדבר בקול ברירת המחדל רק מפני שהרשימה טרם הגיעה. */
    voicesReady();

    if (opts.audio && opts.audio.voice) {
      probeStatic(opts.audio.sample, { base: opts.audio.base, voice: opts.audio.voice });
    }
    return API;
  }

  /* ===================================================================
     הממשק החיצוני
     =================================================================== */

  var API = {
    version: CORE_VERSION,
    init: init,

    /* אחסון */
    get store() { return store; },

    /* שפות */
    langs: LANGS,
    t: t,
    get lang() { return i18n.lang; },
    setLang: setLang,
    onLangChange: onLangChange,
    addStrings: addStrings,

    /* מילון הגייה */
    ktiv: {
      add: ktivAdd,
      apply: ktivApply,
      lookup: ktivLookup,
      strip: stripNiqqud,
      size: function () { return Object.keys(ktivTable).length; },
      table: function () { var o = {}; Object.keys(ktivTable).forEach(function (k) { o[k] = ktivTable[k]; }); return o; }
    },

    /* הקראה */
    tts: {
      speak: ttsSpeak,
      queue: ttsSpeakQueue,
      stop: ttsStop,
      ready: voicesReady,
      voices: safeVoices,
      pickVoice: pickVoice,
      segments: segments,
      audioId: audioId,
      probeStatic: probeStatic,
      get available() { return !!synth; },
      get speaking() { return tts.speaking; },
      get tier() { return tts.lastTier; },
      get rate() { return tts.rate; },
      setRate: function (r) { tts.rate = clamp(Number(r) || 1, 0.5, 2); return tts.rate; },
      setEnabled: function (on) { tts.enabled = !!on; if (!on) ttsStop(); return tts.enabled; },
      get enabled() { return tts.enabled; },
      onTier: function (fn) { tts.onTier = fn; },
      SEG_MAX: SEG_MAX
    },

    /* התקדמות וטעויות */
    progress: progress,
    mistakes: mistakes,

    /* ערבוב וניווט */
    shuffle: shuffle,
    deck: deck,
    nav: nav,

    /* עזרים */
    util: {
      escapeHTML: escapeHTML,
      plainText: plainText,
      stripNiqqud: stripNiqqud,
      todayKey: todayKey,
      clamp: clamp
    }
  };

  global.LearningCore = API;
  global.LC = API;

})(typeof window !== 'undefined' ? window : this);
