import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogEntry } from '@/components/admin/types';
import { ConsoleHeader } from '@/components/admin/ConsoleHeader';
import { ConsoleFilters } from '@/components/admin/ConsoleFilters';
import { LogItem } from '@/components/admin/LogItem';
import Icon from '@/components/ui/icon';

const AdminConsole = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = () => {
      const savedLogs = localStorage.getItem('admin-console-logs');
      if (savedLogs) {
        try {
          const parsed = JSON.parse(savedLogs);
          setLogs(parsed.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp)
          })));
        } catch (e) {
          console.warn('Failed to load saved logs');
        }
      }
    };

    loadLogs();
    
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = search === '' || 
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('admin-console-logs');
    toast.success('Логи очищены');
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Логи экспортированы');
  };

  const testSystemErrors = () => {
    console.error('Test Error: This is a test error message');
    console.warn('Test Warning: This is a test warning');
    console.log('Test Info: System check completed successfully ✓');
    toast.success('Тестовые события созданы');
  };

  const copyLogToClipboard = (log: LogEntry) => {
    const logText = `
[${log.level.toUpperCase()}] ${log.timestamp.toLocaleString('ru-RU')}
${log.source ? `Source: ${log.source}` : ''}

Message:
${log.message}

${log.details ? `Details:\n${log.details}\n\n` : ''}${log.stackTrace ? `Stack Trace:\n${log.stackTrace}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(logText).then(() => {
      toast.success('Лог скопирован в буфер обмена');
    }).catch(() => {
      toast.error('Не удалось скопировать');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-slate-200"
          >
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            Вернуться в приложение
          </Button>
        </div>
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <ConsoleHeader
            onClearLogs={clearLogs}
            onExportLogs={exportLogs}
            onTestErrors={testSystemErrors}
          />
          
          <CardContent className="p-6">
            <ConsoleFilters
              logs={logs}
              filter={filter}
              search={search}
              autoRefresh={autoRefresh}
              onFilterChange={setFilter}
              onSearchChange={setSearch}
              onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
            />
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-lg">Нет логов для отображения</p>
                  <p className="text-sm mt-2">
                    {search || filter !== 'all' 
                      ? 'Попробуйте изменить фильтры или поиск'
                      : 'Логи будут появляться здесь автоматически'}
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <LogItem
                    key={log.id}
                    log={log}
                    isExpanded={expandedLog === log.id}
                    onToggleExpand={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    onCopy={() => copyLogToClipboard(log)}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminConsole;