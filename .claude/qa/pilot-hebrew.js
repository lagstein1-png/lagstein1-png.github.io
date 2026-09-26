#!/usr/bin/env node
'use strict';
// Isolated Hebrew audio trial. No repository writes or publication.
const fs = require('fs'), path = require('path'), os = require('os');
const {spawnSync} = require('child_process');
const ROOT = path.resolve(__dirname, '../..');
require(path.join(ROOT, 'speech/recorded.js'));
require(path.join(ROOT, 'tutor/he-speech.js'));
const R = globalThis.RECORDED, H = globalThis.HESPEECH;
const LIST = require('./pilot-hebrew-list.json');
const APPS = ['english','history','ulpan','lomda'];
const SOURCES = {english:['english/index.html'],history:['history/index.html'],ulpan:['ulpan/index.html'],lomda:fs.readdirSync(path.join(ROOT,'lomda/data')).filter(f=>f.endsWith('.js')).sort().map(f=>'lomda/data/'+f)};
const MODEL = 'gemini-3.1-flash-tts-preview', VOICE = 'Kore';
// Paid standard rate, not an invoice. A 50s/1250-token response maximum
// plus the model's 8192 input-token limit reserves $0.0332 per call.
const MAX_OUTPUT_TOKENS = 1250, INPUT_TOKEN_LIMIT = 8192;
const MAX_COST_USD = 0.50, RESERVED_CALL_USD = INPUT_TOKEN_LIMIT / 1e6 + MAX_OUTPUT_TOKENS * 20 / 1e6;
function costOf(usage) {
  const input = usage.promptTokenCount, output = usage.candidatesTokenCount;
  if (!Number.isInteger(input) || input < 0 || input > INPUT_TOKEN_LIMIT ||
      !Number.isInteger(output) || output < 0 || output > MAX_OUTPUT_TOKENS)
    throw Error('Missing or unexpected token usage; stop before next call');
  return input / 1e6 + output * 20 / 1e6;
}

const key = process.env.GEMINI_API_KEY;
const OUT = process.env.RUNNER_TEMP ? path.join(process.env.RUNNER_TEMP,'hebrew-pilot') : path.join(os.tmpdir(),'bekol-hebrew-pilot');
function plain(h){return String(h||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function unquote(raw){try{return JSON.parse('"'+raw+'"')}catch{return raw.replace(/\\"/g,'"')}}
function corpus(app){const seen=new Map();for(const f of SOURCES[app]){const s=fs.readFileSync(path.join(ROOT,f),'utf8');for(const m of s.matchAll(/\bhe\s*:\s*"((?:[^"\\]|\\.)*)"/g)){const text=plain(unquote(m[1]));if(!/[א-ת]/.test(text)||text.split(' ').length<2)continue;const id=R.id(text);if(!seen.has(id))seen.set(id,text)}}return seen}
function validate(){if(LIST.length!==32)throw Error('Expected exactly 32 clips');const seen=new Set();for(const app of APPS){const c=corpus(app);const selected=LIST.filter(x=>x.app===app);if(selected.length!==8)throw Error('Expected 8 in '+app);for(const {id,text} of selected){if(id!==R.id(text)||c.get(id)!==text||seen.has(app+'/'+id))throw Error('Corpus mismatch or duplicate '+app+'/'+id);if(fs.existsSync(path.join(ROOT,app,'audio/he',id+'.mp3')))throw Error('Already recorded '+app+'/'+id);seen.add(app+'/'+id)}}return true}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function synth(text){const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+MODEL+':generateContent', {method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:H.spoken(text)}]}],generationConfig:{maxOutputTokens:MAX_OUTPUT_TOKENS,responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:VOICE}}}}})});if(!response.ok){throw Error('Gemini status '+response.status)}const j=await response.json();const p=j.candidates?.[0]?.content?.parts?.find(x=>x.inlineData)?.inlineData;if(!p?.data)throw Error('Missing audio');const rate=Number(/rate=(\d+)/.exec(p.mimeType||'')?.[1])||24000;return {pcm:Buffer.from(p.data,'base64'),rate,usage:j.usageMetadata||{}}}
function mp3(pcm,rate){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-f','s16le','-ar',String(rate),'-ac','1','-i','pipe:0','-ac','1','-b:a','32k','-f','mp3','pipe:1'],{input:pcm,maxBuffer:8*1024*1024});if(r.status!==0)throw Error('ffmpeg failed');if(r.stdout.length<512)throw Error('MP3 too small');return r.stdout}
async function main(){validate();console.log('Validated 32 exact missing corpus clips (8 each), '+LIST.reduce((n,x)=>n+x.text.length,0)+' display characters. Model '+MODEL+', voice '+VOICE+'.');if(process.argv.includes('--check'))return;if(!key)throw Error('No Gemini key');fs.mkdirSync(OUT,{recursive:true});let completed=0,spent=0;const report={model:MODEL,voice:VOICE,modelOutputTokenLimit:MAX_OUTPUT_TOKENS,estimatedCostUsd:spent,clips:[]};for(const item of LIST){if(spent + RESERVED_CALL_USD > MAX_COST_USD){console.error('Stopped before next request: conservative cost reserve would cross $'+MAX_COST_USD);process.exitCode=1;break}try{const {pcm,rate,usage}=await synth(item.text);const charge=costOf(usage);spent+=charge;report.estimatedCostUsd=Number(spent.toFixed(6));const audio=mp3(pcm,rate);const dir=path.join(OUT,item.app);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,item.id+'.mp3'),audio);report.clips.push({app:item.app,id:item.id,text:item.text,spoken:H.spoken(item.text),bytes:audio.length,estimatedCostUsd:Number(charge.toFixed(6)),usage});completed++;console.log('Clip '+completed+'/32 '+item.app+'/'+item.id+' '+audio.length+' bytes; cumulative estimated USD '+spent.toFixed(4)+'; usage '+JSON.stringify(usage));fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2)+'\n')}catch(e){console.error('Stopped at '+item.app+'/'+item.id+': '+e.message);process.exitCode=1;break}if(completed<32)await sleep(14000)}console.log('Made '+completed+'/32 clips; successful-response metered estimate $'+spent.toFixed(4)+' (limit $'+MAX_COST_USD+'). Artifact directory '+OUT)}
main().catch(e=>{console.error(e.message);process.exitCode=1});
