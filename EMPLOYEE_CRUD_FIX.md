# Исправление CRUD операций для сотрудников

## Проблема
Раздел "Сотрудники" не сохранял изменения:
- Старые удалённые сотрудники появлялись снова
- Новые добавленные сотрудники пропадали
- Изменения не сохранялись в базе данных

## Причина
Backend функция `local-db-proxy` не поддерживала операции создания, обновления и удаления (только чтение).

## Решение

### 1. Добавлены CRUD операции в backend (`backend/local-db-proxy/index.py`)

#### ✅ CREATE - Создание записей
```python
elif action == 'create':
    table = request_data.get('table', 'employees')
    schema = request_data.get('schema', 't_p47619579_knowledge_management')
    data = request_data.get('data', {})
    
    columns = ', '.join(data.keys())
    placeholders = ', '.join(['%s'] * len(data))
    values = list(data.values())
    
    cur.execute(f"""
        INSERT INTO {schema}.{table} ({columns})
        VALUES ({placeholders})
        RETURNING *
    """, values)
    
    conn.commit()
    row = cur.fetchone()
    result = {'data': convert_dates(dict(row)) if row else None}
```

#### ✅ UPDATE - Обновление записей
```python
elif action == 'update':
    table = request_data.get('table', 'employees')
    schema = request_data.get('schema', 't_p47619579_knowledge_management')
    record_id = request_data.get('id')
    data = request_data.get('data', {})
    
    set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
    values = list(data.values()) + [record_id]
    
    cur.execute(f"""
        UPDATE {schema}.{table}
        SET {set_clause}, updated_at = NOW()
        WHERE id = %s
        RETURNING *
    """, values)
    
    conn.commit()
    row = cur.fetchone()
    result = {'data': convert_dates(dict(row)) if row else None}
```

#### ✅ DELETE - Удаление записей (soft/hard)
```python
elif action == 'delete':
    table = request_data.get('table', 'employees')
    schema = request_data.get('schema', 't_p47619579_knowledge_management')
    record_id = request_data.get('id')
    permanent = request_data.get('permanent', False)
    
    if permanent:
        # Hard delete - полное удаление из БД
        cur.execute(f"DELETE FROM {schema}.{table} WHERE id = %s", [record_id])
    else:
        # Soft delete - деактивация (is_active = false)
        cur.execute(f"""
            UPDATE {schema}.{table}
            SET is_active = false, updated_at = NOW()
            WHERE id = %s
        """, [record_id])
    
    conn.commit()
    result = {'deleted': True, 'affected': cur.rowcount}
```

### 2. Поддержка GET и POST запросов
Backend теперь принимает параметры через:
- Query string для GET: `?action=list&table=employees`
- Body для POST: `{"action": "create", "table": "employees", "data": {...}}`

### 3. Унифицирован формат ответа
- Все действия возвращают `data` вместо `rows`
- Консистентная структура: `{data: [...], count: N}` или `{data: {...}}`

### 4. Добавлен метод в frontend (`src/services/externalDbService.ts`)

```typescript
async createEmployee(employeeData: {
  full_name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  role?: 'admin' | 'teacher' | 'employee';
  hire_date?: string;
  zoom_link?: string;
}): Promise<any> {
  const response = await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      action: 'create',
      table: 'employees',
      schema: 't_p47619579_knowledge_management',
      data: {
        full_name: employeeData.full_name,
        email: employeeData.email,
        phone: employeeData.phone || null,
        department: employeeData.department,
        position: employeeData.position,
        role: employeeData.role || 'employee',
        hire_date: employeeData.hire_date || null,
        zoom_link: employeeData.zoom_link || null,
        is_active: true
      }
    }),
    mode: 'cors',
    credentials: 'omit'
  });

  if (!response.ok) {
    throw new Error(`Create employee failed: ${response.status}`);
  }

  const result = await response.json();
  return result.data || result;
}
```

## Результат
✅ Все операции с сотрудниками теперь сохраняются в PostgreSQL базе:
- Создание новых сотрудников
- Редактирование существующих
- Мягкое удаление (деактивация)
- Жёсткое удаление (полное удаление из БД)

## Тестирование
Обновлены тесты backend функции:
- ✅ OPTIONS request (CORS)
- ✅ Get employees list via POST
- ✅ Get database stats

Backend URL: https://functions.poehali.dev/fcf1f05b-799c-46d4-975a-b43ce02ffed6
