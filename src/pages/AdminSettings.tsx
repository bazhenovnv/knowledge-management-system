import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { Footer } from "@/components/layout/Footer";
import { 
  TextSectionsTab, 
  type TextSection 
} from "@/components/admin/TextSectionsTab";
import { 
  ProjectSettingsTab, 
  type ProjectSettings 
} from "@/components/admin/ProjectSettingsTab";
import { 
  AppearanceTab, 
  type AppearanceSettings 
} from "@/components/admin/AppearanceTab";

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

const defaultAppearance: AppearanceSettings = {
  backgroundColor: "#f3f4f6",
  backgroundImage: "",
  contentBackgroundColor: "#ffffff",
  useBackgroundImage: false
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [textSections, setTextSections] = useState<TextSection[]>([]);
  const [settings, setSettings] = useState<ProjectSettings>(defaultSettings);
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance);
  const [activeSection, setActiveSection] = useState<string>("welcome");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedSections = localStorage.getItem("adminTextSections");
    const savedSettings = localStorage.getItem("adminProjectSettings");
    const savedAppearance = localStorage.getItem("appAppearanceSettings");

    if (savedSections) {
      setTextSections(JSON.parse(savedSections));
    } else {
      setTextSections(defaultTextSections);
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    if (savedAppearance) {
      setAppearance(JSON.parse(savedAppearance));
    }
  };

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
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/branches')}
              variant="outline"
              size="lg"
            >
              <Icon name="Building" className="mr-2" size={20} />
              Филиалы
            </Button>
            <Button 
              onClick={() => navigate('/test-sql')}
              variant="outline"
              size="lg"
            >
              <Icon name="Database" className="mr-2" size={20} />
              SQL Server
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
            >
              <Icon name="ArrowLeft" className="mr-2" size={20} />
              Вернуться в приложение
            </Button>
          </div>
        </div>

        <Tabs defaultValue="texts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="texts">
              <Icon name="FileText" className="mr-2" size={18} />
              Тексты разделов
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Sliders" className="mr-2" size={18} />
              Настройки проекта
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Icon name="Palette" className="mr-2" size={18} />
              Внешний вид
            </TabsTrigger>
          </TabsList>

          <TabsContent value="texts">
            <TextSectionsTab
              textSections={textSections}
              setTextSections={setTextSections}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </TabsContent>

          <TabsContent value="settings">
            <ProjectSettingsTab
              settings={settings}
              setSettings={setSettings}
            />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceTab
              appearance={appearance}
              setAppearance={setAppearance}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
