/* =====================================================================
   מנוע ההקראה — שלב 2.
   כאן יושב הקובץ כשלד בלבד, עם ממשק סופי שלא ישתנה, כדי ש-app.js
   יוכל לקרוא לו כבר עכשיו בלי לדעת מתי המנוע יגיע. הכפתורים בממשק
   נבנים סביב הממשק הזה ולא סביב Web Speech ישירות, ולכן שלב 2 יחליף
   את הפנים של הקובץ בלי לגעת באף כפתור.

   הממשק:
     Speech.supported()      האם הדפדפן יודע להקריא בכלל
     Speech.ready()          האם המנוע פעיל (בשלב 1: false)
     Speech.rate(v)          קורא או קובע מהירות: 0.7 / 1.0 / 1.3
     Speech.speak(text, el)  מקריא, ומדגיש את el בזמן ההקראה
     Speech.stop()           עוצר
     Speech.onstate(fn)      מנוי לשינוי מצב, כדי שהכפתורים יתעדכנו

   כלל שאינו נתון לפרשנות: `speak` מקבל תמיד את השדה `speech` של
   הפריט, ולעולם לא את `latex`. הבחירה נעשית ב-app.js, ב-speechOf().
   ===================================================================== */
(function () {
  "use strict";

  var RATES = [0.7, 1.0, 1.3];
  var RKEY = "bagrut806-rate";
  var rate = 1.0;
  var listeners = [];

  try {
    var saved = parseFloat(localStorage.getItem(RKEY));
    if (RATES.indexOf(saved) > -1) rate = saved;
  } catch (e) {}

  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](); } catch (e) {}
    }
  }

  window.Speech = {
    RATES: RATES,

    supported: function () {
      return typeof window.speechSynthesis !== "undefined" &&
             typeof window.SpeechSynthesisUtterance !== "undefined";
    },

    /* שלב 1: המנוע עדיין לא מחובר. הממשק מציג את הכפתורים כמושבתים
       במקום להעמיד פנים שהם עובדים. */
    ready: function () { return false; },

    rate: function (v) {
      if (v === undefined) return rate;
      if (RATES.indexOf(v) < 0) return rate;
      rate = v;
      try { localStorage.setItem(RKEY, String(v)); } catch (e) {}
      emit();
      return rate;
    },

    speak: function (/* text, el */) { return false; },

    stop: function () { return false; },

    speaking: function () { return false; },

    onstate: function (fn) { if (typeof fn === "function") listeners.push(fn); }
  };
})();
