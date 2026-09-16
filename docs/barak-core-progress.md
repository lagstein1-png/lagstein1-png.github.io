# מנוע ברק (BARAK-CORE) — יומן התקדמות

**מטרת הקובץ:** אם השיחה נקטעת, הסשן הבא קורא את זה וממשיך מהנקודה
שבה נעצר. מתעדכן בסוף כל שלב. כל מספר כאן — עם המקור שלו.

**הענף בכל הריפו:** `claude/barak-core-full-build-2gyyk4`.
**המנדט:** לעבוד ברצף בלי לעצור; שתי עצירות בלבד — אין מפתח Gemini
(אינו המצב, ראו שלב 0), והמיזוג ל-`main` + פריסת `tutor` בייצור
שממתינים ל״יאללה״ אחד.

---

## שלב 0 — מיפוי וצילום מצב · 16.9.2026

### צילום מצב (`git branch --show-current`, `git log --oneline -1`, `git status --short`)

| ריפו | ענף | HEAD | status |
|---|---|---|---|
| `lagstein1-png.github.io` | `claude/barak-core-full-build-2gyyk4` | `ec86d35` = `origin/main` | נקי |
| `הריפו הנפרד של ״תאוריה מדברת״` | `claude/barak-core-full-build-2gyyk4` | `80b1565d` (v99) | נקי |
| `arthur-orchestrator` | `claude/barak-core-full-build-2gyyk4` | `0ba4cdc` | נקי — פרויקט Python/LangGraph נפרד, אינו נוגע לברק |
| `learning-app` | `claude/barak-core-full-build-2gyyk4` | **אין קומיטים** (`git ls-remote --heads origin` ריק) | ריפו ריק |

`git log origin/main..HEAD | wc -l` = 0 ו-`HEAD..origin/main` = 0 בריפו
הראשי — הענף מתחיל בדיוק מ-`main`.

### מה נקרא

- `ARTHUR.md`, `CLAUDE.md`, `FINDINGS.md` (טבלת ״פתוח״ ורשומת 16.9).
- `tutor-api/worker.js` (715 שורות), `tutor-api/wrangler.toml`,
  `tutor-api/README.md`, `.github/workflows/deploy-tutor.yml`,
  `tutor-compare.yml`, `tutor-api/local/server.js`, `compare.mjs`.
- `tutor/tutor.js` (1283), `tutor/josh-local.js` (646),
  `tutor/josh-face.js` (862), `tutor/josh-state.js` (229).
- `josh-engine.js` (1607, בשורש) — **המוח המת**; `brain.js` אוסר על
  דף לטעון אותו. לא נוגעים.
- `.claude/qa/exam.js`, `tutor.js`, `brain.js`, `search.js`, `josh.js`,
  `joshface.js`, `joshstate.js`, `offer.js`, `cache.js`, `engine.js`,
  `all.js`.
- 12 בלוקי `TUTOR.mount` (11 ב-`index.html`, ו-`bagrut-806/app.js:957`).
- `index.html` של הריפו הנפרד של ״תאוריה מדברת״: `renderFlow` (3035), `flowAnswer` (3101),
  `go` (2521), `speak` (2410), `EXPLAIN` (כבוי, netlify שאינו קיים),
  `BUILD = 'v99'` (812).

### מה לא נמצא

- **`docs/barak-lesson-engine-spec.md` אינו קיים** באף אחד מארבעת
  הריפו (`find . -name "barak*"` החזיר ריק). גם ״barak-player״ אינו
  מופיע בשום קובץ (`grep -rl barak-player` ריק). לכן אין ״שלב A״
  לבנות עליו, ואין מבצע פעולות קיים לשתף. רשם הפעולות נבנה כאן
  פעם אחת, ב-`tutor/barak-core.js`, ומי שיכתוב את המפרט ההוא
  ישתמש בו.
- אין `wrangler.toml` נוסף: היחיד הוא `tutor-api/wrangler.toml`,
  ו-`[env.staging]` אינו מוגדר בו. `tutor-staging` אינו קיים עדיין.

### המפתח — העצירה היחידה שאינה נדרשת

