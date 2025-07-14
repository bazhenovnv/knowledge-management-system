import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { employees } from "@/data/mockData";

export const TopEmployees = () => {
  // Функция для подсчета общей оценки тестирования
  const getTestScore = (employee: any) => {
    if (!employee.testResults) return 0;
    const totalScore = employee.testResults.reduce((sum: number, test: any) => sum + test.score, 0);
    return Math.round(totalScore / employee.testResults.length);
  };

  // Функция для подсчета пройденных тестов
  const getCompletedTests = (employee: any) => {
    return employee.testResults ? employee.testResults.length : 0;
  };

  // Сортировка сотрудников по общей оценке
  const sortedEmployees = [...employees].sort((a, b) => getTestScore(b) - getTestScore(a));
  
  // Топ-3 лучших сотрудников
  const topEmployees = sortedEmployees.slice(0, 3);
  
  // Топ-3 худших сотрудников
  const bottomEmployees = sortedEmployees.slice(-3).reverse();

  const renderEmployeeItem = (employee: any, index: number, isTop: boolean) => {
    const testScore = getTestScore(employee);
    const completedTests = getCompletedTests(employee);
    
    // Определение иконки медали для топ-3
    const getMedalIcon = (position: number) => {
      switch (position) {
        case 0: return "🥇";
        case 1: return "🥈";
        case 2: return "🥉";
        default: return "";
      }
    };

    return (
      <div key={employee.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center space-x-2">
          {isTop && (
            <span className="text-xl">{getMedalIcon(index)}</span>
          )}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
            {employee.name.charAt(0)}
          </div>
        </div>
        <div className="flex-1">
          <p className="font-medium">{employee.name}</p>
          <p className="text-sm text-gray-500">{employee.department}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <Badge variant={testScore >= 80 ? "default" : testScore >= 60 ? "secondary" : "destructive"}>
              {testScore}
            </Badge>
            <span className="text-sm text-gray-500">({completedTests} тестов)</span>
          </div>
          <Progress value={testScore} className="w-16 mt-1" />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Топ-3 лучших сотрудников */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-700">
            <Icon name="Trophy" size={24} className="mr-2 text-green-600" />
            Лучшие сотрудники
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topEmployees.map((employee, index) => 
              renderEmployeeItem(employee, index, true)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Топ-3 худших сотрудников */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <Icon name="AlertTriangle" size={24} className="mr-2 text-red-600" />
            Требуют внимания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bottomEmployees.map((employee, index) => 
              renderEmployeeItem(employee, index, false)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};