import { API_CONFIG } from '@/config/apiConfig';
import funcUrls from '../../backend/func2url.json';

export const API_URLS = {
  DATABASE_INFO: funcUrls['database-info'] || API_CONFIG.DATABASE_INFO,
  DATABASE_QUERY: funcUrls['db-query'] || API_CONFIG.DATABASE_QUERY,
  DATABASE_MIGRATE: funcUrls['db-migrate'] || API_CONFIG.DATABASE_MIGRATE
};

export default API_URLS;