/* =====================================================================
   voice.js — האם מנוע ההקראה באמת מתאושש

   ארבעת המנגנונים שהועתקו מ"תאוריה מדברת" מכסים כשלים שאין דרך
   לראות בעין: הם קורים על מכשיר מסוים, אחרי חמש־עשרה שניות, או רק
   כשהאינטרנט נופל. בדיקה ידנית לא תמצא אותם לעולם.

   הדרך היחידה לבדוק אותם היא להחליף את speechSynthesis האמיתי במנוע
   מזויף שאפשר לומר לו להיכשל בדיוק כמו המכשיר הבעייתי — ואז לשאול
   את האפליקציה מה היא עשתה. ארבע בדיקות לכל אפליקציה:

     · בחירה   — מתוך ארבעה קולות באותה שפה, נבחר הטוב ולא הראשון,
                 והוא הקול הנשי הטבעי, בקצב 0.95 ובגובה 1.12 (״נשי רגוע״)
     · שומר-ער — pause+resume נורה כדי שההקראה לא תיחתך
     · שומר זמן — onend שלא נורה אינו מקפיא את התור
     · נפילה   — קול רשת שנכשל מוחלף בקול מקומי, ואותו טקסט נאמר שוב
   ===================================================================== */
'use strict';
const { chromium } = require('./pw.js');
const fs = require('fs'), path = require('path');

const BASE = 'http://127.0.0.1:8099';

/* גרסת התנאים נגזרת מ-`legal/terms.js` ואינה קבועה כאן. היא עולה
   מ-1.0 ל-1.1 ברגע שכתובת השרת של הבוט מולאה (`enable-tutor.js`),
   ומפתח האישור ב-localStorage נושא את המספר. קבוע קשיח כאן היה
   מחזיר את שער התנאים לכל אפליקציה מהרגע ההוא, והלחיצה על כפתור
   ההתחלה הייתה נחסמת — נמדד בחזרה יבשה של ההפעלה, 10.9.2026. */
const LEGAL_VER = (fs.readFileSync(
  path.resolve(__dirname, '..', '..', 'legal', 'terms.js'), 'utf8')
  .match(/version:\s*"([^"]+)"/) || [])[1];
if (!LEGAL_VER) { console.log('✗ לא נמצא version ב-legal/terms.js'); process.exit(1) }

