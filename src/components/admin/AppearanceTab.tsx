import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

export interface AppearanceSettings {
  backgroundColor: string;
  backgroundImage: string;
  contentBackgroundColor: string;
  useBackgroundImage: boolean;
}

interface AppearanceTabProps {
  appearance: AppearanceSettings;
  setAppearance: (appearance: AppearanceSettings) => void;
}

export function AppearanceTab({ appearance, setAppearance }: AppearanceTabProps) {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const validateColor = (color: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  };

  const validateUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateAppearance = (): string | null => {
    if (!appearance.useBackgroundImage) {
      if (!validateColor(appearance.backgroundColor)) {
        return "Некорректный формат цвета фона (используйте HEX, например #f3f4f6)";
      }
    } else {
      if (!appearance.backgroundImage.trim()) {
        return "URL изображения не может быть пустым";
      }
      if (!validateUrl(appearance.backgroundImage)) {
        return "Некорректный URL изображения";
      }
    }
    if (!validateColor(appearance.contentBackgroundColor)) {
      return "Некорректный формат цвета контента (используйте HEX)";
    }
    return null;
  };

  const saveAppearance = () => {
    const error = validateAppearance();
    if (error) {
      toast({
        title: "Ошибка валидации",
        description: error,
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem("appAppearanceSettings", JSON.stringify(appearance));
    window.dispatchEvent(new Event('appearanceChanged'));
    toast({
      title: "Сохранено",
      description: "Настройки внешнего вида обновлены",
    });
  };

  const updateAppearance = <K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) => {
    setAppearance({ ...appearance, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Фон приложения</CardTitle>
          <CardDescription>
            Настройка фона для всего приложения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium mb-1">Тип фона</h4>
              <p className="text-sm text-gray-600">
                Выберите между цветом и изображением
              </p>
            </div>
            <Button
              variant={appearance.useBackgroundImage ? "default" : "outline"}
              onClick={() => updateAppearance("useBackgroundImage", !appearance.useBackgroundImage)}
            >
              <Icon 
                name={appearance.useBackgroundImage ? "Image" : "Palette"} 
                className="mr-2" 
                size={16} 
              />
              {appearance.useBackgroundImage ? "Изображение" : "Цвет"}
            </Button>
          </div>

          {!appearance.useBackgroundImage ? (
            <div className="space-y-2">
              <Label htmlFor="bg-color">Цвет фона</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={appearance.backgroundColor}
                  onChange={(e) => updateAppearance("backgroundColor", e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={appearance.backgroundColor}
                  onChange={(e) => updateAppearance("backgroundColor", e.target.value)}
                  placeholder="#f3f4f6"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  className={`flex-1 ${!validateColor(appearance.backgroundColor) ? "border-red-300" : ""}`}
                />
              </div>
              {!validateColor(appearance.backgroundColor) && (
                <p className="text-xs text-red-500">Используйте HEX формат (например, #f3f4f6)</p>
              )}
            </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="bg-image">URL изображения</Label>
              <Input
                id="bg-image"
                type="url"
                value={appearance.backgroundImage}
                onChange={(e) => {
                  updateAppearance("backgroundImage", e.target.value);
                  setImageError(false);
                }}
                placeholder="https://example.com/background.jpg"
                className={appearance.backgroundImage && !validateUrl(appearance.backgroundImage) ? "border-red-300" : ""}
              />
              {appearance.backgroundImage && !validateUrl(appearance.backgroundImage) && (
                <p className="text-xs text-red-500">Некорректный URL (должен начинаться с http:// или https://)</p>
              )}
              {appearance.backgroundImage && validateUrl(appearance.backgroundImage) && (
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <img 
                    src={appearance.backgroundImage} 
                    alt="Предпросмотр фона"
                    className="w-full h-48 object-cover"
                    onError={() => setImageError(true)}
                  />
                  {imageError && (
                    <p className="text-xs text-red-500 p-2">Не удалось загрузить изображение</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Цвет контента</CardTitle>
          <CardDescription>
            Цвет фона для карточек и контейнеров
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="content-bg-color">Цвет фона контента</Label>
          <div className="flex gap-2">
            <Input
              id="content-bg-color"
              type="color"
              value={appearance.contentBackgroundColor}
              onChange={(e) => updateAppearance("contentBackgroundColor", e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={appearance.contentBackgroundColor}
              onChange={(e) => updateAppearance("contentBackgroundColor", e.target.value)}
              placeholder="#ffffff"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              className={`flex-1 ${!validateColor(appearance.contentBackgroundColor) ? "border-red-300" : ""}`}
            />
          </div>
          {!validateColor(appearance.contentBackgroundColor) && (
            <p className="text-xs text-red-500">Используйте HEX формат (например, #ffffff)</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Предпросмотр</CardTitle>
          <CardDescription>
            Как будет выглядеть ваше приложение
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="border rounded-lg p-8 min-h-[200px] flex items-center justify-center"
            style={{
              backgroundColor: appearance.useBackgroundImage ? 'transparent' : appearance.backgroundColor,
              backgroundImage: appearance.useBackgroundImage ? `url(${appearance.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div 
              className="p-6 rounded-lg shadow-lg max-w-md w-full"
              style={{ backgroundColor: appearance.contentBackgroundColor }}
            >
              <h3 className="text-xl font-bold mb-2">Пример карточки</h3>
              <p className="text-gray-600">
                Так будут выглядеть элементы интерфейса на вашем фоне
              </p>
              <Button className="mt-4 w-full">Пример кнопки</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveAppearance} size="lg">
          <Icon name="Save" className="mr-2" size={20} />
          Применить изменения
        </Button>
      </div>
    </div>
  );
}