import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: Theme) => {
      root.classList.remove('dark', 'light');
      if (t === 'system') {
        const isDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        if (isDark) root.classList.add('dark');
      } else if (t === 'dark') {
        root.classList.add('dark');
      }
      // If light, do nothing (no class)
    };

    applyTheme(theme);

    let mql: MediaQueryList | null = null;
    const systemListener = () => {
      if (theme === 'system') applyTheme('system');
    };
    if (theme === 'system') {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', systemListener);
    }
    return () => {
      if (mql) mql.removeEventListener('change', systemListener);
    };
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
