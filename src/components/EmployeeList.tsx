import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { databaseService, DatabaseEmployee } from '@/utils/databaseService';
import EditEmployeeForm from './EditEmployeeForm';
import AddEmployeeForm from './AddEmployeeForm';
import * as XLSX from 'xlsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<DatabaseEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<DatabaseEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<DatabaseEmployee | null>(null);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState<DatabaseEmployee | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    console.log('🔄 Loading employees from database...');
    setIsLoading(true);
    try {
      const data = await databaseService.getEmployees();
      console.log('✅ Employees loaded:', data.length, 'records');
      console.log('📋 First employee:', data[0]);
      setEmployees(data);
    } catch (error) {
      console.error('❌ Error loading employees:', error);
      toast.error('Ошибка при загрузке списка сотрудников');
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = employees.filter(emp => 
      emp.full_name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term) ||
      emp.position.toLowerCase().includes(term) ||
      (emp.phone && emp.phone.includes(term))
    );
    
    setFilteredEmployees(filtered);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      // Если сотрудник неактивен - полное удаление, иначе - мягкое (деактивация)
      const success = employeeToDelete.is_active 
        ? await databaseService.deleteEmployee(employeeToDelete.id)
        : await databaseService.permanentDeleteEmployee(employeeToDelete.id);
      
      if (success) {
        await loadEmployees();
        const message = employeeToDelete.is_active
          ? `Сотрудник ${employeeToDelete.full_name} деактивирован`
          : `Сотрудник ${employeeToDelete.full_name} полностью удалён из базы данных`;
        toast.success(message);
      } else {
        toast.error('Не удалось удалить сотрудника');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Ошибка при удалении сотрудника');
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleEmployeeUpdated = (updatedEmployee: DatabaseEmployee) => {
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    );
    setEditingEmployee(null);
    toast.success('Данные сотрудника обновлены');
  };

  const handleEmployeeAdded = (newEmployee: DatabaseEmployee) => {
    setEmployees(prev => [...prev, newEmployee]);
    setIsAddingEmployee(false);
    toast.success('Новый сотрудник добавлен');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'teacher': return 'Преподаватель';
      default: return 'Сотрудник';
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = employees.map(emp => ({
        'ID': emp.id,
        'ФИО': emp.full_name,
        'Email': emp.email,
        'Телефон': emp.phone || '-',
        'Отдел': emp.department,
        'Должность': emp.position,
        'Роль': getRoleText(emp.role),
        'Дата найма': emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('ru-RU') : '-',
        'Создан': new Date(emp.created_at).toLocaleDateString('ru-RU')
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Сотрудники');
      
      // Настройка ширины колонок
      const colWidths = [
        { wch: 5 },  // ID
        { wch: 35 }, // ФИО
        { wch: 30 }, // Email
        { wch: 18 }, // Телефон
        { wch: 25 }, // Отдел
        { wch: 30 }, // Должность
        { wch: 15 }, // Роль
        { wch: 12 }, // Дата найма
        { wch: 12 }  // Создан
      ];
      ws['!cols'] = colWidths;

      const fileName = `Сотрудники_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success(`Экспортировано ${employees.length} сотрудников в Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте данных');
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ['ID', 'ФИО', 'Email', 'Телефон', 'Отдел', 'Должность', 'Роль', 'Дата найма', 'Создан'];
      
      const csvData = employees.map(emp => [
        emp.id,
        emp.full_name,
        emp.email,
        emp.phone || '-',
        emp.department,
        emp.position,
        getRoleText(emp.role),
        emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('ru-RU') : '-',
        new Date(emp.created_at).toLocaleDateString('ru-RU')
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `Сотрудники_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Экспортировано ${employees.length} сотрудников в CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте данных');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const totalRows = jsonData.length;

      setImportProgress({ current: 0, total: totalRows });

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        setImportProgress({ current: i + 1, total: totalRows });
        
        try {
          const rowData = row as any;
          
          // Маппинг колонок (поддержка разных вариантов названий)
          const fullName = rowData['ФИО'] || rowData['Имя'] || rowData['Full Name'] || rowData['Name'];
          const email = rowData['Email'] || rowData['E-mail'] || rowData['Почта'];
          const phone = rowData['Телефон'] || rowData['Phone'] || '';
          const department = rowData['Отдел'] || rowData['Department'];
          const position = rowData['Должность'] || rowData['Position'];
          const roleText = rowData['Роль'] || rowData['Role'] || 'employee';
          const hireDate = rowData['Дата найма'] || rowData['Hire Date'] || '';

          // Преобразование роли из текста в код
          let role: 'admin' | 'teacher' | 'employee' = 'employee';
          if (roleText.toLowerCase().includes('админ') || roleText.toLowerCase() === 'admin') {
            role = 'admin';
          } else if (roleText.toLowerCase().includes('препод') || roleText.toLowerCase() === 'teacher') {
            role = 'teacher';
          }

          // Валидация обязательных полей
          if (!fullName || !email || !department || !position) {
            errorCount++;
            errors.push(`Строка с email "${email || 'не указан'}": пропущены обязательные поля`);
            continue;
          }

          // Валидация email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            errorCount++;
            errors.push(`"${fullName}": некорректный email "${email}"`);
            continue;
          }

          // Создание сотрудника
          const newEmployee = await databaseService.createEmployee({
            full_name: fullName.toString().trim(),
            email: email.toString().trim(),
            phone: phone ? phone.toString().trim() : undefined,
            department: department.toString().trim(),
            position: position.toString().trim(),
            role,
            hire_date: hireDate ? hireDate.toString() : undefined,
            password: 'temp123' // Временный пароль
          });

          if (newEmployee) {
            successCount++;
          } else {
            errorCount++;
            errors.push(`"${fullName}": не удалось создать (возможно, email уже существует)`);
          }
        } catch (error) {
          errorCount++;
          errors.push(`Ошибка обработки строки: ${error}`);
        }
      }

      // Обновляем список сотрудников
      await loadEmployees();

      // Показываем результаты
      if (successCount > 0) {
        toast.success(`Успешно импортировано: ${successCount} сотрудников`);
      }
      
      if (errorCount > 0) {
        const errorMessage = errors.slice(0, 3).join('\n') + (errors.length > 3 ? `\n... и еще ${errors.length - 3}` : '');
        toast.error(`Ошибок при импорте: ${errorCount}\n${errorMessage}`, { duration: 5000 });
      }

      if (successCount === 0 && errorCount === 0) {
        toast.warning('Файл не содержит данных для импорта');
      }

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Ошибка при чтении файла. Проверьте формат Excel.');
    } finally {
      setIsImporting(false);
      setImportProgress(null);
      // Очищаем input для возможности повторного импорта того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = async () => {
    try {
      // Создаем данные для основного шаблона
      const templateData = [
        {
          'ФИО': 'Иванов Иван Иванович',
          'Email': 'ivanov@company.com',
          'Телефон': '+7 (999) 123-45-67',
          'Отдел': 'IT',
          'Должность': 'Senior разработчик',
          'Роль': 'Сотрудник',
          'Дата найма': '2024-01-15'
        },
        {
          'ФИО': 'Петрова Анна Сергеевна',
          'Email': 'petrova@company.com',
          'Телефон': '+7 (999) 234-56-78',
          'Отдел': 'Обучение',
          'Должность': 'Преподаватель',
          'Роль': 'Преподаватель',
          'Дата найма': '2024-02-20'
        },
        {
          'ФИО': 'Сидоров Петр Алексеевич',
          'Email': 'sidorov@company.com',
          'Телефон': '+7 (999) 345-67-89',
          'Отдел': 'Маркетинг',
          'Должность': 'Маркетолог',
          'Роль': 'Сотрудник',
          'Дата найма': '2024-03-10'
        }
      ];

      // Создаем справочник отделов
      const departments = [
        'IT', 'Обучение', 'Партнерка', 'Отдел разработки', 'QA/Тестирование', 
        'DevOps', 'Отдел продаж', 'Маркетинг', 'SEO/SMM', 'HR', 'Управление', 
        'Бухгалтерия', 'Финансы', 'Дизайн', 'Аналитика', 'Безопасность', 
        'Поддержка клиентов', 'Логистика', 'Закупки', 'Юридический'
      ];
      
      const departmentData = departments.map(dept => ({ 'Отдел': dept }));

      // Создаем справочник должностей
      const positions = [
        'Junior разработчик', 'Middle разработчик', 'Senior разработчик', 
        'Team Lead', 'Менеджер проекта', 'Product Manager', 'Системный аналитик',
        'Дизайнер', 'QA инженер', 'DevOps инженер', 'Специалист', 
        'Старший специалист', 'Эксперт', 'Консультант', 'Координатор',
        'Ассистент', 'Стажер', 'Руководитель отдела', 'Заместитель директора',
        'Директор', 'Бухгалтер', 'Экономист', 'HR-менеджер', 'Маркетолог',
        'SMM-менеджер', 'Преподаватель', 'Главный администратор'
      ];
      
      const positionData = positions.map(pos => ({ 'Должность': pos }));

      // Создаем справочник ролей
      const roleData = [
        { 'Роль': 'Сотрудник', 'Описание': 'Обычный сотрудник с базовыми правами' },
        { 'Роль': 'Преподаватель', 'Описание': 'Может создавать и назначать тесты' },
        { 'Роль': 'Администратор', 'Описание': 'Полный доступ к системе' }
      ];

      // Создаем книгу Excel
      const wb = XLSX.utils.book_new();

      // Лист 1: Шаблон для заполнения
      const ws1 = XLSX.utils.json_to_sheet(templateData);
      ws1['!cols'] = [
        { wch: 35 }, { wch: 30 }, { wch: 18 }, { wch: 25 }, 
        { wch: 30 }, { wch: 15 }, { wch: 12 }
      ];
      XLSX.utils.book_append_sheet(wb, ws1, 'Шаблон для импорта');

      // Лист 2: Справочник отделов
      const ws2 = XLSX.utils.json_to_sheet(departmentData);
      ws2['!cols'] = [{ wch: 30 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Отделы');

      // Лист 3: Справочник должностей
      const ws3 = XLSX.utils.json_to_sheet(positionData);
      ws3['!cols'] = [{ wch: 35 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Должности');

      // Лист 4: Справочник ролей
      const ws4 = XLSX.utils.json_to_sheet(roleData);
      ws4['!cols'] = [{ wch: 20 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, ws4, 'Роли');

      // Сохраняем файл
      XLSX.writeFile(wb, 'Шаблон_импорта_сотрудников.xlsx');
      toast.success('Шаблон скачан! Содержит примеры и справочники отделов, должностей и ролей.');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Ошибка при создании шаблона');
    }
  };

  if (isAddingEmployee) {
    return (
      <div>
        <Button 
          onClick={() => setIsAddingEmployee(false)}
          variant="outline"
          className="mb-4"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад к списку
        </Button>
        
        <AddEmployeeForm
          onEmployeeAdded={handleEmployeeAdded}
          onCancel={() => setIsAddingEmployee(false)}
        />
      </div>
    );
  }

  if (editingEmployee) {
    return (
      <div>
        <Button 
          onClick={() => setEditingEmployee(null)}
          variant="outline"
          className="mb-4"
        >
          <Icon name="ArrowLeft" size={16} className="mr-2" />
          Назад к списку
        </Button>
        
        <EditEmployeeForm
          employee={editingEmployee}
          onEmployeeUpdated={handleEmployeeUpdated}
          onCancel={() => setEditingEmployee(null)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Icon name="Loader2" size={24} className="animate-spin mr-2" />
          Загрузка сотрудников...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={24} />
              Список сотрудников ({employees.length})
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddingEmployee(true)} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-[0.25px] border-black">
                <Icon name="UserPlus" size={16} className="mr-2" />
                Добавить
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isImporting}>
                    {isImporting ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Импорт...
                      </>
                    ) : (
                      <>
                        <Icon name="Upload" size={16} className="mr-2" />
                        Импорт
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleImportClick}>
                    <Icon name="FileUp" size={16} className="mr-2" />
                    Импорт из Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadTemplate}>
                    <Icon name="Download" size={16} className="mr-2" />
                    Скачать шаблон
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Icon name="Download" size={16} className="mr-2" />
                    Экспорт
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToExcel}>
                    <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                    Экспорт в Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <Icon name="FileText" size={16} className="mr-2" />
                    Экспорт в CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={loadEmployees} variant="outline" size="sm">
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isImporting && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Icon name="Loader2" size={18} className="animate-spin" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Импорт сотрудников...</span>
                  {importProgress && (
                    <div className="mt-1">
                      <div className="text-xs text-blue-600">
                        Обработано: {importProgress.current} из {importProgress.total}
                      </div>
                      <div className="mt-1 w-full bg-blue-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <div className="relative">
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <Input
                type="text"
                placeholder="Поиск по имени, email, отделу, должности или телефону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Найдено: {filteredEmployees.length} из {employees.length}
              </p>
            )}
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
              <p>
                {searchTerm ? 'Сотрудники не найдены по запросу' : 'Сотрудники не найдены'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => {
                // Фильтруем сотрудников с пустыми обязательными полями
                if (!employee.full_name || !employee.department || !employee.position) {
                  return null;
                }
                
                return (
                <div 
                  key={employee.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold text-lg ${!employee.is_active ? 'text-gray-400 line-through' : ''}`}>
                          {employee.full_name}
                        </h3>
                        <Badge className={getRoleBadgeColor(employee.role)}>
                          {getRoleText(employee.role)}
                        </Badge>
                        {!employee.is_active && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                            <Icon name="XCircle" size={12} className="mr-1" />
                            Неактивен
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Icon name="Mail" size={14} />
                          {employee.email}
                        </div>
                        
                        {employee.phone && (
                          <div className="flex items-center gap-1">
                            <Icon name="Phone" size={14} />
                            {employee.phone}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Icon name="Building2" size={14} />
                          {employee.department}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Icon name="Briefcase" size={14} />
                          {employee.position}
                        </div>
                      </div>
                    
                    {employee.hire_date && (
                      <div className="mt-2 text-xs text-gray-500">
                        Дата найма: {new Date(employee.hire_date).toLocaleDateString('ru-RU')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingEmployee(employee)}
                    >
                      <Icon name="Edit" size={14} className="mr-1" />
                      Редактировать
                    </Button>
                    
                    {!employee.is_active ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const restored = await databaseService.restoreEmployee(employee.id);
                            if (restored) {
                              toast.success(`Сотрудник ${employee.full_name} восстановлен`);
                              loadEmployees();
                            } else {
                              toast.error('Ошибка при восстановлении сотрудника');
                            }
                          }}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Icon name="UserCheck" size={14} className="mr-1" />
                          Восстановить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEmployeeToDelete(employee)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={14} className="mr-1" />
                          Удалить полностью
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEmployeeToDelete(employee)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Icon name="Trash2" size={14} className="mr-1" />
                        Удалить
                      </Button>
                    )}
                    </div>
                  </div>
                </div>
              );
              })}
          </div>
        )}
      </CardContent>
    </Card>

    <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {employeeToDelete?.is_active ? 'Подтверждение деактивации' : 'Подтверждение удаления'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {employeeToDelete?.is_active ? (
              <>
                Вы уверены, что хотите деактивировать сотрудника{' '}
                <strong>{employeeToDelete?.full_name}</strong>?
                <br />
                <br />
                Сотрудник будет помечен как неактивный, но данные останутся в базе данных.
                Позже его можно будет восстановить.
              </>
            ) : (
              <>
                <span className="text-red-600 font-semibold">⚠️ Внимание! Это действие необратимо!</span>
                <br />
                <br />
                Вы уверены, что хотите <strong>полностью удалить</strong> сотрудника{' '}
                <strong>{employeeToDelete?.full_name}</strong> из базы данных?
                <br />
                <br />
                Все данные сотрудника будут удалены безвозвратно. Восстановление будет невозможно.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteEmployee}
            className="bg-red-600 hover:bg-red-700"
          >
            {employeeToDelete?.is_active ? 'Деактивировать' : 'Удалить навсегда'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default EmployeeList;