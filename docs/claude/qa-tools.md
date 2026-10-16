# כלי בדיקה

> הועבר כלשונו מ-`CLAUDE.md` ב-17.9.2026, כדי לקצר את מה שנטען בכל סשן.
> הכללים כאן מחייבים בדיוק כמו שם. הפניות ״למעלה״ ו״למטה״ מכוונות לסעיפים ב-`CLAUDE.md` או במסמכים האחרים כאן (הטבלה בראש `CLAUDE.md`).

## כלי בדיקה

    node .claude/qa/serve.js                 # שרת מקומי על 127.0.0.1:8099; QA_PORT=8123 — ריצה שנייה במקביל (כל הכלים קוראים port.js)
    node .claude/qa/smoke.js math-app        # דפדפן אמיתי, בודק שגיאות JS
    node .claude/qa/parse.js                 # תקינות פרסינג
    node .claude/qa/entropy.js               # תשובה קבועה / כפילויות
    node .claude/qa/options.js               # כמה אפשרויות התלמיד באמת רואה
    node .claude/qa/exam806.js               # התוכן הכתוב־ביד של 806 (ו-`--app=bagrut-history` לאחות שלה)
    node .claude/qa/naming.js                # כלל השם של ״תאוריה מדברת״
    node .claude/qa/a11y.js                  # ששת מצבי הנגישות — מ-applyModes ועד כלל ב-CSS
    node .claude/qa/aria.js                  # מצב דו־מצבי קבוע, outline בתוך :focus, tabindex חיובי, מאפיין פיזי
    node .claude/qa/pressed.js               # כפתור דו־מצבי בלי aria-pressed — קורא מסך אינו יודע מה נבחר
    node .claude/qa/density.js               # כמה שאלות בכל תא נושא×רמה — ראצ׳ט מול בסיס, התקן 9; מאגר רשום שלא נקרא — נופל (O-196)
    node .claude/qa/cache.js                 # חמש בדיקות על שלושה־עשר ה-sw.js
    node .claude/qa/storage.js               # מפתח localStorage אחד לאפליקציה אחת — כל .html/.js בתיקייה, var/let/const, KEY לבדו (O-194)
    node .claude/qa/say.js                   # ההקראה לא מסגירה את התשובה לפני שעונים
    node .claude/qa/spacesay.js              # אותה דליפה, סטטית, בכל האפליקציות; וגם רווח/Enter על כפתור ממוקד שיורה פעמיים
    node .claude/qa/barcontrast.js           # ניגודיות ארבעת הפקדים בפס הכותרת — בחישוב, בלי דפדפן; app.css וגם <style> שב-index.html (O-196)
    node .claude/qa/saysym.js                # מה באמת נאמר — אין ^ או _ גולמי בהקראה
    node .claude/qa/guess.js                 # אי אפשר לקלוע לפי אורך התשובה או מיקומה; תא שחצה נמדד שוב לפני שמפיל
    node .claude/qa/visible.js               # מסיח בשאלת חסר שכבר גלוי במשפט — נפסל בלי ידע
    node .claude/qa/clearwhy.js              # הסבר הטעות כמשפט — בלי סימנים, בשפת הלומד, עד 120 תווים
    node .claude/qa/clicks.js                # כל לחיצה מושמעת, והמתג שמשתיק אותה — הרשימה נגזרת (O-162), לא כתובה
    node .claude/qa/fonts.js                 # ערבית ורוסית בגופן שיש בו את הכתב
    node .claude/qa/langbtn.js               # כפתור השפה עצמו — "العربية" גם כשהממשק עברי
    node .claude/qa/teen-i18n.js             # ״שלב״ בארבע שפות בפועל — המסך, ההקראה, והרווח לפני מספר; בדפדפן
    node .claude/qa/banks.js                 # החיווט של lomda/data/, וארבע השפות בתוכן; מנוע שלא זוהה (window.BANKS) — נופל (O-170)
    node .claude/qa/kotvim.js                # התוכן של ״כותבים ביחד״ — ארבע שפות, ואין קטע גנרי
    node .claude/qa/geobank.js               # המחסן של geography-elem — מבנה, שפות, רמז שמסגיר, אורך שמסגיר, ≥13 בתא
    node .claude/qa/bgbank.js                # מסלול הבגרות של english (BGP) — מבנה, אנגלית בלבד, אורך שמסגיר (קו בסיס), מודול ריק
    node .claude/qa/leaks.js                 # תיאור של פריט בלומדה אינו מצטט את כותרתו (ההקראה לא מסגירה)
    node .claude/qa/markers.js               # סמני התנגשות מיזוג שנשארו בקובץ שנעקב
    node .claude/qa/port.js --check          # אין כלי שמקודד 127.0.0.1:8099 — הפורט מ-QA_PORT (ברירת מחדל 8099), דרך port.js
    node .claude/qa/guide.js                 # שם כפתור שהמדריך מבטיח, וכבר אינו בממשק
    node .claude/qa/hebrew.js                # העברית של לימור — תרגום מילולי בשלושת קובצי הלקוח
    node .claude/qa/langretry.mjs            # הניסיון החוזר — handleAsk עם fetch מוזרק, שלושה מצבים
    node .claude/qa/josh.js                  # הכתיב של ג׳וש (גרש עברי U+05F3), ושהשם שהלומד רואה הוא לימור
    node .claude/qa/brain.js                 # מוח אחד — אין מוח ג׳וש שני שדף טוען, ואין חיפוש מהדפדפן
    node .claude/qa/joshface.js              # שכבת הפנים נשארת תצוגה — אין מוח, רשת, הקראה או קול; גם כינוי (`var SS = window.speechSynthesis`, O-196)
    node .claude/qa/joshstate.js             # גלאי מצב הלומד — 17 תרחישים ב-vm נפרד, וארבע נגיעות החיווט בתשע אפליקציות
    node .claude/qa/search.js                # חוזה ספק החיפוש — אין ספק, ואין ניסוח שמתיימר לבדוק; כל מארח בקוד השרת ברשימת המוכרים (O-196)
    node .claude/qa/claims.js                # חמש הטענות האסורות בשיווק — שלוש בגרפ, ושתיים שהפקודה מריצה
    node .claude/qa/money.js                 # אין מסחר: לא מחיר, לא דף קנייה, לא הבטחת תשלום, ולא הרשמה/חשבון/מנוי — גם בגוף כל דף (O-171, O-196)
    node .claude/qa/letters.js               # אורך המכתב שהכותרת מבטיחה, מול המכתב עצמו
    node .claude/qa/skill.js                 # דף בניית האפליקציה — אות BUILD, שער השלבים, וטענת מספר־שורה
    node .claude/qa/srt.js                   # הכתוביות מול טבלאות התסריטים (המחולל: marketing/make-srt.js)
    node .claude/qa/core.js                  # learning-core/ — חוסם אימוץ כל עוד היא נסחפת מהמנוע החי
    node .claude/qa/galileo.js               # רקיע — המנוע האסטרונומי מול Swiss Ephemeris, סטייה מרבית לכל גוף
    node .claude/qa/rakia-content.js         # רקיע — 469 הטקסטים: מניין, מבנה {he}, אורך, ייחוד, והמילון
    node .claude/qa/rakia-safety.js          # רקיע — מה שאסור לטקסט לומר: רפואה, כסף, משפט, מוות, נבואה, ודאות, מגדר
    node .claude/qa/deps.js                  # כל הדפים (בלי ארגומנט) — אפס תלות בזמן ריצה, וכל סקריפט מקומי גם ב-PRE; KNOWN מודפס (O-166)
    node .claude/qa/rakia/mk-ephem.js --check    # טבלאות האפמריס לא נערכו ביד (המחולל: אותו קובץ עם נתיב astronomia)
    node .claude/qa/rakia/mk-places.js --check   # places.js לא נערך ביד (המחולל: אותו קובץ עם all-the-cities ו-tz-lookup)
    node .claude/qa/wix.js                   # כרטיסי האפליקציות ל-wix-content.md
    node .claude/qa/content.js               # תוכן: תשע משפחות, דוח PASS/REVIEW/FAIL
    node .claude/qa/fresh.js                 # דוח תוכן שמתאר עץ שכבר אינו קיים
    node .claude/qa/stage.js                 # שער השלבים — מי מותר ללומד
    node .claude/qa/deployed.js              # מסלול הלומד על הבתים שנפרסו — ביד בלבד
    Actions → live-check → Run workflow      # מה באמת מוגש מהאתר החי (הסוכן חסום)
    Actions → tutor-status → Run workflow    # /health של לימור, כולל המכסה הגלובלית ב-KV (הסוכן חסום)
    node .claude/qa/keyboard.js              # הפאנל של לימור כשהמקלדת פתוחה — visualViewport מזויף, 360/412, עברית וערבית, חזקות, אופליין
    node .claude/qa/apps.js              # נקודות המגע בדף הבית (badge, ICONS, STAGE_IDS, SUBJECT_IDS…) — הרשימה: new-app-or-topic.md
    node .claude/qa/status.js --check    # STATUS.md מול המדידה — הטבלה לא נכתבת ביד
    node .claude/qa/sitemap.js --check   # sitemap.xml מול stages.json, noindex ו-git (המחולל: אותו קובץ בלי --check)
    node .claude/qa/pure.js              # המבחן הכיתתי: כל קריאה ל-buildQuestion מתוך buildQ מעבירה pure=true — בכל אפליקציה עם chooseIndex (O-184)
    node .claude/qa/coverage.js          # האחוז על הכרטיס, בסרגל הרמה ובמסך ההתקדמות הוא כיסוי (נענו נכון מתוך המאגר של התא), ״נשלט״ = כיסוי ≥75% ודיוק אחרון ≥60% — סימולציה ב-13 אפליקציות; --rev=HEAD להוכחת נפילה (O-189)
    node .claude/qa/i18n.js              # המחרוזת העברית היא המפתח — TR_KEYS (_("…") ו-_('…'), כל מפתח מתורגם, ותרגום שזז ממפתח אחר מול HEAD) ומילונים לפי מפתח עברי (reader/TR, rakia/EN_DICT)
    node .claude/qa/agents.js            # סוכן אינו קורא לסוכן — אין כלי סוכנים בשורת tools ואין הבטחה כזאת
    node .claude/qa/century.js           # המאה בארבע השפות — על הפונקציה האמיתית שבאפליקציה
    node .claude/qa/content806.js        # סריקת התוכן של bagrut-806 (הבנק הסטטי) — כותב את הדוח. שם אפליקציה כארגומנט: bagrut-history
    node .claude/qa/hebank.js            # סריקת התוכן של hebrew — bank.json, עברית בלבד; QA_BANK מצביע על מאגר חלופי
    node .claude/qa/engine.js            # המנוע המשותף — האם העותקים בכל האפליקציות עדיין זהים
    node .claude/qa/tutor.js             # ״עזרה מהמורה״ — השומרים בשרת, החיווט בלקוח, ושער התנאים
    node .claude/qa/offer.js             # הצעה שלימור מציעה (״נעבור ל…״) מתקיימת בפועל
    node .claude/qa/simplify.js          # ״גרסה פשוטה״ ב-reader — רק בלחיצה, רק במצב simplify, ובלי שרת
    node .claude/qa/analytics.js         # GoatCounter: בכל הדפים או באף אחד, והתנאים זהים בארבע שפות
    node .claude/qa/mkreader.js --check  # marketing/index.html לא נערך ביד (המחולל: אותו קובץ)
    node .claude/qa/og.js --check        # תמונות השיתוף: רקע מול theme_color, 1200×630, ואין עותק של אפליקציה אחרת (המחולל: אותו קובץ)
    node .claude/qa/icon.js --check      # אייקוני PWA: רקע מול theme_color, וכל אייקון שהמניפסט מצהיר קיים בגודלו (המחולל: אותו קובץ)
    node .claude/qa/media.js             # סרטוני ההדגמה — חתימת כל סרטון מול DEMO_SCRIPT, וצילומי המסך בארבע שפות
    node .claude/qa/counts.js            # מספר תוכן שמצוטט בחומר שיווקי מול המדידה של היום — ומניין האפליקציות מול apps.js (O-200)
    node .claude/qa/barak.js             # מנוע לימור — חוזה ה-Worker מול מודל מדומה, והחיווט בלקוח; בלי רשת
    node .claude/qa/hespeech.js          # מנוע ההגייה העברי — /tutor/he-speech.js; תגית, PRE וקריאה ל-spoken בכל אפליקציה מקריאה — נגזר, NOT_WIRED מנומק (O-225)
    node .claude/qa/barak-browser.js     # לימור בדפדפן אמיתי מול שרת מדומה, בכל אפליקציה
    node .claude/qa/tutor-timeout.js     # ספק שתולה — הפאנל של לימור אינו נתקע (O-72)
    node .claude/qa/tutor-lang.js        # השאלה שלימור מקבלת כתובה בשפת המסך — בכל אפליקציה עם מחולל
    node .claude/qa/contrast.js          # האם הטקסט בכלל נראה — ניגודיות מול הסף; וגם בתוך כל שיעור מודרך, אחרי בחירת תשובה (נגזר מ-function *LessonView, O-230)
    node .claude/qa/shadow.js            # פונקציה גלובלית שנדרסה בשקט
    node .claude/qa/voice.js             # מנוע ההקראה מול speechSynthesis מזויף — ארבעת המנגנונים מתאוששים, בכל אפליקציה מקריאה (נגזר מ-stages.json; EXCEPT לפי בדיקה, O-225); ופס ״אין קול בשפה״ (O-79): קולות en בלבד → פס פעם אחת, he → אין, ריקה → אין. `--nolang` מריץ רק אותו
    node .claude/qa/netpin.js            # מנגנון 4 מול בחירת קול ידנית — tutor/tutor.js
    node .claude/qa/exam.js              # המבחן מהקישור — השאלה שהמורה רואה היא שהתלמיד מקבל
    node .claude/qa/examdrift.js         # המבחן הכיתתי כשהמורה והתלמיד בשני דפדפנים: חתימת התוכן (h בקוד התשובות) — שפה אחרת אינה אזהרה, מאגר/מחולל שונה בצד התלמיד כן; כל אפליקציה עם examId (O-176)
    node .claude/qa/recorded.js          # השכבה המוקלטת — המודול והחיווט בכל אפליקציה ב-stages.json, גם js/speech.js (O-165); עם --browser גם הניגון בדפדפן
    node .claude/qa/record.js --check    # ההקלטות מול המניפסט — המחולל: אותו קובץ (record.yml מריץ אותו כל בוקר)
    node .claude/qa/record-safety.js     # ההקלטה אינה מוחקת, אינה ננעלת ואינה נופלת על gcloud — ffmpeg/ffprobe/fetch מדומים
    node .claude/qa/audio-size.js            # תקרת שני מאגרי הקול, ומתג המקור מול 41 קובצי sw.js
    node .claude/qa/audio-move.js            # בונה את עצי ריפואי הקול מהעץ הזה — מעתיק, לא מוחק
    node .claude/qa/audio-adopt.js           # קליפ שכבר שולם עליו לא מוקלט שוב — מאמץ בין אפליקציות
    node .claude/qa/findings.js --check  # FINDINGS.md מחזיק שבוע, הישן בארכיון — --archive מעביר (O-85); ושני ## בכל הקובץ (O-196)
    node .claude/qa/suite.js --check     # הרשימה הזאת מול SUITE שב-all.js — מזהה חסר או שורה מתה נופלים
    node .claude/qa/all.js                   # הכול, ופסק דין אחד; רשימות האפליקציות נגזרות מ-stages.json (applist.js)
    node .claude/qa/all.js --static          # רק מה שאינו דורש דפדפן
    node .claude/qa/extract.js /tmp/js …     # מחלץ סקריפטים ל-eslint

