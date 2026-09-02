const fs=require('fs'),vm=require('vm');
const files=process.argv.slice(2);
let bad=0;
for(const f of files){
  const src=fs.readFileSync(f,'utf8');
  /* קובץ js חיצוני אינו נושא תגיות script, ולכן הסריקה למטה לא
     מוצאת בו דבר ומדווחת "0 parse failures" בלי לפרוס שורה אחת.
     כך עברה bagrut-806 — האפליקציה הרב-קבצית היחידה בריפו —
     בדיקת פרסינג ריקה על ארבעת קובצי ה-js שלה. קובץ js נפרס במלואו. */
  if(/\.(m|c)?js$/i.test(f)){
    try{ new vm.Script(src,{filename:f}); console.log(`${f}: js file, 0 parse failures`); }
    catch(e){ bad++; console.log(`PARSE FAIL ${f}: ${e.message}`); }
    continue;
  }
  const re=/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
  let m,i=0,b=0;
  while((m=re.exec(src))){
    const attrs=m[1]||'';
    if(/\bsrc\s*=/.test(attrs))continue;
    if(/type\s*=\s*["'](?!text\/javascript|module|application\/javascript)/i.test(attrs))continue;
    i++;
    const code=m[2];
    const line=src.slice(0,m.index).split('\n').length;
    try{ new vm.Script(code,{filename:f}); }
    catch(e){ b++; console.log(`PARSE FAIL ${f} script#${i} (starts line ${line}): ${e.message}`); }
  }
  bad+=b;
  console.log(`${f}: ${i} inline scripts, ${b} parse failures`);
}
process.exit(bad?1:0);
