import { useState } from "react";

export interface AIMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  relatedTopics?: string[];
}

export const useAI = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIResponse = async (query: string): Promise<AIResponse> => {
    // Симуляция API запроса к AI
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    // Простая логика для демонстрации
    const responses = getAIResponses(query);
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateAIResponse(text);

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      return response;
    } catch (err) {
      setError("Произошла ошибка при обращении к AI помощнику");
      console.error("AI Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};

const getAIResponses = (query: string): AIResponse[] => {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("react") || lowerQuery.includes("реакт")) {
    return [
      {
        message:
          "React — это JavaScript библиотека для создания пользовательских интерфейсов. Основные концепции: компоненты, состояние, пропсы, хуки. Рекомендую начать с изучения функциональных компонентов и хука useState.",
        suggestions: [
          "Изучить useState",
          "Создать первый компонент",
          "Понять JSX",
        ],
        relatedTopics: ["TypeScript", "JavaScript", "HTML/CSS"],
      },
      {
        message:
          "React использует концепцию виртуального DOM для эффективного обновления интерфейса. Ключевые хуки: useState для состояния, useEffect для побочных эффектов, useContext для передачи данных.",
        suggestions: [
          "Изучить useEffect",
          "Понять виртуальный DOM",
          "Работа с формами",
        ],
        relatedTopics: ["JavaScript", "Веб-разработка", "Frontend"],
      },
    ];
  }

  if (lowerQuery.includes("typescript") || lowerQuery.includes("тайпскрипт")) {
    return [
      {
        message:
          "TypeScript — это надстройка над JavaScript, добавляющая статическую типизацию. Помогает находить ошибки на этапе разработки, улучшает читаемость кода и предоставляет лучшую поддержку IDE.",
        suggestions: [
          "Изучить базовые типы",
          "Настроить TypeScript",
          "Типизация функций",
        ],
        relatedTopics: ["JavaScript", "React", "Node.js"],
      },
    ];
  }

  if (lowerQuery.includes("безопасность") || lowerQuery.includes("security")) {
    return [
      {
        message:
          "Информационная безопасность включает защиту от XSS, CSRF атак, правильную аутентификацию и авторизацию. Важно валидировать данные на сервере, использовать HTTPS, и следить за актуальностью зависимостей.",
        suggestions: [
          "Изучить OWASP Top 10",
          "Настроить HTTPS",
          "Валидация данных",
        ],
        relatedTopics: ["Веб-разработка", "Backend", "Криптография"],
      },
    ];
  }

  if (
    lowerQuery.includes("дизайн") ||
    lowerQuery.includes("design") ||
    lowerQuery.includes("ui")
  ) {
    return [
      {
        message:
          "Дизайн интерфейсов основан на принципах удобства использования: простота, консистентность, обратная связь. Важно думать о пользователе, создавать интуитивно понятные элементы и тестировать дизайн на реальных пользователях.",
        suggestions: [
          "Изучить UI/UX принципы",
          "Создать дизайн-систему",
          "Тестирование удобства",
        ],
        relatedTopics: [
          "Пользовательский опыт",
          "Психология",
          "Графический дизайн",
        ],
      },
    ];
  }

  if (
    lowerQuery.includes("управление") ||
    lowerQuery.includes("менеджмент") ||
    lowerQuery.includes("проект")
  ) {
    return [
      {
        message:
          "Управление проектами включает планирование, организацию ресурсов, контроль выполнения и коммуникацию. Популярные методологии: Agile, Scrum, Kanban. Важно определить цели, разбить на задачи и отслеживать прогресс.",
        suggestions: [
          "Изучить Agile",
          "Планирование спринтов",
          "Работа с командой",
        ],
        relatedTopics: ["Лидерство", "Коммуникации", "Планирование"],
      },
    ];
  }

  // Общие ответы
  return [
    {
      message:
        "Отличный вопрос! Для получения более точного ответа, попробуйте уточнить вашу область интересов: программирование, дизайн, менеджмент, или что-то еще. Я готов помочь с изучением различных тем.",
      suggestions: [
        "Задать более конкретный вопрос",
        "Выбрать категорию",
        "Посмотреть курсы",
      ],
      relatedTopics: ["Общие вопросы", "Навигация", "Обучение"],
    },
    {
      message:
        "Я могу помочь с вопросами по разработке, дизайну, управлению проектами, информационной безопасности и другим темам. Расскажите подробнее, что вас интересует, и я дам развернутый ответ.",
      suggestions: ["Уточнить вопрос", "Выбрать тему", "Получить рекомендации"],
      relatedTopics: ["Консультации", "Обучение", "Развитие"],
    },
  ];
};