לא ניתן להריץ `wrangler` מכאן (`api.cloudflare.com` חסום, ראו
`deploy-tutor.yml`). אבל ההוכחה שהמפתח קיים כבר נמדדה:
`deploy-tutor` **ריצה 6** (`actions_list`, 16.9.2026 14:01 UTC, על
`main` `2f29e91`) הסתיימה `success`, והצעד האחרון שלה הוא בדיקה
חיה שנופלת אם ה-Worker אינו מחזיר 200 — ו-200 מ-`worker.js`
דורש `GEMINI_API_KEY` תקין. כלומר: הסוד `GEMINI_API_KEY` קיים
ב-Secrets של GitHub, והוורקפלו החדש לסטייג׳ינג יכתוב אותו
ל-`tutor-staging` באותו מנגנון (`--secrets-file`). **אין צורך
בהדבקה ידנית.**

### קו הבסיס

- `node .claude/qa/all.js --static` — **36 בדיקות, כולן עברו**.
- `qa.yml` על `main`: ריצה 604 (`ec86d35`) ירוקה. ריצה 602 הייתה
  אדומה (`markers.js`) ותוקנה ב-604 — שלב 0 של השחרור מתקיים.
- Playwright נטען (`require('/opt/node22/lib/node_modules/playwright')` — `pw ok`).

### מה קיים כבר ומה חסר (מול שני הכשלים שבמנדט)

| כשל | מה קיים | מה חסר |
|---|---|---|
| ״ברק לא יודע כלום״ | `CFG.q()` שולח `expr`, `ans`, `topic`, `level` | האפשרויות, תשובת התלמיד, מזהה וסוג מסך, הפניה לתוכנית |
| ״אומר ׳נעבור למסך׳ ולא מעביר״ | כלום — `worker.js` מחזיר טקסט בלבד | function calling, רשם פעולות בלקוח, אימות, יושרת פעולה |

מפתחות הקאש בקו הבסיס (ל-13 ההעלאות בשלב 2):
`96` · n103 · m108 · k47 · l97 · b120 · t112 · u112 · v110 · g109 ·
reader 76 · a71 · x69 (`grep -Hn "sw.js?v=" index.html */index.html bagrut-806/app.js`).

**סטטוס: שלב 0 הושלם.**

## שלב 1 — Worker בסטייג׳ינג · 16.9.2026

**קבצים:** `tutor-api/worker.js` (נתיב `/ask`, function calling, אימות
פעולות, שרשרת מודלים מה-API, מונה בזיכרון עם flush ל-KV, `/health`),
`tutor-api/wrangler.toml` (`[env.staging]` → `tutor-staging`),
`.github/workflows/deploy-tutor-staging.yml`, `JOSH.md` (שתי שורות
CORE חדשות, 35 שורות), `.claude/qa/tutor.js` (בדיקות המונה עודכנו),
`.claude/qa/barak.js` (חדש).

**החוזה:** `POST /ask` ← `{app, lang, screen:{id,type,q,options,correct,
student,topic,curriculum,level}, userText, actions:[{name,desc,params}],
history(≤8), mode}` → `{say, text, action|null, face, source:"ai", model,
checked}`. 429 ו-503 נושאים `fallback:"local"`.

**הוכחות:** `node .claude/qa/barak.js` — חצי השרת ירוק (37 בדיקות),
חצי הלקוח אדום עד שלב 2 (5 נכשלו). מוטציה 1 (`validateAction` מקבל
הכול) → ״פעולה לא מוכרת — action null״ אדום; מוטציה 2 (שורת ״אל
תאמר שאתה עובר למסך״ מוסרת מ-CORE) → ״CORE: יושרת פעולות״ אדום.
תקציב הכתיבות: 1,000 פניות מ-40 כתובות → פחות מ-700 כתיבות (בדיקה
ב-`tutor.js`, `1000/25+1` לכל היותר).

**הפריסה לסטייג׳ינג לא רצה מכאן** (Cloudflare חסום). היא רצה
ב-Actions → deploy-tutor-staging → `STAGING`, ובסופה `/health` ו-`/ask`
עם רמז שאינו מכיל 15.

## שלב 2 — לקוח משותף · 16.9.2026

