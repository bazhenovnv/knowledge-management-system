import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import funcUrls from '../../backend/func2url.json';

interface FunctionStat {
  function_name: string;
  call_count: number;
  avg_response_time: number;
  error_count: number;
  month_year: string;
}

interface FunctionAnalyticsProps {
  refreshTrigger?: number;
}

export const FunctionAnalytics = ({ refreshTrigger }: FunctionAnalyticsProps) => {
  const [stats, setStats] = useState<FunctionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${funcUrls['database'] || 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558'}?action=list&table=function_calls_detailed`
      );
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        const sortedStats = data.data.sort((a: FunctionStat, b: FunctionStat) => 
          b.month_year.localeCompare(a.month_year) || b.call_count - a.call_count
        );
        
        if (sortedStats.length > 0) {
          setCurrentMonth(sortedStats[0].month_year);
        }
        
        setStats(sortedStats);
      }
    } catch (error) {
      console.error('[FunctionAnalytics] Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentMonthStats = stats.filter(s => s.month_year === currentMonth);
  const previousMonth = getPreviousMonth(currentMonth);
  const previousMonthStats = stats.filter(s => s.month_year === previousMonth);

  const getErrorRate = (stat: FunctionStat) => {
    return stat.call_count > 0 ? ((stat.error_count / stat.call_count) * 100).toFixed(1) : '0.0';
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return 'text-green-600';
    if (time < 300) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Icon name="Loader2" size={20} className="animate-spin text-gray-600" />
            <span className="text-gray-600">Загрузка статистики...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Activity" size={24} className="text-purple-600" />
          Детальная статистика функций
          <Badge variant="secondary" className="ml-2">
            {formatMonth(currentMonth)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Функция</TableHead>
              <TableHead className="text-right">Вызовов</TableHead>
              <TableHead className="text-right">Ср. время (мс)</TableHead>
              <TableHead className="text-right">Ошибки</TableHead>
              <TableHead className="text-right">% ошибок</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMonthStats.map((stat) => {
              const prevStat = previousMonthStats.find(p => p.function_name === stat.function_name);
              const callChange = prevStat ? ((stat.call_count - prevStat.call_count) / prevStat.call_count * 100) : null;
              
              return (
                <TableRow key={stat.function_name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Icon name="Zap" size={16} className="text-purple-500" />
                      {stat.function_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-semibold">{formatNumber(stat.call_count)}</span>
                      {callChange !== null && (
                        <span className={`text-xs ${callChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {callChange > 0 ? '+' : ''}{callChange.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${getResponseTimeColor(stat.avg_response_time)}`}>
                    {stat.avg_response_time}
                  </TableCell>
                  <TableCell className="text-right">
                    {stat.error_count > 0 ? (
                      <Badge variant="destructive" className="font-mono">
                        {stat.error_count}
                      </Badge>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={stat.error_count > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                      {getErrorRate(stat)}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {currentMonthStats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет данных за текущий месяц
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getPreviousMonth(monthYear: string): string {
  if (!monthYear) return '';
  const [year, month] = monthYear.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}

function formatMonth(monthYear: string): string {
  if (!monthYear) return '';
  const [year, month] = monthYear.split('-');
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export default FunctionAnalytics;