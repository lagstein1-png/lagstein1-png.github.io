/* =====================================================================
   מונה מבקרים — צד הדפדפן. קובץ אחד, נטען כך:

     <script src="/analytics/visit.js" async
             data-endpoint="https://<השרת>/api/analytics/visit"
             data-page="/"></script>

   · data-endpoint ריק או חסר = אין מדידה בכלל. זה המצב ב-GitHub Pages,
     שאין לו שרת. כשהאתר מוגש מהשרת עצמו אפשר לכתוב "/api/analytics/visit".
   · data-page — שם הדף. חסר → הנתיב מהכתובת, בלי שאילתה.
   · data-consent="ask" — מציג שורת הסכמה לפני המדידה. כברירת מחדל אין
     שורה כזאת: המדידה אנונימית, בלי cookie ובלי מידע מזהה, ולפי הדין
     בישראל אינה דורשת הסכמה. אם הקהל בחו"ל והדין שם דורש — מוסיפים
     את התכונה, ולא נוגעים בקוד.

   מה נשלח: מזהה session אקראי (sessionStorage — נמחק כשהלשונית נסגרת),
   שם הדף, שפת הממשק, ושם המארח של הדף המפנה. לא כתובת מלאה, לא שם,
   לא סיסמה, לא מפתח — לקובץ הזה אין גישה לשום דבר כזה, והוא לא
   קורא מ-localStorage.

   ביקור אחד ל-session: רענון אינו נספר שוב (דגל ב-sessionStorage),
   והשרת גם מסנן כפילות של אותו מזהה. כל כשל — שקט. הדף לעולם לא נשבר
   בגלל מדידה.
   ===================================================================== */
(function(){
"use strict";
var me=document.currentScript; if(!me)return;
var endpoint=(me.getAttribute("data-endpoint")||"").trim(); if(!endpoint)return;
var pingUrl=endpoint.replace(/\/visit\/?$/,"/ping");
var consent=(me.getAttribute("data-consent")||"").trim();
var SID_KEY="site-visit-sid", SENT_KEY="site-visit-sent", CONSENT_KEY="site-visit-consent";

function ss(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function ssSet(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function ls(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}

function randomId(){
  var a=new Uint8Array(16), s="";
  if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(a);
  else for(var i=0;i<16;i++)a[i]=Math.floor(Math.random()*256);
  for(var j=0;j<16;j++)s+=("0"+a[j].toString(16)).slice(-2);
  return s;
}
function sid(){
  var s=ss(SID_KEY);
  if(!s||!/^[a-f0-9]{32}$/.test(s)){s=randomId();ssSet(SID_KEY,s)}
  return s;
}
function page(){
  var p=me.getAttribute("data-page")||location.pathname||"/";
  p=p.split("?")[0].split("#")[0];
  if(p.charAt(0)!=="/")p="/"+p;
  return p.slice(0,64);
}
function referrer(){
  try{
    if(!document.referrer)return "";
    var h=new URL(document.referrer).hostname.toLowerCase();
    return h===location.hostname?"":h.slice(0,80);
  }catch(e){return ""}
}
function send(url,body){
  try{
    var s=JSON.stringify(body);
    /* text/plain — בקשה "פשוטה", בלי preflight, גם מדומיין אחר */
    if(navigator.sendBeacon){
      try{if(navigator.sendBeacon(url,new Blob([s],{type:"text/plain"})))return}catch(e){}
    }
    if(window.fetch)fetch(url,{method:"POST",body:s,headers:{"Content-Type":"text/plain"},
      keepalive:true,credentials:"omit",mode:"cors"}).catch(function(){});
  }catch(e){}
}

function measure(){
  var id=sid();
  if(ss(SENT_KEY)!==id){
    send(endpoint,{sid:id,page:page(),lang:(document.documentElement.lang||navigator.language||"").slice(0,8),ref:referrer()});
    ssSet(SENT_KEY,id);
  }
  /* "פעילים עכשיו": פינג קצר כל דקה, רק כשהלשונית גלויה */
  var timer=null;
  function tick(){if(document.visibilityState==="visible")send(pingUrl,{sid:id})}
  function arm(){if(timer)clearInterval(timer);timer=setInterval(tick,60000)}
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){tick();arm()}});
  arm();
}

/* שורת הסכמה — רק כש-data-consent="ask" */
var TXT={
  he:{dir:"rtl",t:"האתר סופר ביקורים באופן אנונימי, בלי עוגיות ובלי מידע אישי. מסכימים?",y:"מסכים/ה",n:"לא"},
  ar:{dir:"rtl",t:"يعدّ الموقع الزيارات بشكل مجهول، بلا كوكيز وبلا معلومات شخصية. هل توافق؟",y:"أوافق",n:"لا"},
  ru:{dir:"ltr",t:"Сайт считает посещения анонимно, без cookie и без личных данных. Согласны?",y:"Согласен",n:"Нет"},
  en:{dir:"ltr",t:"This site counts visits anonymously, with no cookies and no personal data. Is that OK?",y:"OK",n:"No"}
};
function askConsent(){
  var l=(document.documentElement.lang||"he").toLowerCase().split("-")[0]; if(l==="iw")l="he";
  var t=TXT[l]||TXT.he;
  var bar=document.createElement("div");
  bar.setAttribute("role","dialog"); bar.setAttribute("aria-live","polite"); bar.dir=t.dir;
  bar.style.cssText="position:fixed;inset-inline:0;bottom:0;z-index:2147482000;background:#111827;color:#fff;"+
    "padding:12px 16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:center;"+
    "font:16px/1.5 system-ui,'Segoe UI',Arial,sans-serif";
  var p=document.createElement("span"); p.textContent=t.t;
  function btn(label,val){
    var b=document.createElement("button"); b.type="button"; b.textContent=label;
    b.style.cssText="font:inherit;font-weight:700;min-height:44px;padding:0 18px;border-radius:10px;cursor:pointer;"+
      (val==="yes"?"background:#fff;color:#111827;border:0":"background:none;color:#fff;border:1px solid #9ca3af");
    b.onclick=function(){lsSet(CONSENT_KEY,val);bar.remove();if(val==="yes")measure()};
    return b;
  }
  bar.appendChild(p); bar.appendChild(btn(t.y,"yes")); bar.appendChild(btn(t.n,"no"));
  document.body.appendChild(bar);
}

function start(){
  if(consent==="ask"){
    var c=ls(CONSENT_KEY);
    if(c==="yes")measure(); else if(c!=="no")askConsent();
    return;
  }
  measure();
}
/* רק אחרי שהדף נטען — המדידה לעולם לא מתחרה בטעינה */
if(document.readyState==="complete")setTimeout(start,0);
else window.addEventListener("load",function(){setTimeout(start,0)});
})();
