const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let clientSocket = null;

// Bağlı istemciler ve ekran görüntüleri için hafıza
let connectedClients = {};
let screenshots = [];

// Socket bağlantısı güncellemesi
io.on('connection', socket => {
    const clientIp = socket.handshake.address;
    connectedClients[socket.id] = { id: socket.id, ip: clientIp };
    console.log('Bir istemci bağlandı.');
    clientSocket = socket;

    socket.on('screenshot-data', (data) => {
        
        const buffer = Buffer.from(data, 'base64');
        const filename = `screenshot_${Date.now()}.png`;
        fs.writeFileSync(path.join(__dirname, 'public', 'screenshots', filename), buffer);
        screenshots.push(filename);
        console.log(`Ekran görüntüsü kaydedildi: ${filename}`);
    });

    socket.on('disconnect', () => {
        delete connectedClients[socket.id];
        console.log('İstemci bağlantısı kesildi.');
    });
});

app.use(express.static('public'));
app.use(express.json());

// Login API (örnek: sabit kullanıcı adı/şifre)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'emre') {
        return res.json({ success: true });
    }
    res.json({ success: false, message: 'Hatalı kullanıcı adı veya şifre.' });
});

// Bağlı istemciler API
app.get('/api/clients', (req, res) => {
    res.json({ clients: Object.values(connectedClients) });
});

// Ekran görüntüleri API
app.get('/api/screenshots', (req, res) => {
    res.json({ screenshots });
});

// Ekran görüntülerini statik sun
app.use('/screenshots', express.static(path.join(__dirname, 'public', 'screenshots')));

// Seçili istemciye komut gönderme API
app.post('/api/send-command', (req, res) => {
    const { clientId, command, nircmdArgs } = req.body;
    const targetSocket = io.sockets.sockets.get(clientId);
    if (targetSocket) {
        if (command === 'nircmd') {
            targetSocket.emit('komut', { type: 'nircmd', args: nircmdArgs });
        } else {
            targetSocket.emit('komut', command);
        }
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'İstemci bulunamadı veya bağlı değil.' });
    }
});

// Komut gönderme
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function komutSor() {
    readline.question('Komut girin (screenshot/shutdown/nircmd): ', komut => {
        if (clientSocket) {
            clientSocket.emit('komut', komut);
        } else {
            console.log("İstemci bağlı değil.");
        }
        komutSor();
    });
}

server.listen(3000, "192.168.1.176", () => {
    const address = server.address();
    console.log('Sunucu 3000 portunda çalışıyor...');
    console.log(`Sunucu ${address.address} adresinde ${address.port} portunda çalışıyor...`);
    komutSor();
});

