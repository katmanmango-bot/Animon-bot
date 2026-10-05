const http = require('http');
http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end('<h1>Animon Bot LIVE ✅</h1><p>Check Logs for Pair Code</p>');
}).listen(process.env.PORT || 10000);
console.log("WEB SERVER LIVE on", process.env.PORT || 10000);

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const qrcode = require('qrcode-terminal');

let animons = [];
try { animons = JSON.parse(fs.readFileSync('./animons.json','utf8')); } catch(e){ console.log("animons load fail"); }

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level:'silent'}).child({})) },
    logger: pino({level:'silent'}),
    browser: ['Animon-Bot','Chrome','1.0']
  });
  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    const num = (process.env.PHONE_NUMBER || "").replace(/[^0-9]/g,'');
    if (num) {
      setTimeout(async ()=>{
        try {
          const code = await sock.requestPairingCode(num);
          console.log(`\n\n>>>>>>>> PAIRING CODE: ${code} <<<<<<<<\nGo to WhatsApp > Linked Devices > Link with phone number\n\n`);
        } catch(e){ console.log("Pair error", e.message); }
      }, 3000);
    } else {
      console.log("SET PHONE_NUMBER ENV IN RENDER!");
    }
  }

  sock.ev.on('connection.update', (u)=>{
    const { connection } = u;
    if (connection === 'open') console.log("✅ ANIMON CONNECTED!");
    if (connection === 'close') startBot();
  });

  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;
    const txt = (m.message.conversation || m.message.extendedTextMessage?.text || "").trim().toLowerCase();
    const jid = m.key.remoteJid;
    if (txt === '.animon' || txt === '.menu' || txt === 'menu') {
      let list = animons.slice(0,10).map(a=>`${a.id}. ${a.name} (${a.rarity})`).join('\n');
      await sock.sendMessage(jid,{text:`*🎮 Animon Bot*\n\n${list}\n\nUse .catch`});
    }
    if (txt === '.catch' || txt === 'catch') {
      const r = animons[Math.floor(Math.random()*animons.length)];
      await sock.sendMessage(jid,{text:`🎉 You caught *${r.name}*! Rarity: ${r.rarity}`});
    }
  });
}
startBot();
