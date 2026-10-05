/* =====================================================================
   לימור במכשיר — פיילוט, 5.10.2026. נטען רק ב-/limor/.

   מודל שפה קטן (Gemma 4 E2B, ‏Apache 2.0) רץ בדפדפן של הלומד דרך
   transformers.js ו-WebGPU. אחרי הורדה אחת הוא עונה בלי שרת, בלי
   מפתח ובלי עלות, והשאלה של הלומד אינה יוצאת מהמכשיר.

   **זו חריגה מפורשת, בהכרעת הבעלים (5.10.2026).** שני כללים נשברים
   כאן ורק כאן: ספרייה חיצונית (transformers.js מ-jsDelivr) ובקשות
   יוצאות (קובצי המודל מ-Hugging Face). `.claude/qa/brain.js` מתיר
   אותן בקובץ הזה בלבד, ורק בדף /limor/. ההנמקה — `JOSH.md`.

   **סדר המוח:** המודל במכשיר (אם הורד) ← השרת הקיים ← `JOSHLOCAL`.
   הקובץ עוטף את `BARAK.ask`. הוא אינו נוגע ב-`tutor.js` ולא
   ב-`barak-core.js`: כשהמודל אינו מוכן, נכשל, או שהתשובה שלו נפסלה,
   הבקשה ממשיכה בדיוק במסלול של היום.

   **אין כאן מוח שני.** האישיות (`CORE`), התפקיד לפי אפליקציה,
   ההקשר של המסך (`contextBlock`) והשומרים (`revealsAnswer`,
   `badEquation`, `badLang`) מיובאים מ-`tutor-api/worker.js` — אותו
   קובץ שהשרת מריץ. מה שנוסף הוא שורה אחת, `DEVICE_RULE`, וגם היא
   יושבת שם: המודל הקטן מנסח, מפשט ורומז, ואינו מחשב בעצמו.

   **אין הורדה בלי לחיצה.** הכפתור מוצג רק כשהמכשיר מסוגל (WebGPU
   עם shader-f16, וזיכרון של 4 ג׳יגה ומעלה כשהדפדפן מדווח). הלחיצה
   הראשונה בודקת את הגודל, והשנייה מורידה. מכשיר שאינו מסוגל אינו
   רואה דבר, ולימור נשארת כמו שהיא.
   ===================================================================== */
