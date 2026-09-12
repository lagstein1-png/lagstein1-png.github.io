/* ============================================================
   מבצע השקה — שכבה מעל דף הבית.

   שלושה דברים, ואף אחד מהם אינו נוגע בנתוני הכרטיסים:
   1. חלון קופץ, פעם ב-7 ימים (localStorage: launch-popup-seen).
   2. תגיות המחיר (.t.price) מקבלות ״חינם בתקופת ההשקה״; ״חינם״
      מקבלת ״חינם לתמיד״; תגית עם data-launch-done="1" לא נוגעים בה.
   3. ״תאוריה מדברת״ (הכרטיס data-app="theory") נשארת בתשלום: המחיר
      המלא חוצה, לידו מחיר המבצע, וכפתור ״לרכישה״ אל theory/buy.html.

   הכרטיסים נבנים מחדש ב-draw() בכל סינון, חיפוש והחלפת שפה, ולכן
   השכבה מאזינה ל-#grid ורצה שוב אחרי כל ציור. תגית שכבר עברה
   מסומנת data-launch-done="1" — אותו סימן שאומר ״לא לגעת״.

   אירועי GoatCounter נשלחים רק אם window.goatcounter קיים. אין
   שגיאה בלעדיו. הכול חשוף ב-window.LAUNCH לצורך tests/launch.test.html.
   ============================================================ */
