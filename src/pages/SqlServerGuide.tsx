import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Icon from "@/components/ui/icon";
import { useState } from "react";

const SqlServerGuide = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const steps = [
    {
      id: 1,
      title: "Установка ngrok",
      icon: "Download",
      substeps: [
        {
          text: "Перейди на сайт ngrok.com и зарегистрируйся",
          code: "https://ngrok.com/download"
        },
        {
          text: "Скачай ngrok для своей системы (Windows/Mac/Linux)",
          code: null
        },
        {
          text: "Распакуй архив в удобную папку",
          code: null
        },
        {
          text: "Получи свой authtoken в личном кабинете ngrok",
          code: null
        },
        {
          text: "Авторизуй ngrok командой:",
          code: "ngrok config add-authtoken ВАШ_ТОКЕН"
        }
      ]
    },
    {
      id: 2,
      title: "Проверка SQL Server",
      icon: "Database",
      substeps: [
        {
          text: "Убедись, что SQL Server запущен на порту 1433",
          code: null
        },
        {
          text: "Открой SQL Server Configuration Manager",
          code: null
        },
        {
          text: "Включи TCP/IP протокол в настройках сети",
          code: "SQL Server Network Configuration → Protocols → TCP/IP → Enable"
        },
        {
          text: "Перезапуsti SQL Server после изменений",
          code: null
        },
        {
          text: "Проверь, что SQL Server Authentication включён",
          code: null
        }
      ]
    },
    {
      id: 3,
      title: "Запуск ngrok туннеля",
      icon: "Zap",
      substeps: [
        {
          text: "Открой терминал/командную строку",
          code: null
        },
        {
          text: "Перейди в папку с ngrok",
          code: "cd путь/к/ngrok"
        },
        {
          text: "Запусти туннель к SQL Server:",
          code: "ngrok tcp 1433",
          important: true
        },
        {
          text: "Не закрывай окно ngrok - оно должно работать постоянно",
          code: null
        }
      ]
    },
    {
      id: 4,
      title: "Получение адреса ngrok",
      icon: "Link",
      substeps: [
        {
          text: "В окне ngrok найди строку 'Forwarding'",
          code: "tcp://0.tcp.ngrok.io:12345 -> localhost:1433"
        },
        {
          text: "Скопируй хост (0.tcp.ngrok.io) и порт (12345)",
          code: null
        },
        {
          text: "Формат адреса: ХОСТ,ПОРТ",
          code: "Например: 0.tcp.ngrok.io,12345",
          important: true
        }
      ]
    },
    {
      id: 5,
      title: "Обновление строки подключения",
      icon: "Settings",
      substeps: [
        {
          text: "Открой секреты проекта в poehali.dev",
          code: null
        },
        {
          text: "Найди секрет MSSQL_CONNECTION_STRING",
          code: null
        },
        {
          text: "Обнови значение:",
          code: "Server=0.tcp.ngrok.io,12345;Database=ИМЯ_БД;User Id=ЛОГИН;Password=ПАРОЛЬ;TrustServerCertificate=True;Encrypt=True;",
          important: true
        },
        {
          text: "Замени 0.tcp.ngrok.io,12345 на свой адрес из шага 4",
          code: null
        },
        {
          text: "Сохрани изменения",
          code: null
        }
      ]
    },
    {
      id: 6,
      title: "Проверка подключения",
      icon: "CheckCircle",
      substeps: [
        {
          text: "Открой консоль браузера (F12)",
          code: null
        },
        {
          text: "Выполни тестовый запрос:",
          code: "fetch('https://functions.poehali.dev/76973564-4ea6-4a98-9582-8f19bc9a6bb6', {\n  method: 'POST',\n  headers: {'Content-Type': 'application/json'},\n  body: JSON.stringify({query: 'SELECT TOP 1 * FROM employees'})\n}).then(r => r.json()).then(console.log)",
          important: true
        },
        {
          text: "Если видишь данные - всё работает! 🎉",
          code: null
        }
      ]
    }
  ];

  const commonIssues = [
    {
      icon: "AlertCircle",
      problem: "ngrok показывает 'ERR_NGROK_108'",
      solution: "Проверь, что SQL Server запущен и слушает порт 1433"
    },
    {
      icon: "AlertCircle",
      problem: "Ошибка подключения 'Login failed'",
      solution: "Проверь логин и пароль в строке подключения"
    },
    {
      icon: "AlertCircle",
      problem: "Адрес ngrok меняется при перезапуске",
      solution: "Бесплатная версия ngrok меняет адрес. Обновляй строку подключения после каждого перезапуска"
    },
    {
      icon: "AlertCircle",
      problem: "Timeout при подключении",
      solution: "Убедись, что ngrok запущен и не закрыт. Проверь firewall"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon name="Database" size={48} className="text-blue-600" />
            <Icon name="ArrowRight" size={32} className="text-gray-400" />
            <Icon name="Cloud" size={48} className="text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-gray-800">
            Подключение SQL Server через ngrok
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Пошаговая инструкция для подключения локальной базы данных к облачному приложению
          </p>
        </div>

        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Icon name="Info" className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>Важно:</strong> Окно ngrok должно оставаться открытым всё время работы. При перезапуске ngrok адрес изменится - нужно будет обновить строку подключения.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 mb-12">
          {steps.map((step) => (
            <Card
              key={step.id}
              className={`cursor-pointer transition-all ${
                expandedStep === step.id
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-xl ${
                      expandedStep === step.id ? "bg-blue-600" : "bg-gray-400"
                    }`}>
                      {step.id}
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Icon name={step.icon as any} size={24} />
                        {step.title}
                      </CardTitle>
                    </div>
                  </div>
                  <Icon
                    name={expandedStep === step.id ? "ChevronUp" : "ChevronDown"}
                    size={24}
                    className="text-gray-400"
                  />
                </div>
              </CardHeader>
              {expandedStep === step.id && (
                <CardContent className="pt-0">
                  <div className="space-y-4 ml-16">
                    {step.substeps.map((substep, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700 mb-2">{substep.text}</p>
                          {substep.code && (
                            <div className={`p-3 rounded-lg font-mono text-sm overflow-x-auto ${
                              substep.important
                                ? "bg-yellow-50 border-2 border-yellow-300 text-yellow-900"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              <pre className="whitespace-pre-wrap">{substep.code}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <Card className="border-orange-200 bg-orange-50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Icon name="AlertTriangle" size={24} />
              Частые проблемы и решения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commonIssues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Icon name={issue.icon as any} size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{issue.problem}</p>
                    <p className="text-gray-600 text-sm">{issue.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Icon name="Lightbulb" size={28} />
              Полезные советы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-white/90">
            <div className="flex items-start gap-2">
              <Icon name="Check" size={20} className="flex-shrink-0 mt-0.5" />
              <p>Сохрани адрес ngrok в текстовый файл, чтобы не искать его каждый раз</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Check" size={20} className="flex-shrink-0 mt-0.5" />
              <p>Используй платную версию ngrok для постоянного адреса (от $8/месяц)</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Check" size={20} className="flex-shrink-0 mt-0.5" />
              <p>Запускай ngrok в отдельном окне терминала, чтобы видеть логи подключений</p>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="Check" size={20} className="flex-shrink-0 mt-0.5" />
              <p>Для продакшена рассмотри вариант размещения БД в облаке (Azure SQL, AWS RDS)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SqlServerGuide;
