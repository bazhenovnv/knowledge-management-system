import { KnowledgeMaterial, Test } from '@/utils/database';
import { generateId } from '@/utils/common';

// Создание теста на основе материала базы знаний
export const createTestFromMaterial = (
  material: KnowledgeMaterial,
  createdBy: string,
  userRole: string
): Test => {
  // Создаем базовую структуру теста
  const testId = generateId();
  
  const test: Test = {
    id: testId,
    title: `Тест: ${material.title}`,
    description: `Тест создан на основе материала "${material.title}". Заполните детали теста вручную.`,
    category: material.category,
    difficulty: "medium" as const,
    timeLimit: 30, // 30 минут по умолчанию
    questions: [],
    department: material.department || 'Общий',
    createdBy,
    createdAt: new Date(),
    status: "draft" as const,
    totalAttempts: 0,
    averageScore: 0,
    sourceMaterialId: material.id,
    isGeneratedFromMaterial: true
  };

  return test;
};

// Поиск тестов по теме материала
export const findTestsByMaterialTopic = (
  tests: Test[],
  material: KnowledgeMaterial
): Test[] => {
  return tests.filter(test => {
    // Поиск по ID исходного материала
    if (test.sourceMaterialId === material.id) {
      return true;
    }
    
    // Поиск по категории и заголовку
    const titleMatch = test.title.toLowerCase().includes(material.title.toLowerCase()) ||
                      material.title.toLowerCase().includes(test.title.toLowerCase());
    
    const categoryMatch = test.category === material.category;
    
    // Поиск по ключевым словам
    const keywords = material.tags || [];
    const titleWords = material.title.toLowerCase().split(' ');
    const testTitleWords = test.title.toLowerCase().split(' ');
    
    const keywordMatch = keywords.some(keyword => 
      test.title.toLowerCase().includes(keyword.toLowerCase()) ||
      test.description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const wordMatch = titleWords.some(word => 
      word.length > 3 && testTitleWords.some(testWord => 
        testWord.includes(word) || word.includes(testWord)
      )
    );
    
    return (titleMatch || categoryMatch || keywordMatch || wordMatch);
  });
};

// Найти наиболее подходящий тест для материала
export const findBestTestForMaterial = (
  tests: Test[],
  material: KnowledgeMaterial
): Test | null => {
  const matchingTests = findTestsByMaterialTopic(tests, material);
  
  if (matchingTests.length === 0) {
    return null;
  }
  
  // Приоритет: тесты созданные из этого материала
  const directMatch = matchingTests.find(test => test.sourceMaterialId === material.id);
  if (directMatch) {
    return directMatch;
  }
  
  // Затем опубликованные тесты
  const publishedTests = matchingTests.filter(test => test.status === 'published');
  if (publishedTests.length > 0) {
    return publishedTests[0];
  }
  
  // Иначе любой подходящий тест
  return matchingTests[0];
};

// Генерация базовых вопросов на основе содержимого материала
export const generateBasicQuestions = (material: KnowledgeMaterial): Test['questions'] => {
  const questions: Test['questions'] = [];
  
  // Базовый вопрос о теме материала
  questions.push({
    id: generateId(),
    question: `Что является основной темой материала "${material.title}"?`,
    options: [
      material.category,
      'Другая тема',
      'Общая информация',
      'Специальные знания'
    ],
    correctAnswer: 0,
    explanation: `Материал "${material.title}" относится к категории "${material.category}".`,
    timeLimit: 60
  });
  
  // Вопрос о категории
  if (material.category) {
    questions.push({
      id: generateId(),
      question: `К какой категории относится материал "${material.title}"?`,
      options: [
        'Общие навыки',
        material.category,
        'Техническая документация',
        'Процедуры'
      ],
      correctAnswer: 1,
      explanation: `Материал относится к категории "${material.category}".`,
      timeLimit: 45
    });
  }
  
  // Вопрос о важности
  questions.push({
    id: generateId(),
    question: `Для чего предназначен материал "${material.title}"?`,
    options: [
      'Для общего развития',
      'Для изучения и применения в работе',
      'Для развлечения',
      'Для справки'
    ],
    correctAnswer: 1,
    explanation: 'Материалы базы знаний предназначены для изучения и применения в профессиональной деятельности.',
    timeLimit: 60
  });
  
  return questions;
};