הפירוט המלא, ובכללו קו הבסיס של eslint, נמצא ב-`.claude/qa/README.md`.

**ויש שער שיעצור אותך בסוף.** `.claude/hooks/qa-gate.sh`, מחובר
כ-`Stop` hook ב-`.claude/settings.json`, מריץ `all.js --static`
כשסשן מנסה להסתיים — 52 בדיקות, 12 שניות (נמדד 19.9.2026) — ו**חוסם את
הסיום** אם אחת נכשלה. הוא שותק כשלא נגעת בקוד (שינוי ב-`.md`,
ב-`.json` או ב-`qa/reports/` אינו מפעיל אותו), והוא אינו מתקן
כלום — רק אומר מה נשבר. עקיפה מכוונת: `QA_GATE=0`.

אל תסתמך עליו כתחליף להרצה: הוא אינו מריץ דפדפן, ולכן `smoke`,
`exam`, `entropy` ו-`options` אינם בו. את אלה מריצים ב-`/qa`.

**ושלושה הוקים — שניים על הסחיפה שכתובה למטה, ואחד על הדחיפה.**
`.claude/hooks/main-drift.sh` רץ בפתיחת סשן, ושוב לפני כל
`git commit`, ומדפיס כמה `main` מקדים אותך ומה זז שם — כולל קבצים
שמחזיקים `BUILD` ומפתח קאש. **הוא אינו חוסם.** נעילת קבצים חוסמת
נשקלה ונפסלה: נעילה שטועה עוצרת כל עריכה, וההתנגשויות המתועדות
היו בין סשנים — ועליהן המידע הזה עונה.

