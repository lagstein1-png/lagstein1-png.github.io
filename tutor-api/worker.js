/* ============================================================
   ״עזרה מהמורה״ — צד השרת של הבוט הלימודי של ״חשבון ליסודי״.

   למה יש כאן שרת בכלל: האתר מתארח ב-GitHub Pages, שהוא סטטי.
   מפתח API בקובץ סטטי הוא מפתח פומבי. הקובץ הזה הוא המקום
   היחיד שבו המפתח קיים, והוא מגיע מ-Secret של הסביבה ולא
   מהמאגר. אין כאן ולא יהיה כאן מפתח כתוב.

   בלי npm ובלי build — fetch בלבד, כדי שאפשר יהיה להדביק את
   הקובץ הזה כמו שהוא לעורך של Cloudflare. זה אותו כלל שחל על
   שאר המאגר.

   פריסה, משתני סביבה ובדיקה: README.md שלצידו.
   ============================================================ */

/* הוראות המערכת. הן יושבות כאן, בשרת, ולא בהודעת הפתיחה
   שנשלחת מהדפדפן — דפדפן אפשר לערוך, שרת לא. */
const SYSTEM = [
  "אתה מורה פרטי סבלני לחשבון לתלמידי יסודי.",
  "דבר בעברית פשוטה, נעימה ומכבדת, בלי תיוגים.",
  "כתוב תשובות קצרות ושאל רק שאלה אחת בכל פעם.",
  "התמקד בתרגיל הנוכחי וברמת הלימוד שהאפליקציה מספקת.",
  "אם התרגיל אינו ידוע לך, בקש מהתלמיד לכתוב אותו.",
  "התחל ברמז קטן והמתן לתשובת התלמיד.",
  "אל תמסור מיד פתרון; אם התלמיד עדיין מתקשה, הדגם צעד אחד.",
  "אם מתבקש פתרון מלא, הצג אותו בהדרגה עם הסבר.",
  "בטעות, הסבר בעדינות מה כדאי לבדוק ונסה דרך אחרת.",
  "השתמש בדוגמאות יומיומיות ובייצוגים פשוטים כשזה מועיל.",
  "אל תבקש שם מלא, כתובת, טלפון או פרטים מזהים.",
  "בשאלות שאינן קשורות ללימוד, החזר בעדינות לנושא."
].join("\n");

const MODEL = "claude-opus-5";   /* מודל זול יותר הוא שינוי שורה אחת, והוא החלטה של הבעלים */
const MAX_TOKENS = 700;          /* תשובה קצרה בעברית. גבוה מספיק כדי לא להיחתך באמצע משפט */
const API = "https://api.anthropic.com/v1/messages";

/* ---------- גבולות הקלט. כל אחד מהם הוא גם תקרת עלות ---------- */
const LIM = {
  msgs: 14,          /* אורך השיחה שנשלח בחזרה */
  chars: 300,        /* הודעה בודדת של התלמיד */
  total: 2000,       /* כל השיחה יחד */
  perDay: 60,        /* פניות ליום, לכל כתובת IP */
  globalPerDay: 3000 /* תקרה יומית לכל השירות — חסם העלות האמיתי */
};

const KINDS = { add: "+", sub: "−", mul: "×", div: ":" };
const LANGS = ["he", "ar", "ru", "en"];

/* הודעת הנסיגה, כשהתשובה של המודל נפסלה פעמיים.
   היא לעולם אינה מוסרת את הפתרון — זה כל הרעיון. */
const FALLBACK = {
  he: "בוא ננסה יחד: מה הצעד הראשון שהיית עושה כאן?",
  ar: "لنجرّب معًا: ما هي الخطوة الأولى التي ستقوم بها هنا؟",
  ru: "Давай попробуем вместе: какой первый шаг ты бы сделал?",
  en: "Let's try together: what would your first step be here?"
};

