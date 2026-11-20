# טיוטות לדף החנות ב-Google Play

טיוטה להדבקה ב-Play Console. **לא הועלתה לשום מקום.** המגבלות של Play: שם עד 30 תווים, תיאור קצר עד 80, תיאור מלא עד 4000. האורכים נבדקו ב-`node` (ראו בסוף).

---

## PermitVoice (net.permitvoice.app) — en-US

**App name:** PermitVoice

**Short description:**
Permit test practice, read aloud. English and Spanish, for CA, TX and FL.

**Full description:**
PermitVoice helps you get ready for the written learner's permit test, one question at a time, with every question read aloud.

READ ALOUD
Tap the speaker button and PermitVoice reads the question and every answer out loud. It is made for people who learn better by listening: new drivers, adults coming back to driving, people with dyslexia or ADHD, and anyone studying in a second language.

ENGLISH AND SPANISH
Practice in English or in Spanish. Switch the language at any time.

YOUR STATE
Practice questions written for California, Texas and Florida rules of the road: signs, right of way, speed limits, parking, and safe driving.

SIMPLE AND PRIVATE
No account and no sign-up. No ads.

PermitVoice is an independent study aid. It is not made by, or endorsed by, the DMV, the Texas DPS, the FLHSMV or any government agency. The questions are original practice material based on the public driver handbooks. Always check the official handbook for your state.

**Contact email:** lemida.bekol@gmail.com
**Website:** https://permitvoice.net
**Privacy policy:** https://permitvoice.net/legal/privacy.html
**Category:** Education

---

## בקול (il.co.bekol.app) — iw-IL

**שם האפליקציה:** בקול

**תיאור קצר:**
אפליקציות לימוד בעברית שמקריאות כל שאלה בקול. חינם, בלי פרסומות.

**תיאור מלא:**
בקול הוא אוסף אפליקציות לימוד בעברית, וכל שאלה בו נקראת בקול.

מקשיבים לשאלה
לוחצים על כפתור הרמקול, ובקול מקריא את השאלה ואת כל התשובות. האפליקציה בנויה לילדים ולבני נוער שלומדים טוב יותר כשהם שומעים: עם דיסלקציה, עם ADHD, ועולים חדשים שעוד לומדים עברית.

הרבה מקצועות במקום אחד
חשבון, אנגלית, עברית, מדעים, היסטוריה, גאוגרפיה ועוד, מהיסודי ועד התיכון.

לומדים מטעות
כשבוחרים תשובה לא נכונה, בקול מסביר במשפט פשוט למה התשובה הנכונה נכונה.

בכמה שפות
חלק מהאפליקציות מציגות הסבר גם בערבית, באנגלית וברוסית.

בלי חשבון ובלי פרסומות
אין הרשמה, אין חשבון משתמש ואין פרסומות. ההתקדמות נשמרת רק במכשיר.

**אימייל ליצירת קשר:** lemida.bekol@gmail.com
**אתר:** https://bekol.co.il
**מדיניות פרטיות:** https://bekol.co.il/legal/
**קטגוריה:** Education

**הערות גרסה (Alpha):**
```
<iw-IL>
גרסה ראשונה לבדיקה סגורה.
</iw-IL>
```

---

## מה צריך לבדוק לפני ששולחים לבדיקה

1. **קריטי, PermitVoice: באתר יש קנייה.** ב-`https://permitvoice.net/` מוגדר קישור תשלום של Lemon Squeezy (`checkout: 'https://permitvoice.lemonsqueezy.com/...'`), ו-`/pricing/` מחזיר 200 (נבדק ב-`curl`, 20.11.2026). אם האפליקציה מציגה את האתר (TWA), הלומד יראה בתוכה כפתור קנייה. מדיניות Play דורשת Google Play Billing לתוכן דיגיטלי, וההצהרה "אין רכישות" לא תהיה נכונה. צריך להחליט לפני השליחה: להסתיר את הקנייה בתוך האפליקציה, או להצהיר עליה ולעבור ל-Play Billing.
2. **חשוב, בקול: Data safety.** כל דפי האתר טוענים GoatCounter (`CLAUDE.md`, `analytics.js`). GoatCounter לא משתמש בעוגיות, אבל הוא אוסף צפיות בדפים. בטופס צריך לסמן App interactions → Analytics, לא "אין איסוף נתונים". זה חשוב במיוחד בתוכנית Families.
3. **חשוב, PermitVoice: כתובת מדיניות הפרטיות.** הכתובת שהוזנה קודם (`/privacy/`) מחזירה 404. צריך להחליף ל-`https://permitvoice.net/legal/privacy.html` (מחזירה 200).

אורכי הטקסטים (`node`, ספירת תווים): PermitVoice: קצר 73, מלא 962. בקול: קצר 64, מלא 597.
