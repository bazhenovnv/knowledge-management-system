import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

interface TextSection {
  id: string;
  title: string;
  content: string;
  description: string;
}

interface ProjectSettings {
  projectName: string;
  companyName: string;
  supportEmail: string;
  maxEmployees: number;
  enableNotifications: boolean;
  enableAnalytics: boolean;
}

const defaultTextSections: TextSection[] = [
  {
    id: "welcome",
    title: "Приветствие на главной",
    content: "Добро пожаловать в систему обучения сотрудников",
    description: "Текст приветствия для главной страницы"
  },
  {
    id: "about",
    title: "О системе",
    content: "Наша система помогает эффективно управлять обучением и развитием сотрудников",
    description: "Описание системы для новых пользователей"
  },
  {
    id: "footer",
    title: "Подвал сайта",
    content: "© 2024 Система обучения персонала. Все права защищены.",
    description: "Текст для нижней части страницы"
  }
];

const defaultSettings: ProjectSettings = {
  projectName: "Система обучения",
  companyName: "Моя компания",
  supportEmail: "support@example.com",
  maxEmployees: 100,
  enableNotifications: true,
  enableAnalytics: true
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [textSections, setTextSections] = useState<TextSection[]>([]);
  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState<string>("welcome");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSections = localStorage.getItem("adminTextSections");
    const savedSettings = localStorage.getItem("adminProjectSettings");

    if (savedSections) {
      setTextSections(JSON.parse(savedSections));
    } else {
      setTextSections(defaultTextSections);
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveTextSections = () => {
    localStorage.setItem("adminTextSections", JSON.stringify(textSections));
    toast({
      title: "Сохранено",
      description: "Тексты успешно обновлены",
    });
  };

  const saveSettings = () => {
    localStorage.setItem("adminProjectSettings", JSON.stringify(settings));
    toast({
      title: "Сохранено",
      description: "Настройки проекта обновлены",
    });
  };

  const updateTextSection = (id: string, field: keyof TextSection, value: string) => {
    setTextSections(sections =>
      sections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const addNewSection = () => {
    const newSection: TextSection = {
      id: `custom_${Date.now()}`,
      title: "Новый раздел",
      content: "",
      description: "Описание нового раздела"
    };
    setTextSections([...textSections, newSection]);
    setActiveSection(newSection.id);
  };

  const deleteSection = (id: string) => {
    if (textSections.length <= 1) {
      toast({
        title: "Ошибка",
        description: "Нельзя удалить последний раздел",
        variant: "destructive"
      });
      return;
    }
    setTextSections(sections => sections.filter(s => s.id !== id));
    setActiveSection(textSections[0]?.id || "");
  };

  const currentSection = textSections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              <Icon name="Settings" className="inline mr-2" size={32} />
              Настройки администратора
            </h1>
            <p className="text-gray-600">
              Управление текстами и настройками проекта
            </p>
          </div>
          <Button 
            onClick={() => navigate('/admin-console')}
            variant="outline"
            size="lg"
          >
            <Icon name="Terminal" className="mr-2" size={20} />
            Консоль логов
          </Button>
        </div>

        <Tabs defaultValue="texts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="texts">
              <Icon name="FileText" className="mr-2" size={18} />
              Тексты разделов
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Sliders" className="mr-2" size={18} />
              Настройки проекта
            </TabsTrigger>
          </TabsList>

          <TabsContent value="texts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Редактирование текстов</h2>
              <Button onClick={addNewSection} size="sm">
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить раздел
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Разделы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {textSections.map(section => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section.id)}
                    >
                      <Icon name="FileText" className="mr-2" size={16} />
                      {section.title}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Редактировать раздел</CardTitle>
                  <CardDescription>
                    {currentSection?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentSection && (
                    <>
                      <div>
                        <Label htmlFor="section-title">Название раздела</Label>
                        <Input
                          id="section-title"
                          value={currentSection.title}
                          onChange={(e) => updateTextSection(currentSection.id, "title", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="section-description">Описание</Label>
                        <Input
                          id="section-description"
                          value={currentSection.description}
                          onChange={(e) => updateTextSection(currentSection.id, "description", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="section-content">Содержание</Label>
                        <Textarea
                          id="section-content"
                          value={currentSection.content}
                          onChange={(e) => updateTextSection(currentSection.id, "content", e.target.value)}
                          rows={8}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={saveTextSections} className="flex-1">
                          <Icon name="Save" className="mr-2" size={16} />
                          Сохранить
                        </Button>
                        {!["welcome", "about", "footer"].includes(currentSection.id) && (
                          <Button
                            variant="destructive"
                            onClick={() => deleteSection(currentSection.id)}
                          >
                            <Icon name="Trash2" className="mr-2" size={16} />
                            Удалить
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Основные настройки</CardTitle>
                <CardDescription>
                  Конфигурация проекта и системные параметры
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="projectName">Название проекта</Label>
                    <Input
                      id="projectName"
                      value={settings.projectName}
                      onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyName">Название компании</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="supportEmail">Email поддержки</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxEmployees">Макс. сотрудников</Label>
                    <Input
                      id="maxEmployees"
                      type="number"
                      value={settings.maxEmployees}
                      onChange={(e) => setSettings({ ...settings, maxEmployees: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Уведомления</Label>
                      <p className="text-sm text-gray-500">Отправлять email уведомления</p>
                    </div>
                    <Button
                      variant={settings.enableNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                    >
                      {settings.enableNotifications ? "Включено" : "Выключено"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Аналитика</Label>
                      <p className="text-sm text-gray-500">Собирать данные использования</p>
                    </div>
                    <Button
                      variant={settings.enableAnalytics ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings({ ...settings, enableAnalytics: !settings.enableAnalytics })}
                    >
                      {settings.enableAnalytics ? "Включено" : "Выключено"}
                    </Button>
                  </div>
                </div>

                <Button onClick={saveSettings} className="w-full">
                  <Icon name="Save" className="mr-2" size={16} />
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}