/* ============================================================
   הערכות מנוע ברק — סט תרחישים קבוע לכל אפליקציה, בארבע השפות.

   מריץ את ה-handler האמיתי של worker.js (מיובא, לא מועתק) על
   תרחישים שמייצגים את ״הגדרת הגמור״ מהמנדט:

     hint      רמז שלא מגלה את התשובה
     explain   הסבר שמתייחס לשאלה שעל המסך
     next      ״נעבור למסך הבא״ שמחזיר פעולה (ולא רק מבטיח)
     wrong     טעות שמקבלת עידוד, בלי ״נכשלת״
     lang      תשובה בשפת הממשק
     short     אורך קצר בתורים הראשונים

   שני מצבים:
     --mock (ברירת מחדל)  מודל מדומה שעונה בשפה הנכונה ובוחר פעולה
                          כשמבקשים — בודק שהצינור כולו (שומרים, אימות
                          פעולות, ניתוב שפה) מחווט. אפס רשת.
     --live               Gemini אמיתי, מפתח מ-GEMINI_API_KEY, ותקרה
                          קשיחה של 60 קריאות לריצה (LIVE_CAP). רץ
                          מרנר של GitHub (barak-live.yml) — הסביבה כאן
                          חסומה.

   הרצה:  node tutor-api/local/evals.mjs [--mock|--live] [--apps a,b] [--langs he,ar] [--out קובץ]
   ============================================================ */
import worker, { revealsAnswer, ROLE, handleAsk, _rate } from "../worker.js";
import fs from "node:fs";

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d };
const LIVE = argv.includes("--live");
const LIVE_CAP = Math.min(60, +(process.env.LIVE_CAP || 60));
/* **השהיה בין קריאות חיות — 16.9.2026, אחרי מדידה.** `barak-live`
   ריצה 1 ירתה 60 קריאות ב-31 שניות וקיבלה 429 אחרי כעשר; שתי דקות
   אחר כך שמונה קריאות עברו בלי 429 אחד. כלומר המכסה שנגמרה היא
   **לדקה ולא ליום**, והריצה בלי השהיה לא תשלים 60 לעולם. השהיה
   ברירת מחדל של 4 שניות מחזיקה כ-15 קריאות לדקה. `LIVE_GAP_MS=0`
   מבטל אותה. אינה חלה על המוק, שאינו פונה לרשת. */
const LIVE_GAP_MS = LIVE ? Math.max(0, +(process.env.LIVE_GAP_MS ?? 4000)) : 0;
const sleep = ms => ms > 0 ? new Promise(r => setTimeout(r, ms)) : Promise.resolve();
const APPS = (opt("--apps", "") || Object.keys(ROLE).join(",")).split(",").filter(Boolean);
const LANGS = (opt("--langs", "he,ar,ru,en")).split(",");
const OUT = opt("--out", process.env.EVALS_OUT || "");

