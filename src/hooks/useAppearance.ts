import { useState, useEffect } from 'react';

interface AppearanceSettings {
  backgroundColor: string;
  backgroundImage: string;
  contentBackgroundColor: string;
  useBackgroundImage: boolean;
}

const defaultAppearance: AppearanceSettings = {
  backgroundColor: "#f3f4f6",
  backgroundImage: "",
  contentBackgroundColor: "#ffffff",
  useBackgroundImage: false
};

export const useAppearance = () => {
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance);

  const loadAppearance = () => {
    const saved = localStorage.getItem('appAppearanceSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAppearance(parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse appearance settings', e);
      }
    }
    return defaultAppearance;
  };

  useEffect(() => {
    loadAppearance();

    const handleAppearanceChange = () => {
      loadAppearance();
    };

    window.addEventListener('appearanceChanged', handleAppearanceChange);
    return () => {
      window.removeEventListener('appearanceChanged', handleAppearanceChange);
    };
  }, []);

  const getBackgroundStyle = () => {
    if (appearance.useBackgroundImage && appearance.backgroundImage) {
      return {
        backgroundImage: `url(${appearance.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      };
    }
    return {
      backgroundColor: appearance.backgroundColor
    };
  };

  const getContentBackgroundColor = () => {
    return appearance.contentBackgroundColor;
  };

  return {
    appearance,
    getBackgroundStyle,
    getContentBackgroundColor
  };
};
