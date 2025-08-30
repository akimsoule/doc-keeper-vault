import { useEffect, useState } from 'react';

export type Theme = 'doc-keeper' | 'doc-keeper-dark' | 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'doc-keeper';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(current => {
      switch (current) {
        case 'doc-keeper':
          return 'doc-keeper-dark';
        case 'doc-keeper-dark':
          return 'doc-keeper';
        case 'light':
          return 'dark';
        case 'dark':
          return 'light';
        default:
          return 'doc-keeper';
      }
    });
  };

  return { theme, setTheme, toggleTheme };
};
