import requests
import concurrent.futures
import re
from tqdm import tqdm

# Danh sách các API proxy
PROXY_APIS = [
    "https://api.proxyscrape.com/?request=getproxies&proxytype=http&country=VN",
    "https://www.proxydocker.com/vi/proxylist/country/Vietnam",
    "https://proxycompass.com/vi/free-proxies/asia/vietnam/",
    "https://fineproxy.org/vi/free-proxies/asia/vietnam/",
    # Thêm các API khác nếu có
]

# Hàm lấy proxy từ API
def fetch_from_apis():
    proxies = set()
    for api in PROXY_APIS:
        try:
            response = requests.get(api, timeout=10)
            if response.status_code == 200:
                # Tùy thuộc vào cấu trúc dữ liệu trả về từ API, cần xử lý phù hợp
                # Ví dụ: nếu API trả về danh sách proxy dạng văn bản
                for line in response.text.splitlines():
                    if re.match(r"^\d+\.\d+\.\d+\.\d+:\d+$", line):
                        proxies.add(line.strip())
        except requests.RequestException:
            continue
    return proxies

# Hàm kiểm tra proxy còn sống
def check_proxy(proxy):
    try:
        response = requests.get("http://ip-api.com/json",
                                proxies={"http": f"http://{proxy}", "https": f"http://{proxy}"},
                                timeout=5)
        return proxy if response.status_code == 200 else None
    except requests.RequestException:
        return None

# Hàm kiểm tra danh sách proxy và lưu vào file
def validate_and_save(proxies):
    valid_proxies = set()

    with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
        results = list(tqdm(executor.map(check_proxy, proxies), total=len(proxies), desc="Kiểm tra proxy"))

    for proxy in results:
        if proxy:
            valid_proxies.add(proxy)

    # Lưu vào file proxy.txt
    with open("proxy.txt", "w") as f:
        for proxy in valid_proxies:
            f.write(proxy + "\n")

    print(f"Đã lưu {len(valid_proxies)} proxy hợp lệ vào proxy.txt")

# Chạy tool
if __name__ == "__main__":
    print("Đang thu thập proxy từ API...")
    proxies_from_api = fetch_from_apis()

    # Tổng hợp tất cả proxy thu thập được
    all_proxies = proxies_from_api
    print(f"Tổng số proxy thu thập được: {len(all_proxies)}")

    # Kiểm tra proxy còn sống và lưu lại
    validate_and_save(all_proxies)
