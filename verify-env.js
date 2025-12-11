// Скрипт проверки правильности environment variables перед билдом
import { readFileSync } from 'fs';
import { resolve } from 'path';

const EXPECTED_FUNCTION_URL = 'https://functions.poehali.dev/72034790-df65-4fb9-885e-c40a2ee29179';

console.log('🔍 Проверка конфигурации environment variables...\n');

try {
  // Читаем .env.production
  const envPath = resolve(process.cwd(), '.env.production');
  const envContent = readFileSync(envPath, 'utf-8');
  
  // Парсим переменные
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  // Проверяем критичные переменные
  const criticalVars = ['VITE_EXTERNAL_DB_URL', 'VITE_LEGACY_DB_URL'];
  let hasErrors = false;

  criticalVars.forEach(varName => {
    const value = envVars[varName];
    if (!value) {
      console.error(`❌ ${varName} не задана!`);
      hasErrors = true;
    } else if (value === EXPECTED_FUNCTION_URL) {
      console.log(`✅ ${varName} = ${value}`);
    } else if (value.includes('ab-education.ru') || value.startsWith('/api')) {
      console.error(`❌ ${varName} содержит старый URL: ${value}`);
      console.error(`   Ожидается: ${EXPECTED_FUNCTION_URL}`);
      hasErrors = true;
    } else {
      console.warn(`⚠️  ${varName} = ${value} (не совпадает с ожидаемым)`);
    }
  });

  if (hasErrors) {
    console.error('\n❌ Обнаружены ошибки в конфигурации! Исправьте .env.production');
    process.exit(1);
  } else {
    console.log('\n✅ Конфигурация корректна! Можно делать билд.');
    process.exit(0);
  }
} catch (error) {
  console.error('❌ Ошибка чтения .env.production:', error.message);
  process.exit(1);
}
