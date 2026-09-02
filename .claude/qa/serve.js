/* שרת סטטי לבדיקות מקומיות. משרת את שורש הריפו על 127.0.0.1:8099.
   node .claude/qa/serve.js   (מהשורש) */
const http=require('http'),fs=require('fs'),path=require('path'),url=require('url');
const root=process.cwd();
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8',
  '.json':'application/json;charset=utf-8','.png':'image/png','.svg':'image/svg+xml',
  '.css':'text/css','.mp3':'audio/mpeg','.webp':'image/webp','.ico':'image/x-icon',
  '.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.txt':'text/plain;charset=utf-8'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(url.parse(req.url).pathname), f=path.join(root,p);
  let st;
  try{ st=fs.statSync(f) }
  catch(e){ res.writeHead(404); return res.end('not found') }
  if(st.isDirectory()){
    /* GitHub Pages מפנה /dir אל /dir/ ב-301, ובלי ההפניה הזאת כל
       נתיב יחסי בדף נפתר מול השורש: אפליקציה שיש לה app.js משלה
       נראית שבורה בבדיקה בזמן שבאתר החי היא תקינה. */
    if(!p.endsWith('/')){
      res.writeHead(301,{'Location':p+'/'+(url.parse(req.url).search||'')});
      return res.end();
    }
    f=path.join(f,'index.html');
  }
  fs.readFile(f,(e,d)=>{
    if(e){res.writeHead(404);return res.end('not found')}
    res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});
    res.end(d);
  });
}).listen(8099,'127.0.0.1',()=>console.log('serving '+root+' on http://127.0.0.1:8099'));
