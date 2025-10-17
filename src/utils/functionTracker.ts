const TRACK_FUNCTION_URL = 'https://functions.poehali.dev/9af65be8-de12-472e-910f-fd63b3516ed9';

export const trackFunctionCall = async () => {
  try {
    await fetch(TRACK_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('[FunctionTracker] Failed to track function call:', error);
  }
};

export const createTrackedFetch = (originalFetch: typeof fetch) => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    if (url.includes('functions.poehali.dev') && !url.includes('track-function-call')) {
      trackFunctionCall();
    }
    
    return originalFetch(input, init);
  };
};
