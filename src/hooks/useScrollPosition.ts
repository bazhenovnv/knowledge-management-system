import { useEffect, useRef, useState } from 'react';

export const useScrollPosition = (key: string, dependency?: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRestoringRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const savedPosition = localStorage.getItem(`scroll_${key}`);
    if (savedPosition && !isRestoringRef.current) {
      isRestoringRef.current = true;
      setIsAnimating(true);
      setShowIndicator(true);

      setTimeout(() => {
        const targetPosition = parseInt(savedPosition, 10);
        const startPosition = element.scrollTop;
        const distance = targetPosition - startPosition;
        const duration = 600;
        let startTime: number | null = null;

        const easeInOutCubic = (t: number): number => {
          return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animation = (currentTime: number) => {
          if (startTime === null) startTime = currentTime;
          const timeElapsed = currentTime - startTime;
          const progress = Math.min(timeElapsed / duration, 1);
          const easedProgress = easeInOutCubic(progress);

          element.scrollTop = startPosition + distance * easedProgress;

          if (progress < 1) {
            requestAnimationFrame(animation);
          } else {
            setIsAnimating(false);
            setTimeout(() => setShowIndicator(false), 300);
            isRestoringRef.current = false;
          }
        };

        requestAnimationFrame(animation);
      }, 150);
    }
  }, [key, dependency]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      if (!isRestoringRef.current && !isAnimating) {
        localStorage.setItem(`scroll_${key}`, element.scrollTop.toString());
      }
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [key, isAnimating]);

  return { scrollRef, showIndicator };
};