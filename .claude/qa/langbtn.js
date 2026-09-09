/* =====================================================================
   כפתור שפה בכתב שאין בגופן — הבדיקה שחסרה ל-fonts.js.

   `fonts.js` בודק את הדף: אם הממשק כולו בערבית, האם נטענת משפחה
   ערבית ומוחלת עליו. זה כלל של `html[lang="ar"]`, והוא נכון —
   אבל הוא חל רק כשהדף כולו באותה שפה.

   סרגל השפות הוא בדיוק המקום שבו זה לא מספיק: הכפתור "العربية"
   מוצג גם כשהממשק בעברית, וכך גם "Русский". Heebo ו-Assistant אינם
   מכילים לא ערבית ולא קירילית, ולכן שני הכפתורים האלה נפלו לגופן
   ברירת המחדל של המערכת — במידות אחרות משני הכפתורים שלידם. הטקסט
   קריא (הדפדפן משלים גליף חסר מהגופן הבא בשרשרת), אבל הכפתור נראה
   בגודל אחר, וזו בדיוק התלונה.

   נמדד ב-9.9.2026 לפני התיקון, בכרום דרך השרת המקומי:
     דף הבית ru = Heebo · pricing ar+ru = Heebo · reader ar+ru = Assistant
     שער התנאים (legal/protect.js) ar+ru = Heebo, בכל שתים־עשרה
   אחרי: כולם "Noto Sans Arabic" / "Noto Sans".

   הבדיקה מודדת בדפדפן ולא בקריאת CSS: היא שואלת מה הכפתור **קיבל**
   בפועל, ולכן היא אינה תלויה בצורת הכתיבה של הכלל ואינה נשברת
   כשמישהו כותב אותו אחרת. דורשת את השרת המקומי.

   node .claude/qa/langbtn.js
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');

const BASE = 'http://127.0.0.1:8099';

/* שני הכתבים שאף אחד מגופני הכותרת של הריפו אינו מכיל, והמשפחה
   שחייבת להופיע ראשונה בשרשרת של כפתור בכתב הזה. */
const SCRIPT = {
  ar: { name: 'ערבית',  want: /Noto Sans Arabic/i },
  ru: { name: 'רוסית',  want: /Noto Sans(?!\s*Arabic)/i },
};

/* הדפים שיש בהם סרגל שפות גלוי במסך הראשון, בלי ניווט. */
const PAGES = [
  { id: 'דף הבית', url: '/',         sel: '.lang button' },
  { id: 'pricing', url: '/pricing/', sel: '.lang button' },
  { id: 'reader',  url: '/reader/',  sel: '#langbar button' },
];

/* שער התנאים מוזרק על ידי legal/protect.js לכל שתים־עשרה, ולכן
   מספיק לבדוק אותו בכמה מהן — נפילה בו היא נפילה בכולן. */
const GATE = ['/', '/math-app/', '/lomda/', '/reader/'];

/* בוררי השפה שבתוך מסך ההגדרות. הם יושבים מאחורי ניווט, ולכן הם לא
   נבדקו ב-9.9 ונרשמו כ-O-14 ב-FINDINGS.md. הניווט אליהם אינו אחיד —
   שלוש צורות, וכולן קבועות בקוד ולא נחושות:

     english · history · lomda · ulpan   [data-a="set"]
     math-teen · math-uni · uni2 · uni3  [data-a="go"][data-v="settings"]
     math-app                            אותו כפתור, אבל רק אחרי אונבורדינג

   bagrut-806 אינה כאן: אין בה ממשק ערבי ורוסי, ואין בה בורר שפה.

   וכאן המדידה אינה יכולה להסתמך על תכונת lang: ארבע אפליקציות החידון
   אינן מסמנות אותה על הכפתור כלל (`data-a="lang" data-v="ar"` בלבד),
   ולכן הכתב מזוהה מטווח התווים של הטקסט שעל הכפתור. זה גם מה שהמשתמש
   רואה: הגליף, לא התכונה. */
/* אונבורדינג משפחת המתמטיקה: כמה מסכי "הבא" ואז "התחלה". חמש לחיצות
   מספיקות לארוך שבהן, ולחיצה על סלקטור שאינו קיים אינה עושה דבר. */
const OB = ['[data-a="obnext"]', '[data-a="obnext"]', '[data-a="obnext"]',
            '[data-a="obnext"]', '[data-a="start"]'];

const SETTINGS = [
  { id: 'english',   url: '/english/',   nav: '[data-a="set"]' },
  { id: 'history',   url: '/history/',   nav: '[data-a="set"]' },
  { id: 'lomda',     url: '/lomda/',     nav: '[data-a="set"]' },
  { id: 'ulpan',     url: '/ulpan/',     nav: '[data-a="set"]' },
  { id: 'math-teen', url: '/math-teen/', nav: '[data-a="go"][data-v="settings"]', ob: OB },
  { id: 'math-uni',  url: '/math-uni/',  nav: '[data-a="go"][data-v="settings"]', ob: OB },
  { id: 'math-uni2', url: '/math-uni2/', nav: '[data-a="go"][data-v="settings"]', ob: OB },
  { id: 'math-uni3', url: '/math-uni3/', nav: '[data-a="go"][data-v="settings"]', ob: OB },
  { id: 'math-app',  url: '/math-app/',  nav: '[data-a="go"][data-v="settings"]',
    ob: ['[data-a="selpet"]', '[data-a="startpet"]'] },
];