/* ============ בדיקת נכונות חשבונית ============
   שתי בדיקות על התשובה שחזרה, ושתיהן מכניות ולא מסתמכות על
   המודל.

   1. גילוי מוקדם — התשובה הסופית אסורה בשני התורים הראשונים.
      זה מה שאוכף את ״התחל ברמז קטן״ ואת ״אל תמסור מיד פתרון״.
   2. משוואה שגויה — כל ״א פעולה ב = ג״ שמופיע בטקסט מחושב
      מחדש כאן. מודל שכותב 8+7=16 נפסל, בלי קשר לתרגיל.

   מה שלא נבדק כאן, בכוונה: מספרים ״זרים״ שאינם בתרגיל. מורה
   שמפרק 17 ל-10 ו-7 כותב מספרים שאינם בתרגיל, וזו בדיוק
   ההוראה ״ייצוגים פשוטים״. פסילה שלהם הייתה פוסלת הוראה טובה.
*/
function revealsAnswer(text, ans) {
  return new RegExp("(^|[^\\d])" + ans + "([^\\d]|$)").test(text);
}

function badEquation(text) {
  const re = /(\d+)\s*([+\-−×xX*÷:\/])\s*(\d+)\s*=\s*(\d+)/g;
  let m;
  while ((m = re.exec(text))) {
    const a = +m[1], b = +m[3], said = +m[4];
    let real;
    if (m[2] === "+") real = a + b;
    else if (m[2] === "-" || m[2] === "−") real = a - b;
    else if (m[2] === "÷" || m[2] === ":" || m[2] === "/") { if (!b) return true; real = a / b; }
    else real = a * b;
    if (real !== said) return true;
  }
  return false;
}

/* ---------- עזרי HTTP ---------- */
function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOW_ORIGIN || "https://lagstein1-png.github.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
function json(obj, status, env) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, cors(env))
  });
}

/* ---------- מונה יומי. בלי KV הוא פשוט אינו סופר ---------- */
async function overLimit(env, ip) {
  if (!env.RATE) return false;                    /* אין KV — התקרות הפנימיות עדיין חלות */
  const day = new Date().toISOString().slice(0, 10);
  const keys = ["d:" + day + ":" + ip, "d:" + day + ":ALL"];
  const caps = [LIM.perDay, LIM.globalPerDay];
  const now = [];
  for (let i = 0; i < keys.length; i++) {
    const v = +(await env.RATE.get(keys[i]) || 0);
    if (v >= caps[i]) return true;
    now.push(v);
  }
  /* נשמר ליומיים, כדי שמפתח של אתמול ייעלם לבד */
  for (let i = 0; i < keys.length; i++)
    await env.RATE.put(keys[i], String(now[i] + 1), { expirationTtl: 172800 });
  return false;
}

/* ---------- אימות הגוף שהגיע מהדפדפן ---------- */
function readBody(b) {
  if (!b || typeof b !== "object") return null;
  const lang = LANGS.indexOf(b.lang) >= 0 ? b.lang : "he";

  /* התרגיל אינו חובה: ההוראות אומרות לבקש מהתלמיד לכתוב אותו
     כשהוא אינו ידוע, וזה בדיוק המצב הזה. */
  let q = null;
  if (b.q && KINDS[b.q.kind]) {
    const a = +b.q.a, bb = +b.q.b;
    if (Number.isInteger(a) && Number.isInteger(bb) &&
        a >= 0 && a <= 100000 && bb >= 0 && bb <= 100000)
      q = { kind: b.q.kind, a: a, b: bb, level: Math.min(9, Math.max(1, +b.q.level || 1)) };
  }

  const src = Array.isArray(b.messages) ? b.messages.slice(-LIM.msgs) : [];
  const msgs = [];
  let total = 0;
  for (const m of src) {
    const role = m && m.role === "assistant" ? "assistant" : "user";
    const text = String((m && m.text) || "").trim().slice(0, LIM.chars);
    if (!text) continue;
    total += text.length;
    if (total > LIM.total) break;
    msgs.push({ role: role, content: text });
  }
  /* Claude דורש שהתור הראשון והאחרון יהיו של המשתמש */
  while (msgs.length && msgs[0].role === "assistant") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return null;
  return { lang: lang, q: q, msgs: msgs };
}

