import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Mic,
  MicOff,
  MessageCircle,
  Volume2,
  VolumeX,
  Bot,
  Sparkles,
  Send,
} from "lucide-react";
import Icon from "@/components/ui/icon";

interface AliceAssistantProps {
  onNavigate?: (tab: string) => void;
  userRole?: "admin" | "teacher" | "student";
}

interface Message {
  id: string;
  type: "user" | "alice";
  text: string;
  timestamp: Date;
  isVoice?: boolean;
}

const AliceAssistant: React.FC<AliceAssistantProps> = ({
  onNavigate,
  userRole = "student",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "alice",
      text: "Привет! Я Алиса - ваш AI помощник в системе обучения. Могу помочь с навигацией, ответить на вопросы о тестах и курсах, или найти нужную информацию. Чем могу помочь?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Инициализация речевых API
  useEffect(() => {
    // Проверяем поддержку Speech Recognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = "ru-RU";
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript, true);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Проверяем поддержку Speech Synthesis
    if ("speechSynthesis" in window) {
      setSynthesis(window.speechSynthesis);
    }
  }, []);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Команды для Алисы
  const aliceCommands = {
    navigation: {
      главная: () => onNavigate?.("home"),
      дашборд: () =>
        onNavigate?.(
          userRole === "admin"
            ? "dashboard"
            : userRole === "teacher"
              ? "dashboard"
              : "dashboard",
        ),
      курсы: () => onNavigate?.("courses"),
      тесты: () => onNavigate?.("tests"),
      аналитика: () => onNavigate?.("analytics"),
      обучение: () => onNavigate?.("courses"),
      знания: () => onNavigate?.("courses"),
    },
    responses: {
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

  const handleUserMessage = (text: string, isVoice = false) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text,
      timestamp: new Date(),
      isVoice,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Обработка команд
    setTimeout(() => {
      const response = processAliceCommand(text.toLowerCase());
      const aliceMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "alice",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aliceMessage]);

      // Озвучиваем ответ Алисы
      if (synthesis && !isSpeaking) {
        speakText(response);
      }
    }, 500);

    setInputText("");
  };

  const processAliceCommand = (text: string): string => {
    // Проверяем команды навигации
    for (const [command, action] of Object.entries(aliceCommands.navigation)) {
      if (text.includes(command)) {
        action();
        return `Открываю ${command}...`;
      }
    }

    // Проверяем готовые ответы
    for (const [trigger, response] of Object.entries(aliceCommands.responses)) {
      if (text.includes(trigger)) {
        return response;
      }
    }

    // Специальные команды
    if (text.includes("тест") && text.includes("создать")) {
      return userRole === "admin" || userRole === "teacher"
        ? 'Для создания теста перейдите в раздел "Тесты" и нажмите кнопку "Создать тест".'
        : "Создание тестов доступно только преподавателям и администраторам.";
    }

    if (text.includes("результат") || text.includes("балл")) {
      return 'Ваши результаты тестов можно посмотреть в личном кабинете в разделе "Дашборд".';
    }

    if (text.includes("курс") && text.includes("записаться")) {
      return 'Для записи на курс перейдите в раздел "Курсы" и выберите интересующий курс.';
    }

    if (text.includes("забыл") && text.includes("пароль")) {
      return "Для восстановления пароля обратитесь к администратору системы.";
    }

    // Общий ответ
    return 'Интересный вопрос! Попробуйте быть более конкретными или воспользуйтесь командами: "покажи тесты", "открой курсы", "помощь".';
  };

  const speakText = (text: string) => {
    if (synthesis) {
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
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking && synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <>
      {/* Плавающая кнопка Алисы */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
            >
              <Icon name="Bot" size={24} className="text-white" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md h-[600px] flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
                  <Icon name="Bot" size={20} className="text-purple-600" />
                </div>
                <span>Алиса - AI Помощник</span>
                <Badge variant="outline" className="ml-auto">
                  <Icon name="Sparkles" size={12} className="mr-1" />
                  Онлайн
                </Badge>
              </DialogTitle>
            </DialogHeader>

            {/* Чат */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        {message.type === "alice" && (
                          <Icon
                            name="Bot"
                            size={14}
                            className="text-purple-600"
                          />
                        )}
                        {message.isVoice && (
                          <Icon name="Mic" size={12} className="opacity-60" />
                        )}
                        <span className="text-xs opacity-60">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-line">
                        {message.text}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Управление */}
              <div className="flex items-center space-x-2 pt-3 border-t">
                <Button
                  variant={isSpeaking ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleSpeech}
                  disabled={!synthesis}
                >
                  <Icon name={isSpeaking ? "VolumeX" : "Volume2"} size={16} />
                </Button>

                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  disabled={!recognition}
                  className={isListening ? "animate-pulse" : ""}
                >
                  <Icon name={isListening ? "MicOff" : "Mic"} size={16} />
                </Button>

                <div className="flex-1 flex space-x-1">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Напишите ваш вопрос..."
                    className="min-h-0 h-9 resize-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (inputText.trim()) {
                          handleUserMessage(inputText.trim());
                        }
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      inputText.trim() && handleUserMessage(inputText.trim())
                    }
                    disabled={!inputText.trim()}
                  >
                    <Icon name="Send" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Индикатор активности */}
      {isListening && (
        <div className="fixed bottom-24 right-6 z-40">
          <Card className="p-3 bg-red-50 border-red-200">
            <div className="flex items-center space-x-2 text-red-600">
              <Icon name="Mic" size={16} className="animate-pulse" />
              <span className="text-sm font-medium">Слушаю...</span>
            </div>
          </Card>
        </div>
      )}

      {isSpeaking && (
        <div className="fixed bottom-24 right-6 z-40">
          <Card className="p-3 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-2 text-blue-600">
              <Icon name="Volume2" size={16} className="animate-pulse" />
              <span className="text-sm font-medium">Говорю...</span>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default AliceAssistant;
