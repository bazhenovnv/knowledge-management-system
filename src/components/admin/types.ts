export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info' | 'success';
  message: string;
  details?: string;
  source?: string;
  stackTrace?: string;
}
