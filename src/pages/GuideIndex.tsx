import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useState } from "react";

const GuideIndex = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Начало работы",
      description: "Как создать свой первый проект",
      icon: "Rocket",
      content: [
        "Опиши свою идею простым языком",
        "Юра создаст основу сайта за минуты",
        "Посмотри результат в режиме реального времени"
      ]
    },
    {
      id: 2,
      title: "Редактирование",
      description: "Как вносить правки в проект",
      icon: "Pencil",
      content: [
        "Попроси Юру изменить любой элемент",
        "Укажи конкретные правки: цвета, текст, структуру",
        "Используй скриншоты для визуальных правок"
      ]
    },
    {
      id: 3,
      title: "Публикация",
      description: "Вывод сайта в интернет",
      icon: "Globe",
      content: [
        "Нажми «Опубликовать» в редакторе",
        "Получи ссылку на свой сайт",
        "Подключи свой домен при необходимости"
      ]
    },
    {
      id: 4,
      title: "GitHub",
      description: "Доступ к коду проекта",
      icon: "Github",
      content: [
        "Подключи GitHub для полного доступа к коду",
        "Скачай код или билд проекта",
        "Работай с версиями и историей изменений"
      ]
    },
    {
      id: 5,
      title: "Дополнительно",
      description: "Расширенные возможности",
      icon: "Sparkles",
      content: [
        "База данных PostgreSQL доступна из коробки",
        "Серверные функции на Python или TypeScript",
        "Генерация изображений через AI",
        "Настройка SEO для поисковых систем"
      ]
    }
  ];

  const tips = [
    {
      icon: "Lightbulb",
      title: "Будь конкретным",
      text: "Чем точнее описание, тем лучше результат"
    },
    {
      icon: "MessageCircle",
      title: "Общайся на русском",
      text: "Пиши как обычно, без технических терминов"
    },
    {
      icon: "Image",
      title: "Используй скриншоты",
      text: "Покажи пример или набросок — Юра поймёт"
    },
    {
      icon: "Zap",
      title: "Итеративный подход",
      text: "Делай правки постепенно, шаг за шагом"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="Rocket" size={40} className="text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              poehali.dev
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Создавай сайты через русский язык. Без кода, без сложностей.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((step) => (
            <Card
              key={step.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                currentStep === step.id
                  ? "ring-2 ring-blue-500 shadow-xl scale-105"
                  : "hover:scale-102"
              }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    currentStep === step.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    <Icon name={step.icon as any} size={24} />
                  </div>
                  <div className="text-2xl font-bold text-gray-300">
                    {step.id}
                  </div>
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              {currentStep === step.id && (
                <CardContent>
                  <ul className="space-y-2">
                    {step.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <Icon name="Check" size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <Card className="mb-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Icon name="Zap" size={28} />
              Быстрый старт
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-lg mb-3">Примеры запросов для Юры:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Icon name="ArrowRight" size={16} className="mt-1 flex-shrink-0" />
                  <span>"Сделай лендинг для кофейни с меню и контактами"</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="ArrowRight" size={16} className="mt-1 flex-shrink-0" />
                  <span>"Создай интернет-магазин с каталогом товаров"</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="ArrowRight" size={16} className="mt-1 flex-shrink-0" />
                  <span>"Нужен сайт-портфолио для фотографа с галереей"</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="ArrowRight" size={16} className="mt-1 flex-shrink-0" />
                  <span>"Измени цвет кнопки на синий"</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Полезные советы
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {tips.map((tip, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Icon name={tip.icon as any} size={24} className="text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-1">{tip.title}</CardTitle>
                      <CardDescription className="text-base">{tip.text}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-2 border-dashed border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="BookOpen" size={24} />
              Нужна помощь?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => window.open("https://docs.poehali.dev", "_blank")}
              >
                <Icon name="FileText" size={20} className="mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Документация</div>
                  <div className="text-xs text-gray-500">Подробные инструкции</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => window.open("https://t.me/+QgiLIa1gFRY4Y2Iy", "_blank")}
              >
                <Icon name="MessageCircle" size={20} className="mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Сообщество</div>
                  <div className="text-xs text-gray-500">Telegram-канал</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuideIndex;
