import { useEffect, useRef } from 'react';

export const useScrollPosition = (key: string, dependency?: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const savedPosition = localStorage.getItem(`scroll_${key}`);
    if (savedPosition && !isRestoringRef.current) {
      isRestoringRef.current = true;
      setTimeout(() => {
        element.scrollTop = parseInt(savedPosition, 10);
        isRestoringRef.current = false;
      }, 100);
    }
  }, [key, dependency]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      if (!isRestoringRef.current) {
        localStorage.setItem(`scroll_${key}`, element.scrollTop.toString());
      }
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [key]);

  return scrollRef;
};
