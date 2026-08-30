const fs=require('fs'),path=require('path');
const out=process.argv[2];
for(const f of process.argv.slice(3)){
  const html=fs.readFileSync(f,'utf8');
  const re=/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
  let m,i=0,parts=[],map=[];
  while((m=re.exec(html))){
    if(/\bsrc\s*=/.test(m[1]||''))continue;
    i++;
    const line=html.slice(0,m.index).split('\n').length;
    map.push({i,line});
    parts.push(m[2]);
  }
  const name=f.replace(/\//g,'_').replace(/\.html$/,'')+'.js';
  fs.writeFileSync(path.join(out,name),parts.join('\n;\n'));
  console.log(name,JSON.stringify(map));
}