**ושער שלישי, על הדחיפה — `.claude/hooks/fresh-gate.sh`, 14.9.2026.**
הוא מריץ `fresh.js` לפני כל `git push`, **וחוסם** אם דוח תוכן
מתאר עץ שכבר אינו קיים.

למה הוא נדרש: `fresh` הפיל את `main` **תשע פעמים** — ריצות 439,
440, 443, 446, 458, 462, 463, 464 ו-467 — באותו רצף בדיוק. הסשן
סורק תוכן, הדוח טרי, `all.js --static` ירוק; ואז `git merge
origin/main` — **שמבצע commit בעצמו, ולכן אינו עובר ב-`git
commit`** ובשער שמסונן עליו — מביא שינוי תוכן של סשן אחר,
החתימה זזה, והדוח מיושן. `git push` לא נבדק כלל.

**והנזק אינו נעצר בסשן שגרם לו:** ריצות 463 ו-464 נפלו על
התקלה של 462. `main` אדום הופך כל ריצה של כל סשן אחר לחסרת
משמעות — זה בדיוק הנימוק של ״שלב 0 של השחרור״ למעלה.

**למה דווקא על `push` ולא על `merge`:** הוק `PreToolUse` רץ
*לפני* הפקודה, ולכן על `git merge` הוא עדיין רואה את העץ
שלפני המיזוג ואינו יכול לראות את ההיישנות שהמיזוג יוצר.
הדחיפה היא הרגע האחרון שבו הנזק עוד פרטי.

