// API endpoints are proxied through nginx to your own database
const API_BASE = '/api';

export const API_CONFIG = {
  AUTH_API: `${API_BASE}/auth`,
  DATABASE_INFO: `${API_BASE}/database-info`,
  DATABASE_QUERY: `${API_BASE}/database-query`,
  DATABASE_MIGRATE: `${API_BASE}/database-migrate`,
  EXTERNAL_DB: `${API_BASE}/external-db`,
  LEGACY_DATABASE: `${API_BASE}/external-db`,
  FUNCTION_TRACKER: `${API_BASE}/track-function-call`,
  EMAIL_API: `${API_BASE}/email-notifications`,
  PASSWORD_RESET: `${API_BASE}/password-reset`,
} as const;

console.log('[API_CONFIG] EXTERNAL_DB:', API_CONFIG.EXTERNAL_DB);