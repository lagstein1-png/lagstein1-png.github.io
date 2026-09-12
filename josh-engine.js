/* ============================================================
   josh-engine.js — המנוע של "ג'וש", מורה דיגיטלי צף
   הקראה קולית (SpeechSynthesis) + זיהוי דיבור (SpeechRecognition)

   שימוש בסיסי:
     <link rel="stylesheet" href="josh-avatar.css">
     <script src="josh-engine.js" defer></script>

   API:
     Josh.say("שלום!")             — ג'וש מקריא, וכותב בצ'אט או בבועה
     Josh.stop()                   — עצירת הקראה
     Josh.openChat() / closeChat() / toggleChat()
     Josh.send("שאלה")             — שליחת הודעה כאילו הוקלדה
     Josh.answer(fn)               — מחליף את מנגנון התשובות (מחרוזת או Promise)
     Josh.toggleMuted()            — הרמקול: מקריא או שקט
     Josh.listen() / Josh.stopListening() / Josh.toggleMic()
     Josh.readSelection()          — הקראת הטקסט המסומן בעמוד
     Josh.readElement("#article")  — הקראת אלמנט בעמוד
     Josh.on("result", txt => ...) — אירועים: speakstart|speakend|result|interim|
                                     error|state|message|chatopen|chatclose
     Josh.addCommand(/למה/, fn)    — פקודה קולית מותאמת
     Josh.config({ rate: 1.1, name: "ג'וש" })

   מראה לפי פעילות (josh-sprites.png):
     Josh.greetPose()              — 'מברך', מנוגן אוטומטית בטעינה
     Josh.thinking(true/false)     — 'חושב/מגרד בראש', אוטומטי בהמתנה ל-AI
     Josh.solving(true/false)      — 'מסתכל הצידה', כשהתלמיד פותר
     Josh.celebrate()              — 'חוגג': תשובה נכונה — חיוך, הנהון, נפנוף
     Josh.encourage()              — 'מעודד': טעות — מגרד בראש ומחזק
     Josh.setPose("talk")          — כפייה ידנית של מצב
   'מדבר' נדלק מעצמו בכל הקראה. המעברים הם הצלבה רכה בין שתי שכבות.

   חיפוש ברשת כשאין תשובה:
     Josh.search("שאלה")           — מחזיר Promise עם תשובה או null
     Josh.provider(fn)             — ספק חיפוש משלכם (דרך שרת שלכם)
   ברירת המחדל היא ויקיפדיה בעברית — פתוחה ל-CORS, בלי מפתח.

   תמונות: josh-sprites.png לגיליון המצבים, josh-avatar.png לפנים
   סטטיות. אם קובץ חסר — ג'וש נופל אחורה לפנים המצוירות המובנות,
   בלי תמונה שבורה ובלי שגיאה בקונסולה.
   ============================================================ */

