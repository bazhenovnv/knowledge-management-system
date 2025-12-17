#!/bin/bash
# Скрипт для добавления функции регистрации в API

# Создаем бэкап
cp /var/www/api_server.py /var/www/api_server.py.backup_$(date +%Y%m%d_%H%M%S)

# Добавляем функцию регистрации после action == 'logout'
# Ищем строку с "return jsonify({'error': 'Invalid action'}), 400"
# и добавляем перед ней блок elif action == 'register'

cat > /tmp/register_block.py << 'PYEOF'
    
    elif action == 'register':
        # Регистрация нового пользователя
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        role = data.get('role', 'employee')
        department = data.get('department', '')
        position = data.get('position', '')
        phone = data.get('phone', '')
        
        if not email or not password or not full_name:
            return jsonify({'error': 'Email, password and full_name are required'}), 400
        
        # Проверяем, не существует ли уже пользователь с таким email
        cur.execute("""
            SELECT id FROM t_p47619579_knowledge_management.employees 
            WHERE email = %s
        """, (email,))
        
        if cur.fetchone():
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Хешируем пароль
        password_hash = hash_password(password)
        
        # Создаем нового пользователя
        cur.execute("""
            INSERT INTO t_p47619579_knowledge_management.employees 
            (email, password_hash, full_name, role, department, position, phone, hire_date, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), true)
            RETURNING id, email, full_name, role, department, position, phone
        """, (email, password_hash, full_name, role, department, position, phone))
        
        user = cur.fetchone()
        conn.commit()
        
        if not user:
            return jsonify({'error': 'Failed to create user'}), 500
        
        # Создаем сессию для нового пользователя
        session_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO t_p47619579_knowledge_management.user_sessions 
            (employee_id, session_token, created_at, expires_at)
            VALUES (%s, %s, NOW(), NOW() + INTERVAL '30 days')
        """, (user[0], session_id))
        conn.commit()
        
        employee_data = {
            'id': user[0],
            'email': user[1],
            'full_name': user[2],
            'role': user[3],
            'department': user[4],
            'position': user[5],
            'phone': user[6]
        }
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'employee': employee_data
        })
PYEOF

# Находим строку с "return jsonify({'error': 'Invalid action'}), 400"
# и вставляем код регистрации перед ней
python3 << 'PYSCRIPT'
import sys

# Читаем файл
with open('/var/www/api_server.py', 'r') as f:
    lines = f.readlines()

# Читаем блок регистрации
with open('/tmp/register_block.py', 'r') as f:
    register_code = f.read()

# Находим строку с "return jsonify({'error': 'Invalid action'})"
output = []
inserted = False
for i, line in enumerate(lines):
    if not inserted and "return jsonify({'error': 'Invalid action'}), 400" in line:
        # Вставляем код регистрации перед этой строкой
        output.append(register_code)
        output.append('\n')
        inserted = True
    output.append(line)

# Записываем обратно
with open('/var/www/api_server.py', 'w') as f:
    f.writelines(output)

print("Register function added successfully!")
PYSCRIPT

# Перезапускаем сервис
systemctl restart api-server

echo "API server restarted. Registration function added."
