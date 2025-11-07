#!/usr/bin/env python3
"""
Скрипт для создания схемы и таблиц в TimeWeb Cloud PostgreSQL
Использование: python setup_timeweb_cloud.py
"""

import psycopg2
import urllib.request
import os

# Connection string из секрета DATABASE_CONNECTION_TIMEWEB (с sslmode=require вместо verify-full)
DATABASE_URL = "postgresql://gen_user:TC%3Eo0yl2J_PR%28e@c6b7ae5ab8e72b5408272e27.twc1.net:5432/default_db?sslmode=require"

def setup_ssl_cert():
    """Download and setup SSL certificate for TimeWeb Cloud PostgreSQL"""
    cert_dir = os.path.expanduser('~/.postgresql')
    cert_path = os.path.join(cert_dir, 'root.crt')
    
    if not os.path.exists(cert_path):
        os.makedirs(cert_dir, exist_ok=True)
        cert_url = 'https://st.timeweb.com/cloud-static/ca.crt'
        print(f"📥 Скачивание SSL сертификата...")
        urllib.request.urlretrieve(cert_url, cert_path)
        print(f"✅ Сертификат сохранён: {cert_path}")
    
    os.environ['PGSSLROOTCERT'] = cert_path

def main():
    print("🚀 Подключение к TimeWeb Cloud PostgreSQL...")
    
    try:
        setup_ssl_cert()
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        cursor = conn.cursor()
        
        print("✅ Подключение установлено")
        print("📝 Чтение SQL скрипта...")
        
        with open('setup_timeweb_database.sql', 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        print("⚙️  Выполнение SQL скрипта...")
        cursor.execute(sql_script)
        conn.commit()
        
        print("✅ SQL скрипт выполнен успешно")
        print("📊 Проверка созданных таблиц...")
        
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 't_p47619579_knowledge_management'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        
        print(f"\n✅ Создано таблиц: {len(tables)}")
        for table in tables:
            print(f"   - {table[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM t_p47619579_knowledge_management.employees")
        employee_count = cursor.fetchone()[0]
        print(f"\n👥 Сотрудников в базе: {employee_count}")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Настройка базы данных завершена успешно!")
        
    except psycopg2.Error as e:
        print(f"\n❌ Ошибка базы данных: {e}")
        return 1
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())