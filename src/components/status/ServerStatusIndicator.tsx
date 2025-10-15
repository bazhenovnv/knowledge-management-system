import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ServerStatusIndicatorProps {
  apiUrl?: string;
  checkInterval?: number;
  compact?: boolean;
}

export default function ServerStatusIndicator({ 
  apiUrl = 'https://functions.poehali.dev/75306ed7-e91c-4135-84fe-8b519f7dcf17',
  checkInterval = 30000,
  compact = false
}: ServerStatusIndicatorProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [ping, setPing] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}?action=process`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        setStatus('online');
        setPing(responseTime);
      } else {
        setStatus('offline');
        setPing(null);
      }
    } catch (error) {
      setStatus('offline');
      setPing(null);
    }

    setLastCheck(new Date());
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, checkInterval);
    return () => clearInterval(interval);
  }, [apiUrl, checkInterval]);

  useEffect(() => {
    const handleOnline = () => checkConnection();
    const handleOffline = () => {
      setStatus('offline');
      setPing(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = () => {
    if (status === 'checking') return 'bg-gray-400';
    if (status === 'offline') return 'bg-red-500';
    if (ping === null) return 'bg-yellow-500';
    if (ping < 500) return 'bg-green-500';
    if (ping < 1000) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getStatusText = () => {
    if (status === 'checking') return 'Проверка...';
    if (status === 'offline') return 'Оффлайн';
    if (ping === null) return 'Онлайн';
    if (ping < 500) return 'Отлично';
    if (ping < 1000) return 'Хорошо';
    return 'Медленно';
  };

  const getStatusIcon = () => {
    if (status === 'checking') return 'Loader2';
    if (status === 'offline') return 'WifiOff';
    return 'Wifi';
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status === 'checking' ? 'animate-pulse' : ''}`} />
              {status === 'online' && ping !== null && (
                <span className="text-xs text-gray-600">{ping}ms</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{getStatusText()}</p>
              {status === 'online' && ping !== null && (
                <p className="text-xs text-gray-500">Задержка: {ping}ms</p>
              )}
              {lastCheck && (
                <p className="text-xs text-gray-500">
                  {lastCheck.toLocaleTimeString()}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge 
      variant={status === 'online' ? 'default' : 'destructive'}
      className={`flex items-center gap-2 ${status === 'online' ? 'bg-green-500 hover:bg-green-600' : ''}`}
    >
      <Icon 
        name={getStatusIcon()} 
        size={14} 
        className={status === 'checking' ? 'animate-spin' : ''}
      />
      <span>{getStatusText()}</span>
      {status === 'online' && ping !== null && (
        <span className="text-xs opacity-80">({ping}ms)</span>
      )}
    </Badge>
  );
}
