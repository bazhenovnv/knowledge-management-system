# Исправление отображения вопросов при прохождении тестов

## Проблема
При прохождении тестов не отображались вопросы - пользователь видел пустой экран или ошибку.

## Причины

### 1. Неправильная структура данных в SQL запросе
`externalDb.getTests()` возвращал неполную структуру вопросов и ответов:

**Было:**
```sql
json_build_object(
  'id', tq.id,
  'question', tq.question_text,  -- ❌ Неправильное поле
  'answers', (
    SELECT json_agg(
      json_build_object(
        'id', test_answers.id,
        'text', test_answers.answer_text,  -- ❌ Неправильное поле
        'is_correct', test_answers.is_correct
      )
    )
  )
)
```

**Стало:**
```sql
json_build_object(
  'id', tq.id,
  'test_id', tq.test_id,
  'question_text', tq.question_text,  -- ✅ Правильное поле
  'question_type', tq.question_type,
  'points', tq.points,
  'order_num', tq.order_num,
  'created_at', tq.created_at,
  'answers', (
    SELECT json_agg(
      json_build_object(
        'id', ta.id,
        'question_id', ta.question_id,
        'answer_text', ta.answer_text,  -- ✅ Правильное поле
        'is_correct', ta.is_correct,
        'order_num', ta.order_num,
        'created_at', ta.created_at
      ) ORDER BY ta.order_num
    )
  )
)
```

### 2. Отсутствие валидации данных
Компонент не проверял:
- Наличие вопросов в тесте
- Наличие ответов у вопросов
- Валидность текущего вопроса

## Решение

### 1. Исправлен SQL запрос в `src/services/externalDbService.ts`

```typescript
async getTests(): Promise<any[]> {
  try {
    const rows = await this.query(`
      SELECT 
        t.id, t.title, t.description, t.time_limit, 
        t.passing_score, t.is_active, t.created_at,
        t.course_id, t.creator_id, t.max_attempts, t.updated_at,
        json_agg(
          json_build_object(
            'id', tq.id,
            'test_id', tq.test_id,
            'question_text', tq.question_text,
            'question_type', tq.question_type,
            'points', tq.points,
            'order_num', tq.order_num,
            'created_at', tq.created_at,
            'answers', (
              SELECT json_agg(
                json_build_object(
                  'id', ta.id,
                  'question_id', ta.question_id,
                  'answer_text', ta.answer_text,
                  'is_correct', ta.is_correct,
                  'order_num', ta.order_num,
                  'created_at', ta.created_at
                ) ORDER BY ta.order_num
              )
              FROM t_p47619579_knowledge_management.test_answers ta
              WHERE ta.question_id = tq.id
            )
          ) ORDER BY tq.order_num
        ) FILTER (WHERE tq.id IS NOT NULL) as questions
      FROM t_p47619579_knowledge_management.tests t
      LEFT JOIN t_p47619579_knowledge_management.test_questions tq ON t.id = tq.test_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    return rows || [];
  }
}
```

### 2. Добавлена валидация в `src/components/tests/DatabaseTestTaking.tsx`

#### Проверка при загрузке теста:

```typescript
const loadTest = async () => {
  setIsLoading(true);
  try {
    console.log('🔄 Loading test with ID:', testId);
    const testData = await testsService.getTestWithQuestions(testId);
    console.log('📋 Test data loaded:', testData);
    
    if (testData) {
      // ✅ Проверка на наличие вопросов
      if (!testData.questions || testData.questions.length === 0) {
        console.warn('⚠️ Test has no questions:', testData);
        toast.error('В тесте нет вопросов');
        onCancel();
        return;
      }
      
      // ✅ Проверка что у вопросов есть ответы
      const questionsWithoutAnswers = testData.questions.filter(
        q => !q.answers || q.answers.length === 0
      );
      if (questionsWithoutAnswers.length > 0) {
        console.warn('⚠️ Some questions have no answers:', questionsWithoutAnswers);
        toast.error('У некоторых вопросов отсутствуют варианты ответов');
      }
      
      console.log('✅ Test loaded successfully:', testData.title, 'Questions:', testData.questions.length);
      setTest(testData);
    }
  } catch (error) {
    console.error('❌ Error loading test:', error);
    toast.error('Ошибка загрузки теста');
    onCancel();
  } finally {
    setIsLoading(false);
  }
};
```

#### Проверка перед рендерингом:

```typescript
// ✅ Проверка наличия вопросов
if (!test.questions || test.questions.length === 0) {
  return (
    <div className="text-center py-12">
      <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-yellow-500" />
      <p className="text-lg font-medium">В тесте нет вопросов</p>
      <p className="text-sm text-gray-600 mt-2">
        Администратор должен добавить вопросы к этому тесту
      </p>
      <Button onClick={onCancel} className="mt-4">Назад</Button>
    </div>
  );
}

// ✅ Проверка валидности текущего вопроса
const currentQuestion = test.questions[currentQuestionIndex];

if (!currentQuestion) {
  console.error('Current question not found at index:', currentQuestionIndex);
  return (
    <div className="text-center py-12">
      <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
      <p className="text-lg font-medium">Ошибка загрузки вопроса</p>
      <Button onClick={onCancel} className="mt-4">Назад</Button>
    </div>
  );
}
```

## Структура данных

### TestWithQuestions
```typescript
interface TestWithQuestions {
  id: number;
  title: string;
  description: string;
  time_limit?: number;
  passing_score: number;
  is_active: boolean;
  course_id?: number;
  creator_id: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
  questions: TestQuestion[];  // ✅ Массив вопросов
}
```

### TestQuestion
```typescript
interface TestQuestion {
  id: number;
  test_id: number;
  question_text: string;        // ✅ Текст вопроса
  question_type: 'single_choice' | 'multiple_choice' | 'text';
  points: number;
  order_num: number;
  created_at: string;
  answers: TestAnswer[];        // ✅ Массив ответов
}
```

### TestAnswer
```typescript
interface TestAnswer {
  id: number;
  question_id: number;
  answer_text: string;          // ✅ Текст ответа
  is_correct: boolean;
  order_num: number;
  created_at: string;
}
```

## Результат

✅ Вопросы корректно загружаются из базы данных
✅ Все поля присутствуют в правильном формате
✅ Добавлены защитные проверки на пустые данные
✅ Пользователь видит понятные сообщения об ошибках
✅ Логирование помогает отладить проблемы

## Тестирование

Для проверки работы:
1. Создайте тест с вопросами через интерфейс администратора
2. Убедитесь что у каждого вопроса есть хотя бы один ответ
3. Откройте тест для прохождения
4. Проверьте что вопросы отображаются корректно
5. Проверьте что ответы кликабельны и сохраняются
6. Завершите тест и убедитесь что результат корректен

## Дополнительные улучшения

### Логирование
Добавлено подробное логирование на каждом этапе:
- 🔄 Загрузка теста
- 📋 Данные теста
- ⚠️ Предупреждения о проблемах
- ✅ Успешная загрузка
- ❌ Ошибки

### Пользовательские сообщения
- "В тесте нет вопросов" - если тест пустой
- "У некоторых вопросов отсутствуют варианты ответов" - если есть вопросы без ответов
- "Ошибка загрузки вопроса" - если проблема с индексацией
