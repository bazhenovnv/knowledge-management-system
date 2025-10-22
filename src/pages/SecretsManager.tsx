import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Secret {
  name: string;
  value: string;
  description: string;
}

const SecretsManager = () => {
  const { toast } = useToast();
  const [secrets, setSecrets] = useState<Secret[]>([
    {
      name: 'DATABASE_URL',
      value: '',
      description: 'Ссылка для подключения к PostgreSQL базе данных'
    },
    {
      name: 'SQL_SERVER_CONNECTION_STRING',
      value: '',
      description: 'Строка подключения к SQL Server через XTunnel'
    }
  ]);

  const [newSecret, setNewSecret] = useState({
    name: '',
    value: '',
    description: ''
  });

  const handleUpdateSecret = (index: number, value: string) => {
    const updated = [...secrets];
    updated[index].value = value;
    setSecrets(updated);
    
    toast({
      title: 'Секрет обновлен',
      description: `${updated[index].name} успешно обновлен`,
    });
  };

  const handleAddSecret = () => {
    if (!newSecret.name || !newSecret.value) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и значение секрета',
        variant: 'destructive'
      });
      return;
    }

    setSecrets([...secrets, { ...newSecret }]);
    setNewSecret({ name: '', value: '', description: '' });
    
    toast({
      title: 'Секрет добавлен',
      description: `${newSecret.name} успешно добавлен`,
    });
  };

  const handleDeleteSecret = (index: number) => {
    const secretName = secrets[index].name;
    const updated = secrets.filter((_, i) => i !== index);
    setSecrets(updated);
    
    toast({
      title: 'Секрет удален',
      description: `${secretName} удален из списка`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Управление секретами
          </h1>
          <p className="text-gray-600">Безопасное хранение API ключей и строк подключения</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Plus" size={24} />
              Добавить новый секрет
            </CardTitle>
            <CardDescription>
              Создайте новый секрет для подключения к внешним сервисам
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-name">Название секрета</Label>
              <Input
                id="new-name"
                placeholder="например: OPENAI_API_KEY"
                value={newSecret.name}
                onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-description">Описание</Label>
              <Input
                id="new-description"
                placeholder="Для чего используется этот секрет"
                value={newSecret.description}
                onChange={(e) => setNewSecret({ ...newSecret, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-value">Значение</Label>
              <Input
                id="new-value"
                type="password"
                placeholder="Введите значение секрета"
                value={newSecret.value}
                onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
              />
            </div>
            <Button onClick={handleAddSecret} className="w-full">
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить секрет
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Существующие секреты</h2>
          {secrets.map((secret, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Key" size={20} />
                      {secret.name}
                    </CardTitle>
                    <CardDescription>{secret.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSecret(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={18} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor={`secret-${index}`}>Значение</Label>
                <div className="flex gap-2">
                  <Input
                    id={`secret-${index}`}
                    type="password"
                    placeholder="Введите значение секрета"
                    value={secret.value}
                    onChange={(e) => handleUpdateSecret(index, e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: 'Секрет сохранен',
                        description: `${secret.name} обновлен`,
                      });
                    }}
                  >
                    <Icon name="Save" size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecretsManager;
