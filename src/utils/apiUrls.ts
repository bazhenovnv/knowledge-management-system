// Centralized API URLs configuration
import funcUrls from '../../backend/func2url.json';

export const API_URLS = {
  DATABASE_INFO: funcUrls['database-info'] || 'https://functions.poehali.dev/459a10f2-9dff-481a-af79-dcf6ca5cb628',
  DATABASE_QUERY: funcUrls['db-query'] || 'https://functions.poehali.dev/d2daf71d-ad1e-4d8c-8fa3-7e5412c6727d',
  DATABASE_MIGRATE: funcUrls['db-migrate'] || 'https://functions.poehali.dev/952351fb-9c3a-41c4-829d-53e0e293f957'
};

export default API_URLS;