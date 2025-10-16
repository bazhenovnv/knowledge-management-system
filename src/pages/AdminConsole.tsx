import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  details?: string;
  source?: string;
  stackTrace?: string;
}

const AdminConsole = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
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
    
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    const addLog = (level: LogEntry['level'], message: string, details?: any) => {
      let detailsText = '';
      
      if (details) {
        try {
          if (Array.isArray(details) && details.length > 0) {
            detailsText = details.map(d => {
              if (d instanceof Error) {
                return `${d.name}: ${d.message}\n${d.stack}`;
              }
              return typeof d === 'object' ? JSON.stringify(d, null, 2) : String(d);
            }).join('\n\n');
          } else if (details instanceof Error) {
            detailsText = `${details.name}: ${details.message}\n${details.stack}`;
          } else if (typeof details === 'object') {
            detailsText = JSON.stringify(details, null, 2);
          } else {
            detailsText = String(details);
          }
        } catch (e) {
          detailsText = String(details);
        }
      }
      
      const logEntry: LogEntry = {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date(),
        level,
        message: String(message),
        details: detailsText || undefined,
        source: 'Browser Console',
        stackTrace: new Error().stack,
      };
      
      setLogs(prev => [logEntry, ...prev].slice(0, 500));
      
      localStorage.setItem('admin-console-logs', JSON.stringify([logEntry, ...prev].slice(0, 500)));
    };

    console.error = (...args) => {
      addLog('error', args[0], args.slice(1));
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warning', args[0], args.slice(1));
      originalConsoleWarn.apply(console, args);
    };

    console.log = (...args) => {
      if (args[0]?.includes?.('✓') || args[0]?.includes?.('success')) {
        addLog('success', args[0], args.slice(1));
      } else {
        addLog('info', args[0], args.slice(1));
      }
      originalConsoleLog.apply(console, args);
    };

    window.addEventListener('error', (event) => {
      addLog('error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      addLog('error', 'Unhandled Promise Rejection', event.reason);
    });

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.log = originalConsoleLog;
    };
  }, []);

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

  const getLevelBadge = (level: LogEntry['level']) => {
    const variants: Record<LogEntry['level'], any> = {
      error: 'destructive',
      warning: 'outline',
      info: 'secondary',
      success: 'default',
    };
    
    const icons: Record<LogEntry['level'], string> = {
      error: 'AlertCircle',
      warning: 'AlertTriangle',
      info: 'Info',
      success: 'CheckCircle',
    };

    return (
      <Badge variant={variants[level]} className="gap-1">
        <Icon name={icons[level]} size={14} />
        {level.toUpperCase()}
      </Badge>
    );
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

  const testSystemErrors = () => {
    console.error('Test Error: This is a test error message');
    console.warn('Test Warning: This is a test warning');
    console.log('Test Info: System check completed successfully ✓');
    toast.success('Тестовые события созданы');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="Terminal" size={32} className="text-blue-400" />
                <div>
                  <CardTitle className="text-2xl text-white">Консоль администратора</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">Мониторинг ошибок и логов системы в реальном времени</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={testSystemErrors}
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Icon name="TestTube" size={16} />
                  Тест
                </Button>
                <Button 
                  onClick={exportLogs}
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Icon name="Download" size={16} />
                  Экспорт
                </Button>
                <Button 
                  onClick={clearLogs}
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
          
          <CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Поиск по логам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md bg-slate-900/50 border-slate-700 text-white"
              />
              
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Фильтр" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все логи</SelectItem>
                  <SelectItem value="error">Ошибки</SelectItem>
                  <SelectItem value="warning">Предупреждения</SelectItem>
                  <SelectItem value="info">Информация</SelectItem>
                  <SelectItem value="success">Успешные</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="gap-2"
              >
                <Icon name={autoRefresh ? "Pause" : "Play"} size={16} />
                {autoRefresh ? 'Остановить' : 'Запустить'}
              </Button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Логи отсутствуют</p>
                  <p className="text-sm mt-2">Нажмите "Тест" чтобы создать тестовые события</p>
                </div>
              ) : (
                filteredLogs.map(log => (
                  <Card 
                    key={log.id} 
                    className={`border-l-4 transition-all ${
                      log.level === 'error' ? 'border-l-red-500 bg-red-950/20' :
                      log.level === 'warning' ? 'border-l-yellow-500 bg-yellow-950/20' :
                      log.level === 'success' ? 'border-l-green-500 bg-green-950/20' :
                      'border-l-blue-500 bg-slate-900/30'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {getLevelBadge(log.level)}
                            <span className="text-xs text-slate-400">
                              {log.timestamp.toLocaleTimeString('ru-RU')}
                            </span>
                            {log.source && (
                              <Badge variant="outline" className="text-xs">
                                {log.source}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-white font-mono text-sm break-words">
                            {log.message}
                          </p>
                          
                          {expandedLog === log.id && log.details && (
                            <pre className="mt-3 p-3 bg-slate-950/50 rounded text-xs text-slate-300 overflow-x-auto">
                              {log.details}
                            </pre>
                          )}
                          
                          {expandedLog === log.id && log.stackTrace && (
                            <details className="mt-3">
                              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                                Stack Trace
                              </summary>
                              <pre className="mt-2 p-3 bg-slate-950/50 rounded text-xs text-slate-300 overflow-x-auto">
                                {log.stackTrace}
                              </pre>
                            </details>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLogToClipboard(log);
                            }}
                            className="h-8 w-8 p-0 hover:bg-slate-700"
                            title="Скопировать лог"
                          >
                            <Icon name="Copy" size={16} className="text-slate-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedLog(expandedLog === log.id ? null : log.id);
                            }}
                            className="h-8 w-8 p-0 hover:bg-slate-700"
                          >
                            <Icon 
                              name={expandedLog === log.id ? "ChevronUp" : "ChevronDown"} 
                              size={20} 
                              className="text-slate-400"
                            />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between text-sm text-slate-400">
              <div>
                Всего логов: <span className="font-bold text-white">{logs.length}</span>
                {' | '}
                Отображено: <span className="font-bold text-white">{filteredLogs.length}</span>
              </div>
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Ошибки: {logs.filter(l => l.level === 'error').length}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  Предупр.: {logs.filter(l => l.level === 'warning').length}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Успешно: {logs.filter(l => l.level === 'success').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminConsole;