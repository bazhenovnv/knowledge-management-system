import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { scanForJunkCode, fixJunkCode, exportScanStatistics } from './codeScanner';

interface ConsoleHeaderProps {
  onClearLogs: () => void;
  onExportLogs: () => void;
  onTestErrors: () => void;
}

export const ConsoleHeader = ({ onClearLogs, onExportLogs, onTestErrors }: ConsoleHeaderProps) => {
  return (
    <CardHeader className="border-b border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="Terminal" size={32} className="text-blue-400" />
          <div>
            <CardTitle className="text-2xl text-white">Консоль администратора</CardTitle>
            <p className="text-sm text-slate-400 mt-1">Мониторинг ошибок и логов системы в реальном времени</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={scanForJunkCode}
            variant="outline" 
            size="sm"
            className="gap-2 border-purple-500 text-purple-400 hover:bg-purple-950"
          >
            <Icon name="Search" size={16} />
            Сканировать код
          </Button>
          <Button 
            onClick={fixJunkCode}
            variant="outline" 
            size="sm"
            className="gap-2 border-green-500 text-green-400 hover:bg-green-950"
          >
            <Icon name="Wrench" size={16} />
            Исправить проблемы
          </Button>
          <Button 
            onClick={exportScanStatistics}
            variant="outline" 
            size="sm"
            className="gap-2 border-orange-500 text-orange-400 hover:bg-orange-950"
          >
            <Icon name="FileText" size={16} />
            Экспорт отчёта
          </Button>
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
            Экспорт логов
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
    </CardHeader>
  );
};