/* האפליקציות ואיך מפעילים בהן הקראה. הבורר הוא כפתור הרמקול. */
const APPS = [
  { id:'english',   say:'הקראה' },
  { id:'history',   say:'הקראה' },
  { id:'lomda',     say:'הקראה' },
  { id:'ulpan',     say:'הקראה' },
  { id:'math-app',  say:'הקראה' },
  { id:'math-teen', say:'הקראה' },
  { id:'math-uni',  say:'הקראה' },
  { id:'math-uni2', say:'הקראה' },
  { id:'math-uni3', say:'הקראה' },
  /* כותבים ביחד — בשלב build ולכן היא נפתחת רק עם מפתח השער
     הפנימי. היא נכנסת לרשימה כאן ולא אחרי הפרסום, מפני שעותק
     מנוע שאיש אינו בודק הוא הבאג המרכזי של המאגר: היא ירשה את
     ארבעת המנגנונים בהעתקה, ובלי הבדיקה סחיפה בה תתגלה ימים
     אחרי. ההקראה שם היא של הטקסט שהלומד בנה — הרצף הארוך ביותר
     באפליקציה — וזה בדיוק המקרה שבו החיתוך אחרי 15 שניות מורגש. */
  { id:'kotvim', url:'/kotvim/?internal=shlav-internal-kotvim',
    /* אין כאן שאלה שמחכה על המסך: הטקסט **נבנה** בארבעה צעדים,
       וכפתור ההקראה קיים רק בצעד הרביעי. לכן הבדיקה מרכיבה טקסט
       אמיתי דרך הממשק — סוג, נושא, פתיחה, שתי טענות, דוגמה
       וסיכום — ורק אז מקריאה אותו. זה גם המסלול שהלומד עובר. */
    open:async page => {
      /* שער התנאים מכסה את המסך עד שמאשרים, ולכן הקליקים
         נחסמים בלעדיו. זה נכון גם ללומד. */
      const ok = page.locator('#lg-ok');
      await ok.waitFor({ timeout: 8000 }).catch(() => {});
      if(await ok.count()) await ok.click().catch(() => {});
      await page.waitForTimeout(400);
      await page.locator('[data-a="ktype"]').first().click();
      await page.locator('[data-a="ktopic"]').first().click();
      const pick = async (k,i)=>page.locator(`[data-a="kpick"][data-k="${k}"]`).nth(i).click();
      await pick('op',0); await pick('cl',0); await pick('cl',1);
      await pick('ex',0); await pick('cn',0);
      await page.locator('[data-a="kdone"]').first().click();
      await page.waitForTimeout(400);
    }, speak:'[data-a="ksay"]' },
  /* נתיב אינו מתחיל בשאלה אלא בטקסט שמדביקים, ולכן הוא צריך
     פתיחה משלו. הוא גם האפליקציה שקוראת הכי הרבה ברצף — כלומר
     זו שבה חיתוך אחרי חמש־עשרה שניות מורגש יותר מכל. */
  { id:'reader', open:async page => {
      await page.fill('#input', 'זהו טקסט בדיקה. הוא מחולק לכמה משפטים קצרים. ' +
                                'המשפט השלישי כאן. והרביעי סוגר את הקטע.');
      await page.click('#btnGo');
      /* הניקוד יוצא לרשת, והרשת חסומה כאן — נתיב מציע להמשיך
         בלעדיו, וזה בדיוק המסלול האופליין שהמשתמש רואה. */
      const noNik = page.locator('#btnNoNikud');
      await noNik.waitFor({ timeout: 15000 }).catch(() => {});
      if(await noNik.count()) await noNik.click().catch(() => {});
      await page.waitForTimeout(900);
    }, speak:'#btnPlay' },
  /* בגרות 806 מחזיקה את המנוע בקובץ נפרד (speech.js) וחושפת אותו
     כ-window.Speech. קוראים לו ישירות: המסלול דרך הממשק תלוי
     בטעינת מבחן, וזה לא מה שנבדק כאן. */
  { id:'bagrut-806', open:async () => {},
    call:'Speech.speak([{text:"משפט בדיקה ראשון. וגם משפט שני שסוגר את הקטע."}])' }
];

/* מנוע דיבור מזויף. mode קובע איך הוא נכשל:
     'ok'      — מתנהג יפה
     'silent'  — בולע את האמירה ולא יורה onend לעולם
     'neterr'  — קול רשת נכשל ב-synthesis-failed */
