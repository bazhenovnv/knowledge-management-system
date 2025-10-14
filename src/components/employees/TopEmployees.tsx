import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { getStatusColor, getStatusText } from "@/utils/statusUtils";
import { database } from "@/utils/database";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const TopEmployees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [topEmployees, setTopEmployees] = useState<any[]>([]);
  const [bottomEmployees, setBottomEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Загружаем сотрудников из базы данных
  useEffect(() => {
    const loadEmployees = () => {
      const employeesData = database.getEmployees();
      const testsData = database.getTests();
      const totalAvailableTests = testsData.filter(t => t.status === 'published').length;
      
      setEmployees(employeesData);

      // Фильтруем только сотрудников (не админов и преподавателей)
      const onlyEmployees = employeesData.filter(emp => emp.role === 'employee');
      
      // Сотрудники с результатами тестов
      const employeesWithTests = onlyEmployees.filter(emp => 
        emp.testResults && emp.testResults.length > 0
      );

      // Сортировка по общей оценке (от лучших к худшим)
      const sortedByScore = [...employeesWithTests].sort((a, b) => 
        getTestScore(b) - getTestScore(a)
      );
      
      // Топ-3 лучших сотрудников (с лучшими баллами)
      setTopEmployees(sortedByScore.slice(0, 3));
      
      // Сотрудники, требующие внимания:
      // 1. С низкими баллами (< 60%)
      // 2. Не прошедшие ни одного теста
      // 3. Прошедшие мало тестов при наличии доступных
      const needAttention = onlyEmployees.filter(emp => {
        const testScore = getTestScore(emp);
        const completedTests = getCompletedTests(emp);
        
        // Критерии для внимания:
        return (
          completedTests === 0 || // Не прошел ни одного теста
          testScore < 60 || // Низкий балл
          (totalAvailableTests > 0 && completedTests < totalAvailableTests / 2) // Прошел меньше половины
        );
      }).sort((a, b) => {
        // Сортируем по приоритету: сначала с низкими баллами, потом без тестов
        const scoreA = getTestScore(a);
        const scoreB = getTestScore(b);
        const testsA = getCompletedTests(a);
        const testsB = getCompletedTests(b);
        
        // Если оба без тестов - сортируем по имени
        if (testsA === 0 && testsB === 0) return a.name.localeCompare(b.name);
        // Если один без тестов - он важнее
        if (testsA === 0) return -1;
        if (testsB === 0) return 1;
        // Оба с тестами - сортируем по баллу (худшие первыми)
        return scoreA - scoreB;
      });
      
      setBottomEmployees(needAttention.slice(0, 3));
    };

    loadEmployees();
    
    // Обновляем данные каждые 10 секунд
    const interval = setInterval(loadEmployees, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Функция для подсчета общей оценки тестирования
  const getTestScore = (employee: any) => {
    if (!employee.testResults || employee.testResults.length === 0) return 0;
    const totalScore = employee.testResults.reduce((sum: number, test: any) => sum + test.score, 0);
    return Math.round(totalScore / employee.testResults.length);
  };

  // Функция для подсчета пройденных тестов
  const getCompletedTests = (employee: any) => {
    return employee.testResults ? employee.testResults.length : 0;
  };

  // Определение причины, почему сотрудник требует внимания
  const getAttentionReason = (employee: any) => {
    const testScore = getTestScore(employee);
    const completedTests = getCompletedTests(employee);
    const testsData = database.getTests();
    const totalAvailableTests = testsData.filter(t => t.status === 'published').length;
    
    if (completedTests === 0) {
      return { icon: 'XCircle', text: 'Не прошел тесты', color: 'text-red-600' };
    }
    if (testScore < 40) {
      return { icon: 'TrendingDown', text: 'Очень низкий балл', color: 'text-red-600' };
    }
    if (testScore < 60) {
      return { icon: 'AlertTriangle', text: 'Низкий балл', color: 'text-orange-600' };
    }
    if (totalAvailableTests > 0 && completedTests < totalAvailableTests / 2) {
      return { icon: 'Clock', text: 'Мало пройдено', color: 'text-yellow-600' };
    }
    return { icon: 'Info', text: 'Требует внимания', color: 'text-gray-600' };
  };

  const renderEmployeeItem = (employee: any, index: number, isTop: boolean) => {
    const testScore = getTestScore(employee);
    const completedTests = getCompletedTests(employee);
    const attentionReason = !isTop ? getAttentionReason(employee) : null;
    
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
      <div 
        key={employee.id} 
        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={() => {
          setSelectedEmployee(employee);
          setIsDialogOpen(true);
        }}
      >
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
          <p className="text-sm text-gray-500">{employee.department || 'Без отдела'}</p>
          {!isTop && attentionReason && (
            <div className={`flex items-center mt-1 text-xs ${attentionReason.color}`}>
              <Icon name={attentionReason.icon as any} size={12} className="mr-1" />
              {attentionReason.text}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <Badge variant={testScore >= 80 ? "default" : testScore >= 60 ? "secondary" : "destructive"}>
              {testScore}%
            </Badge>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Тестов: {completedTests}
          </div>
          <Progress value={testScore} className="w-16 mt-1" />
        </div>
      </div>
    );
  };

  return (
    <>
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
              {topEmployees.length > 0 ? (
                topEmployees.map((employee, index) => 
                  renderEmployeeItem(employee, index, true)
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="Users" size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Нет данных о сотрудниках</p>
                  <p className="text-xs mt-1">Сотрудники появятся после прохождения тестов</p>
                </div>
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
              {bottomEmployees.length > 0 ? (
                bottomEmployees.map((employee, index) => 
                  renderEmployeeItem(employee, index, false)
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="CheckCircle" size={48} className="mx-auto mb-3 opacity-50 text-green-500" />
                  <p className="text-sm">Все сотрудники показывают отличные результаты!</p>
                  <p className="text-xs mt-1">Нет сотрудников, требующих особого внимания</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно с детальной статистикой */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-medium">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedEmployee.name}</DialogTitle>
                    <DialogDescription className="text-base">
                      {selectedEmployee.position} • {selectedEmployee.department || 'Без отдела'}
                    </DialogDescription>
                  </div>
                  <Badge variant={getTestScore(selectedEmployee) >= 80 ? "default" : getTestScore(selectedEmployee) >= 60 ? "secondary" : "destructive"} className="text-lg px-4 py-2">
                    {getTestScore(selectedEmployee)}%
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Общая статистика */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Icon name="BarChart3" size={20} className="mr-2" />
                    Общая статистика
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">{getCompletedTests(selectedEmployee)}</div>
                          <div className="text-sm text-gray-500 mt-1">Пройдено тестов</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">{getTestScore(selectedEmployee)}%</div>
                          <div className="text-sm text-gray-500 mt-1">Средний балл</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Badge className={`${getStatusColor(selectedEmployee.status)} text-white`}>
                            {getStatusText(selectedEmployee.status)}
                          </Badge>
                          <div className="text-sm text-gray-500 mt-2">Статус</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {selectedEmployee.testResults?.reduce((sum: number, test: any) => sum + test.timeSpent, 0) || 0}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Минут на тесты</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Результаты по тестам */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Icon name="FileText" size={20} className="mr-2" />
                    Результаты по тестам
                  </h3>
                  {selectedEmployee.testResults && selectedEmployee.testResults.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEmployee.testResults.map((result: any, index: number) => {
                        const tests = database.getTests();
                        const test = tests.find(t => t.id === result.id.toString());
                        return (
                          <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <Icon name="FileCheck" size={16} className="text-blue-500" />
                                    <p className="font-medium">{test?.title || `Тест #${result.id}`}</p>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Icon name="Clock" size={14} className="mr-1" />
                                      {result.timeSpent} мин
                                    </span>
                                    {test?.category && (
                                      <Badge variant="outline" className="text-xs">{test.category}</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="flex items-center space-x-2">
                                    <Progress value={result.score} className="w-24" />
                                    <Badge variant={result.score >= 80 ? "default" : result.score >= 60 ? "secondary" : "destructive"}>
                                      {result.score}%
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center text-gray-500">
                        <Icon name="FileX" size={48} className="mx-auto mb-3 opacity-50" />
                        <p>Сотрудник еще не прошел ни одного теста</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Рекомендации */}
                {getTestScore(selectedEmployee) < 70 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-orange-600">
                      <Icon name="Lightbulb" size={20} className="mr-2" />
                      Рекомендации
                    </h3>
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <ul className="space-y-2 text-sm">
                          {getCompletedTests(selectedEmployee) === 0 && (
                            <li className="flex items-start">
                              <Icon name="ArrowRight" size={16} className="mr-2 mt-0.5 text-orange-600" />
                              <span>Необходимо пройти первоначальное тестирование для оценки уровня знаний</span>
                            </li>
                          )}
                          {getTestScore(selectedEmployee) < 60 && getCompletedTests(selectedEmployee) > 0 && (
                            <>
                              <li className="flex items-start">
                                <Icon name="ArrowRight" size={16} className="mr-2 mt-0.5 text-orange-600" />
                                <span>Рекомендуется дополнительное обучение по слабым темам</span>
                              </li>
                              <li className="flex items-start">
                                <Icon name="ArrowRight" size={16} className="mr-2 mt-0.5 text-orange-600" />
                                <span>Назначить индивидуальную встречу с наставником</span>
                              </li>
                            </>
                          )}
                          {getTestScore(selectedEmployee) >= 60 && getTestScore(selectedEmployee) < 70 && (
                            <li className="flex items-start">
                              <Icon name="ArrowRight" size={16} className="mr-2 mt-0.5 text-orange-600" />
                              <span>Прогресс есть, но требуется больше практики для улучшения результатов</span>
                            </li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};