import { API_CONFIG } from '@/config/apiConfig';

const EXTERNAL_DB_URL = API_CONFIG.EXTERNAL_DB;

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
      const schema = options.schema || 't_p47619579_knowledge_management';
      const limit = options.limit || 100;
      const offset = options.offset || 0;
      console.log('Calling external DB list:', EXTERNAL_DB_URL, 'table:', table, 'schema:', schema);
      const response = await fetchWithRetry(
        `${EXTERNAL_DB_URL}?action=list&table=${table}&schema=${schema}&limit=${limit}&offset=${offset}`, 
        {
          method: 'GET',
          headers: { 
            'Accept': 'application/json'
          },
          mode: 'cors',
          credentials: 'omit'
        }
      );

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
  async stats(schema = 't_p47619579_knowledge_management'): Promise<{
    tables: any[];
    totalTables: number;
    totalRecords: number;
  }> {
    try {
      console.log('Calling external DB stats:', EXTERNAL_DB_URL, 'schema:', schema);
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}?action=stats&schema=${schema}`, {
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
   * Create a new record in table
   */
  async create(table: string, data: any, schema = 't_p47619579_knowledge_management'): Promise<any> {
    try {
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data).map(v => 
        v === null ? 'NULL' : 
        typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : 
        typeof v === 'object' ? `'${JSON.stringify(v).replace(/'/g, "''")}'` :
        v
      ).join(', ');
      
      const query = `INSERT INTO ${schema}.${table} (${columns}) VALUES (${values}) RETURNING *`;
      const result = await this.query(query);
      return result[0] || null;
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  },

  /**
   * Update a record in table
   */
  async update(table: string, id: number, data: any, schema = 't_p47619579_knowledge_management'): Promise<any> {
    try {
      const sets = Object.entries(data).map(([key, value]) => {
        const val = value === null ? 'NULL' : 
          typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : 
          typeof value === 'object' ? `'${JSON.stringify(value).replace(/'/g, "''")}'` :
          value;
        return `${key} = ${val}`;
      }).join(', ');
      
      const query = `UPDATE ${schema}.${table} SET ${sets} WHERE id = ${id} RETURNING *`;
      const result = await this.query(query);
      return result[0] || null;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  },

  /**
   * Delete a record from table
   */
  async delete(table: string, id: number, schema = 't_p47619579_knowledge_management'): Promise<boolean> {
    try {
      const query = `DELETE FROM ${schema}.${table} WHERE id = ${id}`;
      await this.query(query);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
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
    const escapedSubsection = subsection.replace(/'/g, "''");
    const escapedContent = content.replace(/'/g, "''");
    
    await this.query(
      `INSERT INTO t_p47619579_knowledge_management.subsection_content (subsection_key, content) 
       VALUES ('${escapedSubsection}', '${escapedContent}')
       ON CONFLICT (subsection_key) 
       DO UPDATE SET content = '${escapedContent}', updated_at = NOW()`
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
  },

  /**
   * Get database request statistics
   */
  async getDbRequestStats(): Promise<{
    current_month: { month_year: string; request_count: number; updated_at?: string } | null;
    previous_month: { month_year: string; request_count: number; updated_at?: string } | null;
  }> {
    try {
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}?action=stats`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Stats failed: ${response.status}`);
      }

      const data: any = await response.json();
      return data || { current_month: null, previous_month: null };
    } catch (error) {
      console.error('DB Request Stats error:', error);
      return { current_month: null, previous_month: null };
    }
  },

  /**
   * Add new employee
   */
  async addEmployee(employee: any): Promise<boolean> {
    try {
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}?action=create&table=employees`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(employee),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Add employee failed: ${response.status}`);
      }

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error('Add employee error:', error);
      return false;
    }
  },

  /**
   * Create new employee (wrapper for addEmployee with proper return type)
   */
  async createEmployee(employeeData: {
    full_name: string;
    email: string;
    phone?: string;
    department: string;
    position: string;
    role?: 'admin' | 'teacher' | 'employee';
    hire_date?: string;
    zoom_link?: string;
  }): Promise<any> {
    try {
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          table: 'employees',
          schema: 't_p47619579_knowledge_management',
          data: {
            full_name: employeeData.full_name,
            email: employeeData.email,
            phone: employeeData.phone || null,
            department: employeeData.department,
            position: employeeData.position,
            role: employeeData.role || 'employee',
            hire_date: employeeData.hire_date || null,
            zoom_link: employeeData.zoom_link || null,
            is_active: true
          }
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create employee failed:', response.status, errorText);
        throw new Error(`Create employee failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Employee created:', result);
      return result.data || result;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  },

  /**
   * Update employee
   */
  async updateEmployee(id: number, updates: any): Promise<any> {
    try {
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'update',
          table: 'employees',
          schema: 't_p47619579_knowledge_management',
          id: id,
          data: updates
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update employee failed:', response.status, errorText);
        throw new Error(`Update employee failed: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Update employee error:', error);
      throw error;
    }
  },

  /**
   * Delete employee (soft delete - deactivate)
   */
  async deleteEmployee(id: number): Promise<boolean> {
    try {
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          table: 'employees',
          schema: 't_p47619579_knowledge_management',
          id: id,
          permanent: false
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete employee failed:', response.status, errorText);
        throw new Error(`Delete employee failed: ${response.status}`);
      }

      const data = await response.json();
      return data.deleted === true || !data.error;
    } catch (error) {
      console.error('Delete employee error:', error);
      return false;
    }
  },

  /**
   * Permanently delete employee (hard delete with cascade)
   */
  async permanentDeleteEmployee(id: number, cascade: boolean = true): Promise<boolean> {
    try {
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          table: 'employees',
          schema: 't_p47619579_knowledge_management',
          id: id,
          permanent: true,
          cascade: cascade
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Permanent delete employee failed:', response.status, errorText);
        throw new Error(`Permanent delete employee failed: ${response.status}`);
      }

      const data = await response.json();
      return data.deleted === true || !data.error;
    } catch (error) {
      console.error('Permanent delete employee error:', error);
      return false;
    }
  },

  /**
   * Update employee password
   */
  async updateEmployeePassword(id: number, password: string): Promise<boolean> {
    try {
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}?action=update&table=employees&id=${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ password }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Update password failed: ${response.status}`);
      }

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  },

  /**
   * Get tests with questions and answers
   */
  async getTests(): Promise<any[]> {
    try {
      const rows = await this.query(`
        SELECT 
          t.id, t.title, t.description, t.time_limit, 
          t.passing_score, t.is_active, t.created_at,
          t.course_id, t.creator_id, t.max_attempts, t.updated_at,
          json_agg(
            json_build_object(
              'id', tq.id,
              'test_id', tq.test_id,
              'question_text', tq.question_text,
              'question_type', tq.question_type,
              'points', tq.points,
              'order_num', tq.order_num,
              'created_at', tq.created_at,
              'answers', (
                SELECT json_agg(
                  json_build_object(
                    'id', ta.id,
                    'question_id', ta.question_id,
                    'answer_text', ta.answer_text,
                    'is_correct', ta.is_correct,
                    'order_num', ta.order_num,
                    'created_at', ta.created_at
                  ) ORDER BY ta.order_num
                )
                FROM t_p47619579_knowledge_management.test_answers ta
                WHERE ta.question_id = tq.id
              )
            ) ORDER BY tq.order_num
          ) FILTER (WHERE tq.id IS NOT NULL) as questions
        FROM t_p47619579_knowledge_management.tests t
        LEFT JOIN t_p47619579_knowledge_management.test_questions tq ON t.id = tq.test_id
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `);
      return rows || [];
    } catch (error) {
      console.error('Error loading tests:', error);
      return [];
    }
  },

  /**
   * Create new test with questions
   */
  async createTest(testData: any): Promise<any> {
    try {
      const testResponse = await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          table: 'tests',
          schema: 't_p47619579_knowledge_management',
          data: {
            title: testData.title,
            description: testData.description,
            time_limit: testData.timeLimit,
            passing_score: testData.passing_score || 70,
            is_active: true
          }
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!testResponse.ok) {
        throw new Error(`Create test failed: ${testResponse.status}`);
      }

      const testResult = await testResponse.json();
      const testId = testResult.id;

      if (testData.questions && testData.questions.length > 0) {
        for (let i = 0; i < testData.questions.length; i++) {
          const question = testData.questions[i];
          
          const questionResponse = await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              action: 'create',
              table: 'test_questions',
              schema: 't_p47619579_knowledge_management',
              data: {
                test_id: testId,
                question_text: question.question,
                question_type: 'single_choice',
                points: 1,
                order_num: i + 1
              }
            }),
            mode: 'cors',
            credentials: 'omit'
          });

          if (questionResponse.ok) {
            const questionResult = await questionResponse.json();
            const questionId = questionResult.id;

            if (question.options && Array.isArray(question.options)) {
              for (let j = 0; j < question.options.length; j++) {
                await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({
                    action: 'create',
                    table: 'test_answers',
                    schema: 't_p47619579_knowledge_management',
                    data: {
                      question_id: questionId,
                      answer_text: question.options[j],
                      is_correct: j === question.correctAnswer,
                      order_num: j + 1
                    }
                  }),
                  mode: 'cors',
                  credentials: 'omit'
                });
              }
            }
          }
        }
      }

      return await this.getTests();
    } catch (error) {
      console.error('Create test error:', error);
      throw error;
    }
  },

  /**
   * Update test
   */
  async updateTest(testId: number, testData: any): Promise<boolean> {
    try {
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'update',
          table: 'tests',
          schema: 't_p47619579_knowledge_management',
          id: testId,
          data: {
            title: testData.title,
            description: testData.description,
            time_limit: testData.timeLimit,
            passing_score: testData.passing_score || 70,
            is_active: testData.is_active
          }
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Update test failed: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Update test error:', error);
      return false;
    }
  },

  /**
   * Delete test (cascades to questions and answers)
   */
  async deleteTest(testId: number): Promise<boolean> {
    try {
      const response = await fetchWithRetry(`${EXTERNAL_DB_URL}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'delete',
          table: 'tests',
          schema: 't_p47619579_knowledge_management',
          id: testId
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`Delete test failed: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Delete test error:', error);
      return false;
    }
  }
};