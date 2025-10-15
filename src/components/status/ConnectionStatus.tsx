import { useState, useEffect, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface ConnectionStatusProps {
  apiUrl?: string;
  checkInterval?: number;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export default function ConnectionStatus({ 
  apiUrl = 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558',
  checkInterval = 30000,
  reconnectAttempts = 5,
  reconnectDelay = 3000
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking' | 'reconnecting'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const wasOffline = useRef(false);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const attemptReconnect = async (attempt: number = 1): Promise<void> => {
    if (attempt > reconnectAttempts) {
      setStatus('offline');
      setShowAlert(true);
      setAttemptCount(0);
      toast.error('Не удалось восстановить соединение', {
        description: 'Проверьте подключение к интернету'
      });
      return;
    }

    setStatus('reconnecting');
    setAttemptCount(attempt);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}?action=stats`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('online');
        setShowAlert(false);
        setAttemptCount(0);
        
        if (wasOffline.current) {
          toast.success('Соединение восстановлено', {
            description: 'Подключение к серверу успешно'
          });
          wasOffline.current = false;
        }
        return;
      }
    } catch (error) {
      console.log(`Попытка переподключения ${attempt}/${reconnectAttempts} не удалась`);
    }

    reconnectTimeout.current = setTimeout(() => {
      attemptReconnect(attempt + 1);
    }, reconnectDelay);
  };

  const checkConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}?action=stats`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        if (wasOffline.current) {
          toast.success('Соединение восстановлено');
          wasOffline.current = false;
        }
        setStatus('online');
        setShowAlert(false);
        setAttemptCount(0);
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      if (status === 'online') {
        wasOffline.current = true;
        toast.warning('Потеряно соединение с сервером', {
          description: 'Попытка переподключения...'
        });
      }
      attemptReconnect(1);
    }

    setLastCheck(new Date());
  };

  useEffect(() => {
    checkConnection();

    const interval = setInterval(checkConnection, checkInterval);

    return () => {
      clearInterval(interval);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [apiUrl, checkInterval]);

  useEffect(() => {
    const handleOnline = () => {
      toast.info('Интернет подключен', {
        description: 'Проверяем соединение с сервером...'
      });
      checkConnection();
    };

    const handleOffline = () => {
      wasOffline.current = true;
      setStatus('offline');
      setShowAlert(true);
      toast.error('Интернет отключен', {
        description: 'Ожидание восстановления сети...'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);

  if (!showAlert && status === 'online') {
    return null;
  }

  const handleManualReconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    setAttemptCount(0);
    toast.info('Переподключение...', {
      description: 'Проверяем соединение с сервером'
    });
    checkConnection();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {status === 'reconnecting' && (
        <Alert className="animate-in slide-in-from-top border-yellow-500 bg-yellow-50">
          <Icon name="RefreshCw" size={16} className="animate-spin text-yellow-600" />
          <AlertDescription className="ml-2 text-yellow-800">
            Переподключение к серверу...
            <span className="block text-xs mt-1 opacity-80">
              Попытка {attemptCount} из {reconnectAttempts}
            </span>
          </AlertDescription>
        </Alert>
      )}
      
      {showAlert && status === 'offline' && (
        <Alert variant="destructive" className="animate-in slide-in-from-top">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Icon name="WifiOff" size={16} className="mt-0.5" />
              <AlertDescription>
                Нет подключения к серверу. Проверьте интернет-соединение.
                {lastCheck && (
                  <span className="block text-xs mt-1 opacity-80">
                    Последняя проверка: {lastCheck.toLocaleTimeString()}
                  </span>
                )}
              </AlertDescription>
            </div>
            <button
              onClick={handleManualReconnect}
              className="ml-2 text-white hover:bg-red-600 rounded p-1 transition-colors"
              title="Переподключиться"
            >
              <Icon name="RefreshCw" size={16} />
            </button>
          </div>
        </Alert>
      )}
    </div>
  );
}