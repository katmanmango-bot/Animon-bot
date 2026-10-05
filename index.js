const http = require('http');
http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end("<h1>Animon Bot is LIVE ✅</h1><p>Go to Render Dashboard > Logs for Pair Code</p>");
}).listen(process.env.PORT || 10000);
console.log("WEB SERVER LIVE on port", process.env.PORT || 10000);