/* ---------- המסכים, אפליקציה־אפליקציה ---------- */
const SCREENS = {
  "math-app":   { id: "q1", type: "mcq", q: "כמה זה 8 + 7? (8 + 7)", options: ["14", "15", "16", "17"], correct: "15", topic: "חיבור", curriculum: "חשבון ליסודי, כיתות א׳–ו׳: חיבור, מספרים עד 26", level: "רמה 2 מתוך 6" },
  "math-teen":  { id: "q1", type: "mcq", q: "פתרו: 3x + 5 = 20", options: ["x = 3", "x = 5", "x = 15", "x = 25"], correct: "x = 5", topic: "משוואות ממעלה ראשונה", curriculum: "מתמטיקה לתיכון — 3 יחידות — משוואות", level: "מסלול 3" },
  "math-uni":   { id: "q1", type: "mcq", q: "מהי הנגזרת של x^3?", options: ["3x^2", "x^2", "3x", "x^3/3"], correct: "3x^2", topic: "נגזרות", curriculum: "מתמטיקה שנה א׳ — חדו״א — נגזרות", level: "רמה 1" },
  "math-uni2":  { id: "q1", type: "mcq", q: "פתרו: y' = 2y", options: ["y = Ce^(2x)", "y = 2x + C", "y = Cx^2", "y = e^x"], correct: "y = Ce^(2x)", topic: "משוואות דיפרנציאליות", curriculum: "מתמטיקה שנה ב׳ — מד״ר", level: "רמה 1" },
  "math-uni3":  { id: "q1", type: "mcq", q: "האם הקבוצה [0,1] קומפקטית ב-R?", options: ["כן", "לא", "רק אם פתוחה", "תלוי במטריקה"], correct: "כן", topic: "טופולוגיה", curriculum: "מתמטיקה שנה ג׳ — טופולוגיה — קומפקטיות", level: "רמה 1" },
  "bagrut-806": { id: "q1", type: "open", q: "נתונה הפונקציה f(x) = x^2 - 4x. מצא את נקודת המינימום.", correct: "(2, -4)", topic: "חקירת פונקציה", curriculum: "בגרות במתמטיקה שאלון 806 — חקירת פונקציות", level: "שאלון 806" },
  "english":    { id: "q1", type: "mcq", q: "Choose the correct word: She ___ to school every day.", options: ["go", "goes", "going", "gone"], correct: "goes", topic: "Present Simple", curriculum: "אנגלית — דקדוק — הווה פשוט", level: "מסלול A" },
  "ulpan":      { id: "q1", type: "mcq", q: "מה ההפך של ״גדול״?", options: ["קטן", "ארוך", "חם", "יפה"], correct: "קטן", topic: "אוצר מילים", curriculum: "עברית לעולים — מילים יומיומיות", level: "מסלול א" },
  "history":    { id: "q1", type: "mcq", q: "באיזו שנה הוכרזה מדינת ישראל?", options: ["1917", "1939", "1948", "1967"], correct: "1948", topic: "הקמת המדינה", curriculum: "היסטוריה לחטיבת הביניים — הקמת המדינה", level: "מסלול א" },
  "lomda":      { id: "q1", type: "mcq", q: "מהו תפקידה של הכנסת?", options: ["לחוקק חוקים", "לשפוט", "לבצע חוקים", "לפקח על הצבא"], correct: "לחוקק חוקים", topic: "אזרחות", curriculum: "לומדה — אזרחות — רשויות השלטון", level: "מסלול א" },
  "kotvim":     { id: "k1", type: "text", q: "פתיחה: בעיניי, חשוב לקרוא ספרים כי", topic: "קריאה", curriculum: "כתיבה — טיעון", level: "טיעון" },
  "reader":     { id: "s1", type: "text", q: "הילד הלך לבית הספר ופגש את חבריו.", curriculum: "קריאה — הקראת טקסט מודבק", level: "משפט 1 מתוך 3" },
  "theory":     { id: "q1", type: "mcq", q: "מהו מרחק העצירה של רכב?", options: ["מרחק הבלימה בלבד", "מרחק התגובה ועוד מרחק הבלימה", "מרחק התגובה בלבד", "אורך הרכב"], correct: "מרחק התגובה ועוד מרחק הבלימה", topic: "בלימה ומרחקים", curriculum: "תאוריה בנהיגה — בלימה", level: "תאוריה" }
};
const ACTIONS = [
  { name: "next_question", desc: "עובר לשאלה הבאה" },
  { name: "show_hint", desc: "מציג רמז" },
  { name: "read_aloud", desc: "מקריא את השאלה" }
];
/* הטקסט של הלומד, לכל תרחיש ולכל שפה */
const ASK = {
  hint:    { he: "לא הבנתי, אפשר רמז?", ar: "لم أفهم، هل يمكن تلميح؟", ru: "Я не понял, можно подсказку?", en: "I do not get it, can I have a hint?" },
  explain: { he: "תסביר לי את השאלה הזאת", ar: "اشرح لي هذا السؤال", ru: "Объясни мне этот вопрос", en: "Explain this question to me" },
  next:    { he: "נעבור למסך הבא", ar: "لننتقل إلى الشاشة التالية", ru: "Перейдём к следующему экрану", en: "Let us move to the next screen" },
  wrong:   { he: "טעיתי שוב, אני גרוע בזה", ar: "أخطأت مرة أخرى، أنا سيّئ في هذا", ru: "Я снова ошибся, я плох в этом", en: "I got it wrong again, I am bad at this" }
};
const SCRIPT = { he: /[֐-׿]/, ar: /[؀-ۿ]/, ru: /[Ѐ-ӿ]/, en: /[A-Za-z]/ };
/* השם כפי שכל המאגר כותב אותו — tutor/tutor.js, tutor/josh-local.js,
   barak/index.html — ומ-16.9.2026 גם CORE שבשרת. NAME_ALT תופס
   תעתיק שנראה כמו השם ואינו הוא. */
