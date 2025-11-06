import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface UserStatsCardProps {
  employee: any;
}

export default function UserStatsCard({ employee }: UserStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="BarChart3" size={20} className="mr-2 text-purple-600" />
          Моя статистика
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Icon name="FileText" size={24} className="mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{employee.tests}</p>
            <p className="text-sm text-gray-600">Пройдено тестов</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Icon name="Award" size={24} className="mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{employee.avgScore}%</p>
            <p className="text-sm text-gray-600">Средний балл</p>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Icon name="Star" size={24} className="mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-yellow-600">{employee.score}</p>
            <p className="text-sm text-gray-600">Рейтинг</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Icon name="TrendingUp" size={24} className="mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600">{employee.status}/5</p>
            <p className="text-sm text-gray-600">Статус</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center">
            <Icon name="Activity" size={16} className="mr-2" />
            Последние результаты
          </h4>
          {employee.testResults && employee.testResults.length > 0 ? (
            <div className="space-y-2">
              {employee.testResults.slice(0, 5).map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                  <div className="flex items-center">
                    <Icon name="CheckCircle" size={16} className="mr-2 text-green-600" />
                    <span className="text-sm">Тест #{result.id}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="font-medium text-green-600">{result.score}%</span>
                    <span className="text-gray-500">{result.timeSpent} мин</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Результаты тестов пока отсутствуют
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
