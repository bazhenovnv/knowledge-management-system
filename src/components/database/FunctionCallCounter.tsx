import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface FunctionCallCounterProps {
  isAdmin: boolean;
}

interface MonthStats {
  month_year: string;
  call_count: number;
  updated_at?: string;
}

export const FunctionCallCounter = ({ isAdmin }: FunctionCallCounterProps) => {
  const [currentMonth, setCurrentMonth] = useState<MonthStats | null>(null);
  const [previousMonth, setPreviousMonth] = useState<MonthStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      console.log('[FunctionCallCounter] Fetching function call stats...');
      const response = await fetch(
        `https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558?action=list&table=function_call_stats`
      );
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        const stats = data.data.sort((a: MonthStats, b: MonthStats) => 
          b.month_year.localeCompare(a.month_year)
        );
        
        console.log('[FunctionCallCounter] Stats received:', stats);
        
        if (stats.length > 0) {
          setCurrentMonth(stats[0]);
          if (stats.length > 1) {
            setPreviousMonth(stats[1]);
          }
        }
      }
    } catch (error) {
      console.error('[FunctionCallCounter] Ошибка загрузки статистики функций:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-2">
          <Icon name="Zap" size={18} className="text-purple-600 animate-pulse" />
          <span className="text-sm text-gray-600">Загрузка...</span>
        </div>
      </Card>
    );
  }

  const formatMonth = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  return (
    <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Icon name="Zap" size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Вызовов функций</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-purple-900">
                {formatNumber(currentMonth?.call_count || 0)}
              </span>
              <span className="text-xs text-gray-600">
                {currentMonth ? formatMonth(currentMonth.month_year) : ''}
              </span>
            </div>
          </div>
        </div>

        {previousMonth && previousMonth.call_count > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Прошлый месяц</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-semibold text-gray-700">
                {formatNumber(previousMonth.call_count)}
              </span>
              <span className="text-xs text-gray-500">
                {formatMonth(previousMonth.month_year)}
              </span>
            </div>
            {currentMonth && (
              <div className="mt-1">
                {currentMonth.call_count > previousMonth.call_count ? (
                  <span className="text-xs text-red-600 flex items-center gap-1 justify-end">
                    <Icon name="TrendingUp" size={12} />
                    +{Math.round((currentMonth.call_count / previousMonth.call_count - 1) * 100)}%
                  </span>
                ) : currentMonth.call_count < previousMonth.call_count ? (
                  <span className="text-xs text-green-600 flex items-center gap-1 justify-end">
                    <Icon name="TrendingDown" size={12} />
                    {Math.round((currentMonth.call_count / previousMonth.call_count - 1) * 100)}%
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <Icon name="Minus" size={12} />
                    0%
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default FunctionCallCounter;