**ולמה הוא חוסם בזמן ש-`main-drift.sh` אינו:** סחיפה היא מידע
שהסשן שוקל, ודוח מיושן הוא כשל ידוע שנדחף. `fresh.js` אינו
מריץ דפדפן — נמדד, חמש הרצות: 163–206 מילישניות. עקיפה
מכוונת: `QA_GATE=0`, אותה מילה כמו ב-`qa-gate.sh`.

**הרשת חסומה בסביבת הפיתוח.** אי אפשר להגיע ל-`bekol.co.il` (וגם לא
לכתובת הישנה `lagstein1-png.github.io`) מכאן. בדיקה מול השרת המקומי היא בדיקה מקומית — לא קוראים לה "בדיקה חיה".

**אבל יש דרך אחת לבדוק את האתר החי, והיא לא ידנית:**
`.github/workflows/live-check.yml`, שנוסף 11.9.2026. הרנרים של
GitHub אינם חסומים, והוא מושך את כל האפליקציות ש-`stages.json` מסמן `public` (הרשימה נגזרת בזמן הריצה) מהרשת
ובודק שלושה דברים — סטטוס, מחרוזת שאמורה להיות בדף, ו**מפתח
הקאש המוגש מול זה שב-`main`**. העמודה האחרונה היא העיקר: בלעדיה
״המחרוזת נמצאה״ יכול להיות עותק ישן שנשאר ב-CDN. הפעלה ידנית
בלבד, בלי סודות, `permissions: contents: read`. סוכן יכול
להפעיל אותו ב-`actions_run_trigger` ולקרוא את הלוג.
