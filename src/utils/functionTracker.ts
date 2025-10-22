const TRACK_FUNCTION_URL = 'https://functions.poehali.dev/9af65be8-de12-472e-910f-fd63b3516ed9';

const extractFunctionName = (url: string): string => {
  const match = url.match(/functions\.poehali\.dev\/([a-f0-9-]+)/);
  if (!match) return 'unknown';
  
  const functionId = match[1];
  const functionMap: Record<string, string> = {
    '5ce5a766-35aa-4d9a-9325-babec287d558': 'database',
    '9af65be8-de12-472e-910f-fd63b3516ed9': 'track-function-call',
    '75306ed7-e91c-4135-84fe-8b519f7dcf17': 'email-notifications',
    '592a9eab-8102-4536-b07f-780566a0612b': 'password-reset',
    '1eb49e46-7815-44b0-aca8-7a86adf131b8': 'password-reset-db',
    'af05cfe5-2869-458e-8c1b-998684e530d2': 'auth',
  };
  
  return functionMap[functionId] || functionId;
};

export const trackFunctionCall = async (functionName: string, responseTime: number, isError: boolean = false) => {
  return;
};

export const createTrackedFetch = (originalFetch: typeof fetch) => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    if (url.includes('functions.poehali.dev') && !url.includes('track-function-call')) {
      const functionName = extractFunctionName(url);
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(input, init);
        const responseTime = Math.round(performance.now() - startTime);
        const isError = !response.ok;
        
        trackFunctionCall(functionName, responseTime, isError);
        
        return response;
      } catch (error) {
        const responseTime = Math.round(performance.now() - startTime);
        trackFunctionCall(functionName, responseTime, true);
        throw error;
      }
    }
    
    return originalFetch(input, init);
  };
};