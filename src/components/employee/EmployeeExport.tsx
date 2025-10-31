import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { DatabaseEmployee } from '@/utils/databaseService';

export class EmployeeExport {
  static getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'teacher': return 'Преподаватель';
      default: return 'Сотрудник';
    }
  }

  static exportToExcel(employees: DatabaseEmployee[]): void {
    try {
      const exportData = employees.map(emp => ({
        'ID': emp.id,
        'ФИО': emp.full_name,
        'Email': emp.email,
        'Телефон': emp.phone || '-',
        'Отдел': emp.department,
        'Должность': emp.position,
        'Роль': this.getRoleText(emp.role),
        'Дата найма': emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('ru-RU') : '-',
        'Создан': new Date(emp.created_at).toLocaleDateString('ru-RU')
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Сотрудники');
      
      const colWidths = [
        { wch: 5 },
        { wch: 35 },
        { wch: 30 },
        { wch: 18 },
        { wch: 25 },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 }
      ];
      ws['!cols'] = colWidths;

      const fileName = `Сотрудники_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success(`Экспортировано ${employees.length} сотрудников в Excel`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте данных');
    }
  }

  static exportToCSV(employees: DatabaseEmployee[]): void {
    try {
      const headers = ['ID', 'ФИО', 'Email', 'Телефон', 'Отдел', 'Должность', 'Роль', 'Дата найма', 'Создан'];
      
      const csvData = employees.map(emp => [
        emp.id,
        emp.full_name,
        emp.email,
        emp.phone || '-',
        emp.department,
        emp.position,
        this.getRoleText(emp.role),
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
  }
}
