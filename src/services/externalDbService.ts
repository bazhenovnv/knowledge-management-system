import funcUrls from '../../backend/func2url.json';

// Используем local-db-proxy для работы со встроенной БД проекта (без лимитов)
const EXTERNAL_DB_URL = funcUrls['local-db-proxy'];

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
    try {
      console.log('Calling external DB:', EXTERNAL_DB_URL);
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
        const errorText = await response.text();
        console.error('Query failed:', response.status, errorText);
        throw new Error(`Query failed: ${response.status}`);
      }

      const data: QueryResponse = await response.json();
      return data.rows || [];
    } catch (error) {
      console.error('Fetch error:', error instanceof Error ? error.message : 'Unknown error', 'for', EXTERNAL_DB_URL);
      throw error;
    }
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
        schema: options.schema || 't_p47619579_knowledge_management',
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
  async stats(schema = 't_p47619579_knowledge_management'): Promise<{
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
      'SELECT * FROM t_p47619579_knowledge_management.employees WHERE id = $1',
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
        'SELECT * FROM t_p47619579_knowledge_management.notifications WHERE employee_id = $1 ORDER BY created_at DESC',
        [employeeId]
      );
    }
    return await this.list('notifications', { limit: 100 });
  },

  /**
   * Get knowledge materials (alias for getMaterials)
   */
  async getKnowledgeMaterials(): Promise<any[]> {
    return await this.getMaterials();
  },

  /**
   * Get subsection content
   */
  async getSubsectionContent(): Promise<Record<string, string>> {
    try {
      const rows = await this.query(
        'SELECT subsection_key, content FROM t_p47619579_knowledge_management.subsection_content'
      );
      const result: Record<string, string> = {};
      rows.forEach((row: any) => {
        result[row.subsection_key] = row.content;
      });
      return result;
    } catch (error) {
      console.error('Error loading subsection content:', error);
      return {};
    }
  },

  /**
   * Save subsection content
   */
  async saveSubsectionContent(subsection: string, content: string): Promise<void> {
    await this.query(
      `INSERT INTO t_p47619579_knowledge_management.subsection_content (subsection_key, content) 
       VALUES ('${subsection}', '${content}')
       ON CONFLICT (subsection_key) 
       DO UPDATE SET content = '${content}', updated_at = NOW()`
    );
  },

  /**
   * Get instructions
   */
  async getInstructions(): Promise<any[]> {
    return await this.list('instructions', { limit: 1000 });
  },

  /**
   * Get instruction categories
   */
  async getInstructionCategories(): Promise<any[]> {
    return await this.list('instruction_categories', { limit: 100 });
  }
};