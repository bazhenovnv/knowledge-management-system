import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Icon from '@/components/ui/icon';
import { useToast } from "@/components/ui/use-toast";
import { useApiClient } from "@/utils/apiClient";
import { useEnhancedToast } from "@/components/ui/enhanced-toast";
import DatabaseTest from "@/components/DatabaseTest";

interface TableInfo {
  table_name: string;
  row_count: number;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export function DatabaseSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM employees LIMIT 10;");
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [migrationSql, setMigrationSql] = useState("");
  const [migrationName, setMigrationName] = useState("");
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableColumns, setTableColumns] = useState<ColumnInfo[]>([]);
  const { toast } = useToast();
  const apiClient = useApiClient();
  const enhancedToast = useEnhancedToast();

  const loadTables = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/459a10f2-9dff-481a-af79-dcf6ca5cb628', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: 'database' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables || []);
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список таблиц",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка подключения к базе данных",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTableInfo = async (tableName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/459a10f2-9dff-481a-af79-dcf6ca5cb628', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          level: 'table',
          table_name: tableName
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTableColumns(data.columns || []);
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить информацию о таблице",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка подключения к базе данных",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите SQL запрос",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URLS.DATABASE_QUERY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: sqlQuery,
          max_rows: 100
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueryResult(data.rows || []);
        toast({
          title: "Запрос выполнен",
          description: `Получено ${data.rows?.length || 0} строк`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Ошибка SQL",
          description: error.error || "Ошибка выполнения запроса",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка выполнения запроса",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runMigration = async () => {
    if (!migrationSql.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите SQL для миграции",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URLS.DATABASE_MIGRATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          migration_content: migrationSql,
          migration_name: migrationName || undefined
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Миграция выполнена",
          description: `Миграция ${data.migration_file} успешно применена`,
        });
        setMigrationSql("");
        setMigrationName("");
      } else {
        const error = await response.json();
        toast({
          title: "Ошибка миграции",
          description: error.error || "Ошибка выполнения миграции",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Ошибка выполнения миграции",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Database" size={20} />
          Управление базой данных
        </CardTitle>
        <CardDescription>
          Просмотр структуры БД, выполнение запросов и миграций
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure">Структура БД</TabsTrigger>
            <TabsTrigger value="query">SQL Запросы</TabsTrigger>
            <TabsTrigger value="migrations">Миграции</TabsTrigger>
            <TabsTrigger value="test">Тестирование</TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Таблицы базы данных</h3>
              <Button onClick={loadTables} disabled={isLoading} variant="outline" size="sm">
                <Icon name="RefreshCw" size={16} className={isLoading ? "animate-spin" : ""} />
                Обновить
              </Button>
            </div>

            {tables.length > 0 && (
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Список таблиц</h4>
                    <ScrollArea className="h-64 border rounded p-2">
                      {tables.map((table) => (
                        <div
                          key={table.table_name}
                          className={`p-2 rounded cursor-pointer hover:bg-muted ${
                            selectedTable === table.table_name ? "bg-muted" : ""
                          }`}
                          onClick={() => {
                            setSelectedTable(table.table_name);
                            loadTableInfo(table.table_name);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{table.table_name}</span>
                            <Badge variant="secondary">{table.row_count} строк</Badge>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Колонки таблицы {selectedTable && `"${selectedTable}"`}
                    </h4>
                    <ScrollArea className="h-64 border rounded p-2">
                      {tableColumns.map((column) => (
                        <div key={column.column_name} className="p-2 border-b last:border-b-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{column.column_name}</span>
                            <Badge variant="outline">{column.data_type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {column.is_nullable === "YES" ? "NULL разрешен" : "NOT NULL"}
                            {column.column_default && ` • По умолчанию: ${column.column_default}`}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="query" className="space-y-4">
            <div>
              <Label htmlFor="sql-query">SQL Запрос (только SELECT)</Label>
              <Textarea
                id="sql-query"
                placeholder="SELECT * FROM employees WHERE department = 'IT';"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={6}
                className="mt-1"
              />
            </div>

            <Button onClick={executeQuery} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
              ) : (
                <Icon name="Play" size={16} className="mr-2" />
              )}
              Выполнить запрос
            </Button>

            {queryResult && (
              <div>
                <Separator className="my-4" />
                <h4 className="font-medium mb-2">Результат запроса</h4>
                <ScrollArea className="h-64 border rounded">
                  <div className="p-4">
                    <pre className="text-sm">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="migrations" className="space-y-4">
            <div>
              <Label htmlFor="migration-name">Название миграции (опционально)</Label>
              <Input
                id="migration-name"
                placeholder="add_user_profiles_table"
                value={migrationName}
                onChange={(e) => setMigrationName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="migration-sql">SQL код миграции</Label>
              <Textarea
                id="migration-sql"
                placeholder="CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"
                value={migrationSql}
                onChange={(e) => setMigrationSql(e.target.value)}
                rows={8}
                className="mt-1"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <div className="flex items-start gap-2">
                <Icon name="AlertTriangle" size={16} className="text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Внимание:</strong> Миграции нельзя откатить. Будьте осторожны при изменении структуры БД.
                </div>
              </div>
            </div>

            <Button onClick={runMigration} disabled={isLoading} className="w-full" variant="destructive">
              {isLoading ? (
                <Icon name="Loader2" size={16} className="animate-spin mr-2" />
              ) : (
                <Icon name="Database" size={16} className="mr-2" />
              )}
              Выполнить миграцию
            </Button>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <DatabaseTest />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}