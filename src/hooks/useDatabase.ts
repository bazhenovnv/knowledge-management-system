import { useState, useCallback, useEffect } from 'react';
import { database, Employee, Test, KnowledgeMaterial as Material, TestResult } from '@/utils/database';
import { toast } from 'sonner';

// Хук для управления сотрудниками
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshEmployees = useCallback(() => {
    setEmployees(database.getEmployees());
  }, []);

  useEffect(() => {
    refreshEmployees();
  }, [refreshEmployees]);

  const addEmployee = useCallback(async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newEmployee = database.saveEmployee(employee);
      refreshEmployees();
      toast.success(`Сотрудник ${newEmployee.name} добавлен`);
      return newEmployee;
    } catch (error) {
      toast.error('Ошибка при добавлении сотрудника');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshEmployees]);

  const updateEmployee = useCallback(async (id: number, updates: Partial<Employee>) => {
    setLoading(true);
    try {
      const updatedEmployee = database.updateEmployee(id, updates);
      if (updatedEmployee) {
        refreshEmployees();
        toast.success(`Данные сотрудника обновлены`);
        return updatedEmployee;
      } else {
        toast.error('Сотрудник не найден');
        return null;
      }
    } catch (error) {
      toast.error('Ошибка при обновлении сотрудника');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshEmployees]);

  const deleteEmployee = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const employee = database.getEmployeeById(id);
      const success = database.deleteEmployee(id);
      if (success) {
        refreshEmployees();
        toast.success(`Сотрудник ${employee?.name || ''} удален`);
        return true;
      } else {
        toast.error('Сотрудник не найден');
        return false;
      }
    } catch (error) {
      toast.error('Ошибка при удалении сотрудника');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshEmployees]);

  const getEmployeeById = useCallback((id: number) => {
    return database.getEmployees().find(emp => emp.id === id) || null;
  }, []);

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    refreshEmployees
  };
}

// Хук для управления тестами
export function useTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshTests = useCallback(() => {
    setTests(database.getTests());
  }, []);

  useEffect(() => {
    refreshTests();
  }, [refreshTests]);

  const addTest = useCallback(async (test: Omit<Test, 'createdAt'>) => {
    setLoading(true);
    try {
      const newTest = database.saveTest(test);
      refreshTests();
      toast.success(`Тест "${newTest.title}" создан`);
      return newTest;
    } catch (error) {
      toast.error('Ошибка при создании теста');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshTests]);

  const updateTest = useCallback(async (id: string, updates: Partial<Test>) => {
    setLoading(true);
    try {
      const updatedTest = database.updateTest(id, updates);
      if (updatedTest) {
        refreshTests();
        toast.success(`Тест "${updatedTest.title}" обновлен`);
        return updatedTest;
      } else {
        toast.error('Тест не найден');
        return null;
      }
    } catch (error) {
      toast.error('Ошибка при обновлении теста');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshTests]);

  const deleteTest = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const test = database.getTestById(id);
      const success = database.deleteTest(id);
      if (success) {
        refreshTests();
        toast.success(`Тест "${test?.title || ''}" удален`);
        return true;
      } else {
        toast.error('Тест не найден');
        return false;
      }
    } catch (error) {
      toast.error('Ошибка при удалении теста');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshTests]);

  const getTestById = useCallback((id: string) => {
    return database.getTests().find(test => test.id === id) || null;
  }, []);

  return {
    tests,
    loading,
    addTest,
    updateTest,
    deleteTest,
    getTestById,
    refreshTests
  };
}

// Хук для управления материалами
export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshMaterials = useCallback(() => {
    setMaterials(database.getKnowledgeMaterials());
  }, []);

  useEffect(() => {
    refreshMaterials();
  }, [refreshMaterials]);

  const addMaterial = useCallback(async (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    try {
      const newMaterial = database.saveKnowledgeMaterial(material);
      refreshMaterials();
      toast.success(`Материал "${newMaterial.title}" добавлен`);
      return newMaterial;
    } catch (error) {
      toast.error('Ошибка при добавлении материала');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshMaterials]);

  const updateMaterial = useCallback(async (id: string, updates: Partial<Material>) => {
    setLoading(true);
    try {
      const updatedMaterial = database.updateKnowledgeMaterial(id, updates);
      if (updatedMaterial) {
        refreshMaterials();
        toast.success(`Материал "${updatedMaterial.title}" обновлен`);
        return updatedMaterial;
      } else {
        toast.error('Материал не найден');
        return null;
      }
    } catch (error) {
      toast.error('Ошибка при обновлении материала');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshMaterials]);

  const deleteMaterial = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const material = database.getKnowledgeMaterials().find(m => m.id === id);
      const success = database.deleteKnowledgeMaterial(id);
      if (success) {
        refreshMaterials();
        toast.success(`Материал "${material?.title || ''}" удален`);
        return true;
      } else {
        toast.error('Материал не найден');
        return false;
      }
    } catch (error) {
      toast.error('Ошибка при удалении материала');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshMaterials]);

  const getMaterialById = useCallback((id: string) => {
    return database.getKnowledgeMaterials().find(m => m.id === id) || null;
  }, []);

  return {
    materials,
    loading,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialById,
    refreshMaterials
  };
}

// Хук для управления результатами тестов
export function useTestResults() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshTestResults = useCallback(() => {
    setTestResults(database.getTestResults());
  }, []);

  useEffect(() => {
    refreshTestResults();
  }, [refreshTestResults]);

  const addTestResult = useCallback(async (result: Omit<TestResult, 'id'>) => {
    setLoading(true);
    try {
      const newResult = database.saveTestResult(result);
      refreshTestResults();
      toast.success(`Результат теста сохранен: ${newResult.score}%`);
      return newResult;
    } catch (error) {
      toast.error('Ошибка при сохранении результата');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshTestResults]);

  const getTestResultsByEmployee = useCallback((employeeId: number) => {
    return database.getTestResultsByUser(employeeId.toString());
  }, []);

  const getTestResultsByTest = useCallback((testId: string) => {
    return database.getTestResultsByTestId(testId);
  }, []);

  return {
    testResults,
    loading,
    addTestResult,
    getTestResultsByEmployee,
    getTestResultsByTest,
    refreshTestResults
  };
}

// Общий хук для всей системы
export function useAppData() {
  const employees = useEmployees();
  const tests = useTests();
  const materials = useMaterials();
  const testResults = useTestResults();

  const refresh = useCallback(() => {
    employees.refreshEmployees();
    tests.refreshTests();
    materials.refreshMaterials();
    testResults.refreshTestResults();
  }, [employees, tests, materials, testResults]);

  return {
    employees,
    tests,
    materials,
    testResults,
    refresh
  };
}