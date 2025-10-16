import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { 
  scanForJunkCode, 
  fixJunkCode, 
  exportScanStatistics, 
  createBackup, 
  restoreBackup, 
  hasBackup,
  getBackupInfo,
  deleteBackup 
} from './codeScanner';

interface ConsoleHeaderProps {
  onClearLogs: () => void;
  onExportLogs: () => void;
  onTestErrors: () => void;
}

export const ConsoleHeader = ({ onClearLogs, onExportLogs, onTestErrors }: ConsoleHeaderProps) => {
  const [backupExists, setBackupExists] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{ timestamp: string; size: number } | null>(null);

  useEffect(() => {
    updateBackupStatus();
  }, []);

  const updateBackupStatus = () => {
    setBackupExists(hasBackup());
    setBackupInfo(getBackupInfo());
  };

  const handleCreateBackup = () => {
    createBackup();
    updateBackupStatus();
  };

  const handleFixJunkCode = () => {
    const confirmed = confirm(
      'Перед исправлением ошибок рекомендуется создать резервную копию.\n\n' +
      'Хотите создать резервную копию сейчас?'
    );
    
    if (confirmed) {
      const backupCreated = createBackup();
      if (backupCreated) {
        updateBackupStatus();
        setTimeout(() => {
          fixJunkCode();
        }, 500);
      }
    } else {
      fixJunkCode();
    }
  };

  const handleRestoreBackup = () => {
    restoreBackup();
    updateBackupStatus();
  };

  const handleDeleteBackup = () => {
    const confirmed = confirm('Вы уверены, что хотите удалить резервную копию?');
    if (confirmed) {
      deleteBackup();
      updateBackupStatus();
    }
  };

  return (
    <CardHeader className="border-b border-slate-700">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Icon name="Terminal" size={32} className="text-blue-400" />
          <div>
            <CardTitle className="text-2xl text-white">Консоль администратора</CardTitle>
            <p className="text-sm text-slate-400 mt-1">Мониторинг ошибок и логов системы в реальном времени</p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-2 border-r border-slate-600 pr-2">
            <Button 
              onClick={handleCreateBackup}
              variant="outline" 
              size="sm"
              className="gap-2 border-cyan-500 text-cyan-400 hover:bg-cyan-950"
            >
              <Icon name="Save" size={16} />
              Создать копию
            </Button>
            
            {backupExists && (
              <>
                <Button 
                  onClick={handleRestoreBackup}
                  variant="outline" 
                  size="sm"
                  className="gap-2 border-yellow-500 text-yellow-400 hover:bg-yellow-950"
                >
                  <Icon name="RotateCcw" size={16} />
                  Восстановить
                </Button>
                <Button 
                  onClick={handleDeleteBackup}
                  variant="outline" 
                  size="sm"
                  className="gap-2 border-red-500 text-red-400 hover:bg-red-950"
                >
                  <Icon name="Trash" size={16} />
                </Button>
              </>
            )}
          </div>

          {backupInfo && (
            <Badge variant="secondary" className="gap-1">
              <Icon name="Clock" size={12} />
              {new Date(backupInfo.timestamp).toLocaleTimeString('ru-RU')}
            </Badge>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={() => {
                scanForJunkCode();
                updateBackupStatus();
              }}
              variant="outline" 
              size="sm"
              className="gap-2 border-purple-500 text-purple-400 hover:bg-purple-950"
            >
              <Icon name="Search" size={16} />
              Сканировать
            </Button>
            <Button 
              onClick={handleFixJunkCode}
              variant="outline" 
              size="sm"
              className="gap-2 border-green-500 text-green-400 hover:bg-green-950"
            >
              <Icon name="Wrench" size={16} />
              Исправить
            </Button>
            <Button 
              onClick={exportScanStatistics}
              variant="outline" 
              size="sm"
              className="gap-2 border-orange-500 text-orange-400 hover:bg-orange-950"
            >
              <Icon name="FileText" size={16} />
              Отчёт
            </Button>
          </div>

          <div className="flex gap-2 border-l border-slate-600 pl-2">
            <Button 
              onClick={onTestErrors}
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Icon name="TestTube" size={16} />
              Тест
            </Button>
            <Button 
              onClick={onExportLogs}
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Icon name="Download" size={16} />
              Логи
            </Button>
            <Button 
              onClick={onClearLogs}
              variant="destructive" 
              size="sm"
              className="gap-2"
            >
              <Icon name="Trash2" size={16} />
              Очистить
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};