const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let clientSocket = null;

io.on('connection', socket => {
    console.log('Bir istemci bağlandı.');
    clientSocket = socket;

    socket.on('screenshot-data', (data) => {
        const buffer = Buffer.from(data, 'base64');
        const filename = `screenshot_${Date.now()}.png`;
        fs.writeFileSync(filename, buffer);
        console.log(`Ekran görüntüsü kaydedildi: ${filename}`);
    });

    socket.on('disconnect', () => {
        console.log('İstemci bağlantısı kesildi.');
    });
});

// Komut gönderme
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function komutSor() {
    readline.question('Komut girin (screenshot/shutdown): ', komut => {
        if (clientSocket) {
            clientSocket.emit('komut', komut);
        } else {
            console.log("İstemci bağlı değil.");
        }
        komutSor();
    });
}

server.listen(3000,"192.168.1.153" ,() => {
    const address = server.address();
    console.log('Sunucu 3000 portunda çalışıyor...');
    console.log(`Sunucu ${address.address} adresinde ${address.port} portunda çalışıyor...`);
    komutSor();
});
