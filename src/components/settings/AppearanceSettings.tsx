import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Icon from "@/components/ui/icon";

interface AppearanceSettings {
  backgroundColor: string;
  backgroundImage: string;
  contentBackgroundColor: string;
  useBackgroundImage: boolean;
}

const defaultAppearance: AppearanceSettings = {
  backgroundColor: "#f3f4f6",
  backgroundImage: "",
  contentBackgroundColor: "#ffffff",
  useBackgroundImage: false
};

export default function AppearanceSettings() {
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance);

  useEffect(() => {
    loadAppearance();
  }, []);

  const loadAppearance = () => {
    const savedAppearance = localStorage.getItem("appAppearanceSettings");
    if (savedAppearance) {
      setAppearance(JSON.parse(savedAppearance));
    }
  };

  const saveAppearance = () => {
    localStorage.setItem("appAppearanceSettings", JSON.stringify(appearance));
    window.dispatchEvent(new Event('appearanceChanged'));
    toast.success("Настройки внешнего вида обновлены");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppearance({ ...appearance, backgroundImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const previewStyle: React.CSSProperties = appearance.useBackgroundImage && appearance.backgroundImage
    ? {
        backgroundImage: `url(${appearance.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundColor: appearance.backgroundColor,
      };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Palette" size={24} />
            Внешний вид приложения
          </CardTitle>
          <CardDescription>
            Настройте цвета и фоновое изображение для всего приложения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="bg-color">Цвет фона приложения</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={appearance.backgroundColor}
                  onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={appearance.backgroundColor}
                  onChange={(e) => setAppearance({ ...appearance, backgroundColor: e.target.value })}
                  className="flex-1"
                  placeholder="#f3f4f6"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content-bg-color">Цвет фона контента (карточек)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="content-bg-color"
                  type="color"
                  value={appearance.contentBackgroundColor}
                  onChange={(e) => setAppearance({ ...appearance, contentBackgroundColor: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={appearance.contentBackgroundColor}
                  onChange={(e) => setAppearance({ ...appearance, contentBackgroundColor: e.target.value })}
                  className="flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-bg-image">Использовать фоновое изображение</Label>
                <Switch
                  id="use-bg-image"
                  checked={appearance.useBackgroundImage}
                  onCheckedChange={(checked) => setAppearance({ ...appearance, useBackgroundImage: checked })}
                />
              </div>
              <p className="text-sm text-gray-500">
                Если включено, будет использоваться фоновое изображение вместо цвета
              </p>
            </div>

            {appearance.useBackgroundImage && (
              <div>
                <Label htmlFor="bg-image">Фоновое изображение</Label>
                <Input
                  id="bg-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-2"
                />
                {appearance.backgroundImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppearance({ ...appearance, backgroundImage: "" })}
                    className="mt-2"
                  >
                    <Icon name="X" size={16} className="mr-2" />
                    Удалить изображение
                  </Button>
                )}
              </div>
            )}
          </div>

          <div>
            <Label>Предварительный просмотр</Label>
            <div
              className="mt-2 h-48 rounded-lg border-2 border-dashed border-gray-300 p-4"
              style={previewStyle}
            >
              <div
                className="h-full rounded-lg p-4 shadow-sm"
                style={{ backgroundColor: appearance.contentBackgroundColor }}
              >
                <p className="text-gray-700 font-medium">Пример карточки контента</p>
                <p className="text-gray-500 text-sm mt-2">
                  Так будут выглядеть карточки с контентом на вашем фоне
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={saveAppearance} className="flex-1">
              <Icon name="Save" size={16} className="mr-2" />
              Применить настройки
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAppearance(defaultAppearance);
                localStorage.removeItem("appAppearanceSettings");
                window.dispatchEvent(new Event('appearanceChanged'));
                toast.success("Настройки сброшены");
              }}
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
