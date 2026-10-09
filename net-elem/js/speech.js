/* Recorded voice only. Word timings are estimated from audio progress. */
var SP={tok:0,playing:false,noVoice:false,timers:[]};
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

function clearHl(){SP.timers.forEach(function(x){clearTimeout(x);clearInterval(x)});SP.timers=[];[].forEach.call(document.querySelectorAll(".hl"),function(e){e.classList.remove("hl")})}
function stopSpeech(){SP.tok++;SP.playing=false;clearHl();try{if(typeof RECORDED!=="undefined")RECORDED.stop()}catch(e){}var p=document.getElementById("playBtn");if(p)p.classList.remove("on")}
function rate(){return state.slow?0.62:(state.speed==="slow"?0.75:0.92)}
function speakSeq(segs,done){stopSpeech();var tok=SP.tok,i=0;SP.playing=true;var p=document.getElementById("playBtn");if(p)p.classList.add("on");(function next(){if(tok!==SP.tok)return;if(i>=segs.length){SP.playing=false;clearHl();if(p)p.classList.remove("on");if(done)done();return}var s=segs[i++];if(!s.t){next();return}speakOne(s,tok,next)})();}
function speakOne(s,tok,cb){
  var root=s.el?document.querySelector(s.el):null, ws=root?root.querySelectorAll(".w"):[];
  var box=s.box?document.querySelector(s.box):null; if(box){box.classList.add("hl");if(!root)ws=box.querySelectorAll(".w")}
  var words=s.t.split(/\s+/).filter(Boolean), cur=-1, finished=false, lang=s.lang||"he";

  function hl(k){if(k===cur||!ws[k])return;if(ws[cur])ws[cur].classList.remove("hl");cur=k;ws[k].classList.add("hl");
    }
  function fin(){if(finished)return;finished=true;

    SP.timers.forEach(function(x){clearTimeout(x);clearInterval(x)});SP.timers=[];
    if(ws[cur])ws[cur].classList.remove("hl");if(box)box.classList.remove("hl");
    if(tok===SP.tok)cb()}
  /* Recorded voice only. Missing recordings never switch to another voice. */
  if(typeof RECORDED!=="undefined"){
    var ok=false;
    try{ok=RECORDED.play(s.t,lang,{rate:rate(),onEnd:fin,onError:missing})}catch(e){ok=false}
    if(ok){
      var audio=RECORDED._state&&RECORDED._state.el;
      var timer=setInterval(function(){
        if(tok!==SP.tok||finished){clearInterval(timer);return}
        if(audio&&audio.duration&&isFinite(audio.duration))hl(Math.min(words.length-1,Math.floor(audio.currentTime/audio.duration*words.length)));
      },80);
      SP.timers.push(timer);return;
    }
  }
  missing();
  function missing(){
    SP.noVoice=true;
    var n=document.getElementById("audioNotice");
    if(!n){n=document.createElement("p");n.id="audioNotice";n.className="warn";n.setAttribute("role","status");var m=document.querySelector(".limorbox")||document.querySelector("main");if(m)m.appendChild(n)}
    n.textContent=t("noVoice");fin();
  }
}
