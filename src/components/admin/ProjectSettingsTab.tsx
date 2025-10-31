import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

export interface ProjectSettings {
  projectName: string;
  companyName: string;
  supportEmail: string;
  maxEmployees: number;
  enableNotifications: boolean;
  enableAnalytics: boolean;
}

interface ProjectSettingsTabProps {
  settings: ProjectSettings;
  setSettings: (settings: ProjectSettings) => void;
}

export function ProjectSettingsTab({ settings, setSettings }: ProjectSettingsTabProps) {
  const { toast } = useToast();

  const saveSettings = () => {
    localStorage.setItem("adminProjectSettings", JSON.stringify(settings));
    toast({
      title: "Сохранено",
      description: "Настройки проекта обновлены",
    });
  };

  const updateSetting = <K extends keyof ProjectSettings>(
    key: K,
    value: ProjectSettings[K]
  ) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
          <CardDescription>
            Общая информация о проекте и компании
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Название проекта</Label>
              <Input
                id="project-name"
                value={settings.projectName}
                onChange={(e) => updateSetting("projectName", e.target.value)}
                placeholder="Система обучения"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name">Название компании</Label>
              <Input
                id="company-name"
                value={settings.companyName}
                onChange={(e) => updateSetting("companyName", e.target.value)}
                placeholder="Моя компания"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-email">Email поддержки</Label>
              <Input
                id="support-email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting("supportEmail", e.target.value)}
                placeholder="support@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-employees">Максимум сотрудников</Label>
              <Input
                id="max-employees"
                type="number"
                value={settings.maxEmployees}
                onChange={(e) => updateSetting("maxEmployees", parseInt(e.target.value) || 0)}
                placeholder="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Функциональные настройки</CardTitle>
          <CardDescription>
            Включение и отключение функций системы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Уведомления</h4>
              <p className="text-sm text-gray-600">
                Отправка уведомлений пользователям
              </p>
            </div>
            <Button
              variant={settings.enableNotifications ? "default" : "outline"}
              onClick={() => updateSetting("enableNotifications", !settings.enableNotifications)}
            >
              <Icon 
                name={settings.enableNotifications ? "Bell" : "BellOff"} 
                className="mr-2" 
                size={16} 
              />
              {settings.enableNotifications ? "Включено" : "Выключено"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Аналитика</h4>
              <p className="text-sm text-gray-600">
                Сбор статистики использования
              </p>
            </div>
            <Button
              variant={settings.enableAnalytics ? "default" : "outline"}
              onClick={() => updateSetting("enableAnalytics", !settings.enableAnalytics)}
            >
              <Icon 
                name={settings.enableAnalytics ? "BarChart" : "BarChartHorizontal"} 
                className="mr-2" 
                size={16} 
              />
              {settings.enableAnalytics ? "Включено" : "Выключено"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg">
          <Icon name="Save" className="mr-2" size={20} />
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
}
