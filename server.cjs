const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const TYPES = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/favicon.ico'){res.writeHead(204);return res.end();}
  if(pathname==='/')pathname='/index.html';
  // Only files inside this folder, only known types, nothing hidden.
  const file=path.join(__dirname,pathname),type=TYPES[path.extname(file)];
  if(!type||!file.startsWith(__dirname+path.sep)||pathname.split('/').some(part=>part.startsWith('.'))){res.writeHead(404);return res.end('Not found');}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404);return res.end('Not found');}
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(res);
  });
}).listen(4173,'127.0.0.1',()=>console.log('Room preview: http://127.0.0.1:4173'));