**קבצים:** `tutor/barak-core.js` (חדש: `BARAK.register/ask/run/
highlight`, נפילה מקומית עם זיהוי פעולה בארבע שפות, timeout 8000ms,
אימות פרמטרים גם בלקוח), `tutor/tutor.js` (`send()` מאציל ל-`BARAK.ask`;
`sendLegacy` לדף בלי המנוע; הפאנל הפך לגיליון תחתון / עמודה צדית
שאינם מסתירים את התרגיל — D-17, ממתין לאישור), 12 `index.html` +
`bagrut-806/app.js` (תגית `barak-core.js` אחרי `tutor.js`), 13 `sw.js`
(`PRE`), 13 מפתחות: 97 · n104 · m109 · k48 · l98 · b121 · t113 · u113 ·
v111 · g110 · reader 77 · a72 · x70.

`sw.js` מדלג על כל מה שאינו GET (`req.method !== "GET"`) — POST ל-`/ask`
אינו נשמר, ו-`barak.js` בודק את זה בשלושה־עשר הקבצים.

## שלב 3 — math-app · 16.9.2026

מתאם: 7 פעולות (`next_question`, `show_hint`, `read_aloud`,
`highlight_option`, `explain_again`, `go_screen`, `slow_mode`), הקשר עם
אפשרויות, תשובה נכונה, הבחירה השגויה האחרונה, נושא ותוכנית.
`node .claude/qa/barak-browser.js math-app` (חדש — דפדפן אמיתי מול
Worker מדומה ב-`page.route`): ✓ בשבעה תרחישים. שני באגים נתפסו בדרך
ותוקנו ב-`barak-core.js`: `go_screen` ליעד לא קיים עבר בלי אימות בלקוח
(נוסף `validArgs`), ו-״הבא״ לא זוהה מקומית כי `\b` אינו גבול אחרי
אות עברית (הגבולות עברו לרווחים).

## שלב 4 — הערכות · 16.9.2026

`tutor-api/local/evals.mjs`: 13 אפליקציות × 4 שפות × 4 תרחישים
(רמז שלא מגלה · הסבר · ״נעבור למסך הבא״ שמחזיר פעולה · טעות עם עידוד)
= **208 במוק, 0 נכשלו**. הוכחת נפילה: השומר ב-Worker כובה והמוק גילה
את התשובה → ״הרמז גילה את התשובה״ אדום. `--live` מוגבל ל-60 קריאות
(`LIVE_CAP`), רץ רק מ-`barak-live.yml`. `barak` ו-`barak-browser` נרשמו
ב-`all.js`.

**פתוח בסוף שלב 4:** `naming` תוקן (השם הישן הופיע בקבצים החדשים);
`status` ו-`fresh` ממתינים לרענון אחרי שלב 5; `tutor` אדום על
`theory.patch` עד שלב 6.

## שלב 5 — 11 מתאמים · 16.9.2026

ארבעה סוכני משנה במקביל, קובץ אחד לכל סוכן (משפחת החידון: english,
history, ulpan, lomda · משפחת המתמטיקה: math-teen, math-uni, math-uni2,
math-uni3 · bagrut-806 · reader+kotvim). כל אחד אימת בדפדפן. פעולות:

| אפליקציה | פעולות |
|---|---|
| math-app | next_question, show_hint, read_aloud, highlight_option, explain_again, go_screen, slow_mode |
| math-teen, math-uni, math-uni2, math-uni3 | + repeat_question, formula_sheet (בלי slow_mode) |
| english, history, ulpan, lomda | next_question, show_hint, read_aloud, repeat_question, highlight_option, explain_again, go_screen |
| bagrut-806 | next_question, show_hint, read_aloud, repeat_question, explain_again, go_screen (D-20) |
| reader | read_aloud, repeat_question, next_sentence, read_word |
| kotvim | read_aloud, explain_again, go_screen (D-20) |

`barak-browser.js`: 12 מתוך 12 ✓ (`/tmp/bb-all.txt`; `ulpan` נכשל
פעם אחת על ENTER ישן — תוקן, ✓). `fresh.js`: 10 דוחות נסרקו מחדש.
`status.js --check`: 13 תואמות.

