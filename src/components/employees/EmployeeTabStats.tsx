import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Employee } from '@/utils/database';
import { getTestScore, getCompletedTests } from './employeeUtils';

interface EmployeeTabStatsProps {
  employees: Employee[];
}

const EmployeeTabStats: React.FC<EmployeeTabStatsProps> = ({ employees }) => {
  const totalEmployees = employees.length;
  const excellentEmployees = employees.filter(emp => emp.status >= 4).length;
  const averageScore = totalEmployees > 0 
    ? Math.round(employees.reduce((sum, emp) => sum + getTestScore(emp), 0) / totalEmployees)
    : 0;
  const totalTests = employees.reduce((sum, emp) => sum + getCompletedTests(emp), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={20} className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Всего сотрудников</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={20} className="text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Отличные (4-5)</p>
              <p className="text-2xl font-bold">{excellentEmployees}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Trophy" size={20} className="text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Средняя оценка</p>
              <p className="text-2xl font-bold">{averageScore}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={20} className="text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Всего тестов</p>
              <p className="text-2xl font-bold">{totalTests}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTabStats;