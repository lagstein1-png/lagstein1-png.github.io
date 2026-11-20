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
     דף הבית ru = Heebo · reader ar+ru = Assistant
     שער התנאים (legal/protect.js) ar+ru = Heebo, בכל שתים־עשרה
   אחרי: כולם "Noto Sans Arabic" / "Noto Sans".

   הבדיקה מודדת בדפדפן ולא בקריאת CSS: היא שואלת מה הכפתור **קיבל**
   בפועל, ולכן היא אינה תלויה בצורת הכתיבה של הכלל ואינה נשברת
   כשמישהו כותב אותו אחרת. דורשת את השרת המקומי.

   node .claude/qa/langbtn.js
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');

const { BASE } = require('./port.js');   /* QA_PORT, ברירת מחדל 8099 — O-197 */

/* שני הכתבים שאף אחד מגופני הכותרת של הריפו אינו מכיל, והמשפחה
   שחייבת להופיע ראשונה בשרשרת של כפתור בכתב הזה. */
const SCRIPT = {
  ar: { name: 'ערבית',  want: /Noto Sans Arabic/i },
  ru: { name: 'רוסית',  want: /Noto Sans(?!\s*Arabic)/i },
};

/* הדפים שיש בהם סרגל שפות גלוי במסך הראשון, בלי ניווט. */
const PAGES = [
  { id: 'דף הבית', url: '/',         sel: '.lang button' },
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

/* O-135, 21.10.2026: **נגזרת.** עד היום תשע אפליקציות בשם, ושתים־עשרה
   נוספות עם אותם כפתורי `data-a="lang"` (electric, science, civics,
   chemistry, physics, english-mid/upper…) לא נמדדו. הניווט אינו אחיד,
   ולכן כל אפליקציה מנסה את שתי הצורות המוכרות — קודם בלי אונבורדינג,
   ואם לא הגיעה, אחרי `OB_ANY`. אפליקציה נגזרת שלא הגעתי בה להגדרות, או
   שאין בה כפתור בערבית או ברוסית, מודפסת ב-״·״ עם הסיבה ואינה נספרת.
   התשע הוותיקות (`MUST`) חייבות להגיע — אחרת זה ✗, כמו קודם. */
const AL = require('./applist.js');
const NAV = ['[data-a="set"]', '[data-a="go"][data-v="settings"]'];
const OB_ANY = ['[data-a="selpet"]', '[data-a="startpet"]'].concat(OB);
const MUST = ['english', 'history', 'lomda', 'ulpan', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3', 'math-app'];
const NAMED = AL.pick(process.argv.slice(2), []);
const SETTINGS = (NAMED.length ? NAMED : AL.family('langbtn.js', /data-a=\\?["']lang\b/,
  { floor: 9, must: MUST, why: 'אין בהן כפתורי data-a="lang"' }))
  .map(id => ({ id, url: '/' + id + '/' }));

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
  let checked = 0, findings = 0, skipped = 0;

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

  /* **כשל ידוע, מודפס ב-`~` ואינו מפיל** — O-135, 21.10.2026. כשהבדיקה
     הורחבה מתשע אפליקציות לכל מי שיש לו `data-a="lang"`, נמדד ב-domino:
     כפתורי הערבית והרוסית במסך ההגדרות יורשים `Heebo, system-ui…` בלי
     Noto Sans Arabic / Noto Sans. ואותו דבר במסך הראשון של שש מאפליקציות
     UNITS: יש להן `html[lang="ar"] button{…var(--ar)}`, ולכן בממשק ערבי
     הכול תקין — אבל בממשק העברי הכפתור ״العربية״ עצמו יורש Heebo. ל-
     science-mid יש את הכלל החסר (`button[data-a="lang"][lang="ar"]`), והיא
     ירוקה. התיקון ב-CSS של האפליקציה. כשל ידוע שנעלם — נופל. */
  const KNOWN = { 'הגדרות domino': ['ar', 'ru'],
    'מסך ראשון math-g7': ['ar', 'ru'], 'מסך ראשון math-elem': ['ar', 'ru'],
    'מסך ראשון chemistry': ['ar', 'ru'], 'מסך ראשון physics': ['ar', 'ru'],
    'מסך ראשון english-upper': ['ar', 'ru'], 'מסך ראשון english-mid': ['ar', 'ru'] };
  const knownSeen = {};
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
      } else if ((KNOWN[label] || []).includes(lg)) {
        knownSeen[label + ' ' + lg] = 1;
        console.log(`~ ${label.padEnd(22)} ${lg}: ידוע — font-family = ${got}`);
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
    const nav = async () => {
      for (const sel of NAV) if (await page.evaluate(tap, sel)) { await page.waitForTimeout(600); return sel }
      return null;
    };
    let via = await nav();
    if (!via) {
      for (const sel of OB_ANY) { await page.evaluate(tap, sel); await page.waitForTimeout(400) }
      via = await nav();
    }
    const label = 'הגדרות ' + app.id;
    const must = MUST.includes(app.id) || NAMED.length;
    /* משפחת UNITS (chemistry, physics, math-g7…) מציגה את כפתורי השפה
       במסך הראשון ואין לה מסך הגדרות — שם נמדד מה שיש על המסך. */
    const here = via ? [] : await page.evaluate(settingsFamilies);
    if (!via && here.length && !MUST.includes(app.id)) judge('מסך ראשון ' + app.id, here);
    else if (!via) {
      if (must) { console.log(`\u2717 ${label.padEnd(22)} לא הגעתי למסך ההגדרות — ${NAV.join(' / ')}`); findings++ }
      else { skipped++; console.log(`· ${label.padEnd(22)} מדולגת — אין כפתור הגדרות באחת משתי הצורות המוכרות`) }
    } else {
      const pairs = await page.evaluate(settingsFamilies);
      if (!pairs.length && !must) { skipped++; console.log(`· ${label.padEnd(22)} מדולגת — אין במסך ההגדרות כפתור שפה בערבית או ברוסית`) }
      else judge(label, pairs);
    }
    await page.close();
  }

  for (const [label, lgs] of Object.entries(KNOWN)) for (const lg of lgs) {
    const id = label.replace(/^(הגדרות|מסך ראשון) /, '');
    if (!SETTINGS.some(a => a.id === id) || knownSeen[label + ' ' + lg]) continue;
    findings++;
    console.log(`✗ ${label.padEnd(22)} ${lg}: הכשל הידוע נעלם — מחקו את השורה מ-KNOWN ב-langbtn.js`);
  }

  await browser.close();
  console.log(`\n${checked} כפתורים נמדדו ב-${SETTINGS.length - skipped} מסכי הגדרות (${skipped} מדולגים), ${findings} ממצאים`);
  process.exit(findings ? 1 : 0);
})();
