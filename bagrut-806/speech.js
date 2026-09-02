/* ============================================================
   בגרות 806 — מנוע ההקראה
   ------------------------------------------------------------
   שלב 1 מגדיר את הממשק בלבד. המימוש עצמו — Web Speech API, בחירת
   קול עברי, שלוש מהירויות והדגשת המשפט הנקרא — הוא שלב 2.

   הממשק מוגדר כאן ולא בשלב 2 בכוונה: `app.js` כבר קורא לו, וכפתורי
   ההקראה כבר יושבים במקומם ומדווחים למשתמש שהמנוע עוד לא קיים.
   כפתור שנראה תקין ואינו עושה דבר גרוע מכפתור שאומר למה.

   הכלל שהמנוע יאכוף בשלב 2: לנוסחה קוראים את השדה `speech`,
   לעולם לא את ה-LaTeX הגולמי.
   ============================================================ */
(function (g) {
  "use strict";

  var RATES = [
    { id: "slow",   label: "איטי",  rate: 0.7 },
    { id: "normal", label: "רגיל",  rate: 1.0 },
    { id: "fast",   label: "מהיר",  rate: 1.3 }
  ];

  var state = { rate: "normal", speaking: false, node: null };

  /* האם יש בכלל מנוע דיבור בדפדפן הזה. בשלב 1 התשובה תמיד "לא",
     כי המימוש עוד לא נכתב — ו-`ready()` הוא מה שיהפוך ל-true. */
  function supported() {
    try { return !!(g.speechSynthesis && g.SpeechSynthesisUtterance); }
    catch (e) { return false; }
  }
  function ready() { return false; }          /* שלב 2 */

  /* text — הטקסט להקראה. לנוסחה מעבירים את `speech`, לא את `latex`.
     node — האלמנט שיודגש בזמן ההקראה, אם יש. */
  function speak(text, node) {
    void text; void node;
    return false;                              /* שלב 2 */
  }
  function stop() { state.speaking = false; state.node = null; }

  function setRate(id) {
    for (var i = 0; i < RATES.length; i++) if (RATES[i].id === id) { state.rate = id; return true; }
    return false;
  }
  function getRate() { return state.rate; }
  function rates() { return RATES.slice(); }

  /* למה ההקראה אינה זמינה — כדי שהמסך יגיד את זה במילים ולא ישתוק. */
  function unavailableReason() {
    if (!supported()) return "הדפדפן הזה אינו תומך בהקראה קולית.";
    return "מנוע ההקראה ייבנה בשלב 2.";
  }

  g.Speech = {
    supported: supported,
    ready: ready,
    speak: speak,
    stop: stop,
    setRate: setRate,
    getRate: getRate,
    rates: rates,
    unavailableReason: unavailableReason
  };
})(window);
