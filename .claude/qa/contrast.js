/* =====================================================================
   contrast.js — האם הטקסט בכלל נראה

     node .claude/qa/contrast.js [app...]

   **למה זה נדרש, ובמילים מדודות.** 15.9.2026 נמצאו שלושה מקומות
   שבהם הלומד רואה לבן על לבן:

     math-teen  .seg button.on   כהה   1.18:1   מסך ההגדרות
     math-app   .brc             בהיר  1.18:1   תרגיל הנשימה
     ארבע אפליקציות  .btn-p      כהה   1.76–2.98:1  כפתור הפעולה

   `.seg button.on` הוא מסך בחירת גודל האותיות והניגודיות — כלומר
   בדיוק המקום שלומד עם דיסלקציה הולך אליו ראשון, והוא לא יכול
   לקרוא בו. `.brc` הוא מסך ההפוגה של ילד שנתקע, והמילה ״שאיפה״
   לא נראתה.

   **ואף אחת מ-35 הבדיקות לא מדדה ניגודיות.** `a11y.js` בודקת
   שששת המצבים מחווטים, `aria.js` בודקת מיקוד, `tabindex` ומאפיין
   פיזי — ואיש לא בדק אם הטקסט נראה. שלושת הממצאים נמצאו בעין.

   **מה נמדד כאן:** יחס הניגודיות לפי WCAG 2.2 — sRGB ← לומיננס
   יחסי ← (L1+0.05)/(L2+0.05). הסף 4.5:1 לטקסט רגיל ו-3:1 לטקסט
   גדול (≥24px, או ≥18.66px מודגש), בשני מצבי הצבע.

   **הרקע נלקח מהשרשרת ולא מהאלמנט.** רקע שקוף אינו ״שחור״ — עולים
   בהורים עד לרקע אטום ראשון. **וגרדיאנט הוא לא רקע ריק:**
   `background-color` של אלמנט עם `linear-gradient` הוא
   `transparent`, ולכן בדיקה תמימה הייתה משווה את הטקסט לרקע
   הדף ומפספסת בדיוק את `.btn-p` — הבאג השלישי. כאן נשלפות נקודות
   הצבע מהגרדיאנט ונמדדת **הגרועה שבהן**.

   **מה הבדיקה מצהירה על עצמה, ואינה מסתירה:** רוב המסכים חבויים
   מאחורי ניווט, ולכן `[hidden]` מוסר לפני הסריקה כדי שכל המסכים
   יהיו על הדף יחד. זה משנה פריסה ואינו משנה צבע — הצבעים באים
   מכללי CSS. אלמנט שגם אחרי זה אינו מרונדר **נספר ומדווח**, ולא
   נחשב ״עבר״. מספר הכיסוי מודפס בכל ריצה.
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');
const BASE = process.env.QA_BASE || 'http://127.0.0.1:8099';
const APPS = process.argv.slice(2).length ? process.argv.slice(2) :
  ['math-app', 'math-teen', 'math-uni', 'math-uni2', 'math-uni3', 'bagrut-806',
   'ulpan', 'english', 'history', 'lomda', 'reader', 'kotvim', 'legal', '.'];

const SCAN = () => {
  /* --- WCAG 2.2 --- */
  const lum = ([r, g, b]) => {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const parse = s => {
    const m = String(s || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (p.length < 3 || p.some(isNaN)) return null;
    return { c: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  /* מיזוג צבע חצי־שקוף אל מה שמתחתיו */
  const over = (fg, bg) => fg.c.map((v, i) => v * fg.a + bg[i] * (1 - fg.a));

  /* כל נקודות הצבע שבגרדיאנט — הגרועה שבהן היא הקובעת */
  const gradStops = bi => {
    const out = [];
    const re = /rgba?\([^)]+\)/g; let m;
    while ((m = re.exec(bi || ''))) { const p = parse(m[0]); if (p) out.push(p) }
    return out;
  };

  /* --- הרקע האפקטיבי ------------------------------------------
     **רקע חצי־שקוף ממוזג אל מה שבאמת מתחתיו, ולא אל לבן.**
     הגרסה הראשונה כאן מיזגה כל שכבה אל לבן, וזה הפיל את `reader`
     ב-2.3:1 בשני המצבים — מספר שנראה אמיתי ולא היה. שם הרקע הוא
     `rgba(90,169,230,.12)`, ומיזוג שלו אל לבן נותן בדיוק
     `rgb(235,245,252)`: כלומר הבדיקה המציאה רקע בהיר מתחת לכפתור
     שיושב על דף כהה. `html.light` שם מגדיר `--accent:#1662a4`
     שעובר בקלות, ולא היה שום באג.

     הנכון: אוספים את השכבות מהאלמנט כלפי מעלה עד השכבה האטומה
     הראשונה, ואז ממזגים **מלמטה למעלה**. לבן הוא הבסיס רק אם לא
     נמצאה שכבה אטומה כלל — כלומר הקנבס של הדפדפן. */
  function bgOf(el) {
    const stack = [];            /* מהאלמנט כלפי מעלה */
    let base = [255, 255, 255];  /* הקנבס, אם לא נמצא רקע אטום */
    let node = el;
    outer:
    while (node && node.nodeType === 1) {
      const cs = getComputedStyle(node);
      const stops = gradStops(cs.backgroundImage);
      const solid = parse(cs.backgroundColor);
      const layers = [];
      if (solid && solid.a > 0) layers.push(solid);
      /* גרדיאנט נצבע מעל צבע הרקע, ולכן הוא נכנס אחריו */
      for (const st of stops) if (st.a > 0) layers.push(st);
      for (const L of layers) {
        if (L.a === 1) { base = L.c; stack.length = 0; /* אטום — הכול מתחת נמחק */ }
        else stack.unshift(L);
      }
      if (layers.some(L => L.a === 1)) {
        /* השכבות שמעל האטומה באותו אלמנט עדיין נספרות */
        const after = layers.slice(layers.findIndex(L => L.a === 1) + 1);
        for (const L of after) stack.push(L);
        break outer;
      }
      node = node.parentElement;
    }
    /* גרדיאנט נותן כמה מועמדים — מחזירים את כולם, והגרוע קובע */
    const grads = stack.filter(L => L.a === 1);
    const fold = pick => {
      let cur = base.slice();
      for (const L of stack) cur = over(L, cur);
      return cur;
    };
    const out = [fold()];
    /* אם יש גרדיאנט אטום בערימה, כל נקודה שלו היא מועמד בפני עצמו */
    for (const g of grads) out.push(g.c);
    return out.length ? out : [[255, 255, 255]];
  }

  document.querySelectorAll('[hidden]').forEach(e => e.removeAttribute('hidden'));

  /* **קישור הדילוג נמדד ממוקד, וזו לא פינה — זו כל הנקודה.**
     `.skip` יושב ב-`inset-inline-start:-9999px` ונצבע רק ב-`:focus`.
     הריצה הראשונה כאן דיווחה עליו 1.88:1 בשבעה דפים, והמספר היה
     נכון ו**חסר משמעות**: הוא נמדד במצב שבו הוא מחוץ למסך, כלומר
     על צבע ברירת המחדל של הדפדפן לקישור. הלומד לעולם אינו רואה
     את המצב הזה.

     שער שמפיל דווקא את מנגנון הנגישות שהוא נבנה להגן עליו מאמן
     את מי שקורא אותו להתעלם ממנו. לכן: ממקדים אותו, ומודדים את
     מה שרואים. */
  document.querySelectorAll('a.skip, .skip').forEach(e => { try { e.focus() } catch (x) {} });

  const out = [], seenSel = {};
  let scanned = 0, unrendered = 0;
  const sel = el => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string')
      s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    return s;
  };

  for (const el of document.querySelectorAll('body *')) {
    const txt = [...el.childNodes].filter(n => n.nodeType === 3)
      .map(n => n.textContent).join('').trim();
    if (!txt) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) { unrendered++; continue }
    /* **מחוץ למסך אינו ״לא נראה מספיק״ — הוא לא נראה.** זהו דפוס
       ה-visually-hidden: `-9999px`, `-100px`, או ריבוע של פיקסל.
       מדידת ניגודיות עליו היא מדידה של משהו שאיש אינו רואה. */
    if (r.right < 0 || r.bottom < 0 || r.width * r.height <= 1) { unrendered++; continue }
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') { unrendered++; continue }
    /* **`aria-hidden` הוא הפטור, ולא ״נראה לי שזה קישוט״.** WCAG
       אינו דורש ניגודיות מטקסט שאינו נחשף. הריצה השנייה כאן
       דיווחה `span.fl` ב-1.06:1 ב-math-app — עשרה סימני חשבון
       שצפים ברקע ב-`opacity:.06`, בתוך `div#bg` שכבר נושא
       `aria-hidden="true"`. זה קישוט, והמספר נכון וחסר משמעות.

       **והפטור נקבע לפי הסימון ולא לפי השקיפות**, וזה מכוון:
       אלמנט קישוטי שאינו מסומן ימשיך להפיל כאן — וזה נכון, כי
       אז קורא המסך מכריז עליו. פטור שנשען על `opacity` נמוך היה
       מכשיר גם טקסט אמיתי שדהה בטעות. */
    if (el.closest('[aria-hidden="true"]')) { unrendered++; continue }
    const fg = parse(cs.color);
    if (!fg) continue;
    scanned++;
    const size = parseFloat(cs.fontSize) || 16;
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    let worst = Infinity, worstBg = null;
    for (const bg of bgOf(el)) {
      const v = ratio(over(fg, bg), bg);
      if (v < worst) { worst = v; worstBg = bg }
    }
    if (worst + 0.01 < need) {
      const k = sel(el) + '|' + cs.color;
      if (seenSel[k]) continue;
      seenSel[k] = 1;
      out.push({ sel: sel(el), ratio: +worst.toFixed(2), need,
                 fg: cs.color, bg: 'rgb(' + worstBg.map(Math.round).join(',') + ')',
                 size: Math.round(size), txt: txt.slice(0, 28) });
    }
  }
  return { out, scanned, unrendered };
};

(async () => {
  const browser = await chromium.launch();
  let bad = 0, scanned = 0, unrendered = 0;
  for (const app of APPS) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ colorScheme: scheme });
      const page = await ctx.newPage();
      await page.route('**', r => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
      try {
        await page.goto(`${BASE}/${app === '.' ? '' : app + '/'}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      } catch (e) { console.log(`✗ ${app} [${scheme}] — לא נטען: ${e.message.split('\n')[0]}`); bad++; await ctx.close(); continue }
      await page.waitForTimeout(700);
      const r = await page.evaluate(SCAN);
      scanned += r.scanned; unrendered += r.unrendered;
      for (const f of r.out) {
        bad++;
        console.log(`✗ ${app} [${scheme}] ${f.sel} — ${f.ratio}:1, נדרש ${f.need}:1`);
        console.log(`    ${f.fg} על ${f.bg} · ${f.size}px · ‹${f.txt}›`);
      }
      await ctx.close();
    }
  }
  console.log(`\n${bad ? '✗' : '✓'} ${APPS.length} דפים × 2 מצבי צבע · ${scanned} אלמנטים עם טקסט נמדדו` +
              ` · ${unrendered} לא רונדרו ולכן לא נמדדו · ${bad} מתחת לסף`);
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