const NAME     = { he: "ברק",  ar: "باراك",        ru: "Барак",      en: "Barak" };
const NAME_ALT = { he: "ברק",  ar: "بار[اقئ]ق?|باراق", ru: "Бар[а-я]?к", en: "\\bbarak\\b" };

/* ---------- המודל המדומה ---------- */
const MOCK_SAY = {
  hint:    { he: "בוא נתחיל מהחלק הראשון של השאלה. מה אתה כבר יודע כאן?", ar: "لنبدأ من الجزء الأول من السؤال. ما الذي تعرفه هنا؟", ru: "Начнём с первой части вопроса. Что ты уже знаешь здесь?", en: "Let us start with the first part of the question. What do you already know here?" },
  explain: { he: "השאלה מבקשת דבר אחד. נקרא אותה יחד: מה מבקשים למצוא?", ar: "السؤال يطلب شيئًا واحدًا. لنقرأه معًا: ما المطلوب إيجاده؟", ru: "Вопрос просит одно. Прочитаем его вместе: что нужно найти?", en: "The question asks for one thing. Let us read it together: what are we asked to find?" },
  wrong:   { he: "לא נורא, בוא ננסה שוב. טעות היא חלק מהלמידה. מה הצעד הראשון?", ar: "لا بأس، لنجرّب مرة أخرى. الخطأ جزء من التعلّم. ما الخطوة الأولى؟", ru: "Ничего страшного, попробуем ещё раз. Ошибка — часть учёбы. Какой первый шаг?", en: "That is fine, let us try again. Mistakes are part of learning. What is the first step?" },
  next:    { he: "עוברים לשאלה הבאה.", ar: "ننتقل إلى السؤال التالي.", ru: "Переходим к следующему вопросу.", en: "Moving on to the next question." }
};
function mockFetch(scn, lang) {
  return async (url, init) => {
    if (!init || init.method !== "POST")
      return { ok: true, status: 200, json: async () => ({ models: [{ name: "models/gemini-9.9-flash", supportedGenerationMethods: ["generateContent"] }] }) };
    const parts = [{ text: MOCK_SAY[scn][lang] }];
    if (scn === "next") parts.push({ functionCall: { name: "next_question", args: {} } });
    return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts }, finishReason: "STOP" }] }) };
  };
}

/* ---------- הבדיקות על תשובה ---------- */
function judge(scn, lang, screen, d, turn) {
  const f = [];
  const say = String(d.say || "");
  if (!say) f.push("אין say");
  if (!SCRIPT[lang].test(say)) f.push("לא בשפת הממשק (" + lang + ")");
  if (lang !== "he" && lang !== "en" && /[֐-׿]{4,}/.test(say)) f.push("עברית בתוך תשובה ב-" + lang);
  /* **השם, בארבע כתבים — 16.9.2026.** ריצת barak-live 3 החזירה
     ״أنا ברק״ בערבית ו-״Я ברק״ ברוסית, ושלושתן **עברו**: הסף למעלה
     הוא ארבעה תווים עבריים רצופים, ו״ברק״ הוא שלושה. באותה ריצה
     המודל גם המציא תעתיקים — بارق מול باراك, Барк מול Барак,
     ו-barak באות קטנה — מפני ש-CORE נקב בשם בעברית בלבד.
     הטענה כאן מדויקת ולכן אין לה שגויי־חיוב: השם עצמו, באותיות
     הנכונות לשפת התשובה. */
  if (lang !== "he" && /ברק/.test(say)) f.push("השם באותיות עבריות בתשובה ב-" + lang);
  if (NAME[lang] && new RegExp(NAME_ALT[lang]).test(say) && !say.includes(NAME[lang]))
    f.push("תעתיק אחר של השם ב-" + lang + " (הנכון: " + NAME[lang] + ")");
  if (scn === "hint" && screen.correct && revealsAnswer(say, screen.correct)) f.push("הרמז גילה את התשובה");
  if (scn === "next" && !(d.action && d.action.name === "next_question")) f.push("״נעבור״ בלי פעולה next_question");
  /* **הטענה תוקנה 16.9.2026.** הניסוח הראשון דרש שהמילה ״הבא״
     תופיע בטקסט, והפיל 2 מתוך 2 ב-`barak-live` — בזמן שהמוצר היה
     תקין: המודל החזיר קריאת פונקציה בלי טקסט, והשרת השלים משפט.
     החוזה האמיתי הוא ״פעולה אינה חוזרת בלי משפט שמלווה אותה״,
     והמשפט לכל פעולה יושב ב-`ACTION_LINE` שב-worker.js. */
  if (scn === "next" && d.action && !say.trim()) f.push("פעולה בלי משפט קצר שמלווה אותה");
  if (scn === "wrong" && /נכשלת|فشلت|провалил|you failed/i.test(say)) f.push("״נכשלת״");
  if (scn === "wrong" && d.face !== "encourage") f.push("face אינו encourage אחרי טעות");
  if (turn < 2 && say.split("\n").filter(Boolean).length > 6) f.push("ארוך מדי לתור ראשון (" + say.split("\n").length + " שורות)");
  if (say.length > 900) f.push("ארוך מדי (" + say.length + " תווים)");
  if (/[!！]/.test(say)) f.push("סימן קריאה");
  if (d.source !== "ai") f.push("source אינו ai");
  return f;
}

