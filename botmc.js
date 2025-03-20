const mineflayer = require('mineflayer');
const Socks5Client = require('socks5-https-client');
const fs = require('fs');

const SERVER_HOST = 'your.server.ip'; // Thay đổi thành IP hoặc domain của server
const SERVER_PORT = 25565; // Port của server
const BOT_COUNT = 1000; // Số bot cần join
const MINECRAFT_VERSION = '1.18.1'; // Phiên bản Minecraft

// Đọc danh sách proxy từ file proxy_socks5.txt
const proxyList = fs.readFileSync('proxy_socks5.txt', 'utf8').split('\n').map(line => line.trim()).filter(line => line);

if (proxyList.length < BOT_COUNT) {
    console.error("Không đủ proxy trong file proxy_socks5.txt");
    process.exit(1);
}

// Hàm tạo bot
function createBot(username, proxy) {
    const [proxyHost, proxyPort] = proxy.split(':');

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: username,
        version: MINECRAFT_VERSION,
        connect: client => {
            client.setSocket(new Socks5Client.Socks5ClientSocket({
                socksHost: proxyHost,
                socksPort: parseInt(proxyPort),
                destinationHost: SERVER_HOST,
                destinationPort: SERVER_PORT
            }));
            client.emit('connect');
        }
    });

    bot.on('login', () => {
        console.log(`${username} đã vào server!`);
        startChatLoop(bot);
    });

    bot.on('error', err => {
        console.error(`${username} gặp lỗi:`, err.message);
        reconnect(username, proxy);
    });

    bot.on('end', () => {
        console.log(`${username} đã bị kick hoặc mất kết nối.`);
        reconnect(username, proxy);
    });

    return bot;
}

// Hàm gửi tin nhắn liên tục
function startChatLoop(bot) {
    setInterval(() => {
        if (bot && bot.chat) {
            bot.chat('đm sv như cái đầu buồi');
        }
    }, 1000); // Gửi tin nhắn mỗi giây
}

// Hàm tự động rejoin bot
function reconnect(username, proxy) {
    setTimeout(() => {
        console.log(`Đang thử kết nối lại cho ${username}...`);
        createBot(username, proxy);
    }, 5000); // Đợi 5 giây rồi rejoin
}

// Khởi tạo 20 bot
for (let i = 0; i < BOT_COUNT; i++) {
    const username = `Bot_${Math.floor(Math.random() * 10000)}`;
    createBot(username, proxyList[i % proxyList.length]);
}
