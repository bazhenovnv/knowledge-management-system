import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import funcUrls from '../../backend/func2url.json';

interface DataContextType {
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  stats: any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState<any>(null);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const BACKEND_URL = funcUrls['database'] || 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558';
      
      // Проверяем доступность бэкенда
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const testResultsResponse = await fetch(
        `${BACKEND_URL}?action=list&table=test_results`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (!testResultsResponse.ok) {
        throw new Error('Backend unavailable');
      }
      
      const testResultsData = await testResultsResponse.json();
      const testResults = testResultsData.data || [];
      
      const averageScore = testResults.length > 0
        ? Math.round(testResults.reduce((sum: number, result: any) => sum + result.score, 0) / testResults.length)
        : 0;
      
      const employeesResponse = await fetch(
        `${BACKEND_URL}?action=list&table=employees`
      );
      const employeesData = await employeesResponse.json();
      const allEmployees = employeesData.data || [];
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newRegistrations = allEmployees.filter((emp: any) => 
        new Date(emp.created_at) > yesterday
      ).length;
      
      const activeEmployees = allEmployees.filter((emp: any) => emp.is_active).length;
      const inactiveEmployees = allEmployees.length - activeEmployees;
      
      const testsResponse = await fetch(
        `${BACKEND_URL}?action=list&table=tests`
      );
      const testsData = await testsResponse.json();
      const totalTests = testsData.data?.length || 0;
      
      const coursesResponse = await fetch(
        `${BACKEND_URL}?action=list&table=courses`
      );
      const coursesData = await coursesResponse.json();
      const activeCourses = coursesData.data?.filter((c: any) => c.status === 'active').length || 0;

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
      // Работаем в офлайн-режиме без вывода ошибок
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