import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/icon";
import { Employee } from '@/utils/database';
import { exportToCSV, exportToExcel } from './employeeUtils';

interface EmployeeTabHeaderProps {
  userRole: string;
  employees: Employee[];
  onBulkNotification: () => void;
  onAddEmployee: () => void;
}

const EmployeeTabHeader: React.FC<EmployeeTabHeaderProps> = ({
  userRole,
  employees,
  onBulkNotification,
  onAddEmployee
}) => {
  const handleExportCSV = () => exportToCSV(employees);
  const handleExportExcel = () => exportToExcel(employees);

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Зарегистрированные сотрудники</h2>
      <div className="flex items-center space-x-2">
        <Button 
          onClick={onBulkNotification}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
        >
          <Icon name="Bell" size={16} />
          <span>Отправить уведомление</span>
        </Button>
        
        {userRole === "admin" && (
          <Button 
            onClick={onAddEmployee}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black"
          >
            <Icon name="UserPlus" size={16} className="mr-2" />
            Добавить сотрудника
          </Button>
        )}
        
        {(userRole === "admin" || userRole === "teacher") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black">
                <Icon name="Download" size={16} className="mr-2" />
                Выгрузить отчет
                <Icon name="ChevronDown" size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportExcel}>
                <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                Скачать Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <Icon name="FileText" size={16} className="mr-2" />
                Скачать CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default EmployeeTabHeader;