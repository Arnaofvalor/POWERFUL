const mineflayer = require('mineflayer');
const { SocksClient } = require('socks5-client');
const fs = require('fs');

const SERVER_HOST = 'your.server.ip'; // Thay đổi IP hoặc domain server
const SERVER_PORT = 25565; // Port server
const BOT_COUNT = 20; // Số bot cần join
const MINECRAFT_VERSION = '1.18.1'; // Phiên bản Minecraft

// Đọc danh sách proxy từ file proxy_socks5.txt
const proxyList = fs.readFileSync('proxy_socks5.txt', 'utf8').split('\n').map(line => line.trim()).filter(line => line);

if (proxyList.length < BOT_COUNT) {
    console.error("Không đủ proxy trong file proxy_socks5.txt");
    process.exit(1);
}

// Hàm tạo bot với SOCKS5 proxy
function createBot(username, proxy) {
    const [proxyHost, proxyPort] = proxy.split(':');

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: username,
        version: MINECRAFT_VERSION,
        connect: (client) => {
            SocksClient.createConnection({
                proxy: {
                    host: proxyHost,
                    port: parseInt(proxyPort),
                    type: 5,
                },
                command: 'connect',
                destination: {
                    host: SERVER_HOST,
                    port: SERVER_PORT,
                },
            })
                .then((info) => {
                    client.setSocket(info.socket);
                    client.emit('connect');
                })
                .catch((err) => {
                    console.error(`${username} không thể kết nối qua proxy:`, err.message);
                    reconnect(username, proxy);
                });
        },
    });

    bot.on('login', () => {
        console.log(`${username} đã vào server!`);
        startChatLoop(bot);
    });

    bot.on('error', (err) => {
        console.error(`${username} gặp lỗi:`, err.message);
        reconnect(username, proxy);
    });

    bot.on('end', () => {
        console.log(`${username} bị kick hoặc mất kết nối.`);
        reconnect(username, proxy);
    });

    return bot;
}

// Hàm gửi tin nhắn liên tục
function startChatLoop(bot) {
    setInterval(() => {
        if (bot && bot.chat) {
            bot.chat('hello');
        }
    }, 1000);
}

// Hàm tự động rejoin bot
function reconnect(username, proxy) {
    setTimeout(() => {
        console.log(`Thử kết nối lại cho ${username}...`);
        createBot(username, proxy);
    }, 5000);
}

// Khởi tạo bot
for (let i = 0; i < BOT_COUNT; i++) {
    const username = `Bot_${Math.floor(Math.random() * 10000)}`;
    createBot(username, proxyList[i % proxyList.length]);
}
