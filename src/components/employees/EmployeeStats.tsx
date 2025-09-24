import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { EmployeeStats as StatsType } from './types';

interface EmployeeStatsProps {
  stats: StatsType;
  selectedEmployeesCount: number;
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({
  stats,
  selectedEmployeesCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего сотрудников</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Icon name="Users" size={24} className="text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Средний балл</p>
              <p className="text-2xl font-bold">{stats.avgScore}%</p>
            </div>
            <Icon name="TrendingUp" size={24} className="text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Отделов</p>
              <p className="text-2xl font-bold">{Object.keys(stats.byDepartment).length}</p>
            </div>
            <Icon name="Building2" size={24} className="text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Выбрано</p>
              <p className="text-2xl font-bold">{selectedEmployeesCount}</p>
            </div>
            <Icon name="CheckSquare" size={24} className="text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeStats;