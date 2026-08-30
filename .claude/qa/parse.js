const fs=require('fs'),vm=require('vm');
const files=process.argv.slice(2);
for(const f of files){
  const html=fs.readFileSync(f,'utf8');
  const re=/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
  let m,i=0,bad=0;
  while((m=re.exec(html))){
    const attrs=m[1]||'';
    if(/\bsrc\s*=/.test(attrs))continue;
    if(/type\s*=\s*["'](?!text\/javascript|module|application\/javascript)/i.test(attrs))continue;
    i++;
    const code=m[2];
    const line=html.slice(0,m.index).split('\n').length;
    try{ new vm.Script(code,{filename:f}); }
    catch(e){ bad++; console.log(`PARSE FAIL ${f} script#${i} (starts line ${line}): ${e.message}`); }
  }
  console.log(`${f}: ${i} inline scripts, ${bad} parse failures`);
}