(function(g){
"use strict";

var MODEL = "onnx-community/gemma-4-E2B-it-ONNX";
var DTYPE = "q4f16";
/* גרסה נעוצה. שדרוג הוא החלטה, לא משהו שקורה מעצמו. */
var LIB   = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0/dist/transformers.web.min.js";
var TREE  = "https://huggingface.co/api/models/" + MODEL + "/tree/main/onnx";
/* רק החלק הטקסטואלי: transformers.js טוען את Gemma4ForCausalLM בלי
   מקודדי התמונה והקול, ולכן אלה הקבצים שיורדים בפועל. */
var WANT  = new RegExp("^onnx/(embed_tokens|decoder_model_merged)_" + DTYPE + "\\.onnx(_data(_\\d+)?)?$");
var BRAIN_URL = "/tutor-api/worker.js";
var FLAG  = "limor-device-v1";   /* "on" — הלומד הוריד, וטוענים מהמטמון בביקור הבא */
var CACHE = "transformers-cache"; /* השם של transformers.js עצמה (env.cacheKey) */
var MIN_MEM_GB = 4;
var MAX_NEW = 200;

var ST = "unknown";               /* unknown · unable · offer · sizing · confirm · space · downloading · loading · ready · error */
var SIZE = 0, LOADED = 0;
var GEN = null, BRAIN = null, LIBMOD = null;
var BOX = null;

/* ---------- ארבע שפות ---------- */
var TX = {
  he:{ offer:"הורידו את לימור למכשיר", offerNote:"המכשיר הזה יכול להריץ את לימור בעצמו, בלי שרת. השאלות שלכם לא יוצאות מהמכשיר. ההורדה גדולה, ולכן היא קורית רק אם תבחרו בה.",
       size:"גודל ההורדה: ", sizeUnknown:"את גודל ההורדה לא הצלחתי לבדוק עכשיו.", from:"הקבצים מגיעים מ-Hugging Face ומ-jsDelivr, והם רואים את כתובת הרשת של המכשיר. כדאי להוריד ב-Wi-Fi.",
       go:"להוריד", later:"לא עכשיו", sizing:"בודקת את גודל ההורדה…", space:"אין מספיק מקום פנוי במכשיר להורדה.",
       down:"מורידה את לימור: ", of:" מתוך ", loading:"לימור נטענת במכשיר…",
       ready:"לימור עונה עכשיו מהמכשיר. אם היא לא מצליחה, התשובה מגיעה מהשרת או מהמוח המקומי.", remove:"להסיר את לימור מהמכשיר",
       error:"ההורדה לא הצליחה. לימור ממשיכה לעבוד כרגיל.", retry:"לנסות שוב", gb:" ג׳יגה", mb:" מגה" },
  ar:{ offer:"نزّلوا ليمور إلى الجهاز", offerNote:"يستطيع هذا الجهاز تشغيل ليمور بنفسه، بلا خادم. أسئلتكم لا تخرج من الجهاز. التنزيل كبير، ولذلك لا يحدث إلا إذا اخترتموه.",
       size:"حجم التنزيل: ", sizeUnknown:"لم أتمكّن من فحص حجم التنزيل الآن.", from:"تأتي الملفات من Hugging Face ومن jsDelivr، وهما يريان عنوان الشبكة للجهاز. يُستحسن التنزيل عبر Wi-Fi.",
       go:"تنزيل", later:"ليس الآن", sizing:"أفحص حجم التنزيل…", space:"لا توجد مساحة فارغة كافية في الجهاز للتنزيل.",
       down:"أنزّل ليمور: ", of:" من ", loading:"ليمور تُحمَّل في الجهاز…",
       ready:"ليمور تجيب الآن من الجهاز. إذا لم تنجح، يأتي الجواب من الخادم أو من الدماغ المحلي.", remove:"إزالة ليمور من الجهاز",
       error:"لم ينجح التنزيل. ليمور تواصل العمل كالمعتاد.", retry:"المحاولة مرة أخرى", gb:" غيغابايت", mb:" ميغابايت" },
  ru:{ offer:"Загрузить Лимор на устройство", offerNote:"Это устройство может запускать Лимор само, без сервера. Ваши вопросы не покидают устройство. Загрузка большая, поэтому она начинается только по вашему выбору.",
       size:"Размер загрузки: ", sizeUnknown:"Сейчас не удалось проверить размер загрузки.", from:"Файлы приходят с Hugging Face и jsDelivr, и они видят сетевой адрес устройства. Лучше загружать через Wi-Fi.",
       go:"Загрузить", later:"Не сейчас", sizing:"Проверяю размер загрузки…", space:"На устройстве недостаточно свободного места для загрузки.",
       down:"Загружаю Лимор: ", of:" из ", loading:"Лимор загружается на устройстве…",
       ready:"Лимор теперь отвечает с устройства. Если не получится, ответ придёт с сервера или из локального модуля.", remove:"Удалить Лимор с устройства",
       error:"Загрузка не удалась. Лимор продолжает работать как обычно.", retry:"Попробовать снова", gb:" ГБ", mb:" МБ" },
  en:{ offer:"Download Limor to this device", offerNote:"This device can run Limor by itself, without a server. Your questions do not leave the device. The download is large, so it only happens if you choose it.",
       size:"Download size: ", sizeUnknown:"I could not check the download size right now.", from:"The files come from Hugging Face and jsDelivr, and they see the device's network address. Wi-Fi is recommended.",
       go:"Download", later:"Not now", sizing:"Checking the download size…", space:"There is not enough free space on the device for the download.",
       down:"Downloading Limor: ", of:" of ", loading:"Limor is loading on the device…",
       ready:"Limor now answers from the device. If that fails, the answer comes from the server or the local brain.", remove:"Remove Limor from this device",
       error:"The download did not work. Limor carries on as usual.", retry:"Try again", gb:" GB", mb:" MB" }
};
function lang(){ var l = (document.documentElement.lang || "he").slice(0, 2); return TX[l] ? l : "he" }
function T(){ return TX[lang()] }
function safe(fn, dflt){ try { return fn() } catch (e) { return dflt } }
function store(k, v){ return safe(function(){ if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v) }, null) }
function bytes(n){
  var t = T();
  return n >= 1e9 ? (n / 1e9).toFixed(1) + t.gb : Math.round(n / 1e6) + t.mb;
}

/* ---------- 1 · האם המכשיר מסוגל ----------
   q4f16 דורש shader-f16. בלעדיו המודל אינו נטען, ולכן אין טעם
   להציע הורדה של גיגות שלא תרוץ. `deviceMemory` קיים בכרום בלבד
   ומעוגל; כשהוא חסר — לא פוסלים על סמך ניחוש. */
function capable(){
  if (!g.isSecureContext || !navigator.gpu) return Promise.resolve({ ok:false, why:"no-webgpu" });
  var mem = navigator.deviceMemory;
  if (mem && mem < MIN_MEM_GB) return Promise.resolve({ ok:false, why:"memory" });
  return navigator.gpu.requestAdapter().then(function(a){
    if (!a) return { ok:false, why:"no-adapter" };
    if (!a.features || !a.features.has("shader-f16")) return { ok:false, why:"no-f16" };
    return { ok:true, why:"" };
  }, function(){ return { ok:false, why:"adapter-error" } });
}

/* ---------- 2 · הגודל, נמדד ולא כתוב ----------
   הגודל נקרא מרשימת הקבצים של המאגר ב-Hugging Face, ברגע הלחיצה
   הראשונה. מספר שנכתב כאן ביד היה מתיישן בעדכון הבא של המודל. */
function measure(){
  return fetch(TREE).then(function(r){ return r.ok ? r.json() : [] }).then(function(list){
    var n = 0;
    (list || []).forEach(function(f){ if (f && WANT.test(f.path)) n += (f.lfs && f.lfs.size) || f.size || 0 });
    return n;
  }).catch(function(){ return 0 });
}
function roomFor(n){
  if (!n || !navigator.storage || !navigator.storage.estimate) return Promise.resolve(true);
  return navigator.storage.estimate().then(function(e){ return !e.quota || (e.quota - (e.usage || 0)) > n * 1.1 }, function(){ return true });
}

/* ---------- 3 · הטעינה ----------
   מהרשת בפעם הראשונה; מהמטמון של transformers.js בכל פעם אחריה. */
function load(){
  ST = store(FLAG) === "on" ? "loading" : "downloading"; draw();
  var seen = {};
  function progress(p){
    if (!p || p.status !== "progress" || !p.file) return;
    seen[p.file] = p.loaded || 0;
    LOADED = 0; for (var k in seen) LOADED += seen[k];
    if (!SIZE && p.total) SIZE = Math.max(SIZE, p.total);
    if (ST === "downloading") draw();
  }
  return Promise.all([
    import(LIB),
    import(BRAIN_URL)
  ]).then(function(m){
    LIBMOD = m[0]; BRAIN = m[1];
    LIBMOD.env.allowLocalModels = false;
    return LIBMOD.pipeline("text-generation", MODEL, { device:"webgpu", dtype:DTYPE, progress_callback:progress });
  }).then(function(gen){
    GEN = gen; ST = "ready";
    store(FLAG, "on");
    /* בלי בקשה להתמדה הדפדפן רשאי למחוק גיגות כשנגמר מקום. */
    safe(function(){ navigator.storage && navigator.storage.persist && navigator.storage.persist() });
    install(); draw();
    return true;
  }).catch(function(e){
    safe(function(){ console.error("[limor-device] " + (e && e.message || e)) });
    GEN = null; ST = "error"; draw();
    return false;
  });
}

function cached(){
  if (!g.caches) return Promise.resolve(false);
  return caches.open(CACHE).then(function(c){ return c.keys() }).then(function(keys){
    return keys.some(function(r){ return r.url.indexOf(MODEL) >= 0 && r.url.indexOf("decoder_model_merged") >= 0 });
  }).catch(function(){ return false });
}

function remove(){
  GEN = null; BRAIN = null; ST = "offer"; SIZE = 0; LOADED = 0;
  store(FLAG, null);
  draw();
  if (!g.caches) return Promise.resolve();
  return caches.open(CACHE).then(function(c){
    return c.keys().then(function(keys){
      return Promise.all(keys.filter(function(r){ return r.url.indexOf(MODEL) >= 0 }).map(function(r){ return c.delete(r) }));
    });
  }).catch(function(){});
}

/* ---------- 4 · התשובה ---------- */
function verdict(text, inp, turn){
  var ans = inp.q ? inp.q.ans : null;
  if (!text) return "empty";
  /* אותו תנאי בדיוק כמו `handleAsk` בשרת. */
  var guard = turn < 2 || inp.mode === "hint";
  if (guard && BRAIN.revealsAnswer(text, ans)) return "reveals";
  if (BRAIN.badEquation(text)) return "equation";
  if (BRAIN.badLang(text, inp.lang)) return "lang";
  return "";
}
function clean(s){
  return String(s || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
/* `body` — אותו גוף ש-`barak-core.js` שולח לשרת. מחזיר
   { ok, reason, text, ms, prompt }. `ok` שלילי = לא להציג ללומד. */
function answer(body){
  if (!GEN || !BRAIN) return Promise.resolve({ ok:false, reason:"not-ready", text:"", ms:0 });
  /* פעולות על המסך המודל הקטן אינו מבצע, ולכן הן אינן מוצעות לו:
     רשימה ריקה = `contextBlock` אינו מבטיח פעולה שלא תתבצע. בקשת
     פעולה (״הבא״, ״רמז״) נשארת במסלול הקיים — ראו install. */
  var b = Object.assign({}, body, { actions: [] });
  var inp = BRAIN.readBody(b);
  if (!inp) return Promise.resolve({ ok:false, reason:"body", text:"", ms:0 });
  var turn = inp.msgs.filter(function(m){ return m.role === "assistant" }).length;
  var sys = BRAIN.CORE + "\n" + BRAIN.contextBlock(inp, turn) + "\n" + BRAIN.DEVICE_RULE;
  var msgs = [{ role:"system", content:sys }].concat(inp.msgs.map(function(m){ return { role:m.role, content:m.content } }));
  var t0 = performance.now();
  return GEN(msgs, { max_new_tokens:MAX_NEW, do_sample:false }).then(function(out){
    var gen = out && out[0] && out[0].generated_text;
    var text = clean(Array.isArray(gen) ? (gen[gen.length - 1] || {}).content : gen);
    var why = verdict(text, inp, turn);
    return { ok:!why, reason:why, text:text, ms:Math.round(performance.now() - t0), prompt:sys };
  });
}

function face(sign){
  return sign === "frustrated" ? "encourage" : sign === "stuck" ? "stuck" : sign === "slow" ? "slow" : "speaking";
}

/* ---------- 5 · החיבור — עטיפה של BARAK.ask ----------
   `tutor.js` קורא ל-`BARAK.ask` בזמן השליחה, ולכן העטיפה תופסת בלי
   לגעת בו. מה שאינו שיחה רגילה ממשיך כמו היום: ״גרסה פשוטה״, ובקשת
   פעולה שהמוח המקומי מזהה — שם צריך לבצע, לא לנסח. */
var INSTALLED = false;
function install(){
  if (INSTALLED || !g.BARAK || typeof g.BARAK.ask !== "function") return;
  INSTALLED = true;
  var orig = g.BARAK.ask;
  g.BARAK.ask = function(text, opts){
    opts = opts || {};
    if (!GEN || !BRAIN || opts.mode === "simplify" || !g.BARAK.ready() || g.BARAK._intent(text))
      return orig(text, opts);
    var A = g.BARAK.adapter();
    var body = {
      app: A.app, lang: opts.lang || "he", target: opts.target || null, sign: opts.sign || null,
      mode: opts.mode || "chat", screen: g.BARAK.context(), userText: String(text || "").trim(),
      history: (opts.history || []).slice(-8).map(function(m){
        return { role: m.role === "assistant" ? "assistant" : "user", text: String(m.text || "").slice(0, 300) };
      })
    };
    return answer(body).then(function(r){
      if (!r.ok) {
        safe(function(){ console.warn("[limor-device] " + r.reason + " — ממשיכים לשרת") });
        return orig(text, opts);
      }
      return { say:r.text, action:null, face:face(opts.sign), source:"device", model:MODEL, why:"device", ms:r.ms };
    }, function(e){
      safe(function(){ console.error("[limor-device] " + (e && e.message || e)) });
      return orig(text, opts);
    });
  };
}

/* ---------- 6 · הכפתור ----------
   נצייר רק אם הדף נתן מקום: `<div id="limor-device">`. */
function btn(cls, act, label){
  return '<button class="btn' + (cls ? " " + cls : "") + '" type="button" data-ld="' + act + '">' + label + '</button>';
}
function esc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") }
function draw(){
  if (!BOX) return;
  var t = T(), h = "";
  if (ST === "offer") h = '<p>' + esc(t.offerNote) + '</p><div class="btns">' + btn("pri", "size", esc(t.offer)) + '</div>';
  else if (ST === "sizing") h = '<p role="status">' + esc(t.sizing) + '</p>';
  else if (ST === "confirm") h = '<p>' + esc(SIZE ? t.size + bytes(SIZE) + "." : t.sizeUnknown) + ' ' + esc(t.from) + '</p><div class="btns">' + btn("pri", "go", esc(t.go)) + btn("", "later", esc(t.later)) + '</div>';
  else if (ST === "space") h = '<p role="status">' + esc(t.space) + '</p><div class="btns">' + btn("", "later", esc(t.later)) + '</div>';
  else if (ST === "downloading") {
    var pct = SIZE ? Math.min(100, Math.round(LOADED / SIZE * 100)) : 0;
    h = '<p>' + esc(t.down) + (SIZE ? pct + "% · " + bytes(LOADED) + t.of + bytes(SIZE) : bytes(LOADED)) + '</p>' +
        '<progress max="100" value="' + pct + '" aria-label="' + esc(t.offer) + '" style="width:100%;height:14px"></progress>';
  }
  else if (ST === "loading") h = '<p role="status">' + esc(t.loading) + '</p>';
  else if (ST === "ready") h = '<p role="status">' + esc(t.ready) + '</p><div class="btns">' + btn("", "remove", esc(t.remove)) + '</div>';
  else if (ST === "error") h = '<p role="status">' + esc(t.error) + '</p><div class="btns">' + btn("", "go", esc(t.retry)) + '</div>';
  BOX.hidden = !h;
  BOX.innerHTML = h;
}
function onClick(e){
  var b = e.target.closest && e.target.closest("[data-ld]"); if (!b) return;
  var a = b.getAttribute("data-ld");
  if (a === "size") {
    ST = "sizing"; draw();
    measure().then(function(n){ SIZE = n; return roomFor(n) }).then(function(ok){ ST = ok ? "confirm" : "space"; draw() });
  }
  else if (a === "go") load();
  else if (a === "later") { ST = "offer"; draw() }
  else if (a === "remove") remove();
}

function boot(){
  BOX = document.getElementById("limor-device");
  if (BOX) {
    BOX.addEventListener("click", onClick);
    /* הדף מחליף שפה ב-`<html lang>`; הכפתור מתחלף איתו. */
    safe(function(){ new MutationObserver(draw).observe(document.documentElement, { attributes:true, attributeFilter:["lang"] }) });
  }
  capable().then(function(c){
    if (!c.ok) { ST = "unable"; draw(); return }
    /* הלומד כבר בחר בעבר — טוענים מהמטמון, בלי לשאול שוב. ורק אם
       הקבצים עדיין שם: דפדפן שפינה מקום היה גורם כאן להורדה של
       גיגות בלי לחיצה, וזה בדיוק מה שאסור. */
    return store(FLAG) === "on" ? cached() : false;
  }).then(function(has){
    if (ST === "unable") return;
    if (has) load();
    else { store(FLAG, null); ST = "offer"; draw() }
  });
}

g.LIMOR_DEVICE = {
  MODEL: MODEL, DTYPE: DTYPE, LIB: LIB,
  capable: capable, measure: measure, load: load, remove: remove,
  answer: answer, ready: function(){ return !!(GEN && BRAIN) }, state: function(){ return ST }
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(window);
