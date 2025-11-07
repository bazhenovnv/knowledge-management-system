import funcUrls from '../../../backend/func2url.json';
import { toast } from "sonner";

export const handleExportTestResults = async () => {
  try {
    const BACKEND_URL = funcUrls['local-db-proxy'] || funcUrls['database'];
    const response = await fetch(
      `${BACKEND_URL}?action=list&table=test_results`
    );
    const data = await response.json();
    const testResults = data.data || [];
    
    const testsResponse = await fetch(
      `${BACKEND_URL}?action=list&table=tests`
    );
    const testsData = await testsResponse.json();
    const tests = testsData.data || [];
    
    const employeesResponse = await fetch(
      `${BACKEND_URL}?action=list&table=employees`
    );
    const employeesData = await employeesResponse.json();
    const allEmployees = employeesData.data || [];
    
    const enrichedResults = testResults.map((result: any) => {
      const test = tests.find((t: any) => t.id === result.test_id);
      const employee = allEmployees.find((e: any) => e.id === result.employee_id);
      return {
        id: result.id,
        student_name: employee?.name || 'Неизвестный',
        student_email: employee?.email || '',
        test_title: test?.title || 'Неизвестный тест',
        score: result.score,
        completed_at: result.completed_at,
        time_spent: result.time_spent || 0
      };
    });
    
    const jsonStr = JSON.stringify(enrichedResults, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Результаты тестов экспортированы');
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Ошибка экспорта результатов тестов');
  }
};

export const handleExportStudents = async () => {
  try {
    const BACKEND_URL = funcUrls['local-db-proxy'] || funcUrls['database'];
    const response = await fetch(
      `${BACKEND_URL}?action=list&table=employees`
    );
    const data = await response.json();
    const allEmployees = data.data || [];
    
    const students = allEmployees.filter((emp: any) => emp.role === 'employee');
    
    const jsonStr = JSON.stringify(students, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Список студентов экспортирован');
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Ошибка экспорта студентов');
  }
};

export const handleImportStudents = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importedStudents = JSON.parse(text);
      
      if (!Array.isArray(importedStudents)) {
        toast.error('Неверный формат файла');
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const student of importedStudents) {
        try {
          const BACKEND_URL = funcUrls['local-db-proxy'] || funcUrls['database'];
          const checkResponse = await fetch(
            `${BACKEND_URL}?action=list&table=employees`
          );
          const checkData = await checkResponse.json();
          const existingEmployees = checkData.data || [];
          const exists = existingEmployees.some((e: any) => e.email === student.email);
          
          if (exists) {
            console.log(`Пропускаем ${student.email} - уже существует`);
            continue;
          }
          
          const response = await fetch(
            `https://functions.poehali.dev/47d7f4cf-0b15-41dd-a1f4-28bec9d7c957`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'create',
                table: 'employees',
                data: {
                  name: student.name,
                  email: student.email,
                  password_hash: student.password_hash || 'temp123',
                  role: 'employee',
                  department_id: student.department_id || null,
                  position: student.position || '',
                  is_active: student.is_active !== false
                }
              })
            }
          );
          
          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Ошибка импорта ${student.email}:`, error);
          errorCount++;
        }
      }
      
      toast.success(`Импортировано: ${successCount}, Ошибок: ${errorCount}`);
      
      window.location.reload();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Ошибка импорта файла');
    }
  };
  input.click();
};
