/* ============================================================
   content.js — סריקת תוכן אוטומטית
   ------------------------------------------------------------
   הכלים האחרים שואלים אם הקוד רץ. זה שואל אם **השאלה עצמה
   תקינה** — לפני שבן אדם יושב לקרוא מאות שאלות ביד.

     node .claude/qa/serve.js &
     node .claude/qa/content.js                  # כל בעלי buildQ
     node .claude/qa/content.js math-uni         # אחת
     QA_N=400 node .claude/qa/content.js english # מדגם גדול יותר

   הוא מגריל שאלות מכל נושא ומכל רמה — השאלות כאן נוצרות בזמן
   ריצה ואינן יושבות בקובץ, ולכן אין "מאגר" לפתוח ולקרוא —
   ומודד תשע משפחות ממצאים:

     1  no-answer      אין תשובה נכונה
     2  multi-answer   יותר מתשובה נכונה אחת, או מסיח ששווה לה
     3  duplicate      אותה שאלה חוזרת, או חוזרת עם תשובה אחרת
     4  missing-field  שדה שהסכימה מחייבת וחסר
     5  wording        ניסוח: מציין מיקום שנשאר, רווח כפול, סוגר פתוח
     6  translation    שפה שהוכרזה ואין לה תרגום
     7  tts            מה שההקראה תיתקל בו
     8  suspicious     דורש עין אנושית
     9  structure      מה שישבור את השאלה באפליקציה

   כל ממצא נושא חומרה אחת משתיים, וממנה נגזר פסק הדין:

     FAIL    יש ממצא חוסם. שאלה שבורה מגיעה ללומד.
     REVIEW  אין חוסם, יש מה שדורש עין. אתה מכריע.
     PASS    אפס ואפס.

   הדוחות נכתבים ל-`.claude/qa/reports/<app>.md` ו-`.json`.
   ה-json הוא מה שנקרא כשאפליקציה מבקשת לעלות שלב.

   **הוא אינו קורא מתמטיקה.** הוא אינו יודע אם 7×8=56. זה
   התפקיד של אוקלידס. כאן נמדד רק מה שאפשר למדוד בלי לדעת
   את החומר — ולכן ממצא REVIEW הוא שאלה, לא האשמה.
   ============================================================ */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'), path=require('path');
const DIR=__dirname, ROOT=path.resolve(DIR,'..','..');
const REG=JSON.parse(fs.readFileSync(path.join(DIR,'stages.json'),'utf8'));
const OUT=path.join(DIR,'reports');
const N=parseInt(process.env.QA_N||'150',10);

const APPS=process.argv.slice(2).length?process.argv.slice(2)
  :Object.keys(REG.apps).filter(k=>REG.apps[k].bank==='buildQ');

/* --------------------------------------------------------------
   כל הבדיקות רצות בתוך הדפדפן. שמונים אלף שאלות אינן עוברות
   את הגשר אל node — רק הספירות והדוגמאות עוברות.
   -------------------------------------------------------------- */
