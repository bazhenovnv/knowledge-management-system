import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Icon from "@/components/ui/icon";
import { database } from "@/utils/database";
import { toast } from "sonner";

interface DatabaseStatsProps {
  userRole: string;
}

export const DatabaseStats = ({ userRole }: DatabaseStatsProps) => {
  const [stats, setStats] = useState({
    employees: 0,
    tests: 0,
    testResults: 0,
    lastUpdated: new Date()
  });
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Загружаем статистику
  useEffect(() => {
    const loadStats = () => {
      const employees = database.getEmployees();
      const tests = database.getTests();
      const testResults = database.getTestResults();
      
      setStats({
        employees: employees.length,
        tests: tests.length,
        testResults: testResults.length,
        lastUpdated: new Date()
      });
    };

    loadStats();
  }, []);

  // Экспорт данных
  const handleExportData = () => {
    try {
      const data = database.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Данные экспортированы успешно");
      setIsExportDialogOpen(false);
    } catch (error) {
      toast.error("Ошибка при экспорте данных");
      console.error("Ошибка экспорта:", error);
    }
  };

  // Очистка базы данных
  const handleClearDatabase = () => {
    try {
      database.clearDatabase();
      database.initializeDatabase(); // Восстанавливаем базовые данные
      setStats({
        employees: 0,
        tests: 0,
        testResults: 0,
        lastUpdated: new Date()
      });
      toast.success("База данных очищена и переинициализирована");
      
      // Перезагружаем страницу для обновления всех компонентов
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Ошибка при очистке базы данных");
      console.error("Ошибка очистки:", error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Статистика базы данных</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Icon name="Database" size={12} className="mr-1" />
            localStorage
          </Badge>
          {userRole === "admin" && (
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Icon name="Download" size={14} className="mr-1" />
                  Экспорт
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Экспорт данных</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Экспорт всех данных из базы данных в формате JSON.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.employees}</div>
                      <div className="text-sm text-gray-600">Сотрудников</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.tests}</div>
                      <div className="text-sm text-gray-600">Тестов</div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleExportData}>
                      <Icon name="Download" size={14} className="mr-1" />
                      Скачать
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.employees}</div>
            <div className="text-sm text-gray-600">Сотрудников</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.tests}</div>
            <div className="text-sm text-gray-600">Тестов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.testResults}</div>
            <div className="text-sm text-gray-600">Результатов</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
          <span>Обновлено: {formatDate(stats.lastUpdated)}</span>
          {userRole === "admin" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                  <Icon name="Trash2" size={12} className="mr-1" />
                  Очистить БД
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Очистить базу данных?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие удалит все данные из базы данных и восстановит начальные данные. 
                    Все добавленные сотрудники, тесты и результаты будут удалены безвозвратно.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearDatabase} className="bg-red-500 hover:bg-red-600">
                    Очистить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};