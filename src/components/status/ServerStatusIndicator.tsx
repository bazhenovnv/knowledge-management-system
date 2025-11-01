import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { playSound, SoundType } from '@/utils/soundEffects';
import funcUrls from '../../backend/func2url.json';

interface ServerStatusIndicatorProps {
  apiUrl?: string;
  checkInterval?: number;
  compact?: boolean;
  autoCheckOnMount?: boolean;
}

export default function ServerStatusIndicator({ 
  apiUrl = funcUrls['local-db-proxy'] || funcUrls['database'],
  compact = false,
  autoCheckOnMount = false
}: ServerStatusIndicatorProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('offline');
  const [ping, setPing] = useState<number | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousStatusRef = useRef<'online' | 'offline' | 'checking'>('offline');

  const playSuccessSound = () => {
    const appSettings = localStorage.getItem('app_settings');
    const settings = appSettings ? JSON.parse(appSettings) : {};
    const soundEnabled = settings.enableSoundNotifications !== false;
    const soundType: SoundType = settings.soundNotificationType || 'notification';
    
    if (soundEnabled) {
      playSound(soundType);
    }
  };

  const checkConnection = async (isManual: boolean = false) => {
    if (isManual) {
      setIsManualChecking(true);
      toast.info('Проверка соединения...', {
        description: 'Подключаемся к серверу'
      });
    }

    const startTime = Date.now();
    const prevStatus = previousStatusRef.current;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(apiUrl, {
        method: 'POST',
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'stats'
        })
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        setStatus('online');
        setPing(responseTime);
        previousStatusRef.current = 'online';
        
        if (prevStatus === 'offline' && !isManual) {
          playSuccessSound();
          toast.success('Соединение восстановлено', {
            description: `Задержка: ${responseTime}ms`
          });
        } else if (isManual) {
          toast.success('Соединение установлено', {
            description: `Задержка: ${responseTime}ms`
          });
        }
      } else {
        setStatus('offline');
        setPing(null);
        previousStatusRef.current = 'offline';
        
        if (isManual) {
          toast.error('Сервер недоступен', {
            description: 'Попробуйте позже'
          });
        }
      }
    } catch (error) {
      setStatus('offline');
      setPing(null);
      previousStatusRef.current = 'offline';
      
      if (isManual) {
        toast.warning('Работа в офлайн-режиме', {
          description: 'Используются локальные данные'
        });
      }
    }

    setLastCheck(new Date());
    if (isManual) {
      setIsManualChecking(false);
    }
  };

  const handleManualReconnect = () => {
    checkConnection(true);
  };

  useEffect(() => {
    
    if (autoCheckOnMount) {
      checkConnection(false);
      
      const intervalId = setInterval(() => {
        checkConnection(false);
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [apiUrl, autoCheckOnMount]);

  useEffect(() => {
    const handleOnline = () => checkConnection();
    const handleOffline = () => {
      setStatus('offline');
      setPing(null);
    };
    
    const handleManualCheck = () => checkConnection(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('checkBackendConnection', handleManualCheck);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('checkBackendConnection', handleManualCheck);
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
            <button 
              onClick={handleManualReconnect}
              disabled={isManualChecking}
              className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-50"
            >
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status === 'checking' || isManualChecking ? 'animate-pulse' : ''}`} />
              {status === 'online' && ping !== null && (
                <span className="text-xs text-gray-600">{ping}ms</span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm space-y-1">
              <p className="font-medium">{getStatusText()}</p>
              {status === 'online' && ping !== null && (
                <p className="text-xs text-gray-500">Задержка: {ping}ms</p>
              )}
              {lastCheck && (
                <p className="text-xs text-gray-500">
                  {lastCheck.toLocaleTimeString()}
                </p>
              )}
              <p className="text-xs text-gray-400 border-t pt-1 mt-1">
                Нажмите для переподключения
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={status === 'online' ? 'default' : 'destructive'}
        className={`flex items-center gap-2 ${status === 'online' ? 'bg-green-500 hover:bg-green-600' : ''}`}
      >
        <Icon 
          name={getStatusIcon()} 
          size={14} 
          className={status === 'checking' || isManualChecking ? 'animate-spin' : ''}
        />
        <span>{getStatusText()}</span>
        {status === 'online' && ping !== null && (
          <span className="text-xs opacity-80">({ping}ms)</span>
        )}
      </Badge>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleManualReconnect}
        disabled={isManualChecking}
        className="h-7"
        title="Переподключиться к серверу"
      >
        <Icon 
          name="RefreshCw" 
          size={14} 
          className={isManualChecking ? 'animate-spin' : ''}
        />
      </Button>
    </div>
  );
}