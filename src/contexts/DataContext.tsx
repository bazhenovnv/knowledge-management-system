import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { externalDb } from '@/services/externalDbService';

interface DataContextType {
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  stats: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState<any>(null);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Получаем данные из внешней БД TimeWeb Cloud
      let testResults: any[] = [];
      let allEmployees: any[] = [];
      let tests: any[] = [];
      let courses: any[] = [];
      
      try {
        testResults = await externalDb.getTestResults();
        allEmployees = await externalDb.getEmployees();
        tests = await externalDb.list('tests');
        courses = await externalDb.list('courses');
      } catch (dbError) {
        console.warn('Database connection failed, using demo data:', dbError);
        
        // Demo данные при недоступности БД
        allEmployees = [
          { id: 1, name: 'Иванов Иван', position: 'Менеджер', is_active: true, created_at: new Date().toISOString() },
          { id: 2, name: 'Петрова Мария', position: 'Специалист', is_active: true, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, name: 'Сидоров Петр', position: 'Директор', is_active: false, created_at: new Date(Date.now() - 172800000).toISOString() }
        ];
        
        testResults = [
          { id: 1, employee_id: 1, score: 85, test_id: 1, created_at: new Date().toISOString() },
          { id: 2, employee_id: 2, score: 92, test_id: 1, created_at: new Date().toISOString() },
          { id: 3, employee_id: 1, score: 78, test_id: 2, created_at: new Date().toISOString() }
        ];
        
        tests = [
          { id: 1, title: 'Базовый тест', status: 'active' },
          { id: 2, title: 'Продвинутый тест', status: 'active' }
        ];
        
        courses = [
          { id: 1, title: 'Курс 1', status: 'active' },
          { id: 2, title: 'Курс 2', status: 'active' }
        ];
      }
      
      const averageScore = testResults.length > 0
        ? Math.round(testResults.reduce((sum: number, result: any) => sum + result.score, 0) / testResults.length)
        : 0;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newRegistrations = allEmployees.filter((emp: any) => 
        new Date(emp.created_at) > yesterday
      ).length;
      
      const activeEmployees = allEmployees.filter((emp: any) => emp.is_active).length;
      const inactiveEmployees = allEmployees.length - activeEmployees;
      
      const totalTests = tests.length;
      const activeCourses = courses.filter((c: any) => c.status === 'active').length;

      setStats({
        totalEmployees: allEmployees.length,
        activeEmployees,
        inactiveEmployees,
        totalTests,
        totalTestResults: testResults.length,
        averageScore,
        activeCourses,
        newRegistrations,
        employees: allEmployees,
        testResults
      });
      
      setLastUpdated(new Date());
      toast.success('Данные обновлены');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setStats({
        totalEmployees: 0,
        activeEmployees: 0,
        inactiveEmployees: 0,
        totalTests: 0,
        totalTestResults: 0,
        averageScore: 0,
        activeCourses: 0,
        newRegistrations: 0,
        employees: [],
        testResults: []
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <DataContext.Provider value={{ isLoading, lastUpdated, refreshData, stats }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}