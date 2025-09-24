import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce хук для оптимизации поиска
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle хук для ограничения частоты вызовов
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Хук для мемоизации тяжелых вычислений
export const useMemoizedData = <T>(
  computeValue: () => T,
  deps: React.DependencyList,
  cacheKey?: string
): T => {
  return useMemo(() => {
    const startTime = performance.now();
    const result = computeValue();
    const endTime = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[useMemoizedData] ${cacheKey || 'Unknown'}: ${endTime - startTime}ms`);
    }
    
    return result;
  }, deps);
};

// Виртуализация списков для больших данных
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
};

// Хук для отслеживания производительности компонента
export const useComponentPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>();
  const renderCount = useRef(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] Render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
      }
    }
  });

  return {
    renderCount: renderCount.current
  };
};

// Хук для ленивой загрузки данных
export const useLazyLoad = <T>(
  loadData: () => Promise<T>,
  deps: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (loadedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadData();
      setData(result);
      loadedRef.current = true;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, deps);

  return {
    data,
    loading,
    error,
    load,
    reload: () => {
      loadedRef.current = false;
      load();
    }
  };
};

// Хук для кеширования данных
export const useCache = <T>(key: string, defaultValue?: T) => {
  const [data, setData] = useState<T | undefined>(() => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setCache = useCallback((value: T) => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(value));
      setData(value);
    } catch (error) {
      console.warn('Failed to cache data:', error);
      setData(value);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(`cache_${key}`);
      setData(defaultValue);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, [key, defaultValue]);

  return {
    data,
    setCache,
    clearCache
  };
};