(function (global) {
  "use strict";

  /* ------------------------------------------------------------------
     הגדרות
     ------------------------------------------------------------------ */
  var DEFAULTS = {
    name: "ג'וש הגאון",
    lang: "he-IL",
    /* קצב רגוע וברור ללומדים צעירים. 1.0 מהיר מדי לתלמיד שקורא יחד
       עם ההקראה; 0.85 נותן זמן לעבד בלי להישמע מלאכותי. */
    rate: 0.85,
    pitch: 1.0,             // ללא שינוי גובה — הטבעיות מגיעה מבחירת הקול
    volume: 1,
    greeting: "שלום! אני ג'וש הגאון, המורה הדיגיטלי שלך. אפשר ללחוץ על המיקרופון ולשאול אותי שאלה.",
    autoGreet: false,       // האם להקריא ברכה בטעינה (נחסם בדפדפנים עד מגע ראשון)
    continuous: true,       // האזנה רציפה — מפעילה מחדש את המיקרופון אוטומטית
    draggable: true,
    position: "right",      // "right" | "left"
    bubbleTimeout: 9000,    // מילישניות עד סגירת הבועה (0 = לא נסגרת)
    /* v2: ההגדרות השמורות נטענות מעל ברירות המחדל, ולכן מי שכבר ביקר
       היה נתקע עם rate הישן. שינוי המפתח מבטיח שהקצב החדש באמת יגיע. */
    storageKey: "josh.settings.v2",

    /* תמונת הפנים. אם הקובץ חסר או לא נטען — חוזרים ל-SVG המובנה,
       כך שהרכיב לעולם אינו מציג ריבוע שבור.

       **ריק, ובכוונה.** `josh-avatar.png` אינו בריפו, ומחרוזת שמצביעה
       לקובץ שאינו קיים אינה "נפילה שקטה": הדפדפן מבקש אותו, מקבל 404,
       וכותב שגיאה לקונסולה בכל טעינה של דף הבית — וזה מה שהפיל את
       `smoke.js` על השורש. מחרוזת ריקה מחזירה את אותן פנים בדיוק
       (`if (!this.opts.avatarImage) return FACE_SVG`) בלי הבקשה.
       נכנס קובץ פנים אמיתי — כותבים כאן את שמו. */
    avatarImage: "",
    muted: false,           // רמקול כבוי — ג'וש כותב בצ'אט בלי להקריא
    chatPlaceholder: "כתבו לי שאלה...",
    chatFallback: "עוד אין לי תשובה מוכנה לשאלה הזאת. אפשר לבקש ממני להקריא את הדף, לעצור, או לדבר לאט יותר.",

    /* ----------------------------------------------------------------
       גיליון הספרייטים. מצב אחד מוצג בכל רגע, והמעבר בין מצבים נעשה
       בהצלבה רכה בין שתי שכבות — בלי "קפיצה" בין תמונות.

       cols/rows מתארים את רשת הגיליון בלבד. המיקום מחושב באחוזים, ולכן
       אין צורך לדעת את מידות הפיקסלים של הקובץ והוא יכול להתחלף בלי
       לגעת בקוד. row = שורת המצב בגיליון, frames = כמה פריימים בשורה.

       אם הקובץ חסר או לא נטען — ג'וש ממשיך עם הפנים הרגילות, בלי
       תמונה שבורה ובלי שגיאה. לכן אפשר להריץ את זה עוד לפני שהגיליון
       מוכן, ולהחליף אותו אחר כך.
       ---------------------------------------------------------------- */
    sprite: {
      image: "josh-sprites.png",
      cols: 4,              // כמה פריימים ברוחב הגיליון
      rows: 6,              // כמה שורות (= כמה מצבים)
      fps: 7,
      fade: 260,            // משך ההצלבה בין מצבים, מילישניות

      /* הפריסה שהקוד מצפה לה: 6 שורות × 4 עמודות, כל התאים בגודל זהה,
         והפריימים בכל שורה משמאל לימין לפי סדר התנועה.

             שורה 0   idle       עמידה רגועה; מצמוץ והזזת ראש קלה
             שורה 1   greet      מברך — חיוך ונפנוף, בטעינה
             שורה 2   talk       מדבר — הפה פתוח בדרגות שונות
             שורה 3   think      חושב / מגרד בראש
             שורה 4   aside      מסתכל הצידה — התלמיד פותר
             שורה 5   celebrate  תשובה נכונה — חיוך, הנהון, נפנוף

         מספר השורות/עמודות אינו קבוע: שינוי cols/rows וה-row של כל
         מצב מספיק, ואין צורך לגעת בשאר הקוד. */
      poses: {
        idle:      { row: 0, frames: 4, rest: 3200 },   // rest = הפוגה בין מחזורים
        greet:     { row: 1, frames: 4, loop: false, hold: 2800 },
        talk:      { row: 2, frames: 4 },
        think:     { row: 3, frames: 4 },
        aside:     { row: 4, frames: 4, rest: 2600 },
        celebrate: { row: 5, frames: 4, loop: false, hold: 2400 }
      }
    },

    /* סנכרון שפתיים: הדפדפן מדווח על גבולות מילים בזמן ההקראה
       (onboundary), ואפשר להניע את הפה לפי הדיבור האמיתי במקום לפי
       שעון קבוע. ב-Safari האירוע לא נורה, ואז נשארת האנימציה הרגילה. */
    lipSync: true,

    /* ----------------------------------------------------------------
       חיפוש ברשת כשאין תשובה. ראו P.search למטה.
       ברירת המחדל היא ויקיפדיה בעברית: היא פתוחה ל-CORS, בלי מפתח
       ובלי הרשמה, ולכן עובדת מדף סטטי. ספק אחר נכנס דרך searchProvider.
       ---------------------------------------------------------------- */
    search: true,           // false מכבה את החיפוש לגמרי
    searchLang: "he",
    searchResults: 3,
    searchTimeout: 9000
  };

  var MAX_CHUNK = 180;      // Chrome קוטע הקראות ארוכות — מפצלים למקטעים

  /* משפטי תגובה. רשימה ולא משפט קבוע: תלמיד פותר עשרות שאלות ברצף,
     ואותו משפט בדיוק בכל פעם נשמע כמו מכונה ומפסיק לעודד. */
  var PRAISE = [
    "יפה מאוד! בדיוק נכון.",
    "כל הכבוד! הבנת את זה.",
    "מצוין! ממשיכים הלאה.",
    "נכון! אתה בכיוון הנכון."
  ];
  var ENCOURAGE = [
    "לא נורא, זו שאלה לא פשוטה. בוא ננסה שוב.",
    "כמעט! תסתכל שוב על השאלה, אתה קרוב.",
    "זה בסדר לטעות — ככה לומדים. ננסה עוד פעם?",
    "אל תוותר. אפשר ללחוץ על פתרון ולראות איך זה עובד."
  ];

  function pickOne(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* פנים ה-SVG המובנות. משמשות כגיבוי כשתמונת האווטאר חסרה,
     והן היחידות שיודעות להניע פה ועיניים. */
  var FACE_SVG =
    '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="46" fill="#fde8d0"/>' +
      '<path d="M8 42c2-24 20-36 42-36s40 12 42 36c-6-4-14-10-22-18-10 10-30 16-62 18z" fill="#4b3621"/>' +
      '<ellipse class="josh-eye josh-eye--left"  cx="36" cy="52" rx="6" ry="7.5" fill="#2b2b2b"/>' +
      '<ellipse class="josh-eye josh-eye--right" cx="64" cy="52" rx="6" ry="7.5" fill="#2b2b2b"/>' +
      '<circle cx="38" cy="49.5" r="2" fill="#fff"/>' +
      '<circle cx="66" cy="49.5" r="2" fill="#fff"/>' +
      '<ellipse class="josh-mouth" cx="50" cy="74" rx="12" ry="7" fill="#a83b3b"/>' +
      '<ellipse cx="26" cy="66" rx="6" ry="4" fill="#f2a7a0" opacity=".55"/>' +
      '<ellipse cx="74" cy="66" rx="6" ry="4" fill="#f2a7a0" opacity=".55"/>' +
    '</svg>';

  /* ------------------------------------------------------------------
     כלים קטנים
     ------------------------------------------------------------------ */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function loadStored(key) {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); }
    catch (e) { return {}; }
  }

  function saveStored(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) { /* מצב פרטי */ }
  }

  /**
   * גבול מילה שעובד בעברית, בערבית וברוסית.
   * ה-\b של JavaScript מוגדר מעל [A-Za-z0-9_] בלבד, ולכן /\bעצור\b/
   * אינו מתאים לעולם למילה עברית — הביטוי נראה תקין ופשוט לא נורה.
   * כאן הגבול הוא "כל מה שאינו אות או ספרה", בכל שפה.
   */
  function wordRe(source) {
    // בדיבור חופשי המילה כמעט תמיד נושאת אות בראשה: אות שימוש ("תן לי את
    // הפתרון", "ושוב") או ת' של ציווי ("תעצור", "תקרא"). בלי ההיתר הזה
    // רוב הפקודות פשוט לא נורות.
    return new RegExp(
      "(?:^|[^\\p{L}\\p{N}])[הובלמכשת]?(?:" + source + ")(?:[^\\p{L}\\p{N}]|$)",
      "iu"
    );
  }

  /** מפצל טקסט ארוך למשפטים קצרים כדי שההקראה לא תיקטע באמצע */
  function chunkText(text) {
    // פיצול אחרי סימני פיסוק, בלי lookbehind (לא נתמך ב־Safari ישן)
    var parts = String(text).replace(/\s+/g, " ").trim()
      .replace(/([.!?…:;])\s+/g, "$1\u0000").split("\u0000");
    var out = [], buf = "";
    parts.forEach(function (p) {
      while (p.length > MAX_CHUNK) {            // משפט ארוך במיוחד — חותכים ברווח
        var cut = p.lastIndexOf(" ", MAX_CHUNK);
        if (cut < 40) cut = MAX_CHUNK;
        out.push(p.slice(0, cut));
        p = p.slice(cut).trim();
      }
      if ((buf + " " + p).trim().length <= MAX_CHUNK) {
        buf = (buf + " " + p).trim();
      } else {
        if (buf) out.push(buf);
        buf = p;
      }
    });
    if (buf) out.push(buf);
    return out.filter(Boolean);
  }

  /* ------------------------------------------------------------------
     המחלקה
     ------------------------------------------------------------------ */
  function JoshEngine(options) {
    this.opts = Object.assign({}, DEFAULTS, options || {});
    Object.assign(this.opts, loadStored(this.opts.storageKey));

    this.synth = global.speechSynthesis || null;
    this.voice = null;
    this.queue = [];
    this.state = "idle";          // idle | speaking | listening
    this.listening = false;
    this.wantsToListen = false;
    this.unlocked = false;
    this.commands = [];
    this.handlers = {};
    this._bubbleTimer = null;
    this._keepAlive = null;

    /* מצב הספרייט. _busy = ממתין לתשובה מה-AI, _solving = התלמיד פותר */
    this._spriteOK = false;
    this._poseName = null;
    this._pose = null;
    this._frame = 0;
    this._oneShot = null;
    this._busy = false;
    this._solving = false;

    this._buildUI();
    this._initVoices();
    this._initRecognition();
    this._registerDefaultCommands();
    this._initUnlock();
    this._initSprite();

    if (this.opts.autoGreet && this.opts.greeting) {
      var self = this;
      setTimeout(function () { self.say(self.opts.greeting); }, 700);
    }
  }

  var P = JoshEngine.prototype;

  /* ---------------- אירועים ---------------- */
  P.on = function (name, fn) {
    (this.handlers[name] = this.handlers[name] || []).push(fn);
    return this;
  };
  P.off = function (name, fn) {
    var list = this.handlers[name] || [];
    this.handlers[name] = list.filter(function (f) { return f !== fn; });
    return this;
  };
  P._emit = function (name, data) {
    (this.handlers[name] || []).forEach(function (fn) {
      try { fn(data); } catch (e) { console.error("[Josh] handler error:", e); }
    });
  };

  /* ---------------- בניית ה־DOM ---------------- */
  P._buildUI = function () {
    var self = this;

    var root = el("div", "josh-root");
    root.dir = "rtl";
    root.setAttribute("data-state", "idle");
    root.setAttribute("data-pos", this.opts.position);

    /* בועת דיבור */
    var bubble = el("div", "josh-bubble");
    bubble.setAttribute("role", "status");
    bubble.setAttribute("aria-live", "polite");
    var close = el("button", "josh-bubble__close", "&times;");
    close.type = "button";
    close.setAttribute("aria-label", "סגירת ההודעה");
    var nameEl = el("div", "josh-bubble__name", this.opts.name);
    var textEl = el("div", "josh-bubble__text");
    bubble.appendChild(close);
    bubble.appendChild(nameEl);
    bubble.appendChild(textEl);

    /* כפתורים */
    var actions = el("div", "josh-actions");
    var micBtn = el("button", "josh-btn josh-btn--mic", "🎤");
    micBtn.type = "button";
    micBtn.title = "דברו אל " + this.opts.name;
    micBtn.setAttribute("aria-label", "הפעלת מיקרופון");
    micBtn.setAttribute("aria-pressed", "false");

    var readBtn = el("button", "josh-btn josh-btn--read", "🔊");
    readBtn.type = "button";
    readBtn.title = "הקראת הטקסט המסומן בעמוד";
    readBtn.setAttribute("aria-label", "הקראת הטקסט המסומן");

    var stopBtn = el("button", "josh-btn josh-btn--stop", "■");
    stopBtn.type = "button";
    stopBtn.title = "עצירה";
    stopBtn.setAttribute("aria-label", "עצירת ההקראה");

    actions.appendChild(micBtn);
    actions.appendChild(readBtn);
    actions.appendChild(stopBtn);

    /* האווטאר */
    var avatar = el("button", "josh-avatar");
    avatar.type = "button";
    avatar.title = this.opts.name + " — המורה הדיגיטלי";
    avatar.setAttribute("aria-label", "פתיחת הצ'אט עם " + this.opts.name);
    avatar.setAttribute("aria-expanded", "false");
    avatar.innerHTML = this._faceMarkup() + '<span class="josh-badge" aria-hidden="true">●</span>';
    this._wireFaceFallback(avatar);

    /* חלון הצ'אט */
    var chat = el("div", "josh-chat");
    chat.setAttribute("role", "dialog");
    chat.setAttribute("aria-label", "צ'אט עם " + this.opts.name);
    chat.innerHTML =
      '<div class="josh-chat__head">' +
        '<span class="josh-chat__face">' + this._faceMarkup() + '</span>' +
        '<span class="josh-chat__titles">' +
          '<span class="josh-chat__name"></span>' +
          '<span class="josh-chat__status" aria-live="polite">מוכן לעזור</span>' +
        '</span>' +
        '<button type="button" class="josh-chat__close" aria-label="סגירת הצ\'אט">&times;</button>' +
      '</div>' +
      '<div class="josh-chat__log" role="log" aria-live="polite"></div>' +
      '<form class="josh-chat__form">' +
        '<textarea class="josh-chat__input" rows="1" aria-label="ההודעה שלך"></textarea>' +
        '<button type="submit" class="josh-chat__send" aria-label="שליחה">&#10148;</button>' +
      '</form>';

    var chatLog   = chat.querySelector(".josh-chat__log");
    var chatForm  = chat.querySelector(".josh-chat__form");
    var chatInput = chat.querySelector(".josh-chat__input");
    var chatStatus = chat.querySelector(".josh-chat__status");
    var chatName  = chat.querySelector(".josh-chat__name");
    chatName.textContent = this.opts.name;
    chatInput.placeholder = this.opts.chatPlaceholder;
    this._wireFaceFallback(chat.querySelector(".josh-chat__face"));

    root.appendChild(chat);
    root.appendChild(bubble);
    root.appendChild(actions);
    root.appendChild(avatar);
    (document.body || document.documentElement).appendChild(root);

    this.dom = { root: root, bubble: bubble, text: textEl, name: nameEl,
                 mic: micBtn, read: readBtn, stop: stopBtn, avatar: avatar,
                 chat: chat, log: chatLog, form: chatForm, input: chatInput,
                 status: chatStatus, chatName: chatName };

    /* חיווט אירועים */
    close.addEventListener("click", function () { self.hideBubble(); });
    micBtn.addEventListener("click", function () { self.toggleMic(); });
    readBtn.addEventListener("click", function () { self.toggleMuted(); });
    stopBtn.addEventListener("click", function () { self.stop(); self.stopListening(); });

    /* לחיצה על הפנים פותחת וסוגרת את הצ'אט */
    avatar.addEventListener("click", function () {
      if (self._dragged) { self._dragged = false; return; }   // סוף גרירה — לא לחיצה
      self._unlock();
      self.toggleChat();
    });

    chat.querySelector(".josh-chat__close").addEventListener("click", function () {
      self.closeChat();
    });

    chatForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      self.send(chatInput.value);
    });

    chatInput.addEventListener("input", function () { self._growInput(); });
    chatInput.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        self.send(chatInput.value);
      }
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && root.classList.contains("is-chat-open")) self.closeChat();
    });

    /* הצ'אט לא אמור לגרור את הרכיב בזמן בחירת טקסט או גלילה */
    chat.addEventListener("mousedown", function (ev) { ev.stopPropagation(); });
    chat.addEventListener("touchstart", function (ev) { ev.stopPropagation(); }, { passive: true });

    this._syncReadBtn();
    if (this.opts.draggable) this._makeDraggable();
    this._restorePosition();
  };

  /* ---------------- הפנים: תמונה עם נפילה ל-SVG ---------------- */
  P._faceMarkup = function () {
    if (!this.opts.avatarImage) return FACE_SVG;
    return '<img class="josh-face-img" src="' + String(this.opts.avatarImage).replace(/"/g, "&quot;") +
           '" alt="" draggable="false">';
  };

  /**
   * תמונה חסרה מציגה סמל "שבור" בכל דפדפן. במקום זה מחליפים אותה
   * בפנים ה-SVG, כך שהרכיב נראה תקין גם בלי קובץ התמונה.
   */
  P._wireFaceFallback = function (holder) {
    var img = holder && holder.querySelector(".josh-face-img");
    if (!img) return;
    img.addEventListener("error", function () {
      var badge = holder.querySelector(".josh-badge");
      holder.innerHTML = FACE_SVG + (badge ? badge.outerHTML : "");
      holder.classList.add("has-svg-face");
    }, { once: true });
  };

  /* ==================================================================
     גיליון הספרייטים — המראה של ג'וש לפי מה שהוא עושה

       greet  בטעינה          talk   בזמן הקראה
       think  בזמן המתנה ל-AI aside  כשהתלמיד פותר
       idle   ברירת המחדל

     המעבר בין מצבים הוא הצלבה בין שתי שכבות: מציירים את המצב החדש על
     השכבה הכבויה, ורק אז מחליפים שקיפות. חיתוך ישיר של background-position
     היה קופץ, וזה מה שמונע את זה.
     ================================================================== */

  P._initSprite = function () {
    var s = this.opts.sprite;
    if (!s || !s.image || !s.poses) return;

    var self = this;
    this.dom.root.style.setProperty("--josh-fade", (s.fade || 260) + "ms");

    /* בודקים שהתמונה באמת נטענת לפני שנוגעים ב-DOM. אם לא —
       הפנים הרגילות (תמונה או SVG) נשארות בדיוק כפי שהן. */
    var probe = new Image();
    probe.addEventListener("load", function () {
      if (!probe.naturalWidth) return;
      self._spriteOK = true;
      self._mountSprite();
      self.greetPose();                 // 'מברך' בטעינה
    });
    probe.addEventListener("error", function () {
      console.info("[Josh] " + s.image + " לא נמצא — ג'וש ממשיך עם הפנים הרגילות.");
    });
    probe.src = s.image;
  };

  /** מחליף את הפנים הסטטיות בשתי שכבות ספרייט, באווטאר ובראש הצ'אט */
  P._mountSprite = function () {
    var self = this;
    var holders = [this.dom.avatar];
    var chatFace = this.dom.chat && this.dom.chat.querySelector(".josh-chat__face");
    if (chatFace) holders.push(chatFace);

    this._spriteNodes = [];
    holders.forEach(function (holder) {
      var old = holder.querySelector(".josh-face-img, svg");
      var wrap = el("span", "josh-sprite");
      wrap.setAttribute("aria-hidden", "true");
      wrap.innerHTML = '<span class="josh-sprite__layer is-on"></span>' +
                       '<span class="josh-sprite__layer"></span>';
      if (old) holder.replaceChild(wrap, old);
      else holder.insertBefore(wrap, holder.firstChild);
      self._spriteNodes.push(wrap);
    });
  };

  /** כמה פריימים יש בפועל במצב — לא יותר ממה שנשאר בשורה */
  P._poseFrames = function (pose) {
    var s = this.opts.sprite;
    var from = pose.from || 0;
    return Math.max(1, Math.min(pose.frames || 1, s.cols - from));
  };

  /** מיקום הפריים באחוזים — עובד בלי לדעת את מידות הפיקסלים של הגיליון */
  P._paintLayer = function (layer, pose, frame) {
    var s = this.opts.sprite;
    var col = (pose.from || 0) + frame;
    var x = s.cols > 1 ? (col / (s.cols - 1)) * 100 : 0;
    var y = s.rows > 1 ? (pose.row / (s.rows - 1)) * 100 : 0;
    layer.style.backgroundImage = 'url("' + s.image.replace(/"/g, '\\"') + '")';
    layer.style.backgroundSize = (s.cols * 100) + "% " + (s.rows * 100) + "%";
    layer.style.backgroundPosition = x + "% " + y + "%";
  };

  P._reducedMotion = function () {
    try {
      return !!(global.matchMedia &&
                global.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) { return false; }
  };

  /**
   * מעבר למצב מסוים. בדרך כלל אין צורך לקרוא לזה ישירות — המצב נגזר
   * מעצמו מ-speaking/thinking/solving דרך _refreshPose.
   */
  P.setPose = function (name, force) {
    if (!this._spriteOK) return this;
    var s = this.opts.sprite;
    var pose = s.poses[name] || s.poses.idle;
    if (!pose) return this;
    if (this._poseName === name && !force) return this;

    var self = this;
    this._poseName = name;
    this._pose = pose;
    this._frame = 0;
    clearInterval(this._poseTimer);
    this._poseTimer = null;

    /* ההצלבה: מציירים על השכבה הכבויה ואז מדליקים אותה */
    this._spriteNodes.forEach(function (wrap) {
      var a = wrap.children[0], b = wrap.children[1];
      var on = a.classList.contains("is-on") ? a : b;
      var off = on === a ? b : a;
      self._paintLayer(off, pose, 0);
      off.classList.add("is-on");
      on.classList.remove("is-on");
    });

    clearTimeout(this._restTimer);
    if (this._poseFrames(pose) > 1 && !this._reducedMotion()) {
      this._startFrameTimer();
    }
    return this;
  };

  P._stepFrame = function () {
    var pose = this._pose;
    if (!pose) return;
    var frames = this._poseFrames(pose);
    var next = this._frame + 1;

    if (next >= frames) {
      if (pose.loop === false) {          // מצב חד-פעמי: נעצר בפריים האחרון
        clearInterval(this._poseTimer);
        this._poseTimer = null;
        return;
      }
      /* מצב עם rest — מצמוץ והזזת ראש. לולאה רצופה נראית עצבנית
         ומושכת את העין מהלימוד; כאן המחזור רץ, נח, ורץ שוב, עם
         פיזור אקראי כדי שלא ייראה מכני. */
      if (pose.rest) {
        var self2 = this;
        clearInterval(this._poseTimer);
        this._poseTimer = null;
        clearTimeout(this._restTimer);
        this._restTimer = setTimeout(function () {
          if (self2._pose !== pose) return;        // המצב התחלף בינתיים
          self2._startFrameTimer();
        }, pose.rest + Math.random() * pose.rest * 0.6);
        next = 0;
      } else {
        next = 0;
      }
    }
    this._frame = next;

    var self = this;
    this._spriteNodes.forEach(function (wrap) {
      var on = wrap.querySelector(".josh-sprite__layer.is-on");
      if (on) self._paintLayer(on, pose, next);
    });
  };

  P._startFrameTimer = function () {
    var self = this, s = this.opts.sprite;
    clearInterval(this._poseTimer);
    this._poseTimer = setInterval(function () { self._stepFrame(); },
                                  Math.max(60, 1000 / (s.fps || 7)));
  };

  /**
   * מניע פריים אחד קדימה בפה — נקרא מאירועי onboundary של ההקראה,
   * כך שהשפתיים זזות לפי המילים שנאמרות ולא לפי שעון קבוע.
   */
  P._lipStep = function () {
    if (this._poseName !== "talk" || !this._pose) return;
    /* מרגע שהגיע גבול מילה ראשון — הדיבור מוביל, לא הטיימר */
    if (this._poseTimer) { clearInterval(this._poseTimer); this._poseTimer = null; }
    var frames = this._poseFrames(this._pose);
    this._frame = (this._frame + 1) % frames;
    var self = this;
    this._spriteNodes.forEach(function (wrap) {
      var on = wrap.querySelector(".josh-sprite__layer.is-on");
      if (on) self._paintLayer(on, self._pose, self._frame);
    });
  };

  /**
   * 'חוגג' — תשובה נכונה: חיוך, הנהון ונפנוף, ומשפט מעודד.
   * @param {string} [text] מה להגיד; ברירת מחדל מתחלפת כדי שלא ישעמם
   */
  P.celebrate = function (text) {
    var s = this.opts.sprite;
    if (this._spriteOK && s.poses.celebrate) {
      var self = this;
      this._oneShot = "celebrate";
      this.setPose("celebrate", true);
      clearTimeout(this._greetTimer);
      this._greetTimer = setTimeout(function () {
        self._oneShot = null;
        self._refreshPose();
      }, s.poses.celebrate.hold || 2400);
    }
    return this.say(text || pickOne(PRAISE));
  };

  /** 'מעודד' — טעות או קושי: מגרד בראש ואומר משהו מחזק */
  P.encourage = function (text) {
    if (this._spriteOK) {
      var self = this;
      this._oneShot = "think";
      this.setPose("think", true);
      clearTimeout(this._greetTimer);
      this._greetTimer = setTimeout(function () {
        self._oneShot = null;
        self._refreshPose();
      }, 2600);
    }
    return this.say(text || pickOne(ENCOURAGE));
  };

  /**
   * איזה מצב מתאים עכשיו. הסדר הוא סדר העדיפות.
   * הברכה נמצאת בתחתית בכוונה: היא רק "מה שרואים כשלא קורה כלום".
   * אם היא הייתה למעלה, הקראה או חיפוש שמתחילים תוך כדי הברכה
   * לא היו מזיזים את הפנים בכלל.
   */
  P._resolvePose = function () {
    var poses = this.opts.sprite.poses;
    if (this.state === "speaking") return "talk";
    if (this._busy) return "think";
    if (this.state === "listening" && poses.listen) return "listen";
    if (this._solving) return "aside";
    if (this._oneShot) return this._oneShot;
    return "idle";
  };

  P._refreshPose = function (force) {
    if (!this._spriteOK) return this;
    var next = this._resolvePose();

    /* פעילות אמיתית גברה על הברכה — מבטלים אותה, אחרת היא הייתה
       חוזרת ומופיעה כשהפעילות מסתיימת, הרבה אחרי הטעינה. */
    if (this._oneShot && next !== this._oneShot) {
      this._oneShot = null;
      clearTimeout(this._greetTimer);
    }

    this.setPose(next, force);
    return this;
  };

  /** 'מברך' — מנוגן פעם אחת ואז חוזר למצב הרגיל */
  P.greetPose = function () {
    var s = this.opts.sprite;
    if (!this._spriteOK || !s.poses.greet) return this;
    var self = this;
    this._oneShot = "greet";
    this._refreshPose(true);
    clearTimeout(this._greetTimer);
    this._greetTimer = setTimeout(function () {
      self._oneShot = null;
      self._refreshPose();
    }, s.poses.greet.hold || 2800);
    return this;
  };

  /** 'חושב' — ממתין לתשובה מה-AI או לחיפוש. נקרא אוטומטית מ-send. */
  P.thinking = function (on) {
    this._busy = on !== false;
    return this._refreshPose();
  };

  /** 'מסתכל הצידה' — התלמיד עובד על משהו. הדף קורא לזה בעצמו. */
  P.solving = function (on) {
    this._solving = on !== false;
    return this._refreshPose();
  };

  /* ---------------- גרירה ---------------- */
  P._makeDraggable = function () {
    var self = this, root = this.dom.root, start = null;

    function down(e) {
      var p = e.touches ? e.touches[0] : e;
      var r = root.getBoundingClientRect();
      start = { x: p.clientX, y: p.clientY, left: r.left, top: r.top, moved: false };
      document.addEventListener("mousemove", move, { passive: false });
      document.addEventListener("touchmove", move, { passive: false });
      document.addEventListener("mouseup", up);
      document.addEventListener("touchend", up);
    }

    function move(e) {
      if (!start) return;
      var p = e.touches ? e.touches[0] : e;
      var dx = p.clientX - start.x, dy = p.clientY - start.y;
      if (!start.moved && Math.abs(dx) + Math.abs(dy) < 6) return;   // סף רעידה
      start.moved = true;
      e.preventDefault();
      var r = root.getBoundingClientRect();
      var left = Math.min(Math.max(0, start.left + dx), innerWidth - r.width);
      var top  = Math.min(Math.max(0, start.top + dy), innerHeight - r.height);
      root.style.left = left + "px";
      root.style.top = top + "px";
      root.style.right = "auto";
      root.style.bottom = "auto";
      root.setAttribute("data-pos", left < innerWidth / 2 ? "left" : "right");
    }

    function up() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("mouseup", up);
      document.removeEventListener("touchend", up);
      if (start && start.moved) {
        self._dragged = true;
        saveStored(self.opts.storageKey + ".pos", {
          left: root.style.left, top: root.style.top,
          pos: root.getAttribute("data-pos")
        });
      }
      start = null;
    }

    this.dom.avatar.addEventListener("mousedown", down);
    this.dom.avatar.addEventListener("touchstart", down, { passive: true });
  };

  P._restorePosition = function () {
    var p = loadStored(this.opts.storageKey + ".pos");
    if (!p || !p.left) return;
    var root = this.dom.root;
    root.style.left = p.left;
    root.style.top = p.top;
    root.style.right = "auto";
    root.style.bottom = "auto";
    if (p.pos) root.setAttribute("data-pos", p.pos);
  };

  /* ---------------- מצב ---------------- */
  P._setState = function (state) {
    this.state = state;
    this.dom.root.setAttribute("data-state", state);
    this._syncMicBtn();
    if (this.dom.status) this.dom.status.textContent = this._stateLabel(state);
    this._refreshPose();          // הפנים עוקבות אחרי המצב
    this._emit("state", state);
  };

  /**
   * כפתור המיקרופון משקף את מה שהמשתמש ביקש, לא את מצב המנוע.
   * אישור ההרשאה בדפדפן לוקח זמן, ובלי זה הלחיצה נראית כאילו לא קרה דבר.
   */
  P._syncMicBtn = function () {
    var b = this.dom.mic;
    if (!b) return;
    b.setAttribute("aria-pressed", this.wantsToListen ? "true" : "false");
    b.title = this.wantsToListen ? "המיקרופון פועל — לחצו לכיבוי" : "דברו אל " + this.opts.name;
    b.setAttribute("aria-label", b.title);
  };

  /* ---------------- בועה ---------------- */
  P.showBubble = function (text, interim) {
    var b = this.dom.bubble;
    this.dom.text.textContent = text;
    b.classList.toggle("is-interim", !!interim);
    b.classList.add("is-open");
    clearTimeout(this._bubbleTimer);
    if (!interim && this.opts.bubbleTimeout > 0) {
      var self = this;
      this._bubbleTimer = setTimeout(function () { self.hideBubble(); },
        this.opts.bubbleTimeout + text.length * 45);
    }
    return this;
  };

  P.hideBubble = function () {
    clearTimeout(this._bubbleTimer);
    this.dom.bubble.classList.remove("is-open", "is-interim");
    return this;
  };

  /* ------------------------------------------------------------------
     חלון הצ'אט
     ------------------------------------------------------------------ */
  P.isChatOpen = function () {
    return this.dom.root.classList.contains("is-chat-open");
  };

  P.openChat = function () {
    if (this.isChatOpen()) return this;
    var self = this;
    this.hideBubble();                    /* הבועה מיותרת כשהחלון פתוח */

    /* נגררת לראש המסך? אין מקום לפתוח כלפי מעלה — נפתח כלפי מטה. */
    var box = this.dom.root.getBoundingClientRect();
    var spaceAbove = box.top;
    var spaceBelow = global.innerHeight - box.bottom;
    this.dom.root.classList.toggle("is-chat-below", spaceAbove < 340 && spaceBelow > spaceAbove);

    this.dom.root.classList.add("is-chat-open");
    this.dom.avatar.setAttribute("aria-expanded", "true");

    if (!this._greeted) {
      this._greeted = true;
      if (this.opts.greeting) this._reply(this.opts.greeting);
    }

    /* ההמתנה נותנת לאנימציית הפתיחה להתחיל לפני שהפוקוס קופץ */
    setTimeout(function () {
      try { self.dom.input.focus({ preventScroll: true }); } catch (e) { self.dom.input.focus(); }
      self._scrollLog();
    }, 260);

    this._emit("chatopen");
    return this;
  };

  P.closeChat = function () {
    if (!this.isChatOpen()) return this;
    this.dom.root.classList.remove("is-chat-open");
    this.dom.avatar.setAttribute("aria-expanded", "false");
    this.dom.avatar.focus();
    this._emit("chatclose");
    return this;
  };

  P.toggleChat = function () {
    return this.isChatOpen() ? this.closeChat() : this.openChat();
  };

  /** מוסיף הודעה ליומן הצ'אט. who: "me" | "bot" | "note" */
  P.addMessage = function (text, who) {
    text = String(text == null ? "" : text).trim();
    if (!text) return null;

    var row = el("div", "josh-msg josh-msg--" + (who || "bot"));
    var body = el("div", "josh-msg__text");
    body.textContent = text;
    row.appendChild(body);

    /* לכל תשובה של ג'וש יש כפתור הקראה משלה */
    if (who !== "me" && who !== "note" && this.synth) {
      var self = this;
      var say = el("button", "josh-msg__say", "🔊");
      say.type = "button";
      say.title = "הקראת ההודעה";
      say.setAttribute("aria-label", "הקראת ההודעה");
      say.addEventListener("click", function () {
        self.say(text, { bubble: false, logged: true, force: true });
      });
      row.appendChild(say);
    }

    this.dom.log.appendChild(row);
    this._scrollLog();
    return row;
  };

  P._scrollLog = function () {
    var log = this.dom.log;
    log.scrollTop = log.scrollHeight;
  };

  P._growInput = function () {
    var i = this.dom.input;
    i.style.height = "auto";
    i.style.height = Math.min(i.scrollHeight, 110) + "px";
  };

  /** תשובה של ג'וש: נכנסת ליומן ומוקראת (אלא אם הרמקול כבוי) */
  P._reply = function (text) {
    this.addMessage(text, "bot");
    this.say(text, { bubble: false, logged: true });
    return this;
  };

  /**
   * מחליף את מנגנון התשובות. הפונקציה מקבלת את הטקסט של המשתמש
   * ומחזירה מחרוזת, או Promise שמסתיים במחרוזת.
   *   Josh.answer(function (text) { return fetch(...).then(r => r.text()); });
   */
  P.answer = function (fn) {
    this._responder = typeof fn === "function" ? fn : null;
    return this;
  };

  /** שליחת הודעה מהמשתמש — מהקלדה או מהמיקרופון */
  P.send = function (text) {
    text = String(text == null ? "" : text).trim();
    if (!text) return this;

    this._unlock();
    this.openChat();
    this.addMessage(text, "me");
    this.dom.input.value = "";
    this._growInput();
    this._emit("message", text);

    var self = this;

    /* פקודה מובנת ("עצור", "הקרא את הדף") נענית מיד ולא הולכת לחיפוש */
    if (this._runCommands(text)) return this;

    this.thinking(true);            // הפנים עוברות ל'חושב'
    this.setStatus("חושב...");

    Promise.resolve()
      .then(function () {
        return self._responder ? self._responder(text) : null;
      })
      .then(function (reply) {
        if (reply) return reply;
        /* ה-AI לא ידע — מחפשים ברשת. הפנים נשארות ב'חושב' כל זמן החיפוש. */
        if (!self.opts.search) return null;
        self.setStatus("מחפש ברשת...");
        return self.search(text);
      })
      .then(function (reply) {
        self.thinking(false);
        self.setStatus("");
        self._reply(reply || self.opts.chatFallback);
      })
      .catch(function (err) {
        console.warn("[Josh] שגיאה בתשובה:", err);
        self.thinking(false);
        self.setStatus("");
        self._reply(self.opts.chatFallback);
      });

    return this;
  };

  /* ==================================================================
     חיפוש ברשת

     ברירת המחדל היא ויקיפדיה בעברית. זו הבחירה היחידה שבאמת עובדת מדף
     סטטי בלי שרת: ה-API שלה פתוח ל-CORS (origin=*), בלי מפתח ובלי
     הרשמה. מנועי חיפוש מסחריים חוסמים קריאה ישירה מהדפדפן, ומפתח
     שמוטמע בקוד צד-לקוח גלוי לכל מי שפותח את מקור הדף — ולכן ספק כזה
     צריך לעבור דרך שרת משלכם:

       Josh.provider(function (query) {
         return fetch("/api/search?q=" + encodeURIComponent(query))
           .then(function (r) { return r.json(); })
           .then(function (j) { return j.answer; });   // מחרוזת, או null
       });
     ================================================================== */

  /** מחליף את ספק החיפוש. מחזיר מחרוזת, null, או Promise לאחד מהם. */
  P.provider = function (fn) {
    this._searchProvider = typeof fn === "function" ? fn : null;
    return this;
  };

  /**
   * מחפש תשובה לשאלה. מחזיר Promise שמסתיים במחרוזת או ב-null.
   * הפנים מוצגות כ'חושב' לכל אורך החיפוש, גם בקריאה ישירה.
   */
  P.search = function (query) {
    var self = this;
    query = String(query == null ? "" : query).trim();
    if (!query) return Promise.resolve(null);

    this.thinking(true);
    var run = this._searchProvider
      ? Promise.resolve().then(function () { return self._searchProvider(query); })
      : this._searchWikipedia(query);

    return this._withTimeout(run, this.opts.searchTimeout)
      .then(function (reply) {
        self.thinking(false);
        return reply || null;
      })
      .catch(function (err) {
        self.thinking(false);
        console.warn("[Josh] החיפוש נכשל:", err && err.message ? err.message : err);
        return null;
      });
  };

  /** רשת איטית לא אמורה להשאיר את ג'וש ב'חושב' לנצח */
  P._withTimeout = function (promise, ms) {
    if (!ms) return Promise.resolve(promise);
    return new Promise(function (resolve, reject) {
      var done = false;
      var t = setTimeout(function () {
        if (!done) { done = true; reject(new Error("timeout")); }
      }, ms);
      Promise.resolve(promise).then(function (v) {
        if (done) return;
        done = true; clearTimeout(t); resolve(v);
      }, function (e) {
        if (done) return;
        done = true; clearTimeout(t); reject(e);
      });
    });
  };

  /**
   * ויקיפדיה: קודם חיפוש כותרות, ואז התקציר של התוצאה הראשונה.
   * origin=* הוא מה שמאפשר את הקריאה מהדפדפן בלי שרת מתווך.
   */
  P._searchWikipedia = function (query) {
    var self = this;
    var host = "https://" + (this.opts.searchLang || "he") + ".wikipedia.org";
    var api = host + "/w/api.php?origin=*&format=json&action=query" +
              "&list=search&srlimit=" + (this.opts.searchResults || 3) +
              "&srsearch=" + encodeURIComponent(query);

    return fetch(api)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (j) {
        var hits = (j && j.query && j.query.search) || [];
        if (!hits.length) return null;
        return self._wikiExtract(host, hits[0].title, hits);
      });
  };

  P._wikiExtract = function (host, title, hits) {
    var self = this;
    var api = host + "/w/api.php?origin=*&format=json&action=query" +
              "&prop=extracts&exintro=1&explaintext=1&redirects=1" +
              "&titles=" + encodeURIComponent(title);

    return fetch(api)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var pages = (j && j.query && j.query.pages) || {};
        var key = Object.keys(pages)[0];
        var extract = key && pages[key] && pages[key].extract;
        if (!extract) return self._wikiSnippets(hits);

        /* התקציר של ויקיפדיה ארוך מדי להקראה — לוקחים שני משפטים */
        var trimmed = String(extract).replace(/\s+/g, " ").trim();
        // בלי lookbehind — לא נתמך ב-Safari ישן, כמו ב-chunkText למעלה
        var cut = (trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed])
                    .slice(0, 2).join(" ").trim();
        if (!cut || cut.length < 40) cut = trimmed.slice(0, 320);
        if (cut.length > 480) cut = cut.slice(0, 480).replace(/\s\S*$/, "") + "...";

        return cut + "\n\n(מקור: ויקיפדיה — " + title + ")";
      })
      .catch(function () { return self._wikiSnippets(hits); });
  };

  /** גיבוי: הקטעים מתוצאות החיפוש עצמן, בלי תגיות ה-HTML שוויקיפדיה מחזירה */
  P._wikiSnippets = function (hits) {
    if (!hits || !hits.length) return null;
    var lines = hits.slice(0, this.opts.searchResults || 3).map(function (h) {
      var snip = String(h.snippet || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      return "• " + h.title + (snip ? ": " + snip : "");
    });
    return "מצאתי את אלה:\n" + lines.join("\n") + "\n\n(מקור: ויקיפדיה)";
  };

  P.setStatus = function (text) {
    this.dom.status.textContent = text || this._stateLabel(this.state);
    return this;
  };

  P._stateLabel = function (state) {
    if (state === "speaking") return "מקריא...";
    if (state === "listening") return "מקשיב לך...";
    if (this._busy) return "חושב...";
    return "מוכן לעזור";
  };

  /* ---------------- רמקול: מקריא או שקט ---------------- */
  P.toggleMuted = function () {
    this._unlock();

    /* טקסט מסומן בעמוד — הרמקול מקריא אותו, כמו קודם */
    var sel = String(global.getSelection ? global.getSelection() : "").trim();
    if (sel) return this.say(sel, { force: true });

    this.opts.muted = !this.opts.muted;
    if (this.opts.muted) this.stop();
    this._syncReadBtn();
    this.config({ muted: this.opts.muted });

    if (!this.opts.muted) {
      /* הדלקה חוזרת — מקריאים את התשובה האחרונה כדי שהלחיצה תישמע */
      var last = this.dom.log.querySelector(".josh-msg--bot:last-of-type .josh-msg__text");
      if (last) this.say(last.textContent, { bubble: false, logged: true, force: true });
    }
    return this;
  };

  P._syncReadBtn = function () {
    var b = this.dom.read;
    if (!b) return;
    b.textContent = this.opts.muted ? "🔇" : "🔊";
    b.setAttribute("aria-pressed", this.opts.muted ? "false" : "true");
    b.title = this.opts.muted
      ? "הרמקול כבוי — לחצו להפעלה"
      : "הרמקול פועל — לחצו להשתקה (עם טקסט מסומן: הקראת הטקסט)";
    b.setAttribute("aria-label", b.title);
  };

  /* ------------------------------------------------------------------
     הקראה קולית
     ------------------------------------------------------------------ */
  P._initVoices = function () {
    if (!this.synth) {
      console.warn("[Josh] הדפדפן אינו תומך בהקראה קולית.");
      this.dom.read.disabled = true;
      return;
    }
    var self = this;
    function pick() { self.voice = self._pickVoice(); }
    pick();
    // ברוב הדפדפנים רשימת הקולות נטענת אסינכרונית
    if (typeof this.synth.onvoiceschanged !== "undefined") {
      this.synth.addEventListener("voiceschanged", pick);
    }
  };

  /**
   * בוחר את הקול הנשי הטבעי ביותר בעברית שקיים במכשיר.
   *
   * הרקע: אין ב-Web Speech API שדה מגדר, ואין שמות קולות אחידים בין
   * מערכות. הזיהוי היחיד האפשרי הוא לפי שם הקול, ולכן זו רשימה שמכסה
   * את מה שקיים בפועל:
   *   Carmit          — הקול העברי של אפל (macOS/iOS), נשי
   *   Hila            — הקול הנשי של מיקרוסופט, כולל גרסת Natural ב-Edge
   *   Asaf / Avri     — קולות גבריים; מסומנים כדי שלא ייבחרו בטעות
   * קול "Natural"/"Online" נשמע הרבה יותר טבעי מהמנוע המקומי, ולכן
   * הוא מקבל את הניקוד הגבוה ביותר.
   *
   * אם אין במכשיר שום קול עברי — מוחזר null, והדפדפן יקריא בקול
   * ברירת המחדל שלו. אין דרך להתקין קול מתוך דף אינטרנט.
   */
  var FEMALE_HE = /(carmit|hila|הילה|כרמית)/i;
  var MALE_HE   = /(asaf|avri|אסף|אברי)/i;
  var NATURAL   = /(natural|online|neural|premium|enhanced|wavenet|siri)/i;

  P._pickVoice = function () {
    var voices = this.synth.getVoices() || [];
    if (!voices.length) return null;

    var lang = this.opts.lang.toLowerCase();
    var base = lang.split("-")[0];

    /* בחירה מפורשת של המשתמש גוברת על הכול */
    if (this.opts.voiceName) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].name === this.opts.voiceName) return voices[i];
      }
    }

    var self = this;
    var scored = voices.map(function (v) {
      return { voice: v, score: self._scoreVoice(v, lang, base) };
    }).filter(function (x) { return x.score > 0; });

    if (!scored.length) return null;
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored[0].voice;
  };

  P._scoreVoice = function (v, lang, base) {
    var vlang = String(v.lang || "").toLowerCase().replace("_", "-");
    var name = String(v.name || "");
    var score = 0;

    /* השפה קודמת לכול — קול נשי באנגלית גרוע מקול גברי בעברית */
    if (vlang === lang) score += 100;
    else if (vlang.indexOf(base) === 0) score += 90;
    else if (/^(he|iw)/.test(vlang)) score += 85;
    else return 0;                       // לא עברית — לא רלוונטי

    if (FEMALE_HE.test(name)) score += 40;      // קול נשי מוכר בשמו
    if (MALE_HE.test(name)) score -= 35;        // קול גברי מוכר — נדחק אחורה
    if (NATURAL.test(name)) score += 25;        // מנוע טבעי, לא רובוטי
    if (v.localService === false) score += 5;   // קולות ענן בד"כ איכותיים יותר

    return score;
  };

  /** רשימת הקולות הזמינים בשפה הנוכחית — שימושי לבורר קולות בהגדרות */
  P.getVoices = function () {
    if (!this.synth) return [];
    var base = this.opts.lang.split("-")[0].toLowerCase();
    return (this.synth.getVoices() || []).filter(function (v) {
      return v.lang.toLowerCase().indexOf(base) === 0 || /he|iw/i.test(v.lang);
    });
  };

  /**
   * הקראת טקסט + הצגתו בבועה.
   * @param {string} text
   * @param {object} [o] { rate, pitch, volume, silent, bubble }
   */
  P.say = function (text, o) {
    o = o || {};
    text = String(text == null ? "" : text).trim();
    if (!text) return this;

    /* כשהצ'אט פתוח התשובה נרשמת ביומן במקום לצוף בבועה חולפת */
    if (this.isChatOpen()) {
      if (!o.logged) this.addMessage(text, "bot");
    } else if (o.bubble !== false) {
      this.showBubble(text);
    }

    if (o.silent || !this.synth) return this;
    if (this.opts.muted && !o.force) return this;   /* הרמקול כבוי */

    this.stop();                       // מבטלים הקראה קודמת
    var wasListening = this.listening;
    this.stopListening(true);          // כדי שג'וש לא ישמע את עצמו

    var self = this;
    var chunks = chunkText(text);
    var done = 0;

    if (!this.voice) this.voice = this._pickVoice();

    chunks.forEach(function (chunk, i) {
      var u = new SpeechSynthesisUtterance(chunk);
      u.lang = self.opts.lang;
      u.rate = o.rate != null ? o.rate : self.opts.rate;
      u.pitch = o.pitch != null ? o.pitch : self.opts.pitch;
      u.volume = o.volume != null ? o.volume : self.opts.volume;
      if (self.voice) u.voice = self.voice;

      if (i === 0) {
        u.onstart = function () {
          self._blockedNotice = false;   // ההקראה עברה — ההודעה תוצג שוב אם ייחסם בעתיד
          self._setState("speaking");
          self._startKeepAlive();
          self._emit("speakstart", text);
        };
      }

      /* סנכרון שפתיים: כל מילה שנאמרת מזיזה את הפה פריים אחד.
         ב-Safari האירוע אינו נורה כלל, ואז ממשיכה האנימציה לפי שעון. */
      if (self.opts.lipSync) {
        u.onboundary = function (ev) {
          if (!ev || ev.name === "sentence") return;
          self._lipStep();
        };
      }
      u.onend = function () {
        if (++done < chunks.length) return;
        self._finishSpeaking(text, wasListening);
      };
      u.onerror = function (ev) {
        var err = ev && ev.error;
        if (err === "interrupted" || err === "canceled") return;   // עצירה יזומה — לא שגיאה

        /* הדפדפן חוסם הקראה עד המגע הראשון בעמוד. זה מצב רגיל ולא תקלה,
           ומכיוון שהטקסט מפוצל למקטעים הוא היה מדווח פעם אחת לכל מקטע. */
        if (err === "not-allowed") {
          self.unlocked = false;
          self.stop();
          if (!self._blockedNotice) {
            self._blockedNotice = true;
            console.info("[Josh] ההקראה תתחיל אחרי הלחיצה הראשונה בעמוד (מדיניות הדפדפן).");
          }
          self._emit("blocked", text);
          self._finishSpeaking(text, wasListening);
          return;
        }

        console.warn("[Josh] שגיאת הקראה:", err);
        self._emit("error", { type: "tts", error: err });
        self._finishSpeaking(text, wasListening);
      };

      self.queue.push(u);
      self.synth.speak(u);
    });

    return this;
  };

  P._finishSpeaking = function (text, resumeListening) {
    this._stopKeepAlive();
    this.queue = [];
    if (this.state === "speaking") this._setState("idle");
    this._emit("speakend", text);
    if (resumeListening && this.opts.continuous) {
      var self = this;
      setTimeout(function () { self.listen(); }, 350);   // השהיה קצרה נגד הד
    }
  };

  /** Chrome עוצר הקראות ארוכות אחרי ~15 שניות — pause/resume מחזיק אותן חיות */
  P._startKeepAlive = function () {
    var self = this;
    this._stopKeepAlive();
    this._keepAlive = setInterval(function () {
      if (!self.synth || !self.synth.speaking) return self._stopKeepAlive();
      self.synth.pause();
      self.synth.resume();
    }, 9000);
  };

  P._stopKeepAlive = function () {
    if (this._keepAlive) { clearInterval(this._keepAlive); this._keepAlive = null; }
  };

  P.stop = function () {
    this._stopKeepAlive();
    this.queue = [];
    if (this.synth) this.synth.cancel();
    if (this.state === "speaking") this._setState("idle");
    return this;
  };

  P.pause  = function () { if (this.synth) this.synth.pause();  return this; };
  P.resume = function () { if (this.synth) this.synth.resume(); return this; };

  /** הקראת הטקסט שהמשתמש סימן בעמוד */
  P.readSelection = function () {
    var sel = String(global.getSelection ? global.getSelection() : "").trim();
    if (!sel) return this.say("סמנו טקסט בעמוד ואז לחצו שוב על הרמקול, ואני אקריא אותו.");
    return this.say(sel);
  };

  /** הקראת תוכן אלמנט: Josh.readElement("#article") */
  P.readElement = function (selector) {
    var node = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!node) { console.warn("[Josh] לא נמצא אלמנט:", selector); return this; }
    return this.say(node.innerText || node.textContent || "");
  };

  /* ------------------------------------------------------------------
     זיהוי דיבור
     ------------------------------------------------------------------ */
  P._initRecognition = function () {
    var SR = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!SR) {
      console.warn("[Josh] הדפדפן אינו תומך בזיהוי דיבור (נסו Chrome או Edge).");
      this.dom.mic.disabled = true;
      this.dom.mic.title = "זיהוי דיבור אינו נתמך בדפדפן זה";
      this.recognition = null;
      return;
    }

    var self = this;
    var rec = new SR();
    rec.lang = this.opts.lang;
    rec.interimResults = true;
    rec.continuous = false;          // מחזור קצר + הפעלה מחדש — יציב יותר לאורך זמן
    rec.maxAlternatives = 1;

    rec.onstart = function () {
      self.listening = true;
      self._setState("listening");
    };

    rec.onresult = function (ev) {
      var finalText = "", interim = "";
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var r = ev.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (interim) {
        /* כשהצ'אט פתוח הדיבור נכתב לתוך שדה ההקלדה, כמו הכתבה */
        if (self.isChatOpen()) { self.dom.input.value = interim; self._growInput(); }
        else self.showBubble(interim, true);
        self._emit("interim", interim);
      }
      if (finalText.trim()) {
        var said = finalText.trim();
        self._emit("result", said);
        if (self.isChatOpen()) {
          self.dom.input.value = "";
          self._growInput();
          self.send(said);
        } else {
          self.showBubble(said);
          self._runCommands(said);
        }
      }
    };

    rec.onerror = function (ev) {
      var code = ev && ev.error;
      if (code === "no-speech" || code === "aborted") return;   // רגיל — לא מטריד את המשתמש
      if (code === "not-allowed" || code === "service-not-allowed") {
        self.wantsToListen = false;
        self._syncMicBtn();
        if (self.dom.status) self.dom.status.textContent = self._stateLabel(self.state);
        self.say("לא קיבלתי גישה למיקרופון. צריך לאשר גישה בהגדרות הדפדפן.", { silent: true });
      }
      console.warn("[Josh] שגיאת זיהוי דיבור:", code);
      self._emit("error", { type: "stt", error: code });
    };

    rec.onend = function () {
      self.listening = false;
      if (self.state === "listening") self._setState("idle");
      // הפעלה מחדש כל עוד המשתמש לא כיבה את המיקרופון וג'וש לא מדבר
      if (self.wantsToListen && self.opts.continuous && self.state !== "speaking") {
        setTimeout(function () {
          if (self.wantsToListen) { try { rec.start(); } catch (e) { /* כבר פועל */ } }
        }, 250);
      }
    };

    this.recognition = rec;
  };

  P.listen = function () {
    if (!this.recognition) return this;
    this.wantsToListen = true;
    this._syncMicBtn();                  /* משוב מיידי, עוד לפני אישור ההרשאה */
    if (this.listening) return this;
    if (this.dom.status && this.state !== "listening") {
      this.dom.status.textContent = "מפעיל מיקרופון...";
    }
    try { this.recognition.start(); }
    catch (e) { /* start נקרא בזמן שכבר פועל — אפשר להתעלם */ }
    return this;
  };

  /** @param {boolean} [temporary] עצירה זמנית (בזמן דיבור) בלי לכבות את המיקרופון */
  P.stopListening = function (temporary) {
    if (!temporary) {
      this.wantsToListen = false;
      this._syncMicBtn();
      if (this.dom.status) this.dom.status.textContent = this._stateLabel(this.state);
    }
    if (this.recognition && this.listening) {
      try { this.recognition.stop(); } catch (e) { /* noop */ }
    }
    return this;
  };

  P.toggleMic = function () {
    this._unlock();
    return this.wantsToListen ? this.stopListening() : this.listen();
  };

  /* ------------------------------------------------------------------
     פקודות קוליות
     ------------------------------------------------------------------ */
  /**
   * @param {RegExp|string} pattern מחרוזת נבדקת כמילה שלמה ("עצור|די"),
   *                                RegExp נבדק כמו שהוא. אל תשתמשו ב-\b
   *                                עם עברית — ראו wordRe למעלה.
   * @param {function} handler מקבל (text, match); החזרת false ממשיכה לפקודה הבאה
   */
  P.addCommand = function (pattern, handler) {
    this.commands.push({
      test: pattern instanceof RegExp ? pattern : wordRe(pattern),
      run: handler
    });
    return this;
  };

  P._runCommands = function (text) {
    for (var i = 0; i < this.commands.length; i++) {
      var m = text.match(this.commands[i].test);
      if (!m) continue;
      try {
        if (this.commands[i].run.call(this, text, m) !== false) return true;
      } catch (e) {
        console.error("[Josh] שגיאה בפקודה:", e);
      }
    }
    return false;
  };

  P._registerDefaultCommands = function () {
    var self = this;
    this.addCommand("עצור|תעצור|די|שקט|הפסק", function () {
      self.stop();
      self.showBubble("עצרתי.");
    });
    this.addCommand(/(תקרא|הקרא|קרא לי).*(עמוד|דף|טקסט|מסומן)/, function () {
      self.readSelection();
    });
    this.addCommand("שלום|היי|הלו", function () {
      self.say("שלום! במה אפשר לעזור?");
    });
    this.addCommand("תודה|יופי|מעולה", function () {
      self.say("בשמחה! אני כאן אם צריך עוד משהו.");
    });
    this.addCommand("לאט יותר|תדבר לאט", function () {
      self.config({ rate: Math.max(.6, self.opts.rate - .2) });
      self.say("מדבר לאט יותר.");
    });
    this.addCommand("מהר יותר|תדבר מהר", function () {
      self.config({ rate: Math.min(1.8, self.opts.rate + .2) });
      self.say("מדבר מהר יותר.");
    });
  };

  /* ------------------------------------------------------------------
     שחרור אודיו (iOS/Safari דורשים מגע משתמש ראשון)
     ------------------------------------------------------------------ */
  P._initUnlock = function () {
    var self = this;
    function once() { self._unlock(); }
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
      document.addEventListener(ev, once, { once: true, passive: true });
    });
  };

  P._unlock = function () {
    if (this.unlocked || !this.synth) return;
    this.unlocked = true;
    try {
      var u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      this.synth.speak(u);
    } catch (e) { /* noop */ }
  };

  /* ------------------------------------------------------------------
     הגדרות ותצוגה
     ------------------------------------------------------------------ */
  P.config = function (patch) {
    if (!patch) return Object.assign({}, this.opts);
    Object.assign(this.opts, patch);
    if (patch.name) {
      this.dom.name.textContent = patch.name;
      this.dom.chatName.textContent = patch.name;
    }
    if (patch.lang && this.recognition) this.recognition.lang = patch.lang;
    if (patch.lang || patch.voiceName) this.voice = this._pickVoice();
    if ("muted" in patch) this._syncReadBtn();
    saveStored(this.opts.storageKey, {
      rate: this.opts.rate, pitch: this.opts.pitch, volume: this.opts.volume,
      voiceName: this.opts.voiceName, lang: this.opts.lang, continuous: this.opts.continuous,
      muted: this.opts.muted
    });
    return this;
  };

  P.show      = function () { this.dom.root.hidden = false; return this; };
  P.hide      = function () { this.closeChat().stop().stopListening(); this.dom.root.hidden = true; return this; };
  P.minimize  = function () { this.closeChat(); this.dom.root.classList.add("is-minimized"); return this; };
  P.maximize  = function () { this.dom.root.classList.remove("is-minimized"); return this; };
  P.destroy   = function () {
    this.stop().stopListening();
    clearInterval(this._poseTimer);
    clearTimeout(this._greetTimer);
    clearTimeout(this._restTimer);
    if (this.dom.root.parentNode) this.dom.root.parentNode.removeChild(this.dom.root);
  };

  /* ------------------------------------------------------------------
     אתחול אוטומטי
     ------------------------------------------------------------------ */
  function boot() {
    if (global.Josh instanceof JoshEngine) return global.Josh;
    // אפשר להגדיר window.JOSH_OPTIONS = {...} לפני טעינת הסקריפט
    global.Josh = new JoshEngine(global.JOSH_OPTIONS);
    document.dispatchEvent(new CustomEvent("josh:ready", { detail: global.Josh }));
    return global.Josh;
  }

  JoshEngine.wordRe = wordRe;      // שימושי לבניית פקודות בעברית מחוץ למנוע
  global.JoshEngine = JoshEngine;
  global.JoshBoot = boot;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
