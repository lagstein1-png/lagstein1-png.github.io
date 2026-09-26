/* ============================================================
   i18n — היסטוריה לבגרות (מנוע בגרות, משותף בבסיסו ל-bagrut-806)
   he = מקור. ar/ru/en = תרגום מכונה, מחכה לבדיקת מורה
   (כלל שהבעלים חזרו עליו 26.9.2026, הועבר דרך הסוכן הראשי:
   ארבע שפות בכל אפליקציה; לסמן תרגום מכונה לבדיקת מורה). התוכן עצמו — שאלות ומקורות — נשאר
   בעברית כלשונה עד שיגיעו השאלונים הרשמיים בערבית.
   ============================================================ */
var I18N = (function () {
  var LANGS = ["he", "ar", "ru", "en"];
  var RTL = { he: 1, ar: 1 };
  var STR = {
    he: {
      titleBrand: "היסטוריה לבגרות", titleHomeSuffix: "בגרות בהיסטוריה, שאלונים 22261 ו-22262",
      skip: "דילוג לתוכן",
      brandSub: "שאלוני משרד החינוך · 22261/22262",
      toExams: "לבחינות", back: "חזרה", toProg: "התקדמות", toSettings: "הגדרות",
      homeH1: "היסטוריה לבגרות, בהקראה",
      homeP: "השאלות והמקורות מועתקים כלשונם משאלוני הבגרות הרשמיים של משרד החינוך, וכל אחד מהם נשמע בעברית מדוברת לפני שקוראים אותו. בלי פרסומות, וההתקדמות נשמרת במכשיר שלכם בלבד.",
      chooseExam: "בחרו בחינה",
      modeH1: "בחירת מצב", simH2: "סימולציית בחינה",
      simMeta: "בחינה מלאה עם שעון שסופר לאחור. אין רמזים ואין פתרונות עד הסיום, ובסופה דוח לפי נושא.",
      pracH2: "תרגול מודרך",
      pracMeta: "שאלה אחת בכל פעם. הרמזים נחשפים אחד־אחד בלחיצה, והפתרון המלא אחרון.",
      pracNote: "בתרגול המודרך אין שעון ואין עונש. הרמזים נחשפים רק כשמבקשים אותם, אחד־אחד, והפתרון המלא אחרון. מה שפותרים כאן נספר בדוח הנושאים החלשים, והתרגול עובד גם בלי אינטרנט.",
      chooseTopic: "בחרו נושא", progH1: "ההתקדמות שלכם", setH1: "הגדרות",
      langLab: "שפת ממשק", langDesc: "תרגום מכונה — מחכה לבדיקת מורה",
      fsLab: "גודל טקסט", fsDesc: "מגדיל את כל המסך יחד, לא רק את השאלה",
      fsNormal: "רגיל", fsBig: "גדול", fsBigger: "גדול מאוד",
      rateLab: "מהירות ההקראה", rateDesc: "שינוי באמצע עוצר את ההקראה הנוכחית, והבאה תישמע בקצב החדש",
      rateSlow: "לאט", rateFast: "מהר",
      sayLab: "כפתורים מדברים", sayDesc: "כל כפתור שנלחץ מוקרא בשמו",
      yes: "כן", no: "לא",
      voiceLab: "קול ההקראה", voiceChecking: "בודקים…", trySample: "שמעו דוגמה",
      themeLab: "מראה", themeDesc: "ברירת המחדל הולכת אחרי המכשיר",
      themeAuto: "אוטומטי", themeLight: "בהיר", themeDark: "כהה",
      fontLab: "פונט קריא", fontDesc: "אותיות פשוטות יותר, בלי קצוות מעוגלים",
      contrastLab: "ניגודיות גבוהה", contrastDesc: "שחור על לבן, וגבול מלא לכל כרטיס",
      spaceLab: "ריווח מוגדל", spaceDesc: "רווח גדול יותר בין אותיות, מילים ושורות",
      motionLab: "תנועה מופחתת", motionDesc: "עוצר אנימציות ומעברים",
      resetLab: "איפוס נתונים", resetDesc: "מוחק את כל מה שנשמר במכשיר הזה", resetBtn: "איפוס",
      storageNote: "ההתקדמות נשמרת ב־<code>localStorage</code> של הדפדפן, במכשיר הזה בלבד, ואינה נשלחת לשום מקום.",
      verPrefix: "גרסה", noAds: "בלי פרסומות", terms: "תנאי שימוש", allApps: "כל האפליקציות",
      reading: "קורא…", pause: "השהו",
      gateH1: "האפליקציה הזאת עדיין לא פורסמה",
      gateP: "היא בבנייה ובבדיקה, והתוכן שבה עוד לא אושר. אפשר להיכנס לאפליקציות שכבר פורסמו.",
      gateLink: "כל האפליקציות",
      mtNote: "תרגום מכונה — בבדיקת מורה",
      tutorHomeP: "נתקעתם לפני שהתחלתם? אפשר לשאול את המורה כל שאלה על החומר.",
      moelink: "בחינות בגרות אמיתיות באתר משרד החינוך",
      demoChip: "בחינת הדגמה — לא בחינה אמיתית"
    },
    ar: {
      titleBrand: "التاريخ للبجروت", titleHomeSuffix: "بجروت تاريخ، امتحانات 22261 و-22262",
      skip: "تخطَّ إلى المحتوى",
      brandSub: "امتحانات وزارة التربية · 22261/22262",
      toExams: "للامتحانات", back: "رجوع", toProg: "التقدّم", toSettings: "الإعدادات",
      homeH1: "التاريخ للبجروت، بصوت مسموع",
      homeP: "الأسئلة والمصادر منقولة حرفيًا من امتحانات البجروت الرسمية لوزارة التربية والتعليم، وكل منها يُسمع بالعبرية المنطوقة قبل قراءته. بلا إعلانات، ويُحفَظ تقدّمكم على جهازكم فقط.",
      chooseExam: "اختاروا امتحانًا",
      modeH1: "اختيار الوضع", simH2: "محاكاة امتحان",
      simMeta: "امتحان كامل بساعة عدّ تنازلي. لا تلميحات ولا حلول حتى النهاية، وفي نهايته تقرير حسب الموضوع.",
      pracH2: "تمرين موجَّه",
      pracMeta: "سؤال واحد في كل مرة. تُكشف التلميحات واحدًا تلو الآخر بالضغط، والحل الكامل أخيرًا.",
      pracNote: "في التمرين الموجَّه لا ساعة ولا عقوبة. تُكشف التلميحات فقط عند طلبها، واحدًا تلو الآخر، والحل الكامل أخيرًا. ما تحلّونه هنا يُحسب في تقرير المواضيع الضعيفة، ويعمل التمرين أيضًا بلا إنترنت.",
      chooseTopic: "اختاروا موضوعًا", progH1: "تقدّمكم", setH1: "الإعدادات",
      langLab: "لغة الواجهة", langDesc: "ترجمة آلية — بانتظار مراجعة معلّم",
      fsLab: "حجم الخط", fsDesc: "يكبّر الشاشة كلها معًا، لا السؤال فقط",
      fsNormal: "عادي", fsBig: "كبير", fsBigger: "كبير جدًا",
      rateLab: "سرعة القراءة الصوتية", rateDesc: "التغيير في المنتصف يوقف القراءة الحالية، والتالية تُسمع بالسرعة الجديدة",
      rateSlow: "ببطء", rateFast: "بسرعة",
      sayLab: "أزرار ناطقة", sayDesc: "كل زر يُضغط يُقرأ باسمه",
      yes: "نعم", no: "لا",
      voiceLab: "صوت القراءة", voiceChecking: "نتحقق…", trySample: "اسمعوا مثالًا",
      themeLab: "المظهر", themeDesc: "الافتراضي يتبع الجهاز",
      themeAuto: "تلقائي", themeLight: "فاتح", themeDark: "داكن",
      fontLab: "خط سهل القراءة", fontDesc: "حروف أبسط، بلا حواف مستديرة",
      contrastLab: "تباين عالٍ", contrastDesc: "أسود على أبيض، وإطار كامل لكل بطاقة",
      spaceLab: "تباعد موسّع", spaceDesc: "فراغ أكبر بين الحروف والكلمات والأسطر",
      motionLab: "حركة مخفَّضة", motionDesc: "يوقف الحركات والانتقالات",
      resetLab: "تصفير البيانات", resetDesc: "يمحو كل ما حُفظ على هذا الجهاز", resetBtn: "تصفير",
      storageNote: "يُحفَظ التقدّم في <code>localStorage</code> الخاص بالمتصفح، على هذا الجهاز فقط، ولا يُرسَل إلى أي مكان.",
      verPrefix: "إصدار", noAds: "بلا إعلانات", terms: "شروط الاستخدام", allApps: "كل التطبيقات",
      reading: "يقرأ…", pause: "إيقاف",
      gateH1: "هذا التطبيق لم يُنشر بعد",
      gateP: "هو قيد البناء والفحص، ومحتواه لم يُعتمد بعد. يمكن الدخول إلى التطبيقات المنشورة.",
      gateLink: "كل التطبيقات",
      mtNote: "ترجمة آلية — قيد مراجعة معلّم",
      tutorHomeP: "عالقون قبل أن تبدأوا؟ يمكن أن تسألوا المعلّم أي سؤال عن المادة.",
      moelink: "امتحانات بجروت حقيقية في موقع وزارة التربية",
      demoChip: "امتحان تجريبي — ليس امتحانًا حقيقيًا"
    },
    ru: {
      titleBrand: "История на багрут", titleHomeSuffix: "Багрут по истории, экзамены 22261 и 22262",
      skip: "К содержанию",
      brandSub: "Экзамены Минпроса · 22261/22262",
      toExams: "К экзаменам", back: "Назад", toProg: "Прогресс", toSettings: "Настройки",
      homeH1: "История на багрут с озвучкой",
      homeP: "Вопросы и источники дословно взяты из официальных экзаменов багрут Министерства просвещения, и каждый озвучен на разговорном иврите перед чтением. Без рекламы, а прогресс хранится только на вашем устройстве.",
      chooseExam: "Выберите экзамен",
      modeH1: "Выбор режима", simH2: "Симуляция экзамена",
      simMeta: "Полный экзамен с обратным отсчётом. Без подсказок и решений до конца, а в конце — отчёт по темам.",
      pracH2: "Управляемая практика",
      pracMeta: "Один вопрос за раз. Подсказки открываются по одной по нажатию, полное решение — последним.",
      pracNote: "В управляемой практике нет часов и штрафов. Подсказки открываются только по запросу, по одной, полное решение — последним. Решённое здесь учитывается в отчёте слабых тем, и практика работает даже без интернета.",
      chooseTopic: "Выберите тему", progH1: "Ваш прогресс", setH1: "Настройки",
      langLab: "Язык интерфейса", langDesc: "Машинный перевод — ожидает проверки учителем",
      fsLab: "Размер текста", fsDesc: "Увеличивает весь экран, а не только вопрос",
      fsNormal: "Обычный", fsBig: "Крупный", fsBigger: "Очень крупный",
      rateLab: "Скорость озвучки", rateDesc: "Изменение останавливает текущую озвучку; следующая прозвучит с новой скоростью",
      rateSlow: "Медленно", rateFast: "Быстро",
      sayLab: "Говорящие кнопки", sayDesc: "Каждая нажатая кнопка озвучивается по имени",
      yes: "Да", no: "Нет",
      voiceLab: "Голос озвучки", voiceChecking: "Проверяем…", trySample: "Послушать пример",
      themeLab: "Оформление", themeDesc: "По умолчанию — как на устройстве",
      themeAuto: "Авто", themeLight: "Светлая", themeDark: "Тёмная",
      fontLab: "Читабельный шрифт", fontDesc: "Более простые буквы, без округлых краёв",
      contrastLab: "Высокий контраст", contrastDesc: "Чёрный на белом, полная рамка у каждой карточки",
      spaceLab: "Увеличенные интервалы", spaceDesc: "Больше места между буквами, словами и строками",
      motionLab: "Меньше анимации", motionDesc: "Останавливает анимации и переходы",
      resetLab: "Сброс данных", resetDesc: "Удаляет всё сохранённое на этом устройстве", resetBtn: "Сброс",
      storageNote: "Прогресс хранится в <code>localStorage</code> браузера, только на этом устройстве, и никуда не отправляется.",
      verPrefix: "Версия", noAds: "Без рекламы", terms: "Условия использования", allApps: "Все приложения",
      reading: "Читаю…", pause: "Пауза",
      gateH1: "Это приложение ещё не опубликовано",
      gateP: "Оно в разработке и на проверке, содержимое ещё не утверждено. Можно открыть уже опубликованные приложения.",
      gateLink: "Все приложения",
      mtNote: "Машинный перевод — на проверке у учителя",
      tutorHomeP: "Застряли ещё до начала? Можно спросить учителя о чём угодно по материалу.",
      moelink: "Настоящие экзамены багрут на сайте Минпроса",
      demoChip: "Демо-экзамен — не настоящий экзамен"
    },
    en: {
      titleBrand: "Bagrut history", titleHomeSuffix: "Bagrut history, exams 22261 and 22262",
      skip: "Skip to content",
      brandSub: "MoE exams · 22261/22262",
      toExams: "Exams", back: "Back", toProg: "Progress", toSettings: "Settings",
      homeH1: "Bagrut history, read aloud",
      homeP: "Questions and sources are copied verbatim from the official Ministry of Education bagrut exams, and each is read aloud in spoken Hebrew before you read it. No ads, and your progress stays on your device only.",
      chooseExam: "Choose an exam",
      modeH1: "Choose a mode", simH2: "Exam simulation",
      simMeta: "A full exam with a countdown clock. No hints or solutions until the end, and a per-topic report when you finish.",
      pracH2: "Guided practice",
      pracMeta: "One question at a time. Hints reveal one by one on tap, the full solution last.",
      pracNote: "Guided practice has no clock and no penalty. Hints reveal only when asked, one by one, the full solution last. What you solve here counts in the weak-topics report, and practice works offline too.",
      chooseTopic: "Choose a topic", progH1: "Your progress", setH1: "Settings",
      langLab: "Interface language", langDesc: "Machine translation — pending teacher review",
      fsLab: "Text size", fsDesc: "Enlarges the whole screen, not just the question",
      fsNormal: "Normal", fsBig: "Large", fsBigger: "Extra large",
      rateLab: "Reading speed", rateDesc: "Changing mid-read stops the current one; the next plays at the new speed",
      rateSlow: "Slow", rateFast: "Fast",
      sayLab: "Talking buttons", sayDesc: "Every tapped button is read by name",
      yes: "Yes", no: "No",
      voiceLab: "Reading voice", voiceChecking: "Checking…", trySample: "Hear a sample",
      themeLab: "Appearance", themeDesc: "Default follows your device",
      themeAuto: "Auto", themeLight: "Light", themeDark: "Dark",
      fontLab: "Readable font", fontDesc: "Simpler letters, no rounded edges",
      contrastLab: "High contrast", contrastDesc: "Black on white, full border on every card",
      spaceLab: "Extra spacing", spaceDesc: "More space between letters, words and lines",
      motionLab: "Reduced motion", motionDesc: "Stops animations and transitions",
      resetLab: "Reset data", resetDesc: "Erases everything saved on this device", resetBtn: "Reset",
      storageNote: "Progress is saved in the browser's <code>localStorage</code>, on this device only, and is never sent anywhere.",
      verPrefix: "Version", noAds: "No ads", terms: "Terms", allApps: "All apps",
      reading: "Reading…", pause: "Pause",
      gateH1: "This app is not published yet",
      gateP: "It is being built and tested, and its content is not approved yet. You can visit the published apps.",
      gateLink: "All apps",
      mtNote: "Machine translation — under teacher review",
      tutorHomeP: "Stuck before you even start? You can ask the teacher any question about the material.",
      moelink: "Real bagrut exams on the MoE site",
      demoChip: "Demo exam — not a real exam"
    }
  };
  /* פורמטים עם מספרים. העברית נשארת על plural() בקוד; לשאר השפות
     תבנית פשוטה (תרגום מכונה, בבדיקה). */
  var FMT = {
    ar: { choice: "{c} من أصل {n}", meta: "{q} أسئلة · {s} فقرات · {m} دقيقة" },
    ru: { choice: "{c} из {n}", meta: "{q} вопр. · {s} пунктов · {m} мин" },
    en: { choice: "{c} of {n}", meta: "{q} questions · {s} sections · {m} min" }
  };
  function cur() {
    try { return localStorage.getItem("bekol-lang") || "he"; } catch (e) { return "he"; }
  }
  function t(k) {
    var l = cur();
    return (STR[l] && STR[l][k]) || STR.he[k] || k;
  }
  function fmt(kind, map) {
    var l = cur();
    var tpl = (FMT[l] && FMT[l][kind]) || null;
    if (!tpl) return null;
    return tpl.replace(/\{(\w)\}/g, function (m, k) { return map[k] != null ? map[k] : m; });
  }
  function applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18nhtml]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18nhtml"));
    });
    document.querySelectorAll("[data-i18naria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18naria")));
    });
    var note = document.getElementById("mt-note");
    if (note) {
      note.hidden = cur() === "he";
      note.textContent = cur() === "he" ? "" : t("mtNote");
    }
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-lang") === cur());
    });
  }
  function apply(l) {
    if (LANGS.indexOf(l) < 0) l = "he";
    try { localStorage.setItem("bekol-lang", l); } catch (e) {}
    document.documentElement.lang = l;
    document.documentElement.dir = RTL[l] ? "rtl" : "ltr";
    applyStatic();
  }
  /* בחירת שפה בהגדרות — מאזין עצמאי כדי לא לגעת בצובר של app.js */
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("[data-lang]");
    if (!b) return;
    apply(b.getAttribute("data-lang"));
    document.dispatchEvent(new CustomEvent("langchange"));
  });
  return {
    t: t, fmt: fmt, cur: cur, apply: apply, applyStatic: applyStatic,
    langs: LANGS
  };
})();
