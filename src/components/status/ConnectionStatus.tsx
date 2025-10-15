import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface ConnectionStatusProps {
  apiUrl?: string;
  checkInterval?: number;
}

export default function ConnectionStatus({ 
  apiUrl = 'https://functions.poehali.dev/75306ed7-e91c-4135-84fe-8b519f7dcf17',
  checkInterval = 30000 
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const checkConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}?action=process`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('online');
        setShowAlert(false);
      } else {
        setStatus('offline');
        setShowAlert(true);
      }
    } catch (error) {
      setStatus('offline');
      setShowAlert(true);
    }

    setLastCheck(new Date());
  };

  useEffect(() => {
    checkConnection();

    const interval = setInterval(checkConnection, checkInterval);

    return () => clearInterval(interval);
  }, [apiUrl, checkInterval]);

  useEffect(() => {
    const handleOnline = () => {
      setStatus('online');
      setShowAlert(false);
      checkConnection();
    };

    const handleOffline = () => {
      setStatus('offline');
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert && status === 'online') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {showAlert && status === 'offline' && (
        <Alert variant="destructive" className="animate-in slide-in-from-top">
          <Icon name="WifiOff" size={16} />
          <AlertDescription className="ml-2">
            Нет подключения к серверу. Проверьте интернет-соединение.
            {lastCheck && (
              <span className="block text-xs mt-1 opacity-80">
                Последняя проверка: {lastCheck.toLocaleTimeString()}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
