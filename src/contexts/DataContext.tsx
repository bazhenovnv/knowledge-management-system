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
      
      // Получаем данные из БД TimeWeb Cloud
      const allEmployees = await externalDb.getEmployees();
      const tests = await externalDb.list('tests');
      const courses = await externalDb.list('courses');
      
      let testResults = [];
      try {
        testResults = await externalDb.getTestResults();
      } catch (err) {
        console.log('Could not load test_results, using empty array');
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
      toast.error('Ошибка загрузки данных из базы');
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