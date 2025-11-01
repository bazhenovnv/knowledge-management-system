// Прямая работа со встроенной PostgreSQL БД проекта
// Используется вместо облачных функций чтобы избежать лимитов

export const localDb = {
  /**
   * Get all employees
   */
  async getEmployees(): Promise<any[]> {
    const response = await fetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT * FROM public.employees ORDER BY id'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    
    const data = await response.json();
    return data.rows || [];
  },

  /**
   * Get test results
   */
  async getTestResults(): Promise<any[]> {
    const response = await fetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT * FROM public.test_results ORDER BY created_at DESC'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch test results');
    }
    
    const data = await response.json();
    return data.rows || [];
  },

  /**
   * Get knowledge materials
   */
  async getMaterials(): Promise<any[]> {
    const response = await fetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT * FROM public.knowledge_materials ORDER BY created_at DESC'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }
    
    const data = await response.json();
    return data.rows || [];
  },

  /**
   * Get tests
   */
  async getTests(): Promise<any[]> {
    const response = await fetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT * FROM public.tests ORDER BY created_at DESC'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tests');
    }
    
    const data = await response.json();
    return data.rows || [];
  },

  /**
   * Get courses
   */
  async getCourses(): Promise<any[]> {
    const response = await fetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT * FROM public.courses ORDER BY created_at DESC'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    
    const data = await response.json();
    return data.rows || [];
  },

  /**
   * Get database statistics
   */
  async getStats(): Promise<any> {
    const response = await fetch('/api/db/stats', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    
    return await response.json();
  }
};
