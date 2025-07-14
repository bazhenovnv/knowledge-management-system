import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import TestManagement from "@/components/tests/TestManagement";

interface EmployeeDashboardProps {
  onLogout: () => void;
}

export const EmployeeDashboard = ({ onLogout }: EmployeeDashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Личный кабинет сотрудника</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon name="User" size={24} className="mr-2 text-blue-600" />
              Моя статистика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600">15</div>
                <div className="text-sm text-gray-600">Пройдено тестов</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-green-600">85%</div>
                <div className="text-sm text-gray-600">Средний балл</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Текущие задания</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Тест по безопасности</div>
                  <div className="text-sm text-gray-600">Срок: 25 января</div>
                </div>
                <Badge variant="secondary">Новый</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Обучение React</div>
                  <div className="text-sm text-gray-600">Прогресс: 60%</div>
                  <Progress value={60} className="mt-2" />
                </div>
                <Badge variant="outline">В процессе</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Корпоративная культура</div>
                  <div className="text-sm text-gray-600">Завершено</div>
                </div>
                <Badge className="bg-green-100 text-green-800">Завершено</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Тесты */}
      <Card>
        <CardContent className="p-6">
          <TestManagement userRole="student" />
        </CardContent>
      </Card>
    </div>
  );
};