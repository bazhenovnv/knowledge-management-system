import React from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { databaseService } from '@/utils/databaseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface ImportProgress {
  current: number;
  total: number;
}

interface EmployeeImportProps {
  onImportComplete: () => void;
}

export function EmployeeImport({ onImportComplete }: EmployeeImportProps) {
  const [isImporting, setIsImporting] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState<ImportProgress | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        const row = jsonData[i] as Record<string, unknown>;
        setImportProgress({ current: i + 1, total: totalRows });

        try {
          const fullName = String(row['ФИО'] || row['Full Name'] || row['Имя'] || '').trim();
          const email = String(row['Email'] || row['Электронная почта'] || '').trim().toLowerCase();
          const department = String(row['Отдел'] || row['Department'] || '').trim();
          const position = String(row['Должность'] || row['Position'] || '').trim();
          const phone = row['Телефон'] || row['Phone'] ? String(row['Телефон'] || row['Phone']).trim() : undefined;
          
          let role: 'employee' | 'teacher' | 'admin' = 'employee';
          const roleValue = String(row['Роль'] || row['Role'] || '').trim().toLowerCase();
          if (roleValue === 'admin' || roleValue === 'администратор') role = 'admin';
          else if (roleValue === 'teacher' || roleValue === 'преподаватель') role = 'teacher';

          let hireDate: string | undefined;
          if (row['Дата найма'] || row['Hire Date']) {
            const dateValue = row['Дата найма'] || row['Hire Date'];
            if (typeof dateValue === 'number') {
              const date = XLSX.SSF.parse_date_code(dateValue);
              hireDate = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
            } else {
              const parsedDate = new Date(String(dateValue));
              if (!isNaN(parsedDate.getTime())) {
                hireDate = parsedDate.toISOString().split('T')[0];
              }
            }
          }

          if (!fullName || !email || !department || !position) {
            errors.push(`Строка ${i + 2}: отсутствуют обязательные поля (ФИО, Email, Отдел, Должность)`);
            errorCount++;
            continue;
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            errors.push(`Строка ${i + 2}: некорректный email: ${email}`);
            errorCount++;
            continue;
          }

          const newEmployee = await databaseService.addEmployee({
            full_name: fullName,
            email,
            phone,
            department,
            position,
            role,
            hire_date: hireDate,
            is_active: true
          });

          if (newEmployee) {
            successCount++;
          } else {
            errors.push(`Строка ${i + 2}: не удалось добавить сотрудника`);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error importing row ${i + 2}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
          errors.push(`Строка ${i + 2}: ${errorMessage}`);
          errorCount++;
        }
      }

      const resultMessage = `Импорт завершён. Успешно: ${successCount}, Ошибок: ${errorCount}`;
      
      if (errorCount > 0) {
        console.warn('Import errors:', errors);
        toast.warning(resultMessage, {
          description: errors.slice(0, 3).join('\n') + (errors.length > 3 ? '\n...' : '')
        });
      } else {
        toast.success(resultMessage);
      }

      onImportComplete();
    } catch (error) {
      console.error('File import error:', error);
      toast.error('Ошибка при импорте файла');
    } finally {
      setIsImporting(false);
      setImportProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileImport}
        style={{ display: 'none' }}
      />
      
      {isImporting && importProgress && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Upload" className="animate-pulse" size={20} />
              Импорт данных
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Обработано {importProgress.current} из {importProgress.total} записей
              </p>
              <Progress 
                value={(importProgress.current / importProgress.total) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export { handleImportClick as triggerImport };
