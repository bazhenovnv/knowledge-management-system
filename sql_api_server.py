"""
Локальный HTTP API сервер для работы с SQL Server
Запускай на компьютере с SQL Server, затем пробрасывай через cloudflare
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import pyodbc
from urllib.parse import urlparse, parse_qs

# Настройки подключения к SQL Server
SQL_SERVER = '127.0.0.1'
SQL_DATABASE = 'StudentAccounting'
SQL_USERNAME = 'sa'
SQL_PASSWORD = '12345'

class SQLServerHandler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Обработка CORS preflight запросов"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Обработка GET запросов"""
        try:
            # Парсим URL и параметры
            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)
            
            query = params.get('query', [''])[0]
            
            if not query:
                # По умолчанию - список таблиц
                query = """
                    SELECT TABLE_NAME 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_TYPE = 'BASE TABLE'
                """
            
            # Подключаемся к SQL Server
            conn_str = (
                f'DRIVER={{ODBC Driver 17 for SQL Server}};'
                f'SERVER={SQL_SERVER};'
                f'DATABASE={SQL_DATABASE};'
                f'UID={SQL_USERNAME};'
                f'PWD={SQL_PASSWORD}'
            )
            
            conn = pyodbc.connect(conn_str, timeout=10)
            cursor = conn.cursor()
            
            # Выполняем запрос
            cursor.execute(query)
            
            # Получаем результаты
            columns = [column[0] for column in cursor.description]
            rows = []
            for row in cursor.fetchall():
                rows.append(dict(zip(columns, row)))
            
            cursor.close()
            conn.close()
            
            # Отправляем ответ
            result = {
                'success': True,
                'data': rows,
                'count': len(rows)
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result, default=str, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_error_response(str(e))
    
    def do_POST(self):
        """Обработка POST запросов"""
        try:
            # Читаем тело запроса
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            
            query = data.get('query', '')
            
            if not query:
                raise ValueError('Не указан SQL запрос')
            
            # Подключаемся к SQL Server
            conn_str = (
                f'DRIVER={{ODBC Driver 17 for SQL Server}};'
                f'SERVER={SQL_SERVER};'
                f'DATABASE={SQL_DATABASE};'
                f'UID={SQL_USERNAME};'
                f'PWD={SQL_PASSWORD}'
            )
            
            conn = pyodbc.connect(conn_str, timeout=10)
            cursor = conn.cursor()
            
            # Выполняем запрос
            cursor.execute(query)
            conn.commit()
            
            affected = cursor.rowcount
            
            cursor.close()
            conn.close()
            
            # Отправляем ответ
            result = {
                'success': True,
                'message': 'Запрос выполнен',
                'affected_rows': affected
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result, default=str, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self.send_error_response(str(e))
    
    def send_error_response(self, error_message):
        """Отправка ошибки"""
        result = {
            'success': False,
            'error': error_message
        }
        
        self.send_response(500)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Логирование запросов"""
        print(f"[SQL API] {self.address_string()} - {format % args}")

if __name__ == '__main__':
    PORT = 8000
    
    print("=" * 60)
    print("🚀 SQL Server API запущен!")
    print("=" * 60)
    print(f"Слушает на порту: {PORT}")
    print(f"SQL Server: {SQL_SERVER}")
    print(f"База данных: {SQL_DATABASE}")
    print("")
    print("Теперь запусти в ДРУГОМ окне:")
    print(f"  cloudflared.exe tunnel --url http://localhost:{PORT}")
    print("")
    print("Получишь адрес вида:")
    print("  https://something.trycloudflare.com")
    print("")
    print("Отправь этот адрес Юре!")
    print("=" * 60)
    print("")
    
    server = HTTPServer(('0.0.0.0', PORT), SQLServerHandler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nОстанавливаю сервер...")
        server.shutdown()