(function(){
"use strict";

var KEY="launch-popup-seen", DAYS=7, DAY=24*60*60*1000;
var SEL=".t.price", THEORY_SALE="79 ₪", BUY_URL="/theory/buy.html";
/* השדה (U+0651) יושב בין ج ל-ا ב-"مجّاني", ולכן "مجان" חלק
   לא התאים: חמש האפליקציות החינמיות קיבלו בערבית מחיר בקו חוצה
   ו"חינם בתקופת ההשקה", במקום "חינם לתמיד". */
var FREE=/חינם|free|مجّ?ان|бесплатно/i;

var T={
  he:{dir:"rtl", title:"🎉 מבצע השקה",
      text:"כל האפליקציות פתוחות עכשיו בחינם – ללא חיוב, עד להודעה חדשה.",
      start:"התחילו ללמוד", later:"אחר כך",
      launch:"חינם בתקופת ההשקה", forever:"חינם לתמיד", sale:"מבצע השקה: {p}", buy:"לרכישה"},
  ar:{dir:"rtl", title:"🎉 عرض الإطلاق",
      text:"كل التطبيقات مفتوحة الآن مجّانًا – بلا رسوم، حتى إشعار آخر.",
      start:"ابدأوا التعلّم", later:"لاحقًا",
      launch:"مجّاني في فترة الإطلاق", forever:"مجّاني دائمًا", sale:"عرض الإطلاق: {p}", buy:"للشراء"},
  ru:{dir:"ltr", title:"🎉 Акция к запуску",
      text:"Все приложения сейчас открыты бесплатно – без оплаты, до особого уведомления.",
      start:"Начать учиться", later:"Позже",
      launch:"Бесплатно на время запуска", forever:"Бесплатно навсегда", sale:"Акция: {p}", buy:"Купить"},
  en:{dir:"ltr", title:"🎉 Launch offer",
      text:"All apps are open for free right now – no charge, until further notice.",
      start:"Start learning", later:"Later",
      launch:"Free during launch", forever:"Free forever", sale:"Launch price: {p}", buy:"Buy"}
};
function S(){ var l=document.documentElement.lang||"he"; return T[l]||T.he; }

/* --- מדידה --- */
function track(name){
  try{
    var g=window.goatcounter;
    if(g&&typeof g.count==="function")g.count({path:name,title:name,event:true});
  }catch(e){}
}

/* --- ״נראה כבר?״ — חותמת זמן, ולא דגל --- */
function seenAt(){
  try{ var n=Number(localStorage.getItem(KEY)); return n>0?n:0; }catch(e){ return 0; }
}
function shouldShow(now){
  var t=seenAt(); if(!t)return true;
  return (now||Date.now())-t>DAYS*DAY;
}
function markSeen(now){
  try{ localStorage.setItem(KEY,String(now||Date.now())); }catch(e){}
}

/* --- החלון --- */
var open=null;
function el(tag,cls,text){
  var e=document.createElement(tag); if(cls)e.className=cls; if(text)e.textContent=text; return e;
}
/* opts.root — לאן להכניס (ברירת מחדל body); opts.scrollTo — לאן
   ״התחילו ללמוד״ גולל (ברירת מחדל #grid, מכולת הכרטיסים). מחזיר את
   הרקע של החלון, או null אם לא הוצג. */
function popup(opts){
  opts=opts||{};
  if(open||!shouldShow(opts.now))return null;
  var s=S(), root=opts.root||document.body, prev=document.activeElement;
  var bg=el("div","launch-bg"); bg.setAttribute("data-launch-popup","");
  var box=el("div","launch-box");
  box.setAttribute("role","dialog"); box.setAttribute("aria-modal","true");
  box.setAttribute("aria-labelledby","launchT"); box.setAttribute("aria-describedby","launchP");
  box.setAttribute("dir",s.dir); box.tabIndex=-1;
  var h=el("h2","",s.title); h.id="launchT";
  var p=el("p","",s.text); p.id="launchP";
  var act=el("div","launch-actions");
  var start=el("button","launch-btn launch-btn--main",s.start); start.type="button";
  var later=el("button","launch-btn",s.later); later.type="button";
  act.appendChild(start); act.appendChild(later);
  box.appendChild(h); box.appendChild(p); box.appendChild(act); bg.appendChild(box);

  function close(reason){
    if(open!==bg)return;
    open=null;
    document.removeEventListener("keydown",onKey);
    if(bg.parentNode)bg.parentNode.removeChild(bg);
    if(prev&&prev.focus)try{prev.focus()}catch(e){}
    if(reason==="start"){
      track("launch-popup-start");
      var to=document.querySelector(opts.scrollTo||"#grid");
      if(to&&to.scrollIntoView)to.scrollIntoView({behavior:"smooth",block:"start"});
    }else track("launch-popup-dismiss");
  }
  function onKey(e){
    if(e.key==="Escape"){close("dismiss");return;}
    /* Tab נשאר בתוך החלון: שני כפתורים, והמעגל סגור ביניהם */
    if(e.key==="Tab"){
      var a=document.activeElement;
      if(e.shiftKey&&(a===start||a===box)){e.preventDefault();later.focus();}
      else if(!e.shiftKey&&a===later){e.preventDefault();start.focus();}
    }
  }
  start.addEventListener("click",function(){close("start")});
  later.addEventListener("click",function(){close("dismiss")});
  bg.addEventListener("click",function(e){if(e.target===bg)close("dismiss")});
  document.addEventListener("keydown",onKey);
  bg.launchClose=close;

  root.appendChild(bg);
  open=bg;
  markSeen(opts.now);
  track("launch-popup-shown");
  try{start.focus()}catch(e){}
  return bg;
}
function closePopup(reason){ if(open&&open.launchClose)open.launchClose(reason||"dismiss"); }

/* --- התגיות --- */
/* מחזיר כמה תגיות טופלו. quiet=true מדלג על האזהרה — לרשימה שסוננה
   לאפס כרטיסים באמת אין תגיות, וזה אינו כשל. */
function tags(root,opts){
  root=root||document; opts=opts||{};
  var all=root.querySelectorAll(SEL), n=0;
  if(!all.length){
    if(!opts.quiet&&window.console)console.warn("launch.js: לא נמצאו תגיות מחיר ("+SEL+") — השכבה לא הופעלה על אף כרטיס");
    return 0;
  }
  var s=S();
  Array.prototype.forEach.call(all,function(tag){
    if(tag.getAttribute("data-launch-done")==="1")return;
    var text=tag.textContent.trim();
    tag.textContent="";
    var badge=el("span","launch-badge");
    if(FREE.test(text)){
      badge.className+=" launch-badge--forever"; badge.textContent=s.forever;
    }else{
      var old=el("s","",text); old.setAttribute("dir","auto");
      tag.appendChild(old); tag.appendChild(document.createTextNode(" "));
      badge.textContent=s.launch;
    }
    badge.setAttribute("dir",s.dir);
    tag.appendChild(badge);
    tag.className+=" launch-tagged";
    tag.setAttribute("data-launch-done","1");
    n++;
  });
  return n;
}

/* --- ״תאוריה מדברת״ נשארת בתשלום --- */
function theory(root){
  root=root||document;
  var card=root.querySelector('[data-app="theory"]'); if(!card)return false;
  var s=S(), tag=card.querySelector(SEL);
  if(tag&&tag.getAttribute("data-launch-done")!=="1"){
    var text=tag.textContent.trim();
    tag.textContent="";
    var old=el("s","",text); old.setAttribute("dir","auto");
    var sale=el("b","launch-sale",s.sale.replace("{p}",THEORY_SALE)); sale.setAttribute("dir",s.dir);
    tag.appendChild(old); tag.appendChild(document.createTextNode(" ")); tag.appendChild(sale);
    tag.className+=" launch-tagged";
    tag.setAttribute("data-launch-done","1");
  }
  var act=card.querySelector(".act");
  if(act&&!act.querySelector(".launch-buy")){
    var a=el("a","get launch-buy",s.buy); a.href=BUY_URL;
    a.addEventListener("click",function(){track("theory-buy-click")});
    act.appendChild(a);
  }
  return true;
}

/* --- הפעלה בדף הבית --- */
function apply(quiet){ theory(); tags(null,{quiet:quiet}); }

/* בביקור הראשון שער התנאים (legal/protect.js, .lg-wrap) פתוח, והוא
   יושב מעל הכול. שני חלונות מודאליים יחד — השני אינו נגיש ואינו
   לחיץ. לכן החלון ממתין: נפתח 500ms אחרי הטעינה רק אם אין שער על
   המסך, ואחרת ברגע שהשער מוסר. נמצא בדפדפן אמיתי, 7.9.2026. */
function gateOpen(){ return !!document.querySelector(".lg-wrap"); }
function whenNoGate(fn){
  if(!gateOpen()){fn();return;}
  if(!window.MutationObserver){fn();return;}
  var mo=new MutationObserver(function(){
    if(gateOpen())return;
    mo.disconnect(); setTimeout(fn,500);
  });
  mo.observe(document.body,{childList:true});
}
function init(){
  apply(false);
  var grid=document.getElementById("grid");
  if(grid&&window.MutationObserver)
    new MutationObserver(function(){apply(true)}).observe(grid,{childList:true});
  setTimeout(function(){whenNoGate(popup)},500);
}

window.LAUNCH={KEY:KEY,DAYS:DAYS,shouldShow:shouldShow,markSeen:markSeen,
  popup:popup,close:closePopup,tags:tags,theory:theory,track:track,init:init};
})();