async function scan(page){
 return page.evaluate(({N})=>{
  const R={n:0,cells:0,find:{},lang:{},langs:[]};
  const MAXEX=3;
  /* ממצא = שם, חומרה, הודעה, ומקום.

     שתי החלטות שנלמדו מהריצה הראשונה, ושתיהן על רעש:

     · **הספירה אינה פסק הדין.** אפליקציה שבה אף מסיח אינו נושא
       הסבר קיבלה 1,440 ממצאי REVIEW זהים — עובדה אחת שנכתבה
       אלף פעם. פסק הדין נמנה היום ב*ממצאים נבדלים*, וכל אחד
       נושא בתוכו כמה פעמים הוא הופיע ובכמה תאים.
     · **המבחין (`sub`) מפצל.** שני סימנים שונים שההקראה לא
       המירה הם שני ממצאים, לא אחד עם שני שמות. */
  function add(kind,sev,msg,where,sub){
    const id=kind+(sub?' · '+sub:'');
    const f=R.find[id]||(R.find[id]={kind:kind,sev:sev,n:0,ex:[],cells:{}});
    f.n++;
    if(where) f.cells[where]=1;
    if(f.ex.length<MAXEX) f.ex.push({msg:String(msg).slice(0,220),where:where});
  }

  const div=document.createElement('div');
  const plain=function(h){div.innerHTML=String(h==null?'':h);
    return (div.textContent||'').replace(/\s+/g,' ').trim()};
  /* מפתח מבני: כל גבול אלמנט הוא מפריד, ולכן ‎−5/x‎ ו-‎−5x‎ אינם
     זהים. זה בדיוק המדד של entropy.js, ומאותה סיבה. */
  const key=function(h){div.innerHTML=String(h==null?'':h);
    const walk=function(n){ if(n.nodeType===3) return (n.nodeValue||'').replace(/\s+/g,' ');
      let s='<'+n.nodeName+'>'; for(const c of n.childNodes) s+=walk(c); return s+'</>' };
    let s=''; for(const c of div.childNodes) s+=walk(c); return s.trim()};

  /* מספר מתוך מחרוזת, אם המחרוזת כולה מספר. משמש רק כדי
     לזהות מסיח ששווה לתשובה בכתיב אחר — 0.5 מול 1/2 מול 50%. */
  function num(t){
    let s=String(t).trim().replace(/[−–—]/g,'-').replace(/\s/g,'');
    if(!s) return null;
    let pct=false; if(/%$/.test(s)){pct=true;s=s.slice(0,-1)}
    const m=s.match(/^(-?\d+(?:[.,]\d+)?)\/(-?\d+(?:[.,]\d+)?)$/);
    let v;
    if(m){ const a=parseFloat(m[1].replace(',','.')), b=parseFloat(m[2].replace(',','.'));
           if(!b) return null; v=a/b }
    else { if(!/^-?\d+(?:[.,]\d+)?$/.test(s)) return null;
           v=parseFloat(s.replace(',','.')) }
    if(!isFinite(v)) return null;
    return pct? v/100 : v;
  }

  const HEB=/[֐-׿]/;
  const BROKEN=/\bNaN\b|\bInfinity\b|\bundefined\b|\bnull\b|\[object Object\]/;
  const PLACEHOLDER=/\{(?:a|b|c|n|ans|0|1|2|3)\}/;
  const MOJIBAKE=/[�]|Ã[ -¿]|Ð[ -¿]/;
  const ENTITY=/&(?:amp|lt|gt|quot|nbsp|#\d+);/;
  /* סימנים ש-SAY_MAP ו-PROSE_MAP קיימים כדי להמיר. אם אחד מהם
     שרד עד ה-say, ההקראה תאיית אותו או תדלג עליו. */
  const UNSPOKEN=new RegExp('[\\^_√∫∞∈∪∩∅¬'+
    '∧∨⇒⇔²³₀-₉ₙ→≤≥≠'+
    '±×÷∂∑∏]');
  const LATEX=/[\\$]/;

  /* בדיקות ניסוח רצות על **פרוזה בלבד** — `ask` ו-`hint`.

     הריצה הראשונה החזירה 9,657 ממצאי "רווח לפני פיסוק"
     באקסיומה ב׳, וכולם היו נוסחאות: `[−1 , 5)`, `18 : 15`,
     `A = { −8 , 4 , 7 }`. זה אינו שגיאת כתיב אלא הטיפוגרפיה
     של המתמטיקה כאן, ומדד שמדווח עליה קובר את מה שכן חשוב.

     לכן: `expr` ואפשרויות אינם נבדקים לפיסוק ולמילה כפולה,
     ורווח־לפני־פיסוק נספר רק כשלפניו **אות** — פרוזה — ולא
     ספרה או סימן. נקודתיים ירדו לגמרי: `18 : 15` הוא יחס. */
  function textChecks(kind,t,where){
    if(!t) return;
    if(BROKEN.test(t))      add('broken-text','FAIL',kind+': '+t,where);
    if(PLACEHOLDER.test(t)) add('placeholder-left','FAIL',kind+': '+t,where);
    if(MOJIBAKE.test(t))    add('mojibake','FAIL',kind+': '+t,where);
    if(ENTITY.test(t))      add('double-escaped','REVIEW',kind+': '+t,where);
    if(/ {2,}/.test(t))     add('double-space','REVIEW',kind+': '+t,where);
    const o=(t.match(/[({\[]/g)||[]).length, c=(t.match(/[)}\]]/g)||[]).length;
    if(o!==c) add('unbalanced-brackets','REVIEW',kind+': '+t,where);
    if(kind!=='ask'&&kind!=='hint') return;
    if(/[\p{L}]\s+[,.;!]/u.test(t))
      add('space-before-punct','REVIEW',kind+': '+t,where);
    const dbl=t.match(/(^|\s)(\p{L}{2,})\s+\2(\s|$)/u);
    if(dbl) add('doubled-word','REVIEW',kind+': …'+dbl[0].trim()+'…',where);
  }

  /* ---------- 6. תרגום: מה שאפשר לספור בלי לנחש ---------- */
  const LANGS_=(typeof LANGS!=='undefined')?Object.keys(LANGS):['he'];
  R.langs=LANGS_;
  /* (א) המנגנון של האפליקציה עצמה, כשיש כזה. */
  if(typeof trMissing==='function'){
    for(const lg of LANGS_){
      let v=-1; try{v=trMissing(lg)}catch(e){}
      if(v>=0) R.lang[lg]={dictMissing:v};
    }
  }
  /* (ב) חבילות שפה בתוכן: אובייקט ששדותיו הם קודי שפה ומחרוזות.
     כך בנויים הבנקים של ניב, מפנה ואולפן. סורקים את הגלובלים,
     ומדווחים שפה שהוכרזה ואין לה ערך. */
  (function(){
    const miss={}, seen=new WeakSet(); let nodes=0, bundles=0;
    const isBundle=function(o){
      const k=Object.keys(o);
      if(k.length<2||k.length>6) return false;
      let hit=0;
      for(const x of k){ if(LANGS_.indexOf(x)<0) return false;
        if(typeof o[x]!=='string') return false; hit++ }
      return hit>=2;
    };
    const walk=function(o,p,d){
      if(nodes>400000||d>9||!o||typeof o!=='object') return;
      if(seen.has(o)) return; seen.add(o); nodes++;
      if(!Array.isArray(o)&&isBundle(o)){
        bundles++;
        const gone=LANGS_.filter(function(l){return !o[l]||!String(o[l]).trim()});
        if(gone.length){
          const k=gone.join(',');
          const rec=miss[k]||(miss[k]={n:0,ex:[]});
          rec.n++;
          if(rec.ex.length<MAXEX) rec.ex.push({msg:String(o.he||o.en||'').slice(0,80),where:p});
        }
        return;
      }
      if(Array.isArray(o)){ for(let i=0;i<o.length&&i<4000;i++) walk(o[i],p+'['+i+']',d+1); return }
      for(const k in o){ let v; try{v=o[k]}catch(e){continue}
        if(v&&typeof v==='object'&&!(v instanceof Node)) walk(v,p+'.'+k,d+1) }
    };
    const SKIP={window:1,self:1,top:1,parent:1,document:1,frames:1,location:1,navigator:1};
    for(const g in window){
      if(SKIP[g]) continue;
      let v; try{v=window[g]}catch(e){continue}
      if(v&&typeof v==='object'&&!(v instanceof Node)) walk(v,g,0);
    }
    R.bundles={total:bundles,missing:miss};
    for(const k in miss)
      add('translation-missing','REVIEW',
          'חסר '+k+' ב-'+miss[k].n+' חבילות שפה מתוך '+bundles+
          '. למשל: '+(miss[k].ex[0]?miss[k].ex[0].msg:''),
          miss[k].ex[0]&&miss[k].ex[0].where, k);
  })();

  /* ---------- המדגם הראשי, בעברית ---------- */
  const LVLS=[]; const nl=(typeof LVL!=='undefined'&&LVL.length)||3;
  for(let i=1;i<=nl;i++) LVLS.push(i);
  R.levels=nl; R.topics=TOPICS.length;

  /* שדות הסכימה נמדדים בשיעור ולא בספירה. "אין רמז" בכל שאלה
     היא עובדה אחת על האפליקציה — כמה שדות היא בכלל נושאת —
     ולא אלף באגים. הממצא נכתב פעם אחת בסוף, עם האחוז. */
  const cov={q:0,noHint:0,noSteps:0,hasSteps:0,wrong:0,noWhy:0};

  for(const t of TOPICS) for(const lv of LVLS){
    const where=t.id+' L'+lv;
    R.cells++;
    const qseen={}, qfull={}, posN=[0,0,0,0,0,0], longest=[0,0], sizes={};
    let cellN=0;

    for(let k=0;k<N;k++){
      let q=null;
      try{ q=buildQ(t.id,lv) }
      catch(e){ add('build-throw','FAIL',String(e&&e.message||e),where); continue }
      if(!q){ add('build-null','FAIL','buildQ החזיר null',where); continue }
      R.n++; cellN++;

      /* 9. מבנה */
      if(!Array.isArray(q.options)){ add('no-options','FAIL','אין מערך options',where); continue }
      const opts=q.options;
      sizes[opts.length]=(sizes[opts.length]||0)+1;
      if(opts.length<2) add('too-few-options','FAIL',opts.length+' אפשרויות',where);
      if(opts.length>4) add('too-many-options','FAIL',
        opts.length+' אפשרויות — המקלדת מקצה 1–4 והחמישית אינה נגישה',where);
      let shape=false;
      for(const o of opts)
        if(!o||typeof o!=='object'||(o.h===undefined&&o.t===undefined)||typeof o.ok!=='boolean'){
          shape=true; break }
      if(shape){ add('option-shape','FAIL','אפשרות בלי h/t או בלי ok בוליאני',where); continue }

      const askT=plain(q.ask), exprT=plain(q.expr), hintT=plain(q.hint);
      if(!askT&&!exprT) add('empty-question','FAIL','אין ask ואין expr',where);

      /* 1. אין תשובה תקינה */
      const right=opts.filter(function(o){return o.ok});
      if(right.length===0) add('no-answer','FAIL','אף אפשרות אינה ok',where);
      else if(right.length>1) add('multi-answer','FAIL',right.length+' אפשרויות מסומנות ok',where);

      const texts=opts.map(function(o){return plain(o.h!==undefined?o.h:o.t)});
      const keys =opts.map(function(o){return key(o.h!==undefined?o.h:o.t)});
      const ri=right.length===1?opts.indexOf(right[0]):-1;
      if(ri>=0){
        if(!texts[ri]) add('empty-answer','FAIL','התשובה הנכונה ריקה',where);
        if(BROKEN.test(texts[ri])) add('broken-answer','FAIL','התשובה הנכונה: '+texts[ri],where);
      }

      /* 2. כפולות וסותרות */
      if(new Set(keys).size!==keys.length)
        add('dup-option','FAIL','שתי אפשרויות זהות על המסך: '+texts.join(' | '),where);
      if(ri>=0){
        const av=num(texts[ri]);
        if(av!==null) for(let i=0;i<opts.length;i++){
          if(opts[i].ok) continue;
          const wv=num(texts[i]);
          if(wv!==null&&Math.abs(wv-av)<1e-9)
            add('equivalent-distractor','REVIEW',
                'מסיח ששווה בערכו לתשובה: '+texts[i]+' = '+texts[ri],where);
        }
      }
      for(const tx of texts) if(BROKEN.test(tx)) add('broken-option','FAIL','אפשרות: '+tx,where);

      /* 3. שאלות כפולות וסותרות.

         **זהות השאלה אינה הנוסח שלה.** שלוש רמות בשלוש
         אפליקציות נפלו כאן ב-FAIL כוזב עד שזה תוקן:

         · "מה קרה קודם?" ב״מפנה״ — הנוסח קבוע, וכל האירועים
           יושבים באפשרויות. לפי נוסח בלבד כל ההגרלות הן אותה
           שאלה, וכל תשובה נכונה חדשה נראית סתירה. 55 ממצאים.
         · "איזו משוואה היא לינארית מסדר ראשון?" באקסיומה ב׳ —
           אותו דבר, ולכן הרמה נראתה כמייצרת שאלה אחת.
         · "איזו מילה שמעתם?" בניב ובאולפן — כאן גם האפשרויות
           קבועות. **מה שמבדיל הוא הצליל**, ולכן שאלת האזנה
           נבדלת לפי תשובתה ואינה נבדקת לסתירה כלל: אין בנוסח
           ובאפשרויות מה שיקבע את התשובה, וזה בכוונה.

         לכן המפתח הוא הנוסח, הביטוי והאפשרויות יחד — ובשאלת
         האזנה גם התשובה. */
      const opsKey=texts.slice().sort().join(' ¦ ');
      const idKey=askT+' ¦ '+exprT+' ¦ '+opsKey+
                  (q.audioOnly&&ri>=0?' ¦ '+texts[ri]:'');
      qseen[idKey]=(qseen[idKey]||0)+1;
      if(ri>=0&&!q.audioOnly){
        const rc=qfull[askT+' ¦ '+exprT+' ¦ '+opsKey]||
                 (qfull[askT+' ¦ '+exprT+' ¦ '+opsKey]={});
        rc[texts[ri]]=1;
        if(Object.keys(rc).length>1)
          add('contradiction','FAIL',
              'אותן אפשרויות בדיוק, שתי תשובות נכונות שונות: "'+askT.slice(0,60)+'" ← '+
              Object.keys(rc).join(' / '),where);
      }

      /* 4. שדות שהסכימה מחייבת — נצברים, ונכתבים בסוף באחוזים */
      cov.q++;
      if(!hintT) cov.noHint++;
      if(Array.isArray(q.steps)){ cov.hasSteps++; if(!q.steps.length) cov.noSteps++ }
      for(let i=0;i<opts.length;i++) if(!opts[i].ok){
        cov.wrong++;
        if(!String(opts[i].why||'').trim()) cov.noWhy++;
      }

      /* 5. ניסוח */
      textChecks('ask',askT,where);
      textChecks('expr',exprT,where);
      textChecks('hint',hintT,where);
      for(const tx of texts) textChecks('option',tx,where);

      /* 7. הקראה */
      const say=String(q.say||'');
      if(askT&&!say.trim()) add('no-say','REVIEW','אין say — אין מה להקריא',where);
      if(/<[a-zA-Z\/]/.test(say)) add('html-in-say','REVIEW','תגיות HTML ב-say: '+say.slice(0,80),where);
      if(LATEX.test(say)) add('latex-in-say','FAIL','LaTeX ב-say: '+say.slice(0,80),where);
      const sym=say.match(UNSPOKEN);
      if(sym) add('symbol-in-say','REVIEW',
        'סימן ש-SAY_MAP לא המיר: '+say.slice(0,80),where,sym[0]);
      if(say.length>400) add('long-say','REVIEW',say.length+' תווים בהקראה אחת',where);
      /* דליפת תשובה בהקראה נמדדת על **מה שבאמת נאמר לפני
         שעונים**, ולא על השדה הגולמי `say`.

         `say` הוא המשפט המלא, והוא אמור להכיל את התשובה — הוא
         נאמר *אחרי* שעונים. אפליקציה שיש בה `sitSay` כבר בוחרת
         בעצמה מה להשמיע קודם, ומדידה על `say` הייתה מדווחת על
         דליפה שנסגרה. אין `sitSay` — נופלים ל-`say`, כי אז הוא
         באמת מה שנשמע. */
      if(!q.audioOnly&&ri>=0){
        const a=texts[ri];
        let spoken=say, via='say';
        if(typeof sitSay==='function'){
          try{ const o=sitSay(q); spoken=plain(o&&o.t); via='sitSay' }catch(e){}
        } else if(typeof questionSay==='function'){
          try{ spoken=plain(questionSay(q)); via='questionSay' }catch(e){}
        }
        /* שתי הסתייגויות, בלעדיהן המדד מדווח על מה שחייב לקרות:

           · תשובה שנמצאת ב-`expr` מוצגת על המסך ממילא — נוסחה,
             מטריצה או קטע — ולהשמיע אותה אינו חושף דבר.
           · הקראה שמונה את כל האפשרויות ("האפשרויות: אפשרות
             אחת… אפשרות שתיים…") מכילה את התשובה בהכרח, וזה
             בדיוק תפקידה: מי שאינו קורא את המסך חייב לשמוע גם
             את המסיחים. ב״שלב״ זה 3,262 ממצאים שכולם תקינים.

           דליפה אמיתית היא **א־סימטרית**: התשובה נאמרת ואף מסיח
           לא. כך נשמע `say` של "מפנה" לפני התיקון. */
        /* זיהוי המנייה נעשה על צורה מנוקה מסימנים, מפני
           ש-`speakMath` כותב מחדש את מה שהוא מקריא: המסיח נראה
           על המסך `−37` ונאמר "מינוס 37", ולכן השוואה מילולית
           לא מצאה אותו — והמנייה נראתה כאילו היא אומרת את התשובה
           לבדה. 69 ממצאים ב״שלב״, כולם כוזבים.

           הניקוי משמש **רק** לספירת המסיחים. בדיקת התשובה עצמה
           נשארת מילולית ומחמירה, כדי שהרפיית ההשוואה לא תבלע
           דליפה אמיתית. */
        const norm=x=>String(x).toLowerCase().replace(/[^0-9a-z֐-׿؀-ۿ]/g,'');
        const nSpoken=norm(spoken);
        const others=texts.filter((x,i)=>
          i!==ri&&x&&norm(x).length>=2&&nSpoken.indexOf(norm(x))>=0).length;
        if(a&&a.length>=2&&spoken.indexOf(a)>=0&&
           askT.indexOf(a)<0&&exprT.indexOf(a)<0&&others===0)
          add('answer-in-say','REVIEW',
              'מה שנאמר לפני התשובה ('+via+') מכיל אותה, ואף מסיח לא: "'+a+'"',where,via);
      }

      /* 8. חשוד — נאסף לתא ומוכרע בסופו */
      if(askT.length>300) add('long-question','REVIEW',askT.length+' תווים בשאלה',where);
      for(const tx of texts) if(tx.length>120)
        add('long-option','REVIEW',tx.length+' תווים באפשרות',where);
      if(ri>=0){
        posN[ri]=(posN[ri]||0)+1;
        const lens=texts.map(function(x){return x.length});
        const mx=Math.max.apply(null,lens), mn=Math.min.apply(null,lens);
        if(mx!==mn&&texts[ri].length===mx) longest[0]++;
        if(mx!==mn&&texts[ri].length===mn) longest[1]++;
      }
    }

    /* --- מדדים ברמת התא --- */
    if(cellN>=20){
      const distinct=Object.keys(qseen).length;
      if(distinct===1)
        add('one-question','FAIL','הרמה מייצרת שאלה אחת בלבד ב-'+cellN+' הגרלות',where);
      else if(distinct/cellN<0.05)
        add('low-variety','REVIEW',distinct+' שאלות שונות ב-'+cellN+' הגרלות',where);
      const tot=posN.reduce(function(a,b){return a+b},0);
      if(tot>=20){
        const mx=Math.max.apply(null,posN);
        if(mx/tot>0.5) add('position-bias','REVIEW',
          'התשובה במקום קבוע ב-'+Math.round(mx/tot*100)+'% מהשאלות',where);
        if(longest[0]/tot>0.7) add('longest-answer','REVIEW',
          'התשובה היא הארוכה ביותר ב-'+Math.round(longest[0]/tot*100)+'% מהשאלות',where);
        if(longest[1]/tot>0.7) add('shortest-answer','REVIEW',
          'התשובה היא הקצרה ביותר ב-'+Math.round(longest[1]/tot*100)+'% מהשאלות',where);
      }
      let under=0;
      for(const s in sizes) if(+s<4) under+=sizes[s];
      if(under/cellN>0.2) add('few-options','REVIEW',
        Math.round(under/cellN*100)+'% מהשאלות מציגות פחות מארבע אפשרויות',where);
    }
  }

  /* --- 4. כיסוי שדות, פעם אחת, באחוזים --- */
  R.coverage=cov;
  const pc=function(a,b){return b?Math.round(a/b*100):0};
  if(cov.q&&cov.noHint) add('no-hint','REVIEW',
    pc(cov.noHint,cov.q)+'% מהשאלות ('+cov.noHint+' מתוך '+cov.q+') נבנות בלי רמז','—');
  if(cov.hasSteps&&cov.noSteps) add('no-steps','REVIEW',
    pc(cov.noSteps,cov.hasSteps)+'% מהשאלות ('+cov.noSteps+' מתוך '+cov.hasSteps+
    ') נבנות בלי שלבי פתרון','—');
  if(cov.wrong&&cov.noWhy) add('no-why','REVIEW',
    pc(cov.noWhy,cov.wrong)+'% מהמסיחים ('+cov.noWhy+' מתוך '+cov.wrong+
    ') בלי הסבר למה הם שגויים','—');

  return R;
 },{N:N});
}

/* שפה: מחליפים, מגרילים מעט, ובודקים שהאפליקציה בכלל בונה שאלה.
   אפליקציה שנופלת בערבית היא FAIL, לא הערת ניסוח. */
async function scanLang(page,lg){
 return page.evaluate(({lg})=>{
  const out={lg:lg,built:0,threw:0,empty:0,heb:0,err:''};
  try{
    if(typeof state==='object'&&state){
      if(state.settings) state.settings.lang=lg;
      if('lang' in state) state.lang=lg;
    }
    if(typeof applyModes==='function') applyModes();
    if(typeof lvlSync==='function') lvlSync();
  }catch(e){ out.err=String(e&&e.message||e); return out }
  const div=document.createElement('div');
  const plain=function(h){div.innerHTML=String(h==null?'':h);
    return (div.textContent||'').replace(/\s+/g,' ').trim()};
  const HEB=/[֐-׿]/;
  /* שתי הסתייגויות, ושתיהן נמדדו ולא שוערו:

     · **מתי מתרגמים.** ב״שלב״ התרגום אינו קורה ב-buildQ אלא
       ב-`trHTML` על כל ה-innerHTML ברגע הציור. שאלה שנבנתה
       בערבית ונושאת עברית היא לכן תקינה לגמרי, ובדיקה על פלט
       buildQ ספרה 72 מתוך 72 ככשל. כשיש trHTML — מריצים אותו.
     · **מה התוכן.** באולפן `LEARN="he"`: העברית היא מה שבאים
       ללמוד, ולא מחרוזת ממשק ששכחו לתרגם. אפליקציה שמלמדת
       עברית פטורה מהבדיקה, ונאמר בדוח שהיא פטורה. */
  const teaches=(typeof LEARN!=='undefined')?String(LEARN):'';
  out.teaches=teaches;
  out.skipHeb=(teaches==='he');
  const view=(typeof trHTML==='function')?trHTML:function(h){return h};
  out.rendered=(typeof trHTML==='function');
  for(const t of TOPICS) for(let k=0;k<4;k++){
    let q=null;
    try{ q=buildQ(t.id,1) }
    catch(e){ out.threw++; if(!out.err) out.err=String(e&&e.message||e); continue }
    if(!q||!q.options||!q.options.length){ out.empty++; continue }
    out.built++;
    if(lg!=='he'&&!out.skipHeb&&HEB.test(plain(view('<i>'+q.ask+'</i>')))) out.heb++;
  }
  return out;
 },{lg:lg});
}

/* ---------------- דוח ---------------- */
/* פסק הדין נמנה בממצאים נבדלים. עובדה אחת שחוזרת באלף שאלות
   היא עובדה אחת. מספר המופעים נשמר לצדה ואומר כמה היא רחבה. */
function verdict(find){
  let f=0,r=0,fh=0,rh=0;
  for(const k in find){
    if(find[k].sev==='FAIL'){ f++; fh+=find[k].n } else { r++; rh+=find[k].n }
  }
  return {fail:f,review:r,failHits:fh,reviewHits:rh,
          verdict:f?'FAIL':(r?'REVIEW':'PASS')};
}
const CAT={
  'no-answer':1,'empty-answer':1,'broken-answer':1,
  'multi-answer':2,'dup-option':2,'equivalent-distractor':2,'broken-option':2,
  'contradiction':3,'one-question':3,'low-variety':3,
  'no-hint':4,'no-steps':4,'no-why':4,
  'placeholder-left':5,'double-space':5,'space-before-punct':5,'unbalanced-brackets':5,
  'doubled-word':5,'double-escaped':5,'mojibake':5,'broken-text':5,
  'translation-missing':6,'lang-broken':6,'lang-untranslated':6,
  'no-say':7,'html-in-say':7,'latex-in-say':7,'symbol-in-say':7,'long-say':7,'answer-in-say':7,
  'long-question':8,'long-option':8,'position-bias':8,'longest-answer':8,
  'shortest-answer':8,'few-options':8,
  'build-throw':9,'build-null':9,'no-options':9,'too-few-options':9,
  'too-many-options':9,'option-shape':9,'empty-question':9,'js-error':9
};
const CATNAME=['','אין תשובה תקינה','תשובות כפולות או סותרות','שאלות כפולות',
  'שדות חסרים','ניסוח וכתיב','תרגום','הקראה','חשוד — דורש עין אנושית','מבנה'];

function md(app,R){
  const v=verdict(R.find), L=[];
  L.push('# דוח תוכן — '+app);
  L.push('');
  L.push('**'+v.verdict+'** · '+v.fail+' ממצאים חוסמים ('+v.failHits+
         ' מופעים) · '+v.review+' לבדיקה ('+v.reviewHits+' מופעים)');
  L.push('');
  L.push('| | |');
  L.push('|---|---|');
  L.push('| שאלות שנבדקו | '+R.n.toLocaleString('en-US')+' |');
  L.push('| נושאים × רמות | '+R.topics+' × '+R.levels+' = '+R.cells+' |');
  L.push('| מדגם לכל תא | '+R.sample+' |');
  L.push('| שפות שהוכרזו | '+(R.langs||[]).join(', ')+' |');
  L.push('');
  const byCat={};
  for(const k in R.find){ const c=CAT[R.find[k].kind||k]||8; (byCat[c]||(byCat[c]=[])).push(k) }
  for(let c=1;c<=9;c++){
    const ks=byCat[c];
    L.push('## '+c+'. '+CATNAME[c]);
    L.push('');
    if(!ks||!ks.length){ L.push('אפס.'); L.push(''); continue }
    ks.sort(function(a,b){return R.find[b].n-R.find[a].n});
    L.push('| ממצא | חומרה | מופעים | תאים | דוגמה | איפה |');
    L.push('|---|---|---|---|---|---|');
    for(const k of ks){
      const f=R.find[k], e=f.ex[0]||{};
      L.push('| `'+k+'` | '+f.sev+' | '+f.n+' | '+
        Object.keys(f.cells||{}).length+' | '+
        String(e.msg||'').replace(/\|/g,'\\|').replace(/\n/g,' ')+' | '+(e.where||'')+' |');
    }
    L.push('');
    for(const k of ks){
      const f=R.find[k];
      if(f.ex.length>1){
        L.push('<details><summary>'+k+' — עוד דוגמאות</summary>');
        L.push('');
        for(const e of f.ex.slice(1))
          L.push('- `'+(e.where||'')+'` '+String(e.msg).replace(/\n/g,' '));
        L.push('');
        L.push('</details>');
        L.push('');
      }
    }
  }
  if(R.langsRun&&R.langsRun.length){
    L.push('## נספח — בנייה בכל שפה שהוכרזה');
    L.push('');
    L.push('| שפה | נבנו | נפלו | ריקות | עברית בטקסט | מילון חסר |');
    L.push('|---|---|---|---|---|---|');
    for(const r of R.langsRun)
      L.push('| '+r.lg+' | '+r.built+' | '+r.threw+' | '+r.empty+' | '+
             (r.lg==='he'?'—':(r.skipHeb?'פטורה':r.heb))+' | '+
             ((R.lang[r.lg]&&R.lang[r.lg].dictMissing!==undefined)?R.lang[r.lg].dictMissing:'—')+' |');
    L.push('');
    const r0=R.langsRun[0]||{};
    if(r0.skipHeb){
      L.push('האפליקציה מלמדת עברית (`LEARN="'+r0.teaches+'"`), ולכן טקסט עברי');
      L.push('בשאלה הוא התוכן עצמו ואינו נמדד כתרגום חסר.');
      L.push('');
    } else if(r0.rendered){
      L.push('התרגום כאן נעשה ב-`trHTML` ברגע הציור, ולכן הטקסט נמדד אחרי');
      L.push('הרצתו ולא על פלט `buildQ` הגולמי.');
      L.push('');
    }
  }
  if(R.bundles) L.push('חבילות שפה שנסרקו בתוכן: '+R.bundles.total+'.'), L.push('');
  L.push('---');
  L.push('');
  L.push('נוצר על ידי `node .claude/qa/content.js '+app+'` · QA_N='+R.sample+'.');
  L.push('הכלי אינו בודק נכונות מתמטית ואינו קורא את החומר —');
  L.push('ממצא REVIEW הוא שאלה שמופנית אליך, לא קביעה שיש באג.');
  return L.join('\n')+'\n';
}

(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const b=await chromium.launch();
 const summary=[];
 for(const app of APPS){
  const ctx=await b.newContext({locale:'he-IL'});
  const page=await ctx.newPage();
  const errs=[];
  page.on('pageerror',function(e){errs.push(e.message)});
  await page.route('**/*',function(r){
    return r.request().url().startsWith('http://127.0.0.1:8099')?r.continue():r.abort()});
  try{ await page.goto('http://127.0.0.1:8099/'+app+'/',{waitUntil:'domcontentloaded'}) }
  catch(e){ console.log(app,'SKIP — הדף לא נטען'); await ctx.close(); continue }
  await page.waitForTimeout(1200);

  const R=await scan(page);
  R.langsRun=[];
  for(const lg of (R.langs||['he'])){
    const r=await scanLang(page,lg);
    R.langsRun.push(r);
    if(r.threw) R.find['lang-broken']={sev:'FAIL',n:r.threw,
      ex:[{msg:lg+': buildQ נפל '+r.threw+' פעמים — '+r.err,where:lg}]};
    if(r.heb){
      const f=R.find['lang-untranslated']||(R.find['lang-untranslated']={sev:'REVIEW',n:0,ex:[]});
      f.n+=r.heb;
      if(f.ex.length<3) f.ex.push(
        {msg:lg+': '+r.heb+' שאלות מתוך '+r.built+' עדיין נושאות טקסט עברי',where:lg});
    }
  }
  if(errs.length) R.find['js-error']={sev:'FAIL',n:errs.length,ex:[{msg:errs[0],where:'page'}]};

  const v=verdict(R.find);
  R.app=app; R.sample=N; R.verdict=v.verdict; R.fail=v.fail; R.review=v.review;
  R.generated=new Date().toISOString().slice(0,10);
  fs.writeFileSync(path.join(OUT,app+'.json'),JSON.stringify(R,null,1));
  fs.writeFileSync(path.join(OUT,app+'.md'),md(app,R));
  summary.push({app:app,verdict:v.verdict,fail:v.fail,review:v.review,
                failHits:v.failHits,reviewHits:v.reviewHits,n:R.n});
  const mark=v.verdict==='PASS'?'✓':(v.verdict==='FAIL'?'✗':'!');
  console.log(mark+' '+app.padEnd(11)+' '+v.verdict.padEnd(7)+
    ' '+String(R.n).padStart(7)+' שאלות · '+
    String(v.fail).padStart(2)+' FAIL · '+String(v.review).padStart(2)+' REVIEW');
  await ctx.close();
 }
 await b.close();
 fs.writeFileSync(path.join(OUT,'summary.json'),JSON.stringify(summary,null,1));
 const bad=summary.filter(function(s){return s.verdict==='FAIL'}).length;
 console.log('\n'+summary.length+' אפליקציות · '+
   summary.filter(function(s){return s.verdict==='PASS'}).length+' PASS · '+
   summary.filter(function(s){return s.verdict==='REVIEW'}).length+' REVIEW · '+bad+' FAIL');
 console.log('דוחות: .claude/qa/reports/');
 process.exit(bad?1:0);
})();