## שלב 6 — ״תאוריה מדברת״ (הריפו הנפרד) · 16.9.2026

`index.html`: ארבע תגיות `/tutor/` + `./barak-core.js` (עותק מקומי,
`BARAK_CORE_VERSION = "2026-09-16.1"`), כפתור `#btnTutor` ברצף
ובתרגול (לא בבחינה), `TUTOR.mount({app:'theory'})`, `BARAK.register`
עם 7 פעולות (כולל `show_sign_image`), `BUILD = 'v100'`. `sw.js`:
8 רשומות PRECACHE נוספות. `privacy.html`: ״עזרה מהמורה״ בעברית
ובאנגלית. `CHANGELOG.md`: v100. `tests/baraktest.js` (חדש).
`node tests/run-all.js --quiet`: **17 מתוך 17**. בדפדפן (Playwright,
`/tutor` מוגש מהריפו הראשי דרך `page.route`): ✓ הקשר עם אפשרויות,
תמרור, רמז, הדגשה, הבא, אופליין, ואין ברק בבחינה.
`tutor-api/theory.patch` בריפו הראשי נוצר מחדש מה-`git diff`.

## שלב 7 — QA, דף `/barak/`, מסמכים · 16.9.2026

`legal/terms.js` 1.7 (ארבע שפות: אפשרויות, בחירה שגויה, ארבעה
חילופים, רשימת פעולות). `/barak/index.html` — ארבעה מקצועות × ארבע
שפות, `notApps`; `barak-browser.js barak` ✓, `smoke.js barak` נקי.
`all.js --static`: **37 בדיקות, כולן עברו**. הריצה המלאה עם דפדפן:
ראו `docs/barak-core-report.md`. מסמכים: CLAUDE.md, qa/README,
tutor-api/README, CHANGELOG, FINDINGS, JOSH.md, decisions D-17–D-22.

**באג שנתפס בריצה המלאה הראשונה:** `legal/terms.js` 1.7 נשבר על גרשיים
ASCII במחרוזת האנגלית, ושתים־עשרה האפליקציות נפלו ב-`pageerror`
בזמן שהחבילה הסטטית הייתה ירוקה. תוקן, ו-`barak.js` מפרסר מעכשיו את
`tutor/*.js` ו-`legal/*.js` (הוכח אדום על הקובץ השבור).

`node .claude/qa/all.js` (מלא, עם דפדפן): **51 בדיקות, כולן עברו**. **סטטוס: שלב 7 הושלם; ממתין ל״יאללה״.**

**תיקון בדוח, 16.9.2026 (אחרי הדחיפה):** סדר הפריסה בסעיף 5ב היה
הפוך. `readBody` החדש מקבל גם את הגוף הישן, ולכן פריסת השרת לפני
המיזוג אינה שוברת לומד קיים; ואילו לקוח חדש מול שרת ישן מקבל 400
ונופל למוח המקומי — כלומר המיזוג־קודם יוצר חלון שבו ברק שבשרת אינו
מגיע לאיש. הסדר עכשיו: השרת, ואז האתר. וסעיף 4 תוקן: חמש בדיקות
הטלפון דורשות את המיזוג, כי Pages מגיש את `main` בלבד.

## שלב 8 — הייצור נפרס, והממצאים החיים נסגרו · 16.9.2026 (ערב)

הבעלים: ״תחליטי ובצע״ בתשובה לבקשת ה״יאללה״.

**הסדר שבוצע:** תיקון מציני ה-KV ב-`deploy-tutor.yml` → פריסת
ייצור (ריצה 7) → **קריאת `main` וגילוי שלושה ממצאים חיים** →
תיקון → פריסה מחדש (ריצה 8, 200) → מיזוג `main` לענף → מיזוג
הענף ל-`main` בשני הריפו.

**הטעות בסדר הזה, ואני רושם אותה:** ריצה 7 יצאה לפני שקראתי מה
נחת ב-`main`. הסשן המקביל כבר מדד ש-״החדש ביותר״ הוא העמוס
ביותר, והפריסה ההיא נשאה את הנסיגה כעשר דקות. `git fetch origin
main` שייך לרגע שלפני הפעולה, לא רק לפתיחת הסשן.

