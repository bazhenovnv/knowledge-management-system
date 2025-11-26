const API_BASE_URL = 'https://ab-education.ru';

interface ApiResponse<T = any> {
  rows?: T[];
  count?: number;
  data?: T;
  affected?: number;
  error?: string;
}

interface QueryParams {
  action: string;
  table?: string;
  schema?: string;
  query?: string;
  params?: any[];
  data?: any;
  id?: number;
  limit?: number;
  offset?: number;
}

class KnowledgeApi {
  private async request<T = any>(
    method: string,
    params: QueryParams
  ): Promise<ApiResponse<T>> {
    try {
      const url = API_BASE_URL;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'GET') {
        const queryString = new URLSearchParams(
          params as any
        ).toString();
        const response = await fetch(`${url}?${queryString}`, options);
        return await response.json();
      } else {
        options.body = JSON.stringify(params);
        const response = await fetch(url, options);
        return await response.json();
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async list(
    table: string,
    schema: string = 't_p47619579_knowledge_management',
    limit: number = 100,
    offset: number = 0
  ) {
    return this.request('POST', {
      action: 'list',
      table,
      schema,
      limit,
      offset,
    });
  }

  async create(
    table: string,
    data: any,
    schema: string = 't_p47619579_knowledge_management'
  ) {
    return this.request('POST', {
      action: 'create',
      table,
      schema,
      data,
    });
  }

  async update(
    table: string,
    id: number,
    data: any,
    schema: string = 't_p47619579_knowledge_management'
  ) {
    return this.request('PUT', {
      action: 'update',
      table,
      schema,
      id,
      data,
    });
  }

  async delete(
    table: string,
    id: number,
    schema: string = 't_p47619579_knowledge_management'
  ) {
    return this.request('DELETE', {
      action: 'delete',
      table,
      schema,
      id,
    });
  }

  async query(query: string, params: any[] = []) {
    return this.request('POST', {
      action: 'query',
      query,
      params,
    });
  }

  async stats(schema: string = 't_p47619579_knowledge_management') {
    return this.request('POST', {
      action: 'stats',
      schema,
    });
  }

  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const knowledgeApi = new KnowledgeApi();
