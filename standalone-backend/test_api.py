"""
Скрипт для тестирования API
Использование: python test_api.py <URL>
Пример: python test_api.py https://твой-api.twc1.net
"""

import sys
import requests
import json
from datetime import datetime

def test_health(base_url):
    """Тест проверки здоровья API"""
    print("\n🔍 Тест 1: Проверка здоровья API...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API работает! Статус: {data.get('status')}, БД: {data.get('database')}")
            return True
        else:
            print(f"❌ Ошибка: HTTP {response.status_code}")
            print(f"   Ответ: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка подключения: {e}")
        return False


def test_stats(base_url):
    """Тест получения статистики БД"""
    print("\n🔍 Тест 2: Получение статистики базы данных...")
    try:
        response = requests.post(
            base_url,
            json={
                "action": "stats",
                "schema": "t_p47619579_knowledge_management"
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            tables = data.get('tables', [])
            print(f"✅ Получена статистика:")
            print(f"   Всего таблиц: {data.get('totalTables', 0)}")
            print(f"   Всего записей: {data.get('totalRecords', 0)}")
            
            if tables:
                print("\n   📊 Таблицы:")
                for table in tables[:5]:  # Показываем первые 5
                    print(f"      - {table['table_name']}: {table.get('record_count', 0)} записей")
            return True
        else:
            print(f"❌ Ошибка: HTTP {response.status_code}")
            print(f"   Ответ: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка запроса: {e}")
        return False


def test_query(base_url):
    """Тест выполнения SELECT запроса"""
    print("\n🔍 Тест 3: Выполнение SQL запроса...")
    try:
        response = requests.post(
            base_url,
            json={
                "action": "query",
                "query": "SELECT COUNT(*) as count FROM t_p47619579_knowledge_management.employees WHERE is_active = true"
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            rows = data.get('rows', [])
            if rows:
                count = rows[0].get('count', 0)
                print(f"✅ Запрос выполнен успешно!")
                print(f"   Активных сотрудников: {count}")
                return True
            else:
                print(f"⚠️  Запрос выполнен, но нет результатов")
                return True
        else:
            print(f"❌ Ошибка: HTTP {response.status_code}")
            print(f"   Ответ: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка запроса: {e}")
        return False


def test_cors(base_url):
    """Тест CORS (OPTIONS запрос)"""
    print("\n🔍 Тест 4: Проверка CORS...")
    try:
        response = requests.options(
            base_url,
            headers={
                "Origin": "https://example.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            cors_origin = response.headers.get('Access-Control-Allow-Origin')
            cors_methods = response.headers.get('Access-Control-Allow-Methods')
            print(f"✅ CORS настроен:")
            print(f"   Allow-Origin: {cors_origin}")
            print(f"   Allow-Methods: {cors_methods}")
            return True
        else:
            print(f"⚠️  CORS: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка запроса: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("❌ Использование: python test_api.py <URL>")
        print("   Пример: python test_api.py https://твой-api.twc1.net")
        sys.exit(1)
    
    base_url = sys.argv[1].rstrip('/')
    
    print("=" * 60)
    print(f"🚀 Тестирование API: {base_url}")
    print(f"⏰ Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    results = []
    
    # Запуск тестов
    results.append(("Health Check", test_health(base_url)))
    results.append(("Database Stats", test_stats(base_url)))
    results.append(("SQL Query", test_query(base_url)))
    results.append(("CORS", test_cors(base_url)))
    
    # Итоги
    print("\n" + "=" * 60)
    print("📊 ИТОГИ ТЕСТИРОВАНИЯ:")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {name}")
    
    print("\n" + "-" * 60)
    print(f"Пройдено: {passed}/{total} тестов ({passed*100//total}%)")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ! API готов к использованию.")
        print("\nСледующий шаг:")
        print(f"1. Добавь в .env проекта: VITE_EXTERNAL_DB_URL={base_url}")
        print("2. Пересобери проект в poehali.dev")
        print("3. Проверь работу сайта")
    else:
        print("\n⚠️  Некоторые тесты не прошли. Проверь:")
        print("1. API запущен и доступен по URL")
        print("2. База данных настроена и доступна")
        print("3. IP сервера добавлен в белый список БД")
        print("4. Логи сервера для деталей ошибок")
    
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
