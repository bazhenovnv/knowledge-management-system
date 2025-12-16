import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { externalDb } from '@/services/externalDbService';
import { autoRefreshService } from '@/services/autoRefreshService';

interface DataContextType {
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  stats: any;
  autoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState<any>({
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
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const refreshData = useCallback(async (silent = false) => {
    try {
      setIsLoading(true);
      
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
        ? Math.round(testResults.reduce((sum: number, result: any) => sum + result.percentage, 0) / testResults.length)
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
      if (!silent) {
        toast.success('Данные обновлены');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      if (!silent) {
        toast.error('Ошибка загрузки данных из базы');
      }
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

  const toggleAutoRefresh = useCallback(() => {
    if (autoRefreshEnabled) {
      autoRefreshService.stop();
      setAutoRefreshEnabled(false);
      toast.info('Автообновление отключено');
    } else {
      autoRefreshService.start();
      setAutoRefreshEnabled(true);
      toast.info('Автообновление включено');
    }
  }, [autoRefreshEnabled]);

  useEffect(() => {
    // Загружаем данные в фоне без блокировки UI
    const loadData = async () => {
      try {
        await refreshData(true);
      } catch (error) {
        console.error('Initial data load failed:', error);
      }
    };
    
    loadData();
    
    autoRefreshService.subscribe('data-context', () => {
      console.log('🔄 Автообновление данных запущено');
      refreshData(true);
    });
    
    autoRefreshService.start();
    
    return () => {
      autoRefreshService.unsubscribe('data-context');
      autoRefreshService.stop();
    };
  }, [refreshData]);

  return (
    <DataContext.Provider value={{ 
      isLoading, 
      lastUpdated, 
      refreshData, 
      stats, 
      autoRefreshEnabled, 
      toggleAutoRefresh 
    }}>
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