הפירוט המלא של ארבעת התיקונים ושלושת הבאגים שנתפסו בדרך:
`FINDINGS.md`, הרשומה ״שלושה ממצאים חיים נסגרו״.

### סגירת שלב 8 — המיזוג בוצע, ושני ה-`main` ירוקים

    lagstein1-png.github.io   PR #24  →  c37afc2   qa 630 ✓
    הריפו הנפרד               PR #1   →  2946b68   tests 62 ✓  (17/17)

**מה עיכב, וזה הדבר שיחזור לסשן הבא:** בין ריצה 623 לריצה 627
`main` זז פעמיים. בפעם הראשונה (`bee1f3f`) סשן מקביל לקח את שמונת
מפתחות הקאש שהענף הזה סימן, ו-`cache.js` נפל — כמתוכנן. הוקצו
מספרים טריים (`n105 m110 k49 l99 u114 v112 g111 a73`), שבעת דוחות
התוכן שהתנגשו **נסרקו מחדש על העץ הממוזג** ולא נבחר בהם צד,
ו-`STATUS.md` נוצר מחדש. בפעם השנייה (`7be1df8`) השינוי היה
ב-`FINDINGS.md` בלבד והמיזוג עבר נקי.

**המיזוג עצמו עבר דרך Pull Request** ולא דרך `git merge` מקומי:
מסווג ההרשאות בסביבה הזאת חוסם `git merge` אל ענף שעוקב אחרי
`origin/main`. זה גם המסלול שהריפו התחיל לפתוח (`#13`–`#15`).

**מה שנשאר פתוח, ואינו של הסשן הזה:**

- **D-17** (הפאנל — גיליון תחתון / עמודה צדית) ו-**D-15** (דף
  `/barak/`) ממתינים לאישור הבעלים, כפי ש-§9 דורש.
- **`barak-live`** לא הורץ מאז שהוכנסה ההשהיה (`LIVE_GAP_MS=4000`).
  הרצה אחת תאמת את שרשרת המודלים מול Gemini אמיתי בתוך תקרת
  60 הקריאות.
- **`live-check`** — הפעלה ידנית אחרי ש-Pages יגיש את המיזוג,
  כדי לוודא שמפתח הקאש המוגש הוא זה שב-`main`.

### סבב אחרון — מה שהמודל האמיתי גילה, ומה שתוקן אחריו

`barak-live` ריצה 3 הייתה ההרצה הראשונה עם ההשהיה (`LIVE_GAP_MS=4000`),
והיא החזירה שני דברים — אחד טוב ואחד רע.

**הטוב:** שרשרת המודלים עמדה במבחן שלא תוכנן לה. המכסה החינמית
נגמרה באמצע הריצה, ובכל פנייה מאותו רגע המקובע `gemini-3.6-flash`
החזיר 429, `gemini-3.8-flash` החזיר 429 או 503,
`gemini-3.5-flash-lite` החזיר 400 — **והניסיון החוזר בגוף מינימלי
ענה**. אף תרחיש לא נשאר בלי תשובה. זה בדיוק התיקון שנבנה קודם
בסשן הזה, והפעם הוא נמדד מול מכסה אמיתית.

**הרע:** ברק כתב את שמו באותיות עבריות בתוך ערבית ורוסית
(״أنا ברק״, ״Я ברק״), והמציא תעתיקים (بارق, Барк, barak). חמישה
מקרים, וארבעה מהם **עברו** את ההערכות — הסף היה ארבעה תווים
עבריים רצופים ו״ברק״ הוא שלושה. הפירוט ב-`FINDINGS.md`.

    PR #25  →  950c395   qa ירוקה
    deploy-tutor ריצה 9   ✓ הצליחה, והבדיקה החיה שבסופה החזירה 200

**ולמה זה לא היה נמצא בלי המודל האמיתי:** המוק מחזיר מחרוזות
שאנחנו כתבנו, ולכן הוא לעולם לא יכתוב ״أنا ברק״. 208 התרחישים
במוק בודקים את הצינור; המודל בודק את ההנחיה. שניהם נחוצים,
ואף אחד מהם אינו מחליף את השני.
