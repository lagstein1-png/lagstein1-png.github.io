/* =====================================================================
   שער התנאים + התקנה למסך הבית — מודול משותף לכל האפליקציות.
   ---------------------------------------------------------------------
   שני דברים שמתנהגים אחרת ממה שמצפים, ולכן כתובים כאן במפורש:

   1. אין אירוע התקנה בספארי. אנדרואיד ודסקטופ שולחים
      beforeinstallprompt ואפשר לפתוח דיאלוג אמיתי; iOS לא שולח דבר,
      ושם הדרך היחידה היא הוראות: שיתוף ← הוספה למסך הבית. כפתור
      שמופיע רק כשיש אירוע פשוט לא היה מופיע לעולם באייפון.

   2. השער נכשל *פתוח*. אם הקובץ הזה לא נטען, האפליקציה עובדת. זו
      אפליקציית נגישות, ומסך חסום בגלל תקלת רשת גרוע יותר מאשר
      הודעה משפטית שהוצגה מאוחר. הודעת הזכויות מופיעה גם בכותרת
      המסמך ובתחתית העמוד, בלי תלות בסקריפט.
   ===================================================================== */
(function(){
"use strict";
if(!window.LEGAL||window.__protectLoaded)return;
window.__protectLoaded=true;
var L=window.LEGAL;
var KEY="legal-accepted-v"+L.version;

/* השער יכול להיות בשפה שהאפליקציה עצמה אינה תומכת בה: אפליקציה
   עברית בלבד לא אמורה להתהפך ל-LTR רק מפני שקראו את התנאים באנגלית. */
var forced=null;
function lang(){
  if(forced&&L[forced])return forced;
  var c=(document.documentElement.lang||"he").toLowerCase().split("-")[0];
  if(c==="iw")c="he";
  return L[c]?c:"he";
}
function T(){return L[lang()]}
/* שם בעברית בתוך משפט בערבית או ברוסית נשבר בכיווניות ונקרא הפוך.
   מחוץ לעברית משתמשים בתעתיק הלטיני. */
function owner(){return lang()==="he"?L.owner:L.ownerEn}
function fill(s){return String(s).replace(/\{owner\}/g,owner()).replace(/\{email\}/g,L.email)}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")
  .replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function store(k,v){try{v===undefined?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
function read(k){try{return localStorage.getItem(k)}catch(e){return null}}

/* ---------- סגנון ---------- */
var CSS=''+
'.lg-wrap{position:fixed;inset:0;z-index:2147483000;background:rgba(8,12,20,.72);'+
'  backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:16px;'+
'  overflow-y:auto;font-family:"Heebo","Rubik",system-ui,"Segoe UI",Arial,sans-serif}'+
'.lg-box{background:#fff;color:#111827;max-width:44rem;width:100%;border-radius:18px;'+
'  box-shadow:0 24px 70px -20px rgba(0,0,0,.6);padding:clamp(18px,4vw,30px);'+
'  max-height:92vh;display:flex;flex-direction:column;font-size:16px;line-height:1.65}'+
'.lg-box h2{margin:0 0 6px;font-size:1.5rem;line-height:1.25;font-weight:800}'+
'.lg-box h3{margin:16px 0 4px;font-size:1.02rem;font-weight:800}'+
'.lg-lead{margin:0 0 10px;color:#374151}'+
'.lg-scroll{overflow-y:auto;padding-inline-end:6px;margin:6px 0 4px;flex:1;min-height:0}'+
'.lg-scroll p{margin:0 0 2px;color:#374151}'+
'.lg-meta{font-size:.82rem;color:#6b7280;margin-top:10px}'+
'.lg-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:14px}'+
'.lg-btn{font:inherit;font-weight:700;border-radius:12px;padding:.8rem 1.3rem;cursor:pointer;'+
'  border:1px solid #d1d5db;background:#fff;color:#111827;min-height:3rem}'+
'.lg-btn.pri{background:#111827;color:#fff;border-color:#111827;flex:1 1 15rem}'+
'.lg-btn.link{border:0;background:none;text-decoration:underline;padding:.6rem .2rem;color:#374151}'+
'.lg-btn:focus-visible{outline:3px solid #2563eb;outline-offset:2px}'+
'.lg-install{position:fixed;z-index:2147482000;inset-inline:auto;'+
'  inset-block-end:calc(14px + env(safe-area-inset-bottom));'+
'  inset-inline-end:calc(14px + env(safe-area-inset-right));'+
'  display:flex;align-items:center;gap:.5rem;font:inherit;font-size:.92rem;font-weight:700;'+
'  background:#111827;color:#fff;border:0;border-radius:999px;padding:.7rem 1.1rem;cursor:pointer;'+
'  box-shadow:0 10px 26px -8px rgba(0,0,0,.55);max-width:calc(100vw - 28px)}'+
'.lg-install .x{opacity:.65;font-weight:700;padding:0 .1rem}'+
'.lg-steps{margin:10px 0 0;padding-inline-start:22px;line-height:1.9;color:#374151}'+
'.lg-lgs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 12px}'+
'.lg-lgs button{font:inherit;font-weight:700;font-size:.9rem;border:1px solid #d1d5db;'+
'  background:#fff;color:#374151;border-radius:10px;padding:.55rem .8rem;cursor:pointer;min-height:44px}'+
'.lg-lgs button[aria-pressed="true"]{background:#111827;color:#fff;border-color:#111827}'+
'.lg-lgs button:focus-visible{outline:3px solid #2563eb;outline-offset:2px}'+
'@media (prefers-color-scheme:dark){'+
'  .lg-box{background:#141a24;color:#e8ecf4}'+
'  .lg-lead,.lg-scroll p,.lg-steps{color:#b9c2d4}'+
'  .lg-btn{background:#1d2531;color:#e8ecf4;border-color:#2c3648}'+
'  .lg-btn.pri{background:#e8ecf4;color:#141a24;border-color:#e8ecf4}'+
'  .lg-btn.link{color:#b9c2d4}'+
'  .lg-lgs button{background:#1d2531;color:#b9c2d4;border-color:#2c3648}'+
'  .lg-lgs button[aria-pressed="true"]{background:#e8ecf4;color:#141a24;border-color:#e8ecf4}'+
'  .lg-install{background:#e8ecf4;color:#141a24}}';
function style(){
  if(document.getElementById("lg-style"))return;
  var s=document.createElement("style");
  s.id="lg-style"; s.textContent=CSS;
  (document.head||document.documentElement).appendChild(s);
}

/* ---------- הדיאלוג ---------- */
var open=null;
function modal(html,onClose){
  close();
  style();
  var w=document.createElement("div");
  w.className="lg-wrap"; w.setAttribute("role","dialog");
  w.setAttribute("aria-modal","true"); w.dir=T().dir;
  w.innerHTML='<div class="lg-box" tabindex="-1">'+html+'</div>';
  document.body.appendChild(w);
  open={el:w,onClose:onClose};
  var box=w.firstChild;
  box.focus();
  /* מלכודת פוקוס: קורא מסך שיוצא מהחלון לא ימצא דרך חזרה */
  w.addEventListener("keydown",function(e){
    if(e.key!=="Tab")return;
    var f=box.querySelectorAll("button,[href],[tabindex]:not([tabindex='-1'])");
    if(!f.length)return;
    var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });
  return w;
}
function close(){
  if(!open)return;
  var o=open; open=null;
  if(o.el.parentNode)o.el.parentNode.removeChild(o.el);
  if(o.onClose)o.onClose();
}

/* מי שאינו קורא עברית נתקל כאן בקיר: השער חוסם את האפליקציה עוד לפני
   שהגיע למסך ההגדרות, ולכן בורר השפה חייב לשבת בתוך השער עצמו. */
var LGNAME={he:"עברית",ar:"العربية",ru:"Русский",en:"English"};
var LGDIR={he:"rtl",ar:"rtl",ru:"ltr",en:"ltr"};
var relang=null;   /* מה לצייר מחדש כשמחליפים שפה */
var selfLang=false;/* החלפה שיצאה מהרצועה עצמה — לא לצייר פעמיים */
function langStrip(){
  var cur=lang();
  return '<div class="lg-lgs" role="group">'+
    Object.keys(LGNAME).filter(function(k){return !!L[k]}).map(function(k){
      return '<button type="button" data-lg="'+k+'" lang="'+k+'" dir="'+LGDIR[k]+
        '" aria-pressed="'+(k===cur?"true":"false")+'">'+esc(LGNAME[k])+'</button>';
    }).join("")+'</div>';
}
function wireStrip(){
  var box=open&&open.el; if(!box)return;
  var bs=box.querySelectorAll(".lg-lgs button");
  for(var i=0;i<bs.length;i++)bs[i].onclick=function(){
    var k=this.getAttribute("data-lg");
    if(k===lang())return;
    /* מקור האמת לשפה הוא documentElement.lang, וכך גם האפליקציה קוראת אותה */
    selfLang=true; forced=k;
    if(relang)relang();
    /* אפליקציה רב־לשונית מקשיבה, מחליפה את השפה שלה בעצמה ומעדכנת
       את documentElement. אפליקציה עברית בלבד פשוט לא מגיבה, והשער
       לבדו מתורגם — בלי לשבור את כיווניות המסך שמאחוריו. */
    try{ window.dispatchEvent(new CustomEvent("legal:lang",{detail:k})) }catch(e){}
    setTimeout(function(){selfLang=false},0);
  };
}

function fullText(){
  var t=T();
  return t.sections.map(function(s){
    return "<h3>"+esc(fill(s[0]))+"</h3><p>"+esc(fill(s[1]))+"</p>";
  }).join("");
}

/* השער עצמו. אין X ואין לחיצה בחוץ שסוגרת — הסכמה חייבת להיות פעולה. */
function gate(){
  var t=T();
  relang=gate;
  modal(
    langStrip()+
    '<h2>'+esc(t.gateTitle)+'</h2>'+
    '<p class="lg-lead">'+esc(t.gateLead)+'</p>'+
    '<div class="lg-scroll" id="lg-full">'+fullText()+'</div>'+
    '<p class="lg-meta">'+esc(t.title)+' · '+esc(L.version)+' · '+esc(L.updated)+
    ' · © '+new Date().getFullYear()+' '+esc(owner())+'</p>'+
    '<div class="lg-row">'+
      '<button class="lg-btn pri" id="lg-ok">'+esc(t.accept)+'</button>'+
      '<button class="lg-btn" id="lg-no">'+esc(t.decline)+'</button>'+
    '</div>'
  );
  wireStrip();
  document.getElementById("lg-ok").onclick=function(){
    /* נשמר מה שנחוץ כדי להראות מה בדיוק אושר ומתי */
    store(KEY,JSON.stringify({v:L.version,at:new Date().toISOString(),lang:lang()}));
    relang=null; close(); installMaybe();
  };
  document.getElementById("lg-no").onclick=function(){
    var t2=T();
    modal('<h2>'+esc(t2.decline)+'</h2><p class="lg-lead">'+esc(t2.declined)+'</p>'+
          '<div class="lg-row"><button class="lg-btn pri" id="lg-back">'+esc(t2.readFull)+'</button></div>');
    document.getElementById("lg-back").onclick=gate;
  };
}

/* קריאה חוזרת מתוך האפליקציה, בלי לחסום */
function show(){
  var t=T(),rec=null;
  relang=show;
  try{rec=JSON.parse(read(KEY)||"null")}catch(e){}
  modal(
    langStrip()+
    '<h2>'+esc(t.title)+'</h2>'+
    '<p class="lg-lead">'+esc(t.intro)+'</p>'+
    '<div class="lg-scroll">'+fullText()+'</div>'+
    '<p class="lg-meta">'+esc(L.version)+' · '+esc(L.updated)+' · © '+new Date().getFullYear()+' '+
      esc(owner())+' · '+esc(L.email)+
      (rec&&rec.at?'<br>'+esc(t.acceptedOn)+' '+esc(String(rec.at).slice(0,10)):'')+'</p>'+
    '<div class="lg-row"><button class="lg-btn pri" id="lg-close">'+esc(t.accept.split(",")[0])+'</button></div>'
  );
  wireStrip();
  document.getElementById("lg-close").onclick=function(){relang=null;close()};
}

/* ---------- התקנה למסך הבית ---------- */
var deferred=null,bar=null;
var IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||
        (navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
function standalone(){
  return (window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||
         navigator.standalone===true;
}
var IS={
  he:{cta:"הוספה למסך הבית",title:"להוסיף למסך הבית",
      lead:"האפליקציה תיפתח כמו אפליקציה רגילה, במסך מלא, ותעבוד גם בלי אינטרנט.",
      ios:["פותחים את התפריט ׳שיתוף׳ למטה — הריבוע עם החץ כלפי מעלה",
           "גוללים ובוחרים ׳הוספה למסך הבית׳","לוחצים ׳הוסף׳"],
      ok:"הבנתי",dismiss:"סגירה"},
  ar:{cta:"إضافة إلى الشاشة الرئيسية",title:"الإضافة إلى الشاشة الرئيسية",
      lead:"سيُفتح التطبيق كتطبيق عادي بملء الشاشة، وسيعمل أيضًا بلا إنترنت.",
      ios:["افتح قائمة «مشاركة» في الأسفل — المربّع بسهم إلى الأعلى",
           "مرّر واختر «إضافة إلى الشاشة الرئيسية»","اضغط «إضافة»"],
      ok:"فهمت",dismiss:"إغلاق"},
  ru:{cta:"На главный экран",title:"Добавить на главный экран",
      lead:"Приложение будет открываться как обычное, во весь экран, и работать без интернета.",
      ios:["Откройте меню «Поделиться» внизу — квадрат со стрелкой вверх",
           "Прокрутите и выберите «На экран «Домой»»","Нажмите «Добавить»"],
      ok:"Понятно",dismiss:"Закрыть"},
  en:{cta:"Add to home screen",title:"Add to your home screen",
      lead:"The app will open like an ordinary app, full screen, and work without an internet connection.",
      ios:["Open the Share menu at the bottom — the square with an arrow pointing up",
           "Scroll and choose “Add to Home Screen”","Tap “Add”"],
      ok:"Got it",dismiss:"Close"}
};
function is(){return IS[lang()]||IS.he}
function dismissed(){return read("lg-install-off")==="1"}

function installMaybe(){
  if(standalone()||dismissed())return;
  if(!deferred&&!IOS)return;          /* אין דרך להתקין — אין כפתור */
  if(!read(KEY))return;               /* קודם התנאים, אחר כך הכפתור */
  showBar();
}
function showBar(){
  if(bar||standalone())return;
  style();
  var t=is();
  bar=document.createElement("button");
  bar.className="lg-install"; bar.type="button";
  bar.dir=T().dir;
  bar.innerHTML='<span aria-hidden="true">⬇</span><span>'+esc(t.cta)+
    '</span><span class="x" aria-hidden="true">✕</span>';
  bar.setAttribute("aria-label",t.title);
  bar.addEventListener("click",function(e){
    /* ה-✕ מבטל, כל השאר מתקין */
    var r=bar.getBoundingClientRect();
    var nearEnd=T().dir==="rtl"?(e.clientX-r.left)<26:(r.right-e.clientX)<26;
    if(nearEnd&&e.clientX){ store("lg-install-off","1"); hideBar(); return; }
    doInstall();
  });
  document.body.appendChild(bar);
}
function hideBar(){ if(bar&&bar.parentNode)bar.parentNode.removeChild(bar); bar=null; }
function doInstall(){
  if(deferred){
    var d=deferred; deferred=null;
    d.prompt();
    (d.userChoice||Promise.resolve()).then(function(){hideBar()},function(){hideBar()});
    return;
  }
  /* ספארי: אין דיאלוג, יש הוראות */
  var t=is();
  modal('<h2>'+esc(t.title)+'</h2><p class="lg-lead">'+esc(t.lead)+'</p>'+
        '<ol class="lg-steps">'+t.ios.map(function(x){return "<li>"+esc(x)+"</li>"}).join("")+'</ol>'+
        '<div class="lg-row"><button class="lg-btn pri" id="lg-ios-ok">'+esc(t.ok)+'</button></div>');
  document.getElementById("lg-ios-ok").onclick=close;
}
window.addEventListener("beforeinstallprompt",function(e){
  e.preventDefault(); deferred=e; installMaybe();
});
window.addEventListener("appinstalled",function(){ store("lg-install-off","1"); hideBar(); });

/* האפליקציה משנה את documentElement.lang כשמחליפים שפה בהגדרות.
   חלון תנאים שכבר פתוח צריך להתחלף איתה, לא להישאר בשפה הקודמת. */
try{
  var lastLang=document.documentElement.lang;
  new MutationObserver(function(){
    var now=document.documentElement.lang;
    if(now===lastLang)return;
    lastLang=now;
    forced=null;               /* האפליקציה ענתה — היא המקור מעכשיו */
    if(selfLang)return;
    if(open&&relang)relang();
    if(bar){hideBar();showBar()}
  }).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
}catch(e){}

/* ---------- הפעלה ---------- */
function boot(){
  if(!read(KEY))gate(); else installMaybe();
  /* מסך ההגדרות של כל אפליקציה יכול לקרוא לזה */
  window.LEGAL.show=show;
  window.LEGAL.install=doInstall;
  window.LEGAL.canInstall=function(){return !!deferred||IOS};
  window.LEGAL.accepted=function(){return !!read(KEY)};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
})();
