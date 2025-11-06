// API URL - используем облачную функцию poehali.dev
const EXTERNAL_DB_URL = import.meta.env.VITE_API_URL || 'https://functions.poehali.dev/5ce5a766-35aa-4d9a-9325-babec287d558';

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
      console.log('Calling external DB query:', EXTERNAL_DB_URL);
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}?action=query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'query',
          query: sql
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

      const data: any = await response.json();
      console.log('Query response:', data);
      return data.data || data.rows || data || [];
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
      console.log('Calling external DB list:', EXTERNAL_DB_URL, 'table:', table);
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}?action=list&table=${table}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
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

      const data: any = await response.json();
      console.log('List response for table', table, ':', data);
      return data.data || data.rows || data || [];
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
      console.log('Calling external DB stats:', EXTERNAL_DB_URL);
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}?action=stats`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
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

      const data: any = await response.json();
      console.log('Stats response:', data);
      return data.stats || data || { tables: [], totalTables: 0, totalRecords: 0 };
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
    const employees = await this.list('employees');
    return employees.find((emp: any) => emp.id === id) || null;
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
    const notifications = await this.list('notifications', { limit: 100 });
    if (employeeId) {
      return notifications.filter((n: any) => n.employee_id === employeeId)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return notifications;
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