/* שרת סטטי לבדיקות מקומיות. משרת את שורש הריפו על 127.0.0.1:8099.
   node .claude/qa/serve.js   (מהשורש) */
const http=require('http'),fs=require('fs'),path=require('path'),url=require('url');
const root=process.cwd();
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8',
  '.json':'application/json;charset=utf-8','.png':'image/png','.svg':'image/svg+xml',
  '.css':'text/css','.mp3':'audio/mpeg','.webp':'image/webp','.ico':'image/x-icon'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(url.parse(req.url).pathname), f=path.join(root,p);
  try{
    if(fs.statSync(f).isDirectory()){
      /* תיקייה בלי לוכסן בסוף מקבלת הפניה, בדיוק כמו ב-GitHub Pages.
         בלי זה הדפדפן פותר נתיב יחסי כמו data/exams.js מול ההורה
         ומקבל 404 — תקלה שאינה קיימת בייצור, ולכן היא מטעה פעמיים. */
      if(!p.endsWith('/')){
        res.writeHead(301,{Location:p+'/'});
        return res.end();
      }
      f=path.join(f,'index.html');
    }
  }
  catch(e){ res.writeHead(404); return res.end('not found') }
  fs.readFile(f,(e,d)=>{
    if(e){res.writeHead(404);return res.end('not found')}
    res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});
    res.end(d);
  });
}).listen(8099,'127.0.0.1',()=>console.log('serving '+root+' on http://127.0.0.1:8099'));
