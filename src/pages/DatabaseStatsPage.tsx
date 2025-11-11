import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { externalDb } from '@/services/externalDbService';
import { toast } from 'sonner';
import SecretForm from '@/components/settings/SecretForm';

interface TableStats {
  schemaname: string;
  tablename: string;
  row_count: number;
}

interface DbStats {
  tables: TableStats[];
  totalTables: number;
  totalRecords: number;
}

export default function DatabaseStatsPage() {
  const [stats, setStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await externalDb.stats();
      setStats(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading DB stats:', error);
      toast.error('Ошибка загрузки статистики БД');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const getTableIcon = (tableName: string | undefined) => {
    if (!tableName) return 'Table';
    if (tableName.includes('employee')) return 'Users';
    if (tableName.includes('test')) return 'FileCheck';
    if (tableName.includes('knowledge') || tableName.includes('material')) return 'BookOpen';
    if (tableName.includes('notification')) return 'Bell';
    if (tableName.includes('domain')) return 'Globe';
    if (tableName.includes('course')) return 'GraduationCap';
    return 'Table';
  };

  if (loading && !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Icon name="Loader2" className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка статистики базы данных...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Secret Form */}
      <SecretForm />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Icon name="Database" className="w-8 h-8 text-primary" />
            Статистика базы данных
          </h1>
          <p className="text-muted-foreground mt-2">
            TimeWeb Cloud PostgreSQL • Схема: t_p47619579_knowledge_management
          </p>
          {lastUpdate && (
            <p className="text-sm text-muted-foreground mt-1">
              Обновлено: {lastUpdate.toLocaleString('ru-RU')}
            </p>
          )}
        </div>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Icon name={loading ? "Loader2" : "RefreshCw"} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Всего таблиц</CardTitle>
              <Icon name="Table" className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTables}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Активных таблиц в схеме
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Всего записей</CardTitle>
              <Icon name="FileText" className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatNumber(stats.totalRecords)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Строк данных в базе
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Средний размер</CardTitle>
              <Icon name="PieChart" className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalTables > 0 ? Math.round(stats.totalRecords / stats.totalTables) : 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Записей на таблицу
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tables List */}
      {stats && stats.tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="List" className="w-5 h-5" />
              Таблицы базы данных
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.tables
                .sort((a, b) => b.row_count - a.row_count)
                .map((table) => (
                  <div
                    key={table.tablename}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Icon 
                        name={getTableIcon(table.tablename)} 
                        className="w-5 h-5 text-primary flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{table.tablename}</p>
                        <p className="text-sm text-muted-foreground">
                          Схема: {table.schemaname}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatNumber(table.row_count)}</p>
                        <p className="text-xs text-muted-foreground">записей</p>
                      </div>
                      <Badge 
                        variant={table.row_count > 0 ? "default" : "secondary"}
                        className="w-20 justify-center"
                      >
                        {table.row_count > 100 ? 'Большая' : table.row_count > 0 ? 'Активна' : 'Пустая'}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Info */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Icon name="Server" className="w-5 h-5" />
            Информация о подключении
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Провайдер:</span>
            <span className="font-medium">TimeWeb Cloud</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Тип базы:</span>
            <span className="font-medium">PostgreSQL 16</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Подключение:</span>
            <Badge variant="default" className="bg-green-500">
              <Icon name="CheckCircle" className="w-3 h-3 mr-1" />
              Активно
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SSL:</span>
            <Badge variant="secondary">
              <Icon name="Lock" className="w-3 h-3 mr-1" />
              Включен
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}