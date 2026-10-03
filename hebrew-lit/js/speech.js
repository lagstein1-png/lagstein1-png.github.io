/* Read-aloud. Female voice only. Word highlight follows the voice (boundary events, with a timer fallback). */
var SP={tok:0,playing:false,noVoice:false,timers:[]};
var VOICE_M=/(\bmale\b|\bman\b|asaf|avri|אסף|אברי|david|mark\b|guy\b|ryan|george|james|daniel|alex\b|fred|naayf|hamed|maged|tarik|tareq|bassel|pavel|dmitry|dmitri|yuri|maxim|nikolay|ivan|rishi|ravi|thomas|oliver)/i;
var VOICE_F=/(female|woman|hila|carmit|כרמית|הילה|zira|hazel|susan|aria|jenny|libby|sonia|samantha|karen|tessa|moira|victoria|zariyah|hoda|salma|laila|mariam|irina|svetlana|katya|milena|alena|google)/i;
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
  var words=s.t.split(/\s+/).filter(Boolean), starts=[],p=0;
  words.forEach(function(w){var k=s.t.indexOf(w,p);starts.push(k);p=k+w.length});
  var cur=-1,got=false,u=new SpeechSynthesisUtterance(s.t);
  u.lang=LANG_TTS[s.lang||"he"];var v=voiceFor(s.lang||"he");
  if(v)u.voice=v;else u.pitch=1.25;
  u.rate=rate();
  function hl(k){if(k===cur||!ws[k])return;if(ws[cur])ws[cur].classList.remove("hl");cur=k;ws[k].classList.add("hl");
    try{ws[k].scrollIntoView({block:"nearest"})}catch(e){}}
  u.onboundary=function(e){
    if(tok!==SP.tok)return; if(e.name&&e.name!=="word")return; got=true;
    var k=0;for(var j=0;j<starts.length;j++){if(starts[j]<=e.charIndex)k=j}hl(k);
  };
  var finished=false;
  function fin(){if(finished)return;finished=true;SP.timers.forEach(clearTimeout);SP.timers=[];if(ws[cur])ws[cur].classList.remove("hl");if(box)box.classList.remove("hl");if(tok===SP.tok)cb()}
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
