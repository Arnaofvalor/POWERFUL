const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function urlToFilename(url) {
    return url.replace(/[^a-zA-Z0-9]/g, '_');
}

function getCSRFToken(html) {
    const tokenMatch = html.match(/<input.*?name="csrf_token".*?value="(.*?)"/);
    return tokenMatch ? tokenMatch[1] : null;
}

async function scrapeSite(url) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        const requests = [];
        page.on('request', request => {
            requests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers()
            });
            request.continue();
        });

        const responses = [];
        page.on('response', response => {
            response.text().then(body => {
                responses.push({
                    url: response.url(),
                    status: response.status(),
                    headers: response.headers(),
                    protocol: response.protocol(),
                    body: body
                });
            }).catch(err => {
                responses.push({
                    url: response.url(),
                    status: response.status(),
                    headers: response.headers(),
                    protocol: response.protocol(),
                    body: null
                });
            });
        });

        await page.goto(url, { waitUntil: 'networkidle2' });

        const cookies = await page.cookies();
        const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

        const html = await page.content();
        const csrfToken = getCSRFToken(html);

        const turnstileInput = await page.$('input[name="cf-turnstile-response"]');
        let turnstileToken = null;
        if (turnstileInput) {
            turnstileToken = await (await turnstileInput.getProperty('value')).jsonValue();
        }

        const pageTitle = await page.title();
        const additionalInfo = await page.evaluate(() => {
            return {
                h1Text: document.querySelector('h1') ? document.querySelector('h1').innerText : null,
                metaDescription: document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').getAttribute('content') : null,
            };
        });

        await browser.close();
        return {
            cookies,
            csrfToken,
            turnstileToken,
            requests,
            responses,
            pageTitle,
            additionalInfo
        };

    } catch (error) {
        console.error(`[Error] Failed to scrape site: ${error.message}`);
        return null;
    }
}

function saveToFile(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[Info] Data saved to ${filename}`);
}

(async () => {
    if (process.argv.length < 3) {
        console.log(`Usage: node Site-Infomation.js <Target-Url>
Example: node Site+Infomation.js https://example.com`);
        process.exit(1);
    }

    const targetUrl = process.argv[2];
    const outputFilename = path.join(__dirname, `${urlToFilename(targetUrl)}.json`);

    const result = await scrapeSite(targetUrl);
    if (result) {
        saveToFile(outputFilename, result);
    }
})();