const FAKE = `(function(){
  const V = [
    { name:'espeak he',            lang:'he-IL', voiceURI:'espeak-he',  localService:true,  default:true },
    { name:'Carmit',               lang:'he-IL', voiceURI:'carmit',     localService:true,  default:false },
    { name:'Microsoft Hila Online (Natural) - Hebrew', lang:'he-IL', voiceURI:'hila-net', localService:false, default:false },
    { name:'Google עברית',         lang:'he-IL', voiceURI:'google-he',  localService:true,  default:false },
    /* אנגלית: ניב, נתיב והלומדה מקריאות את החומר הנלמד באנגלית,
       ובלי מועמדים באנגלית בדיקת הנפילה שלהן הייתה ריקה. */
    { name:'espeak en',            lang:'en-US', voiceURI:'espeak-en',  localService:true,  default:false },
    { name:'Samantha',             lang:'en-US', voiceURI:'samantha',   localService:true,  default:false },
    { name:'Microsoft Aria Online (Natural) - English (United States)', lang:'en-US', voiceURI:'aria-net', localService:false, default:false }
  ];
  const log = { spoke:[], pauseResume:0, voices:[], tune:[] };
  window.__tts = log;
  let mode = 'ok';
  window.__mode = m => { mode = m; };
  class U extends EventTarget {
    constructor(t){ super(); this.text = t; this.lang=''; this.rate=1; this.pitch=1; this.volume=1;
      this.voice=null; this.onend=null; this.onerror=null; this.onboundary=null; this.onstart=null; }
  }
  const synth = {
    speaking:false, pending:false, paused:false,
    getVoices(){ return V; },
    addEventListener(){}, removeEventListener(){},
    cancel(){ this.speaking = false; },
    pause(){ this.paused = true; },
    resume(){ this.paused = false; },
    speak(u){
      log.spoke.push(u.text);
      log.voices.push(u.voice ? u.voice.voiceURI : '(ברירת מחדל)');
      /* קצב וגובה — מה שבאמת נשלח למנוע, ולא מה שכתוב בהגדרות.
         volume נרשם כדי לדלג על אמירת חימום שקטה (בגרות 806). */
      log.tune.push({ rate:u.rate, pitch:u.pitch, volume:u.volume });
      this.speaking = true;
      if(mode === 'silent'){ return; }          /* לא יורה כלום, לנצח */
      if(mode === 'neterr' && u.voice && u.voice.localService === false){
        setTimeout(() => { this.speaking = false;
          const e = { error:'synthesis-failed' };
          if(u.onerror) u.onerror(e);
        }, 30);
        return;
      }
      setTimeout(() => { this.speaking = false; if(u.onend) u.onend({}); }, 30);
    }
  };
  const rp = synth.pause.bind(synth), rr = synth.resume.bind(synth);
  synth.pause = function(){ log.pauseResume++; rp(); };
  synth.resume = function(){ rr(); };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable:true });
  window.SpeechSynthesisUtterance = U;
  /* onboundary חייב להיות בפרוטוטיפ — יש אפליקציות שבודקות אותו */
  U.prototype.onboundary = null;
})();`;

