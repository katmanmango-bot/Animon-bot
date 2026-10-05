const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running! QR will show in Render Logs.'));

app.listen(PORT, () => console.log(`Server on ${PORT}`));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('>>>>>>>> SCAN THIS QR WITH WHATSAPP <<<<<<<<');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ ANIMON CONNECTED!');
        }
    });

    // Animon message handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
        if (text.toLowerCase() === '.animon') {
            await sock.sendMessage(m.key.remoteJid, { text: '🔥 Animon Bot Online! Dr.k' });
        }
    });
}

startBot();
