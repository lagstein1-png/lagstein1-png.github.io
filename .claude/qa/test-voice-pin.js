const { chromium } = require('playwright');

const VOICES = {
  hila: { name:'Microsoft Hila - Hebrew (Israel)', lang:'he-IL', voiceURI:'uri-hila', localService:false, default:false },
  asaf: { name:'Microsoft Asaf - Hebrew (Israel)', lang:'he-IL', voiceURI:'uri-asaf', localService:true,  default:false },
};
const INIT = `
window.__vl = [${JSON.stringify(VOICES.asaf)}, ${JSON.stringify(VOICES.hila)}];
if(!window.speechSynthesis){
  const t = new EventTarget();
  window.speechSynthesis = { speaking:false, pending:false, paused:false,
    getVoices(){ return window.__vl },
    addEventListener:(...a)=>t.addEventListener(...a),
    dispatchEvent:(...a)=>t.dispatchEvent(...a),
    cancel(){}, speak(){}, pause(){}, resume(){} };
} else {
  speechSynthesis.getVoices = function(){ return window.__vl };
}
navigator.onLine = true;
`;

(async()=>{
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const fails = [];
  const ok = (name,cond)=>{ console.log((cond?'PASS':'FAIL')+' '+name); if(!cond) fails.push(name); };

  await page.addInitScript(INIT);
  await page.goto('http://127.0.0.1:8099/ulpan/');
  await page.waitForTimeout(800);

  const r1 = await page.evaluate(()=>{
    const out = {};
    // 1) gender-first + pin: female network voice wins and is pinned
    let v = bestVoice('he');
    out.first = v && v.voiceURI;
    // 2) network dies: pinned voice unusable -> single switch to usable male, re-pinned
    window._netVoiceOK = false;
    v = bestVoice('he');
    out.afterDeath = v && v.voiceURI;
    // 3) network returns: must NOT flip back to female
    window._netVoiceOK = true;
    v = bestVoice('he');
    out.afterReturn = v && v.voiceURI;
    // 4) late voiceschanged (past settle window): pins must hold
    window._voiceBornAt = Date.now() - 60000;
    speechSynthesis.dispatchEvent(new Event('voiceschanged'));
    v = bestVoice('he');
    out.afterLateVC = v && v.voiceURI;
    // 5) early voiceschanged (settle window): pins may clear -> female re-picked
    window._voiceBornAt = Date.now();
    speechSynthesis.dispatchEvent(new Event('voiceschanged'));
    v = bestVoice('he');
    out.afterEarlyVC = v && v.voiceURI;
    // 6) manual pick beats pin
    state.devVoice = { he: 'uri-asaf' };
    v = bestVoice('he');
    out.manual = v && v.voiceURI;
    // 7) manual removed -> pin was deleted by setter path? emulate handler
    state.devVoice = {};
    window._voicePin = {};
    v = bestVoice('he');
    out.afterManualCleared = v && v.voiceURI;
    return out;
  });
  console.log(JSON.stringify(r1,null,2));
  ok('ulpan first pick = female (gender-first)', r1.first==='uri-hila');
  ok('ulpan single switch on death', r1.afterDeath==='uri-asaf');
  ok('ulpan NO flip-back on return', r1.afterReturn==='uri-asaf');
  ok('ulpan pins hold past settle window', r1.afterLateVC==='uri-asaf');
  ok('ulpan settle window re-picks', r1.afterEarlyVC==='uri-hila');
  ok('ulpan manual pick beats pin', r1.manual==='uri-asaf');
  ok('ulpan re-pick after manual cleared', r1.afterManualCleared==='uri-hila');

  // --- tutor.js engine ---
  await page.goto('http://127.0.0.1:8099/');
  await page.waitForTimeout(300);
  await page.evaluate(async ()=>{
    let src = await (await fetch('/tutor/tutor.js')).text();
    src = src.replace('g.TUTOR = {',
      'g.__test = { pickVoice: pickVoice, setVoice: setVoice,'
      + ' _net: function(b){ _netVoiceOK = b },'
      + ' _setBorn: function(t){ _voiceBornAt = t },'
      + ' _pins: function(){ return Object.assign({}, pickVoice._pin || {}) } };\n'
      + 'g.TUTOR = {');
    (0,eval)(src);
  });
  const r2 = await page.evaluate(()=>{
    const T = window.__test;
    const out = {};
    let v = T.pickVoice('he-IL');
    out.first = v && v.voiceURI;
    T._net(false);
    v = T.pickVoice('he-IL');
    out.afterDeath = v && v.voiceURI;
    T._net(true);
    v = T.pickVoice('he-IL');
    out.afterReturn = v && v.voiceURI;
    T._setBorn(Date.now() - 60000);
    speechSynthesis.dispatchEvent(new Event('voiceschanged'));
    v = T.pickVoice('he-IL');
    out.afterLateVC = v && v.voiceURI;
    T._setBorn(Date.now());
    speechSynthesis.dispatchEvent(new Event('voiceschanged'));
    v = T.pickVoice('he-IL');
    out.afterEarlyVC = v && v.voiceURI;
    T.setVoice('he-IL','uri-asaf');
    v = T.pickVoice('he-IL');
    out.manual = v && v.voiceURI;
    T.setVoice('he-IL','');
    v = T.pickVoice('he-IL');
    out.afterManualCleared = v && v.voiceURI;
    return out;
  });
  console.log(JSON.stringify(r2,null,2));
  ok('tutor first pick = female (gender-first)', r2.first==='uri-hila');
  ok('tutor single switch on death', r2.afterDeath==='uri-asaf');
  ok('tutor NO flip-back on return', r2.afterReturn==='uri-asaf');
  ok('tutor pins hold past settle window', r2.afterLateVC==='uri-asaf');
  ok('tutor settle window re-picks', r2.afterEarlyVC==='uri-hila');
  ok('tutor manual pick beats pin', r2.manual==='uri-asaf');
  ok('tutor re-pick after manual cleared', r2.afterManualCleared==='uri-hila');

  await browser.close();
  console.log(fails.length? ('FAILURES: '+fails.join(', ')) : 'ALL PASS');
  process.exit(fails.length?1:0);
})();
