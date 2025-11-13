import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { autoRefreshService } from '@/services/autoRefreshService';
import { useData } from '@/contexts/DataContext';

const AutoRefreshIndicator: React.FC = () => {
  const { autoRefreshEnabled, toggleAutoRefresh, lastUpdated } = useData();
  const [status, setStatus] = useState(autoRefreshService.getStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(autoRefreshService.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Никогда';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff} сек назад`;
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    return date.toLocaleTimeString('ru-RU');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Автообновление данных</CardTitle>
            <CardDescription>Проверка изменений каждые 30 секунд</CardDescription>
          </div>
          <Badge variant={autoRefreshEnabled ? 'default' : 'secondary'} className="text-sm">
            {autoRefreshEnabled ? (
              <>
                <Icon name="CheckCircle" size={14} className="mr-1" />
                Включено
              </>
            ) : (
              <>
                <Icon name="XCircle" size={14} className="mr-1" />
                Выключено
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Последнее обновление</p>
            <p className="text-sm font-medium">{formatLastUpdate(lastUpdated)}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Подписчики</p>
            <p className="text-sm font-medium">{status.listenersCount} служб</p>
          </div>
        </div>

        {status.lastKnownUpdates && Object.keys(status.lastKnownUpdates).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Отслеживаемые таблицы:</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(status.lastKnownUpdates).map(table => (
                <Badge key={table} variant="outline" className="text-xs">
                  {table}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={toggleAutoRefresh}
          variant={autoRefreshEnabled ? 'destructive' : 'default'}
          className="w-full"
          size="sm"
        >
          {autoRefreshEnabled ? (
            <>
              <Icon name="Pause" size={16} className="mr-2" />
              Отключить автообновление
            </>
          ) : (
            <>
              <Icon name="Play" size={16} className="mr-2" />
              Включить автообновление
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AutoRefreshIndicator;
