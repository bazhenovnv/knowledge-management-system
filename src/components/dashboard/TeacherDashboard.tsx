import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface TeacherDashboardProps {
  onLogout: () => void;
  employees: any[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const TeacherDashboard = ({
  onLogout,
  employees,
  getStatusColor,
  getStatusText,
}: TeacherDashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Личный кабинет преподавателя</h2>
        <Button
          variant="outline"
          onClick={onLogout}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          <Icon name="LogOut" size={16} className="mr-2" />
          Выход
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon
                name="GraduationCap"
                size={24}
                className="mr-2 text-green-600"
              />
              Статистика обучения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-green-600">24</div>
                <div className="text-sm text-gray-600">Студентов</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600">156</div>
                <div className="text-sm text-gray-600">Проведено тестов</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Список тестируемых</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.slice(0, 3).map((employee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(employee.status)}`}
                    ></div>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-gray-600">
                        {employee.department}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(employee.status)} text-white`}
                  >
                    {getStatusText(employee.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
