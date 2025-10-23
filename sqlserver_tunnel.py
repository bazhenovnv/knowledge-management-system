"""
SQL Server Tunnel - делает локальный SQL Server доступным из интернета
Запускай этот скрипт на компьютере, где установлен SQL Server
"""

import socket
import threading
import time
from datetime import datetime

# Настройки
LOCAL_SQL_HOST = '127.0.0.1'  # Твой локальный SQL Server
LOCAL_SQL_PORT = 1433          # Стандартный порт SQL Server
TUNNEL_PORT = 5001             # Порт для туннеля (отличается от Flask 5000)

class SQLServerTunnel:
    def __init__(self):
        self.server = None
        self.running = False
        
    def log(self, message):
        """Вывод логов с временем"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f"[{timestamp}] {message}")
    
    def handle_client(self, client_socket, addr):
        """Обработка подключения клиента"""
        self.log(f"Новое подключение от {addr}")
        
        try:
            # Подключаемся к локальному SQL Server
            sql_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sql_socket.connect((LOCAL_SQL_HOST, LOCAL_SQL_PORT))
            self.log(f"Подключен к SQL Server {LOCAL_SQL_HOST}:{LOCAL_SQL_PORT}")
            
            # Проксируем данные в обе стороны
            def forward(source, destination, direction):
                try:
                    while True:
                        data = source.recv(4096)
                        if not data:
                            break
                        destination.sendall(data)
                except Exception as e:
                    self.log(f"Ошибка пересылки ({direction}): {e}")
            
            # Запускаем потоки для двусторонней пересылки
            client_to_sql = threading.Thread(
                target=forward, 
                args=(client_socket, sql_socket, "client->sql")
            )
            sql_to_client = threading.Thread(
                target=forward, 
                args=(sql_socket, client_socket, "sql->client")
            )
            
            client_to_sql.start()
            sql_to_client.start()
            
            client_to_sql.join()
            sql_to_client.join()
            
        except Exception as e:
            self.log(f"Ошибка обработки клиента: {e}")
        finally:
            client_socket.close()
            if 'sql_socket' in locals():
                sql_socket.close()
            self.log(f"Соединение с {addr} закрыто")
    
    def start(self):
        """Запуск туннеля"""
        try:
            self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server.bind(('0.0.0.0', TUNNEL_PORT))
            self.server.listen(5)
            self.running = True
            
            print("=" * 60)
            print("🚀 SQL Server Tunnel запущен!")
            print("=" * 60)
            print(f"Локальный SQL Server: {LOCAL_SQL_HOST}:{LOCAL_SQL_PORT}")
            print(f"Туннель слушает на порту: {TUNNEL_PORT}")
            print("")
            print("ВАЖНО: Для доступа из интернета используй:")
            print("  1. ngrok: ngrok tcp 5001")
            print("  2. Cloudflare Tunnel: cloudflared tunnel --url tcp://localhost:5001")
            print("")
            print("После запуска ngrok/cloudflare получишь адрес вида:")
            print("  tcp://0.tcp.ngrok.io:12345")
            print("=" * 60)
            print("")
            
            while self.running:
                try:
                    client_socket, addr = self.server.accept()
                    # Обрабатываем каждое подключение в отдельном потоке
                    client_thread = threading.Thread(
                        target=self.handle_client,
                        args=(client_socket, addr)
                    )
                    client_thread.daemon = True
                    client_thread.start()
                except Exception as e:
                    if self.running:
                        self.log(f"Ошибка принятия соединения: {e}")
        
        except Exception as e:
            print(f"ОШИБКА запуска туннеля: {e}")
        finally:
            self.stop()
    
    def stop(self):
        """Остановка туннеля"""
        self.running = False
        if self.server:
            self.server.close()
        self.log("Туннель остановлен")

if __name__ == '__main__':
    tunnel = SQLServerTunnel()
    
    try:
        tunnel.start()
    except KeyboardInterrupt:
        print("\n\nОстанавливаю туннель...")
        tunnel.stop()
