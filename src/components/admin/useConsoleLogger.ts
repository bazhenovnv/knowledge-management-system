import { useEffect } from 'react';
import { LogEntry } from './types';

export const useConsoleLogger = (
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>
) => {
  useEffect(() => {
    const savedLogs = localStorage.getItem('admin-console-logs');
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        setLogs(parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        })));
      } catch (e) {
        console.warn('Failed to load saved logs');
      }
    }
    
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    const addLog = (level: LogEntry['level'], message: string, details?: any) => {
      let detailsText = '';
      
      if (details) {
        try {
          if (Array.isArray(details) && details.length > 0) {
            detailsText = details.map(d => {
              if (d instanceof Error) {
                return `${d.name}: ${d.message}\n${d.stack}`;
              }
              return typeof d === 'object' ? JSON.stringify(d, null, 2) : String(d);
            }).join('\n\n');
          } else if (details instanceof Error) {
            detailsText = `${details.name}: ${details.message}\n${details.stack}`;
          } else if (typeof details === 'object') {
            detailsText = JSON.stringify(details, null, 2);
          } else {
            detailsText = String(details);
          }
        } catch (e) {
          detailsText = String(details);
        }
      }
      
      const logEntry: LogEntry = {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date(),
        level,
        message: String(message),
        details: detailsText || undefined,
        source: 'Browser Console',
        stackTrace: new Error().stack,
      };
      
      setLogs(prev => {
        const updatedLogs = [logEntry, ...prev].slice(0, 500);
        localStorage.setItem('admin-console-logs', JSON.stringify(updatedLogs));
        return updatedLogs;
      });
    };

    console.error = (...args) => {
      addLog('error', args[0], args.slice(1));
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warning', args[0], args.slice(1));
      originalConsoleWarn.apply(console, args);
    };

    console.log = (...args) => {
      if (args[0]?.includes?.('✓') || args[0]?.includes?.('success')) {
        addLog('success', args[0], args.slice(1));
      } else {
        addLog('info', args[0], args.slice(1));
      }
      originalConsoleLog.apply(console, args);
    };

    window.addEventListener('error', (event) => {
      addLog('error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      addLog('error', 'Unhandled Promise Rejection', event.reason);
    });

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.log = originalConsoleLog;
    };
  }, [setLogs]);
};
