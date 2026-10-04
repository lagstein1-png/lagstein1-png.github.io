/* Read-aloud. Female voice only. Word highlight follows the voice (boundary events, with a timer fallback). */
var SP={tok:0,playing:false,noVoice:false,timers:[]};
/* המילון המשותף (כמו math-app), בתוספת /i — כאן בודקים את v.name כמו שהוא. voice.js, 3.10.2026 */
var VOICE_M=/(google[^a-z]{0,15}(arabic|العربية)|אברי|אסף|حامد|ماجد|طارق|ناصر|بسام|дмитрий|павел|юрий|максим|николай|\bmale\b|\bman\b|#male|asaf|avri|yoni|moshe|\balex\b|daniel|\bfred\b|\btom\b|aaron|arthur|oliver|rishi|gordon|\blee\b|ralph|bruce|david|\bmark\b|\bguy\b|ryan|christopher|\beric\b|brian|andrew|roger|steffan|liam|william|george|james|\bthomas\b|benjamin|brandon|\bjason\b|\btony\b|dmitry|pavel|\byuri\b|artemi|maxim|nikolai|maged|tarik|naayf|hamed|shakir|\bomar\b|tarek|\bali\b|bassel|\bmoaz\b|hamdan|saleh|abdullah|\btaim\b|fahed|rakan|yasser|hemant|madhur|prabhat)/i;
var VOICE_F=/(הילה|כרמית|زارية|سلمى|أمينة|امينة|هدى|فاطمة|ليلى|نورا|светлана|дарья|ирина|екатерина|татьяна|елена|female|woman|#female|\bfem\b|carmit|hila|\bmiri\b|\bdana\b|shira|samantha|karen|moira|tessa|serena|victoria|\bava\b|allison|susan|vicki|nicky|\bzoe\b|fiona|\bkate\b|shelley|zira|hazel|aria|jenny|michelle|\bana\b|\beva\b|emma|libby|sonia|natasha|clara|\bamber\b|ashley|\bcora\b|elizabeth|monica|\bsara\b|\bsarah\b|\bjane\b|\bnancy\b|\bluna\b|\bmolly\b|irina|milena|svetlana|dariya|\belena\b|katja|ekaterina|\bkatya\b|tatyana|\balena\b|hoda|salma|zariyah|amina|\bhala\b|noura|laila|layla|fatima|zeina|\biman\b|\brana\b|\bsana\b|maryam|asma|heera|raveena|swara|neerja)/i;
function allVoices(){try{return speechSynthesis.getVoices()||[]}catch(e){return[]}}
function voiceFor(lang){
  var code=LANG_TTS[lang].toLowerCase(), pre=code.slice(0,2);
  var vs=allVoices().filter(function(v){var l=(v.lang||"").toLowerCase().replace("_","-");return l.indexOf(pre)===0});
  var ok=vs.filter(function(v){return !VOICE_M.test(v.name)});
  var f=ok.filter(function(v){return VOICE_F.test(v.name)});
  return (f[0]||ok[0]||null);   /* all-male device: null, default voice + raised pitch */
}
function mk(text){
  var toks=String(text).split(/\s+/).filter(Boolean), parts=[], html=[];
  toks.forEach(function(tk){
    var clean=tk.replace(/_+/g,"");
    var disp=tk.replace(/_+/g,'<span class="blank"></span>');
    if(/[\u0590-\u05FFa-zA-Z\u0400-\u04FF\u0600-\u06FF0-9]/.test(clean)){parts.push(clean);html.push('<span class="w">'+disp+'</span>')}
    else html.push(disp);
  });
  return {html:html.join(" "),spoken:parts.join(" ")};
}
function clearHl(){
  SP.timers.forEach(clearTimeout);SP.timers=[];
  [].forEach.call(document.querySelectorAll(".w.hl,.opt.hl,.card.hl"),function(e){e.classList.remove("hl")});
}
function stopSpeech(){
  SP.tok++;SP.playing=false;clearHl();
  try{speechSynthesis.cancel()}catch(e){}
  try{if(typeof RECORDED!=="undefined")RECORDED.stop()}catch(e){}
  var p=document.getElementById("playBtn");if(p)p.classList.remove("on");
}
function rate(){return state.slow?0.62:(state.speed==="slow"?0.75:0.92)}
/* segs: [{t, lang, el:'#id' (words inside get highlighted), box:'#id' (whole element highlighted)}] */
function speakSeq(segs,done){
  stopSpeech();
  if(!("speechSynthesis" in window)){SP.noVoice=true;return}
  var tok=SP.tok,i=0;SP.playing=true;
  var pb=document.getElementById("playBtn");if(pb)pb.classList.add("on");
  (function next(){
    if(tok!==SP.tok)return;
    if(i>=segs.length){SP.playing=false;clearHl();if(pb)pb.classList.remove("on");if(done)done();return}
    var s=segs[i++];
    if(!s.t){next();return}
    speakOne(s,tok,next);
  })();
}
function speakOne(s,tok,cb){
  var root=s.el?document.querySelector(s.el):null, ws=root?root.querySelectorAll(".w"):[];
  var box=s.box?document.querySelector(s.box):null; if(box)box.classList.add("hl");
  var words=s.t.split(/\s+/).filter(Boolean), cur=-1, got=false, finished=false;
  function hl(k){if(k===cur||!ws[k])return;if(ws[cur])ws[cur].classList.remove("hl");cur=k;ws[k].classList.add("hl");
    try{ws[k].scrollIntoView({block:"nearest"})}catch(e){}}
  function fin(){if(finished)return;finished=true;SP.timers.forEach(clearTimeout);SP.timers=[];if(ws[cur])ws[cur].classList.remove("hl");if(box)box.classList.remove("hl");if(tok===SP.tok)cb()}
  /* layer 1: recorded file (speech/recorded.js), Hebrew only. A file exists only for text that record.js recorded exactly;
     no file or a failed file falls back to the device voice below. No word highlight on a file (no boundary events). */
  function device(){
    if(finished||tok!==SP.tok)return;
    var starts=[],p=0;
    words.forEach(function(w){var k=s.t.indexOf(w,p);starts.push(k);p=k+w.length});
    var u=new SpeechSynthesisUtterance(s.t);
    u.lang=LANG_TTS[s.lang||"he"];var v=voiceFor(s.lang||"he");
    if(v)u.voice=v;else u.pitch=1.25;
    u.rate=rate();
    u.onboundary=function(e){
      if(tok!==SP.tok)return; if(e.name&&e.name!=="word")return; got=true;
      var k=0;for(var j=0;j<starts.length;j++){if(starts[j]<=e.charIndex)k=j}hl(k);
    };
    u.onend=fin;u.onerror=fin;
    /* fallback: no boundary events (some Android voices). Estimate word timing. */
    if(ws.length){
      SP.timers.push(setTimeout(function(){
        if(got||tok!==SP.tok)return;
        var per=Math.max(260,(s.t.length*72/u.rate)/Math.max(1,words.length));
        words.forEach(function(_,k){SP.timers.push(setTimeout(function(){if(!got&&tok===SP.tok)hl(k)},k*per))});
      },700));
    }
    try{speechSynthesis.resume()}catch(e){}
    speechSynthesis.speak(u);
  }
  if((s.lang||"he")==="he"&&typeof RECORDED!=="undefined"){
    try{speechSynthesis.cancel()}catch(e0){}
    var ok=false;
    try{ok=RECORDED.play(s.raw||s.t,"he",{rate:rate(),onEnd:fin,onError:device})}catch(e1){ok=false}
    if(ok)return;
  }
  device();
}
