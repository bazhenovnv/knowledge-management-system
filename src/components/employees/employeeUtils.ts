import { Employee } from '@/utils/database';
import { getStatusText } from '@/utils/statusUtils';
import * as XLSX from 'xlsx';

// Функция для подсчета общей оценки тестирования
export const getTestScore = (employee: any) => {
  if (!employee.testResults) return 0;
  const totalScore = employee.testResults.reduce((sum: number, test: any) => sum + test.score, 0);
  return Math.round(totalScore / employee.testResults.length);
};

// Функция для подсчета пройденных тестов
export const getCompletedTests = (employee: any) => {
  return employee.testResults ? employee.testResults.length : 0;
};

// Функция для подсчета среднего времени выполнения
export const getAverageTime = (employee: any) => {
  if (!employee.testResults) return "—";
  const totalTime = employee.testResults.reduce((sum: number, test: any) => sum + test.timeSpent, 0);
  const avgMinutes = Math.round(totalTime / employee.testResults.length);
  return `${avgMinutes} мин`;
};

// Функция для получения текста роли
export const getRoleText = (role: string) => {
  switch (role) {
    case "admin": return "Администратор";
    case "teacher": return "Преподаватель";
    case "employee": return "Сотрудник";
    default: return "Сотрудник";
  }
};

// Функция для получения цвета роли
export const getRoleColor = (role: string) => {
  switch (role) {
    case "admin": return "bg-red-100 text-red-800";
    case "teacher": return "bg-blue-100 text-blue-800";
    case "employee": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// Функция выгрузки в CSV
export const exportToCSV = (employees: Employee[]) => {
  const csvContent = [
    ['Имя', 'Отдел', 'Должность', 'Роль', 'Статус', 'Общая оценка', 'Пройдено тестов', 'Среднее время', 'Email'].join(','),
    ...employees.map(emp => [
      emp.name,
      emp.department,
      emp.position,
      getRoleText(emp.role),
      getStatusText(emp.status),
      getTestScore(emp),
      getCompletedTests(emp),
      getAverageTime(emp),
      emp.email
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `employees_report_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

// Функция выгрузки в Excel
export const exportToExcel = (employees: Employee[]) => {
  const data = [
    ['Имя', 'Отдел', 'Должность', 'Роль', 'Статус', 'Общая оценка', 'Пройдено тестов', 'Среднее время', 'Email'],
    ...employees.map(emp => [
      emp.name,
      emp.department,
      emp.position,
      getRoleText(emp.role),
      getStatusText(emp.status),
      getTestScore(emp),
      getCompletedTests(emp),
      getAverageTime(emp),
      emp.email
    ])
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Сотрудники');
  
  // Установка ширины колонок
  const wscols = [
    { wch: 25 }, // Имя
    { wch: 20 }, // Отдел
    { wch: 25 }, // Должность
    { wch: 18 }, // Роль
    { wch: 15 }, // Статус
    { wch: 15 }, // Общая оценка
    { wch: 18 }, // Пройдено тестов
    { wch: 18 }, // Среднее время
    { wch: 30 }  // Email
  ];
  worksheet['!cols'] = wscols;
  
  XLSX.writeFile(workbook, `employees_report_${new Date().toISOString().split('T')[0]}.xlsx`);
};