import requests
from bs4 import BeautifulSoup
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse

# Mengambil input dari pengguna untuk halaman awal dan akhir
start_page = int(input("Masukkan halaman awal: "))
end_page = int(input("Masukkan halaman akhir: "))
max_threads = int(input("Masukkan jumlah maksimum thread: "))

# Base URL halaman arsip tanpa parameter halaman
base_url = "https://haxor.id/archive?page="

# Set untuk menyimpan semua domain yang ditemukan (menggunakan set untuk menghindari duplikasi)
all_domains = set()

# Daftar User-Agent
user_agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3599.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36 OPR/68.0.3618.165",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36 OPR/68.0.3618.165",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36 OPR/68.0.3618.165",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36 OPR/68.0.3618.165",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/83.0.4103.88 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/83.0.4103.88 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPod; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/83.0.4103.88 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.101 Mobile Safari/537.36",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; Xbox)",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; Xbox)",
    "Mozilla/5.0(compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; Xbox)"
]

# Fungsi untuk mengambil dan memproses data dari satu halaman
def fetch_data(page_num):
    url = f"{base_url}{page_num}"
    headers = {'User-Agent': random.choice(user_agents)}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Memeriksa apakah permintaan berhasil
    except requests.RequestException as e:
        print(f"Request error di halaman {page_num}: {e}")
        return set()

    html_content = response.text
    soup = BeautifulSoup(html_content, 'html.parser')
    links = soup.find_all('a', href=True)
    page_domains = set()
    for link in links:
        href = link['href']
        if href.startswith(('http://', 'https://')):
            parsed_url = urlparse(href)
            domain = parsed_url.netloc
            page_domains.add(domain)
    return page_domains

# Menggunakan ThreadPoolExecutor untuk mengatur threading
with ThreadPoolExecutor(max_workers=max_threads) as executor:
    # Mendaftarkan tugas ke executor
    future_to_page = {executor.submit(fetch_data, page_num): page_num for page_num in range(start_page, end_page + 1)}
    
    for future in as_completed(future_to_page):
        page_num = future_to_page[future]
        try:
            domains = future.result()
            all_domains.update(domains)
        except Exception as e:
            print(f"Error di halaman {page_num}: {e}")

# Menyimpan semua domain yang ditemukan ke dalam file list.txt
with open('list.txt', 'w') as file:
    for domain in sorted(all_domains):
        file.write(domain + '\n')

print(f"Domain telah disimpan dalam list.txt, total: {len(all_domains)} domain.")
