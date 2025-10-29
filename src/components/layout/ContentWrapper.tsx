import { useAppearance } from '@/hooks/useAppearance';
import { ReactNode, useEffect } from 'react';

interface ContentWrapperProps {
  children: ReactNode;
}

export const ContentWrapper = ({ children }: ContentWrapperProps) => {
  const { getContentBackgroundColor } = useAppearance();

  useEffect(() => {
    const contentBgColor = getContentBackgroundColor();
    document.documentElement.style.setProperty('--content-bg-color', contentBgColor);
  }, [getContentBackgroundColor]);

  return <>{children}</>;
};
