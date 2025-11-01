import funcUrls from '../../backend/func2url.json';

// Используем external-db для работы с вашей БД TimeWeb Cloud (без оплаты функций)
const EXTERNAL_DB_URL = funcUrls['external-db'];

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

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Retry ${i + 1}/${retries} after error:`, error);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('All retries failed');
}

export const externalDb = {
  /**
   * Execute custom SQL query
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    try {
      console.log('Calling external DB:', EXTERNAL_DB_URL);
      const response = await fetchWithRetry(EXTERNAL_DB_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'query',
          query: sql,
          params
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Query failed:', response.status, response.statusText, errorText);
        
        if (response.status === 402) {
          throw new Error('Database function requires payment. Please contact support.');
        }
        
        throw new Error(`Query failed: ${response.status} ${response.statusText}`);
      }

      const data: QueryResponse = await response.json();
      return data.rows || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Fetch error:', errorMessage, 'for', EXTERNAL_DB_URL);
      
      if (errorMessage.includes('Failed to fetch')) {
        throw new Error('Cannot connect to database. Please check your internet connection or contact support.');
      }
      
      throw error;
    }
  },

  /**
   * List data from table
   */
  async list(table: string, options: { limit?: number; offset?: number; schema?: string } = {}): Promise<any[]> {
    try {
      const response = await fetchWithRetry(EXTERNAL_DB_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'list',
          table,
          schema: options.schema || 'public',
          limit: options.limit || 100,
          offset: options.offset || 0
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('List failed:', response.status, response.statusText, errorText);
        
        if (response.status === 402) {
          throw new Error('Database function requires payment');
        }
        
        throw new Error(`List failed: ${response.status}`);
      }

      const data: QueryResponse = await response.json();
      return data.rows || [];
    } catch (error) {
      console.error('List error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  },

  /**
   * Get database statistics
   */
  async stats(schema = 'public'): Promise<{
    tables: any[];
    totalTables: number;
    totalRecords: number;
  }> {
    try {
      const response = await fetchWithRetry(EXTERNAL_DB_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'stats',
          schema
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats failed:', response.status, response.statusText, errorText);
        
        if (response.status === 402) {
          throw new Error('Database function requires payment');
        }
        
        throw new Error(`Stats failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Stats error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
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
        'SELECT subsection_key, content FROM public.subsection_content'
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
      `INSERT INTO public.subsection_content (subsection_key, content) 
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