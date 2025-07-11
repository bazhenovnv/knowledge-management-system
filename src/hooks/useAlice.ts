import { useState, useEffect, useCallback } from "react";

interface AliceHookProps {
  onNavigate?: (tab: string) => void;
  userRole?: "admin" | "teacher" | "student";
}

export const useAlice = ({
  onNavigate,
  userRole = "student",
}: AliceHookProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Инициализация речевых API
  useEffect(() => {
    let recognitionInstance: SpeechRecognition | null = null;
    let synthesisInstance: SpeechSynthesis | null = null;

    // Проверяем поддержку Speech Recognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = "ru-RU";
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      setRecognition(recognitionInstance);
    }

    // Проверяем поддержку Speech Synthesis
    if ("speechSynthesis" in window) {
      synthesisInstance = window.speechSynthesis;
      setSynthesis(synthesisInstance);
    }

    setIsSupported(!!recognitionInstance && !!synthesisInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
      }
      if (synthesisInstance) {
        synthesisInstance.cancel();
      }
    };
  }, []);

  // Команды для Алисы
  const aliceCommands = {
    navigation: {
      главная: () => onNavigate?.("home"),
      дашборд: () => onNavigate?.("dashboard"),
      курсы: () => onNavigate?.("knowledge"),
      тесты: () => onNavigate?.("tests"),
      аналитика: () => onNavigate?.("analytics"),
      обучение: () => onNavigate?.("knowledge"),
      знания: () => onNavigate?.("knowledge"),
    },
    responses: {
      привет: "Привет! Готова помочь с обучением.",
      "как дела": "У меня всё отлично! Готова помочь с обучением.",
      "что ты умеешь": `Я могу помочь вам:
      • Найти и запустить тесты
      • Показать курсы и материалы
      • Объяснить как работать с системой
      • Перейти к нужному разделу
      • Ответить на вопросы об обучении
      ${userRole === "admin" ? "• Помочь с управлением пользователями" : ""}
      ${userRole === "teacher" ? "• Создать новые тесты и курсы" : ""}`,
      помощь:
        'Скажите или напишите что вам нужно. Например: "покажи тесты", "открой курсы", "как пройти тест" или "что нового".',
      спасибо: "Пожалуйста! Всегда рада помочь 😊",
      пока: "До свидания! Удачного обучения!",
    },
  };

  // Обработка команд
  const processCommand = useCallback(
    (text: string): string => {
      const lowerText = text.toLowerCase();

      // Проверяем команды навигации
      for (const [command, action] of Object.entries(
        aliceCommands.navigation,
      )) {
        if (lowerText.includes(command)) {
          action();
          return `Открываю ${command}...`;
        }
      }

      // Проверяем готовые ответы
      for (const [trigger, response] of Object.entries(
        aliceCommands.responses,
      )) {
        if (lowerText.includes(trigger)) {
          return response;
        }
      }

      // Специальные команды
      if (lowerText.includes("тест") && lowerText.includes("создать")) {
        return userRole === "admin" || userRole === "teacher"
          ? 'Для создания теста перейдите в раздел "Тесты" и нажмите кнопку "Создать тест".'
          : "Создание тестов доступно только преподавателям и администраторам.";
      }

      if (lowerText.includes("результат") || lowerText.includes("балл")) {
        return 'Ваши результаты тестов можно посмотреть в личном кабинете в разделе "Дашборд".';
      }

      if (lowerText.includes("курс") && lowerText.includes("записаться")) {
        return 'Для записи на курс перейдите в раздел "Курсы" и выберите интересующий курс.';
      }

      if (lowerText.includes("забыл") && lowerText.includes("пароль")) {
        return "Для восстановления пароля обратитесь к администратору системы.";
      }

      // Общий ответ
      return 'Интересный вопрос! Попробуйте быть более конкретными или воспользуйтесь командами: "покажи тесты", "открой курсы", "помощь".';
    },
    [userRole, onNavigate, aliceCommands],
  );

  // Озвучивание текста
  const speak = useCallback(
    (text: string) => {
      if (synthesis && isSupported) {
        synthesis.cancel(); // Останавливаем предыдущую речь
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ru-RU";
        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthesis.speak(utterance);
      }
    },
    [synthesis, isSupported],
  );

  // Остановка речи
  const stopSpeaking = useCallback(() => {
    if (synthesis && isSpeaking) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  }, [synthesis, isSpeaking]);

  // Начать слушать
  const startListening = useCallback(
    (onResult?: (text: string) => void) => {
      if (recognition && !isListening && isSupported) {
        setIsListening(true);

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          onResult?.(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      }
    },
    [recognition, isListening, isSupported],
  );

  // Остановить слушание
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  return {
    isListening,
    isSpeaking,
    isSupported,
    processCommand,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
  };
};

export default useAlice;