/* ---------- ההקשר המשתנה. אחרי הפרומפט הקבוע, כדי לא לשבור את המטמון ---------- */
function contextBlock(q, ans, turn) {
  if (!q) return "התרגיל שעל המסך אינו ידוע לך. בקש מהתלמיד לכתוב אותו.";
  const line = q.a + " " + KINDS[q.kind] + " " + q.b;
  let s = "התרגיל שעל המסך: " + line + "\n" +
          "התשובה הנכונה היא " + ans + ". היא נתונה לך כדי שלא תטעה בחשבון.\n" +
          "רמת הלימוד: " + q.level + " מתוך 6.";
  if (turn < 2) s += "\nזו תחילת השיחה: אל תכתוב את המספר " + ans + ". תן רמז אחד ושאל שאלה אחת.";
  return s;
}

async function ask(env, sys, ctx, msgs, extra) {
  const body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    output_config: { effort: "low" },      /* שיחה קצרה — אין צורך בחשיבה עמוקה, וזה חוסך טוקנים */
    fallbacks: "default",                  /* סירוב של המודל מנותב לגיבוי בצד השרת */
    system: [
      /* הבלוק הקבוע ראשון, ועליו סימון מטמון. אם הוא ארוך מהמינימום
         של המודל הוא ייקרא מהמטמון; אפשר לוודא ב-usage.cache_read_input_tokens
         שחוזר בתשובה. הבלוק המשתנה חייב לבוא אחריו. */
      { type: "text", text: sys, cache_control: { type: "ephemeral" } },
      { type: "text", text: ctx + (extra ? "\n" + extra : "") }
    ],
    messages: msgs
  };
  const r = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "server-side-fallback-2026-07-01"
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) return { err: r.status };
  const d = await r.json();
  /* stop_reason נבדק לפני content — בסירוב content יכול לחזור ריק */
  if (d.stop_reason === "refusal") return { err: "refusal" };
  const text = (d.content || [])
    .filter(c => c.type === "text").map(c => c.text).join("").trim();
  return { text: text };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });
    if (request.method !== "POST") return json({ error: "method" }, 405, env);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "server" }, 500, env);

    let body;
    try { body = await request.json() } catch (e) { return json({ error: "bad" }, 400, env) }
    const inp = readBody(body);
    if (!inp) return json({ error: "bad" }, 400, env);

    const ip = request.headers.get("CF-Connecting-IP") || "0";
    if (await overLimit(env, ip)) return json({ error: "limit" }, 429, env);

    const turn = inp.msgs.filter(m => m.role === "assistant").length;
    const q = inp.q;
    const ans = q ? (q.kind === "add" ? q.a + q.b : q.kind === "sub" ? q.a - q.b
                   : q.kind === "mul" ? q.a * q.b : (q.b ? q.a / q.b : 0)) : null;

    let out = await ask(env, SYSTEM, contextBlock(q, ans, turn), inp.msgs, "");
    if (out.err) return json({ error: "upstream" }, 502, env);

    /* הבדיקה החשבונית, ואחריה ניסיון שני אחד ולא יותר */
    const bad = t => (q && turn < 2 && revealsAnswer(t, ans)) || badEquation(t);
    if (bad(out.text)) {
      const nudge = q && turn < 2
        ? "התשובה הקודמת שלך חשפה את הפתרון או הכילה חישוב שגוי. כתוב מחדש: רמז אחד בלבד, בלי המספר " + ans + ", ובלי משוואה מלאה."
        : "התשובה הקודמת שלך הכילה חישוב שגוי. כתוב מחדש, ובדוק כל חישוב לפני שאתה כותב אותו.";
      const again = await ask(env, SYSTEM, contextBlock(q, ans, turn), inp.msgs, nudge);
      out = (again.err || bad(again.text)) ? { text: "" } : again;
    }

    return json({ text: out.text || FALLBACK[inp.lang] || FALLBACK.he }, 200, env);
  }
};

/* מיוצאים בנפרד כדי ש-node .claude/qa/tutor.js יוכל לבדוק אותם.
   Cloudflare קורא רק את ה-default, וייצוא נוסף אינו מפריע לו. */
export { revealsAnswer, badEquation, readBody, contextBlock, LIM, SYSTEM };
