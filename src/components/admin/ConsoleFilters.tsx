import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { LogEntry } from './types';

interface ConsoleFiltersProps {
  logs: LogEntry[];
  filter: string;
  search: string;
  autoRefresh: boolean;
  onFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onAutoRefreshToggle: () => void;
}

export const ConsoleFilters = ({
  logs,
  filter,
  search,
  autoRefresh,
  onFilterChange,
  onSearchChange,
  onAutoRefreshToggle
}: ConsoleFiltersProps) => {
  const errorCount = logs.filter(l => l.level === 'error').length;
  const warningCount = logs.filter(l => l.level === 'warning').length;
  const infoCount = logs.filter(l => l.level === 'info').length;
  const successCount = logs.filter(l => l.level === 'success').length;

  return (
    <div className="flex gap-3 mb-4 flex-wrap items-center">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Поиск в логах..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
      
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
          <SelectValue placeholder="Фильтр" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все ({logs.length})</SelectItem>
          <SelectItem value="error">Ошибки ({errorCount})</SelectItem>
          <SelectItem value="warning">Предупреждения ({warningCount})</SelectItem>
          <SelectItem value="info">Информация ({infoCount})</SelectItem>
          <SelectItem value="success">Успешно ({successCount})</SelectItem>
        </SelectContent>
      </Select>

      <Badge 
        variant={autoRefresh ? "default" : "outline"}
        className="cursor-pointer gap-1"
        onClick={onAutoRefreshToggle}
      >
        <Icon name={autoRefresh ? "RefreshCw" : "Pause"} size={14} />
        {autoRefresh ? 'Авто-обновление' : 'Пауза'}
      </Badge>
    </div>
  );
};