(async () => {
  const env = { GEMINI_API_KEY: process.env.GEMINI_API_KEY || "mock-key", RATE: null, ALLOW_NO_RATE_LIMIT: "yes" };
  if (LIVE && !process.env.GEMINI_API_KEY) { console.error("✗ --live בלי GEMINI_API_KEY"); process.exit(1) }
  const ctx = { waitUntil() {} };
  const rows = [];
  let calls = 0, bad = 0, ran = 0, capped = false;
  const scns = ["hint", "explain", "next", "wrong"];
  outer:
  for (const app of APPS) {
    const screen = SCREENS[app];
    if (!screen) { console.log("· " + app + ": אין מסך בסט"); continue }
    for (const lang of LANGS) for (const scn of scns) {
      if (LIVE && calls >= LIVE_CAP) { capped = true; break outer }
      const body = { app, lang, screen: Object.assign({}, screen), userText: ASK[scn][lang], history: [], mode: scn === "hint" ? "hint" : scn === "explain" ? "explain" : "chat", actions: ACTIONS };
      if (scn === "wrong" && screen.options) body.screen.student = screen.options.find(o => o !== screen.correct);
      if (scn === "wrong") body.sign = "frustrated";
      _rate.reset();
      if (ran) await sleep(LIVE_GAP_MS);
      const F = LIVE ? undefined : mockFetch(scn, lang);
      const t0 = Date.now();
      const r = await handleAsk(new Request("https://x/ask", { method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": "1.1.1.1" }, body: JSON.stringify(body) }),
                                env, ctx, "https://lagstein1-png.github.io", F);
      /* ניסיון שני של השומר הוא קריאה שנייה — נספר לפי המנדט */
      calls += LIVE ? 2 : 1;
      const d = await r.json();
      ran++;
      const fails = r.status === 200 ? judge(scn, lang, screen, d, 0) : ["HTTP " + r.status + " " + JSON.stringify(d)];
      if (fails.length) bad++;
      rows.push({ app, lang, scn, ok: !fails.length, fails, ms: Date.now() - t0, model: d.model || null, say: String(d.say || "").slice(0, 160), action: d.action || null });
      console.log((fails.length ? "✗ " : "✓ ") + app.padEnd(11) + lang + " " + scn.padEnd(8) + (fails.length ? fails.join(" · ") : (d.model || "") + " " + String(d.say || "").replace(/\n/g, " ").slice(0, 70)));
    }
  }
  const summary = { mode: LIVE ? "live" : "mock", ran, bad, calls, cap: LIVE ? LIVE_CAP : null, capped,
                    gapMs: LIVE_GAP_MS, when: new Date().toISOString() };
  console.log(JSON.stringify(summary));
  if (OUT) fs.writeFileSync(OUT, JSON.stringify({ summary, rows }, null, 1));
  console.log(bad ? `✗ הערכות ברק — ${bad} מתוך ${ran} נכשלו` : `✓ הערכות ברק — ${ran} תרחישים עברו` + (capped ? " (נעצר בתקרה " + LIVE_CAP + ")" : ""));
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error("✗ evals נפל: " + (e && e.stack || e)); process.exit(1) });
