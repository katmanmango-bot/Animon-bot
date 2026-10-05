require('http').createServer((_,r)=>r.end('Animon Bot Online')).listen(process.env.PORT||3000);
const http = require('http');
http.createServer((req,res)=>{res.writeHead(200);res.end("Animon Bot is Live");}).listen(process.env.PORT || 10000);
