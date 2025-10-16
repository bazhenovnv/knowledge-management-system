import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { databaseService } from '@/utils/databaseService';

interface DbRequestCounterProps {
  isAdmin: boolean;
}

interface MonthStats {
  month_year: string;
  request_count: number;
  updated_at?: string;
}

export const DbRequestCounter = ({ isAdmin }: DbRequestCounterProps) => {
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
      const stats = await databaseService.getDbRequestStats();
      if (stats && !stats.error) {
        setCurrentMonth(stats.current_month);
        setPreviousMonth(stats.previous_month);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики БД:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  if (loading) {
    return (
      <Card className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-2">
          <Icon name="Database" size={18} className="text-blue-600 animate-pulse" />
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
    <Card className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon name="Database" size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Обращений к БД</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-blue-900">
                {formatNumber(currentMonth?.request_count || 0)}
              </span>
              <span className="text-xs text-gray-600">
                {currentMonth ? formatMonth(currentMonth.month_year) : ''}
              </span>
            </div>
          </div>
        </div>

        {previousMonth && previousMonth.request_count > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Прошлый месяц</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-semibold text-gray-700">
                {formatNumber(previousMonth.request_count)}
              </span>
              <span className="text-xs text-gray-500">
                {formatMonth(previousMonth.month_year)}
              </span>
            </div>
            {currentMonth && (
              <div className="mt-1">
                {currentMonth.request_count > previousMonth.request_count ? (
                  <span className="text-xs text-red-600 flex items-center gap-1 justify-end">
                    <Icon name="TrendingUp" size={12} />
                    +{Math.round((currentMonth.request_count / previousMonth.request_count - 1) * 100)}%
                  </span>
                ) : currentMonth.request_count < previousMonth.request_count ? (
                  <span className="text-xs text-green-600 flex items-center gap-1 justify-end">
                    <Icon name="TrendingDown" size={12} />
                    {Math.round((currentMonth.request_count / previousMonth.request_count - 1) * 100)}%
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

export default DbRequestCounter;
