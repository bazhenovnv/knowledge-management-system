import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { LogEntry } from './types';

interface LogItemProps {
  log: LogEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCopy: () => void;
}

export const LogItem = ({ log, isExpanded, onToggleExpand, onCopy }: LogItemProps) => {
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

  const levelColors: Record<LogEntry['level'], string> = {
    error: 'border-red-500/30 bg-red-950/20',
    warning: 'border-yellow-500/30 bg-yellow-950/20',
    info: 'border-blue-500/30 bg-blue-950/20',
    success: 'border-green-500/30 bg-green-950/20',
  };

  return (
    <div className={`border rounded-lg p-4 ${levelColors[log.level]} transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {getLevelBadge(log.level)}
            <span className="text-xs text-slate-400">
              {log.timestamp.toLocaleString('ru-RU')}
            </span>
            {log.source && (
              <Badge variant="secondary" className="text-xs">
                {log.source}
              </Badge>
            )}
          </div>
          
          <p className="text-white font-mono text-sm break-words mb-2">
            {log.message}
          </p>
          
          {(log.details || log.stackTrace) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="gap-2 text-slate-400 hover:text-white"
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
              {isExpanded ? 'Скрыть' : 'Подробнее'}
            </Button>
          )}
          
          {isExpanded && (
            <div className="mt-3 space-y-3">
              {log.details && (
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1 font-semibold">Детали:</p>
                  <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-words">
                    {log.details}
                  </pre>
                </div>
              )}
              
              {log.stackTrace && (
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1 font-semibold">Stack Trace:</p>
                  <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-words font-mono">
                    {log.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="text-slate-400 hover:text-white shrink-0"
        >
          <Icon name="Copy" size={16} />
        </Button>
      </div>
    </div>
  );
};
