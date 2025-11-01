// Утилита для миграции данных из localStorage в PostgreSQL
import { legacyDbApi } from '@/services/dbAdapter';

const BACKEND_URL = legacyDbApi.baseUrl;

interface MigrationResult {
  success: boolean;
  migratedEmployees: number;
  migratedTests: number;
  migratedResults: number;
  migratedNotifications: number;
  errors: string[];
}

export async function migrateLocalStorageToPostgres(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedEmployees: 0,
    migratedTests: 0,
    migratedResults: 0,
    migratedNotifications: 0,
    errors: []
  };

  try {
    console.log('🚀 Начинаем миграцию данных из localStorage в PostgreSQL...');

    // 1. Миграция сотрудников
    const employeesData = localStorage.getItem('employees');
    if (employeesData) {
      try {
        const employees = JSON.parse(employeesData);
        console.log(`📋 Найдено сотрудников в localStorage: ${employees.length}`);

        for (const emp of employees) {
          try {
            // Проверяем, существует ли сотрудник
            const checkResponse = await legacyDbApi.fetch(`${BACKEND_URL}?action=get&table=employees&id=${emp.id}`);
            const checkData = await checkResponse.json();

            if (!checkData.data) {
              // Создаём нового сотрудника
              const response = await legacyDbApi.fetch(`${BACKEND_URL}?action=create&table=employees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: emp.email,
                  full_name: emp.name,
                  department: emp.department,
                  position: emp.position,
                  role: emp.role,
                  phone: emp.phone || '',
                  password: emp.password || 'password123',
                  is_active: emp.isActive !== false
                })
              });

              if (response.ok) {
                result.migratedEmployees++;
                console.log(`✅ Мигрирован сотрудник: ${emp.name}`);
              }
            } else {
              console.log(`⏭️  Сотрудник уже существует: ${emp.name}`);
            }
          } catch (error) {
            const errorMsg = `Ошибка миграции сотрудника ${emp.name}: ${error}`;
            console.error(errorMsg);
            result.errors.push(errorMsg);
          }
        }
      } catch (error) {
        result.errors.push(`Ошибка парсинга employees: ${error}`);
      }
    }

    // 2. Миграция тестов
    const testsData = localStorage.getItem('tests');
    if (testsData) {
      try {
        const tests = JSON.parse(testsData);
        console.log(`📝 Найдено тестов в localStorage: ${tests.length}`);

        for (const test of tests) {
          try {
            const response = await legacyDbApi.fetch(`${BACKEND_URL}?action=create_test_full`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: test.title,
                description: test.description,
                category: test.category,
                difficulty: test.difficulty,
                time_limit: test.timeLimit,
                passing_score: 60,
                max_attempts: 3,
                status: test.status || 'published',
                created_by: test.createdBy || 'admin',
                questions: test.questions.map((q: any) => ({
                  question: q.question,
                  question_type: 'single_choice',
                  options: q.options,
                  correct_answer: q.correctAnswer,
                  explanation: q.explanation || '',
                  points: 1
                }))
              })
            });

            if (response.ok) {
              result.migratedTests++;
              console.log(`✅ Мигрирован тест: ${test.title}`);
            }
          } catch (error) {
            const errorMsg = `Ошибка миграции теста ${test.title}: ${error}`;
            console.error(errorMsg);
            result.errors.push(errorMsg);
          }
        }
      } catch (error) {
        result.errors.push(`Ошибка парсинга tests: ${error}`);
      }
    }

    // 3. Миграция результатов тестов
    const resultsData = localStorage.getItem('testResults');
    if (resultsData) {
      try {
        const results = JSON.parse(resultsData);
        console.log(`📊 Найдено результатов тестов в localStorage: ${results.length}`);

        for (const testResult of results) {
          try {
            const response = await fetch(`${BACKEND_URL}?action=submit_test`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                test_id: parseInt(testResult.testId) || 1,
                employee_id: parseInt(testResult.userId) || 1,
                score: testResult.score,
                time_spent: testResult.timeSpent,
                answers: testResult.answers
              })
            });

            if (response.ok) {
              result.migratedResults++;
              console.log(`✅ Мигрирован результат теста`);
            }
          } catch (error) {
            const errorMsg = `Ошибка миграции результата: ${error}`;
            console.error(errorMsg);
            result.errors.push(errorMsg);
          }
        }
      } catch (error) {
        result.errors.push(`Ошибка парсинга testResults: ${error}`);
      }
    }

    // 4. Миграция уведомлений
    const notificationsData = localStorage.getItem('notifications');
    if (notificationsData) {
      try {
        const notifications = JSON.parse(notificationsData);
        console.log(`🔔 Найдено уведомлений в localStorage: ${notifications.length}`);

        for (const notification of notifications) {
          try {
            const response = await fetch(`${BACKEND_URL}?action=create_notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                employee_id: notification.userId,
                title: notification.title,
                message: notification.message,
                type: notification.type || 'info',
                is_read: notification.isRead || false
              })
            });

            if (response.ok) {
              result.migratedNotifications++;
              console.log(`✅ Мигрировано уведомление`);
            }
          } catch (error) {
            const errorMsg = `Ошибка миграции уведомления: ${error}`;
            console.error(errorMsg);
            result.errors.push(errorMsg);
          }
        }
      } catch (error) {
        result.errors.push(`Ошибка парсинга notifications: ${error}`);
      }
    }

    result.success = result.errors.length === 0;
    console.log('✨ Миграция завершена!');
    console.log(`📊 Статистика:`);
    console.log(`  - Сотрудники: ${result.migratedEmployees}`);
    console.log(`  - Тесты: ${result.migratedTests}`);
    console.log(`  - Результаты: ${result.migratedResults}`);
    console.log(`  - Уведомления: ${result.migratedNotifications}`);
    
    if (result.errors.length > 0) {
      console.log(`❌ Ошибок: ${result.errors.length}`);
      result.errors.forEach(err => console.error(`  - ${err}`));
    }

  } catch (error) {
    result.errors.push(`Критическая ошибка миграции: ${error}`);
    console.error('💥 Критическая ошибка миграции:', error);
  }

  return result;
}

// Функция для очистки localStorage после успешной миграции
export function clearLocalStorageAfterMigration(): void {
  const keysToRemove = [
    'employees',
    'tests',
    'testResults',
    'notifications',
    'knowledgeMaterials'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️  Удалён ключ из localStorage: ${key}`);
  });

  console.log('✅ localStorage очищен');
}