import { useState, useEffect } from 'react';

export const useViewedTests = () => {
  const [viewedTests, setViewedTests] = useState<string[]>([]);

  // Загружаем просмотренные тесты из localStorage при инициализации
  useEffect(() => {
    const stored = localStorage.getItem('viewedTests');
    if (stored) {
      try {
        setViewedTests(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing viewed tests:', e);
        setViewedTests([]);
      }
    }
  }, []);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('viewedTests', JSON.stringify(viewedTests));
  }, [viewedTests]);

  // Отмечаем тест как просмотренный
  const markTestAsViewed = (testId: string) => {
    setViewedTests(prev => {
      if (prev.includes(testId)) {
        return prev;
      }
      return [...prev, testId];
    });
  };

  // Проверяем, является ли тест новым (не просмотренным)
  const isTestNew = (testId: string, testCreatedAt: Date) => {
    // Тест считается новым если:
    // 1. Он не был просмотрен
    // 2. Он был создан в последние 7 дней
    const isNotViewed = !viewedTests.includes(testId);
    const isRecent = new Date().getTime() - testCreatedAt.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 дней
    
    return isNotViewed && isRecent;
  };

  // Получаем количество новых тестов
  const getNewTestsCount = (tests: Array<{ id: string; createdAt: Date }>) => {
    return tests.filter(test => isTestNew(test.id, test.createdAt)).length;
  };

  return {
    viewedTests,
    markTestAsViewed,
    isTestNew,
    getNewTestsCount,
  };
};