const dismissPopup = () => {
  const b = document.querySelector('[data-launch-popup]');
  if (b && b.launchClose) b.launchClose('dismiss');
  else if (b) b.remove();
};

const families = (sel) => {
  const out = [];
  for (const el of document.querySelectorAll(sel)) {
    const lg = el.getAttribute('lang');
    if (lg) out.push([lg, getComputedStyle(el).fontFamily]);
  }
  return out;
};

/* אותה מדידה כמו families, אבל הכתב מזוהה מהטקסט ולא מתכונת lang,
   והגופן נמדד על האלמנט שבאמת נושא את הגליף — ב-math-app התווית
   יושבת בתוך <b class="fd">, ול-.fd יש font-family משלו שדורס ירושה. */
const tap = (sel) => { const e = document.querySelector(sel); if (!e) return false; e.click(); return true; };

const settingsFamilies = () => {
  const AR = /[\u0600-\u06FF]/, RU = /[\u0400-\u04FF]/;
  const out = [];
  for (const btn of document.querySelectorAll('[data-a="lang"]')) {
    let el = btn, txt = (btn.textContent || '').trim();
    if (!AR.test(txt) && !RU.test(txt)) continue;
    /* יורדים לצאצא העמוק ביותר שנושא את הגליף */
    for (let i = 0; i < 6; i++) {
      const kid = [...el.children].find(c => AR.test(c.textContent) || RU.test(c.textContent));
      if (!kid) break;
      el = kid;
    }
    out.push([AR.test(el.textContent) ? 'ar' : 'ru', getComputedStyle(el).fontFamily]);
  }
  return out;
};

(async () => {
  const browser = await chromium.launch();
  let checked = 0, findings = 0;

  const open = async (url, { gate }) => {
    const page = await (await browser.newContext({ locale: 'he-IL' })).newPage();
    /* חוסמים רשת חיצונית כמו שאר הבדיקות. הגופן לא ייטען כאן ממילא,
       והמדידה היא של שרשרת ה-CSS ולא של הרינדור. */
    await page.route('**/*', r =>
      r.request().url().startsWith(BASE) ? r.continue() : r.abort());
    await page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(900);
    if (!gate) {
      try { await page.click('#lg-ok', { timeout: 2500 }); await page.waitForTimeout(500); }
      catch (e) { /* דף בלי שער */ }
      await page.evaluate(dismissPopup);
      await page.waitForTimeout(200);
    }
    return page;
  };

  const judge = (label, pairs) => {
    if (!pairs.length) {
      console.log(`✗ ${label.padEnd(22)} לא נמצאו כפתורים עם תכונת lang`);
      findings++;
      return;
    }
    for (const [lg, got] of pairs) {
      const sc = SCRIPT[lg];
      if (!sc) continue;              /* he ו-en יושבים בגופן הכותרת, וזה תקין */
      checked++;
      if (sc.want.test(got)) {
        console.log(`✓ ${label.padEnd(22)} ${lg}: ${got.split(',')[0].trim()}`);
      } else {
        findings++;
        console.log(`✗ ${label.padEnd(22)} ${lg}: ה${sc.name} תיפול לגופן המערכת — font-family = ${got}`);
      }
    }
  };

  for (const p of PAGES) {
    const page = await open(p.url, { gate: false });
    judge(p.id, await page.evaluate(families, p.sel));
    await page.close();
  }

  for (const url of GATE) {
    const page = await open(url, { gate: true });
    const pairs = await page.evaluate(families, '.lg-lgs button');
    judge('שער ' + url, pairs);
    await page.close();
  }

  for (const app of SETTINGS) {
    const page = await open(app.url, { gate: false });
    /* לוחצים מתוך evaluate ולא ב-page.click: הדף מצויר מחדש בכל פעולה,
       וסרגל הניווט הדביק מכשיל את בדיקת ה-actionability של playwright. */
    for (const sel of (app.ob || [])) {
      await page.evaluate(tap, sel);
      await page.waitForTimeout(400);
    }
    const ok = await page.evaluate(tap, app.nav);
    await page.waitForTimeout(600);
    if (!ok) {
      console.log(`\u2717 ${('הגדרות ' + app.id).padEnd(22)} לא הגעתי למסך ההגדרות — ${app.nav}`);
      findings++;
    } else {
      judge('הגדרות ' + app.id, await page.evaluate(settingsFamilies));
    }
    await page.close();
  }

  await browser.close();
  console.log(`\n${checked} כפתורים נמדדו, ${findings} ממצאים`);
  process.exit(findings ? 1 : 0);
})();
