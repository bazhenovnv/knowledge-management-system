import funcUrls from '../../backend/func2url.json';

const EXTERNAL_DB_URL = funcUrls['external-db-proxy'];

interface QueryRequest {
  action: 'query' | 'list' | 'stats';
  query?: string;
  params?: any[];
  table?: string;
  schema?: string;
  limit?: number;
  offset?: number;
}

interface QueryResponse {
  rows?: any[];
  count?: number;
  affected?: number;
  tables?: any[];
  totalTables?: number;
  totalRecords?: number;
}

export const externalDb = {
  /**
   * Execute custom SQL query
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    const response = await fetch(EXTERNAL_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'query',
        query: sql,
        params
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Query failed');
    }

    const data: QueryResponse = await response.json();
    return data.rows || [];
  },

  /**
   * List data from table
   */
  async list(table: string, options: { limit?: number; offset?: number; schema?: string } = {}): Promise<any[]> {
    const response = await fetch(EXTERNAL_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'list',
        table,
        schema: options.schema || 'public',
        limit: options.limit || 100,
        offset: options.offset || 0
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'List failed');
    }

    const data: QueryResponse = await response.json();
    return data.rows || [];
  },

  /**
   * Get database statistics
   */
  async stats(schema = 'public'): Promise<{
    tables: any[];
    totalTables: number;
    totalRecords: number;
  }> {
    const response = await fetch(EXTERNAL_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'stats',
        schema
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Stats failed');
    }

    return await response.json();
  },

  /**
   * Get employees list
   */
  async getEmployees(): Promise<any[]> {
    return await this.list('employees', { limit: 1000 });
  },

  /**
   * Get employee by ID
   */
  async getEmployee(id: number): Promise<any> {
    const rows = await this.query(
      'SELECT * FROM public.employees WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Get test results
   */
  async getTestResults(): Promise<any[]> {
    return await this.list('test_results', { limit: 1000 });
  },

  /**
   * Get knowledge materials
   */
  async getMaterials(): Promise<any[]> {
    return await this.list('knowledge_materials', { limit: 1000 });
  },

  /**
   * Get notifications
   */
  async getNotifications(employeeId?: number): Promise<any[]> {
    if (employeeId) {
      return await this.query(
        'SELECT * FROM public.notifications WHERE employee_id = $1 ORDER BY created_at DESC',
        [employeeId]
      );
    }
    return await this.list('notifications', { limit: 100 });
  }
};