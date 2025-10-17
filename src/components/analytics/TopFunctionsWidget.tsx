import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

interface FunctionStat {
  function_name: string;
  call_count: number;
  avg_response_time: number;
  error_count: number;
}

interface TopFunctionsWidgetProps {
  refreshTrigger?: number;
}

export const TopFunctionsWidget = ({ refreshTrigger }: TopFunctionsWidgetProps) => {
  const [topFunctions, setTopFunctions] = useState<FunctionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCalls, setTotalCalls] = useState(0);

  useEffect(() => {
    fetchTopFunctions();
  }, [refreshTrigger]);

  const fetchTopFunctions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=function_calls_detailed`
      );
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentMonthStats = data.data.filter(
          (stat: FunctionStat & { month_year: string }) => stat.month_year === currentMonth
        );
        
        const sorted = currentMonthStats
          .sort((a: FunctionStat, b: FunctionStat) => b.call_count - a.call_count)
          .slice(0, 5);
        
        const total = sorted.reduce((sum, stat) => sum + stat.call_count, 0);
        
        setTopFunctions(sorted);
        setTotalCalls(total);
      }
    } catch (error) {
      console.error('[TopFunctionsWidget] Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (count: number) => {
    return totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0;
  };

  const getFunctionIcon = (name: string) => {
    if (name.includes('database')) return 'Database';
    if (name.includes('auth')) return 'Shield';
    if (name.includes('email')) return 'Mail';
    if (name.includes('password')) return 'Key';
    return 'Zap';
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Icon name="Loader2" size={20} className="animate-spin text-indigo-600" />
            <span className="text-gray-600">Загрузка...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon name="TrendingUp" size={20} className="text-indigo-600" />
          Топ-5 функций
          <Badge variant="secondary" className="ml-auto">
            {totalCalls.toLocaleString()} вызовов
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topFunctions.map((func, index) => (
            <div key={func.function_name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">#{index + 1}</span>
                  <Icon name={getFunctionIcon(func.function_name)} size={14} className="text-indigo-600" />
                  <span className="font-medium text-gray-700">{func.function_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{func.avg_response_time}ms</span>
                  <span className="font-semibold text-indigo-600 min-w-[60px] text-right">
                    {func.call_count.toLocaleString()}
                  </span>
                  {func.error_count > 0 && (
                    <Badge variant="destructive" className="text-xs px-1 py-0">
                      {func.error_count}
                    </Badge>
                  )}
                </div>
              </div>
              <Progress value={getPercentage(func.call_count)} className="h-1.5" />
            </div>
          ))}
        </div>
        
        {topFunctions.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Нет данных за текущий месяц
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopFunctionsWidget;