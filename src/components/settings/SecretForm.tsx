import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

export default function SecretForm() {
  const [secretValue, setSecretValue] = useState('postgresql://gen_user:TC%3Eo0yl2J_PR(e@c6b7ae5ab8e72b5408272e27.twc1.net:5432/default_db?sslmode=require');
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!secretValue.trim()) {
      toast.error('Введите строку подключения');
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.setItem('EXTERNAL_DATABASE_URL', secretValue);
      
      toast.success('Секрет сохранён!', {
        description: 'Строка подключения к базе данных обновлена'
      });
    } catch (error) {
      console.error('Error saving secret:', error);
      toast.error('Ошибка при сохранении секрета');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(secretValue);
    toast.success('Скопировано в буфер обмена');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Key" size={20} />
          Секрет: EXTERNAL_DATABASE_URL
        </CardTitle>
        <CardDescription>
          Строка подключения к внешней базе данных TimeWeb Cloud
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="secret-value">Строка подключения PostgreSQL</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="secret-value"
                type={isVisible ? 'text' : 'password'}
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
                placeholder="postgresql://user:password@host:5432/database"
                className="pr-10 font-mono text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setIsVisible(!isVisible)}
              >
                <Icon name={isVisible ? 'EyeOff' : 'Eye'} size={16} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Копировать"
            >
              <Icon name="Copy" size={16} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Формат: postgresql://username:password@host:port/database?sslmode=require
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Icon name="Info" size={16} className="mt-0.5 text-blue-500" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Данные из панели TimeWeb Cloud:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Хост: c6b7ae5ab8e72b5408272e27.twc1.net</li>
                <li>Порт: 5432</li>
                <li>База: default_db</li>
                <li>Пользователь: gen_user</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !secretValue.trim()}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить секрет
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