/* המכשיר מזדהה כ-Chrome בשולחן העבודה, אחרת שומר-ער לא ייכנס בכלל */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function openApp(browser, app){
  const ctx  = await browser.newContext({ userAgent: UA });
  const page = await ctx.newPage();
  await page.addInitScript(FAKE);
  /* שער התנאים חוסם כל לחיצה עד שמאשרים אותו. מסמנים אותו כמאושר
     מראש — הוא אינו מה שנבדק כאן. */
  await page.addInitScript((ver) => {
    try{ localStorage.setItem('legal-accepted-v' + ver,
      JSON.stringify({ v:ver, at:new Date().toISOString(), lang:'he' })); }catch(e){}
  }, LEGAL_VER);
  await page.route('**', r => {
    const u = r.request().url();
    return u.startsWith(BASE) ? r.continue() : r.abort();
  });
  /* אפליקציה בשלב build נפתחת רק עם מפתח השער הפנימי, ולכן
     היא מביאה `url` משלה. שאר האפליקציות ממשיכות בנתיב הרגיל. */
  await page.goto(app.url ? `${BASE}${app.url}` : `${BASE}/${app.id}/`,
                  { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(700);
  if(app.open){ await app.open(page); }
  else {
    /* עוברים למסך תרגול: לוחצים על מה שנראה ככפתור התחלה */
    for(const t of ['התחלה','להתחיל','תרגול','המשך','קדימה']){
      const b = page.locator(`button:has-text("${t}")`).first();
      if(await b.count() && await b.isVisible()){ await b.click().catch(()=>{}); break; }
    }
  }
  await page.waitForTimeout(600);
  return { ctx, page };
}

/* לוחץ על כפתור ההקראה. מחזיר false אם לא נמצא. */
async function pressSpeak(page, app){
  /* אפליקציה שמצהירה על קריאה ישירה — קוראים לה ולא מחפשים כפתור.
     בגרות 806 מחזיקה כפתור הקראה בממשק שאינו עושה דבר בלי מבחן
     טעון, והחיפוש הכללי מצא אותו וחשב שהוא לחץ על ההקראה. */
  if(app && app.call){
    return page.evaluate(src => { try{ (0, eval)(src); return true; }catch(e){ return false; } }, app.call);
  }
  const cands = [
    ...(app && app.speak ? [app.speak] : []),
    'button[aria-label*="הקרא"]', 'button[title*="הקרא"]',
    'button[data-a="say"]', 'button[data-a="speak"]', '#btnSay', '#say'
  ];
  for(const sel of cands){
    const b = page.locator(sel).first();
    if(await b.count() && await b.isVisible()){ await b.click().catch(()=>{}); return true; }
  }
  /* נפילה לאחור: קוראים ל-speak של האפליקציה ישירות */
  return page.evaluate(() => {
    if(typeof speak === 'function'){ speak('משפט בדיקה ארוך מספיק כדי להיחתך באמצע, ועוד קצת.'); return true; }
    return false;
  }).catch(() => false);
}

async function run(){
  const browser = await chromium.launch();
  let bad = 0;
  for(const app of APPS){
    const { ctx, page } = await openApp(browser, app);
    const fails = [];
    try{
      /* --- 1 · בחירת הקול --- */
      await page.evaluate(() => { window.__mode('ok'); window.__tts.spoke = []; window.__tts.voices = []; window.__tts.tune = []; });
      if(!await pressSpeak(page, app)) throw new Error('לא נמצא כפתור הקראה');
      await page.waitForTimeout(400);
      const picked = await page.evaluate(() => window.__tts.voices[0] || '');
      /* espeak הוא הראשון ברשימה וגם default — מי שלוקח את הראשון ייפול כאן */
      if(picked === 'espeak-he' || picked === 'espeak-en') fails.push('בחירה: נבחר espeak — הדירוג לא עובד');
      else if(!picked) fails.push('בחירה: לא נאמר דבר');
      /* הקול הנשי הטבעי — Hila בעברית, Aria באנגלית — הוא מה שהבעלים
         שמע ב-math-app ב-13.9.2026 ואמר עליו ״נעים ומדויק״: קול נשי
         ברירת מחדל, בקצב 0.95 ובגובה 1.12 (הפריסט ״נשי רגוע״).
         שלושת המספרים חייבים להגיע לאותו מנוע מכל אפליקציה — לפני
         התיקון תשע מהן שלחו 0.78 בגובה 1, בגרות 0.82 ונתיב 0.90. */
      else if(picked !== 'hila-net' && picked !== 'aria-net')
        fails.push('בחירה: נבחר ' + picked + ' ולא הקול הנשי הטבעי');
      const tune = await page.evaluate(() => (window.__tts.tune || []).filter(t => t.volume > 0)[0] || null);
      if(!tune) fails.push('קצב וגובה: לא נשלחה אמירה עם קול');
      else if(Math.abs(tune.rate - 0.95) > 0.005 || Math.abs(tune.pitch - 1.12) > 0.005)
        fails.push('קצב וגובה: ' + tune.rate + ' / ' + tune.pitch + ' במקום 0.95 / 1.12 של ״נשי רגוע״');

      /* --- 2 · שומר-ער ---
         'silent' הוא בדיוק הקראה ארוכה מבחינת השומר: המנוע נשאר
         speaking ולא יורה onend. אמירה שמסתיימת אחרי 30ms מכבה את
         השומר לפני שהוא הספיק לפעום, ולכן אי אפשר למדוד עליה. */
      await page.evaluate(() => { window.__mode('silent'); window.__tts.pauseResume = 0; });
      await pressSpeak(page, app);
      await page.waitForTimeout(9800);
      const pr = await page.evaluate(() => window.__tts.pauseResume);
      if(pr < 1) fails.push('שומר-ער: pause+resume לא נורה — ההקראה תיחתך אחרי 15 שניות');

      /* --- 3 · שומר זמן --- */
      await page.evaluate(() => { window.__mode('silent'); window.__tts.spoke = []; });
      await pressSpeak(page, app);
      await page.waitForTimeout(6500);
      const n = await page.evaluate(() => window.__tts.spoke.length);
      /* טקסט קצר יוצא במקטע אחד; מה שנבדק הוא שהתור לא קפא לנצח —
         כלומר שהשומר שחרר אותו ואפשר להקריא שוב. */
      await page.evaluate(() => { window.__mode('ok'); window.__tts.spoke = []; });
      await pressSpeak(page, app);
      await page.waitForTimeout(500);
      if(await page.evaluate(() => window.__tts.spoke.length) === 0)
        fails.push('שומר זמן: אחרי onend שלא נורה, ההקראה הבאה לא יצאה');

      /* --- 4 · נפילה מקול רשת --- */
      await page.evaluate(() => {
        window.__mode('neterr'); window.__tts.spoke = []; window.__tts.voices = [];
      });
      await pressSpeak(page, app);
      await page.waitForTimeout(1200);
      const vs = await page.evaluate(() => window.__tts.voices);
      const NET = ['hila-net','aria-net'];
      const netUsed = vs.findIndex(x => NET.indexOf(x) >= 0);
      /* אם קול הרשת לא נבחר מלכתחילה, הבדיקה הזאת לא בדקה כלום —
         והיא צריכה לומר את זה ולא לעבור בשקט. */
      if(netUsed < 0) fails.push('נפילה: קול הרשת לא נבחר כלל — הבדיקה ריקה (' + vs.join(',') + ')');
      else {
        const dead = vs[netUsed];
        const after = vs.slice(netUsed + 1).filter(x => x !== dead);
        if(!after.length) fails.push('נפילה: קול הרשת נכשל וההקראה נשברה — לא הייתה חזרה בקול מקומי');
        else if(NET.indexOf(after[0]) >= 0) fails.push('נפילה: אחרי הכישלון נבחר שוב קול רשת');
      }
    }catch(e){
      fails.push('חריגה: ' + e.message);
    }
    await ctx.close();
    if(fails.length){ bad++; console.log('✗ ' + app.id.padEnd(11) + fails.join(' · ')); }
    else console.log('✓ ' + app.id.padEnd(11) + 'בחירה, שומר-ער, שומר זמן ונפילה — כולם עובדים');
  }
  await browser.close();

/* ---------------------------------------------------------------
     מילון המגדר — בכתב שבו המכשיר באמת מציג את הקול

     **נמדד אצל הבעלים, 13.9.2026, בצילום מסך.** Edge בממשק עברי
     מציג ״Microsoft הילה Online (Natural)״ — השם מתורגם לשפת
     הממשק. המילון היה לטיני בלבד, ולכן `hila` לא נמצא, הילה
     נספרה כ״לא ידוע״, האפליקציה הודיעה ״אין במכשיר קול נשי״
     והרימה את הגובה ל-1.45 — על קול נשי אמיתי שהיה בחור.

     כל עותקי המילון שבמאגר, וכולם נבדקים: קול נשי חייב לצאת
     נשי, גברי גברי, ו-״Google עברית״ חייב להישאר **לא ידוע** —
     הוא שם יצרן ולא מגדר, וזה הכלל שכתוב ליד המילון עצמו.
     --------------------------------------------------------------- */
  /* הרשימה נגזרת ואינה קשיחה. רשימה קשיחה של שמונה קבצים החזיקה
     כאן עד 16.9.2026, והיא החמיצה חמישה עותקים שלמים: english,
     history, ulpan, lomda ו-kotvim קוראים למילון V_F/V_M ולא
     VOICE_F/VOICE_M, ולכן הם לא היו ברשימה — ולא נבדקו מעולם.
     התיקון של 13.9 פסח עליהם בדיוק מאותה סיבה, והבדיקה שנכתבה
     לתפוס אותו דיווחה ירוק. זה אותו לקח של changedSinceMain
     ב-cache.js: מה שנספר ידנית מתיישן בעותק הבא. */
  const ROOT = path.resolve(__dirname, '..', '..');
  const DICT = require('child_process')
    .execSync('git ls-files "*.html" "*.js"', { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(f => f && !f.startsWith('.claude/') && !f.startsWith('marketing/') &&
                 !f.startsWith('tests/') && !f.startsWith('learning-core/'))
    .filter(f => /(?:^|[^A-Za-z_])(?:VOICE_F|V_F)\s*=\s*\/\(/
                   .test(fs.readFileSync(path.join(ROOT, f), 'utf8')))
    .sort();
  const CASES = [
    ['Microsoft הילה Online (Natural) - Hebrew (Israel)', 'female'],
    ['Microsoft אברי Online (Natural) - Hebrew (Israel)', 'male'],
    ['Microsoft Hila Online (Natural) - Hebrew (Israel)', 'female'],
    ['Microsoft Asaf - Hebrew (Israel)',                  'male'],
    ['Microsoft زارية Online (Natural)',                  'female'],
    ['Microsoft Светлана Online (Natural)',               'female'],
    ['Google עברית',                                      'unknown']
  ];
  for(const f of DICT){
    const src = fs.readFileSync(path.resolve(__dirname, '..', '..', f), 'utf8');
    /* שני שמות לאותו מילון, ושניהם חוקיים: VOICE_F במשפחה אחת,
       V_F בשנייה. ההבדל הוא היסטורי ולא מהותי. */
    const mf = src.match(/var (?:VOICE_F|V_F)\s*=\s*(\/\(.*?\/)\s*[;\n]/s);
    const mm = src.match(/var (?:VOICE_M|V_M)\s*=\s*(\/\(.*?\/)\s*[;\n]/s);
    if(!mf || !mm){ bad++; console.log('✗ ' + f.padEnd(24) + 'לא נמצא מילון המגדר'); continue }
    let RF, RM;
    try{ RF = eval(mf[1]); RM = eval(mm[1]) }
    catch(e){ bad++; console.log('✗ ' + f.padEnd(24) + 'מילון שאינו נקרא: ' + e.message); continue }
    const miss = [];
    for(const [name, want] of CASES){
      const n2 = (name + ' x').toLowerCase();
      const got = RF.test(n2) ? 'female' : RM.test(n2) ? 'male' : 'unknown';
      if(got !== want) miss.push(name.slice(0, 34) + ' → ' + got + ' (צריך ' + want + ')');
    }
    if(miss.length){ bad++; console.log('✗ ' + f.padEnd(24) + miss.join(' · ')) }
    else console.log('✓ ' + f.padEnd(24) + CASES.length + ' שמות, בעברית ובלטינית');
  }
/* ---------------------------------------------------------------
     תקרת גובה הקול — מספר אחד לכל העותקים

     **למה זו בדיקה ולא הערה.** ההרמה חיה בשלוש־עשרה העתקות של
     אותו קוד, ועד 17.9.2026 הן הסכימו על 1.45 רק מפני שהן הועתקו
     באותו יום. ברגע שמישהו יגע באחת — והבעלים ביקש בדיוק את זה,
     ״קול נשי עדין כמו בתאוריה מדברת, תעתיק משם״ — עשר האחרות
     יישארו מאחור בלי שגיאה ובלי שאיש ישמע, מפני שלכל אפליקציה
     מכשיר אחר ולומד אחר.

     הבדיקה אינה נועלת מספר: היא דורשת שכל העותקים יאמרו **אותו**
     מספר. מי שמשנה את התקרה משנה אותה בכולם, וזה כל העניין.
     --------------------------------------------------------------- */
  const CEIL = require('child_process')
    .execSync('git ls-files "*.html" "*.js"', { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean)
    .filter(f => !f.startsWith('.claude/') && !f.startsWith('tests/'))
    .map(f => {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
      const hits = [];
      let m;
      const reMin = /Math\.min\(\s*([0-9.]+)\s*,[^;\n]*femLift\s*\(/g;
      while((m = reMin.exec(src))) hits.push(m[1]);
      const reClamp = /clamp\(\s*PITCH_BASE[^;\n]*,\s*0\.5\s*,\s*([0-9.]+)\s*\)/g;
      while((m = reClamp.exec(src))) hits.push(m[1]);
      return hits.length ? [f, hits] : null;
    })
    .filter(Boolean);
  const VALS = new Set(CEIL.flatMap(([, h]) => h));
  if(!CEIL.length){ bad++; console.log('✗ תקרת הגובה — לא נמצאה באף קובץ; הביטוי השתנה') }
  else if(VALS.size !== 1){
    bad++;
    console.log('✗ תקרת הגובה — ' + VALS.size + ' ערכים שונים: ' + [...VALS].join(', '));
    for(const [f, h] of CEIL) console.log('    ' + f.padEnd(26) + h.join(' '));
  } else {
    console.log('✓ ' + 'תקרת גובה הקול'.padEnd(24) +
                CEIL.length + ' קבצים, כולם ' + [...VALS][0]);
  }

/* ---------------------------------------------------------------
     סדר ההודעה: מה שעובד קודם

     בווינדוס בעברית ״הוספת קולות״ הוא מבוי סתום — למיקרוסופט אין
     קול עברי נשי להתקנה, וזה כתוב בהערה שמעל `isWinNotEdge` בכל
     אחד־עשר הקבצים. Edge נושא את הילה הנוירלית בלי התקנה. עד
     17.9.2026 הקישור ל-Edge ישב **אחרי** המשפט שנגמר במבוי הסתום,
     והבעלים צילם בדיוק את זה ושאל למה אין קול נשי.

     הבדיקה נגזרת ואינה רשימה: מאתרת את המשתנה שמקבל את `femNote(`
     בכל קובץ, ודורשת שהוא ייעטף ב-`femNoteHTML` ולא ייבנה כ-
     `esc(<var>)+edgeNote()`. אתר ״אין קולות בכלל״ אינו נוגע בזה —
     שם אין הוראת מערכת שקודמת לקישור. */
  const ORDER = require('child_process')
    .execSync('git ls-files "*.html"', { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean)
    .filter(f => !f.startsWith('.claude/'))
    .map(f => {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
      if(!/function femNote\s*\(/.test(src) || !/function edgeNote\s*\(/.test(src)) return null;
      const m = src.match(/(?:var\s+)?([A-Za-z_$][\w$]*)\s*=\s*femNote\(/);
      if(!m) return [f, 'לא נמצא המשתנה שמקבל את femNote('];
      const v = m[1].replace(/[$]/g, '\\$&');
      if(new RegExp('esc\\(\\s*' + v + '\\s*\\)\\s*\\+\\s*edgeNote\\(\\)').test(src))
        return [f, 'הקישור ל-Edge אחרי הודעת הקול — esc(' + m[1] + ')+edgeNote()'];
      if(!new RegExp('femNoteHTML\\(\\s*' + v + '\\s*\\)').test(src))
        return [f, 'הודעת הקול אינה עוברת ב-femNoteHTML'];
      return null;
    })
    .filter(Boolean);
  if(ORDER.length){
    bad++;
    for(const [f, why] of ORDER) console.log('✗ ' + f.padEnd(24) + why);
  } else {
    console.log('✓ ' + 'סדר הודעת הקול'.padEnd(24) + 'הקישור ל-Edge ראשון בכל הקבצים');
  }

  if(bad){ console.log('\n' + bad + ' אפליקציות נכשלו'); process.exit(1); }
  console.log('\n' + APPS.length + ' אפליקציות, מנוע ההקראה מתאושש בכולן');
}
run().catch(e => { console.error(e); process.exit(1); });
