
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

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
  theme: 'dark',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'yamo-theme',
  ...props
}: ThemeProviderProps) {
  // CHANGEMENT 1 : Initialisation simple et sûre de l'état.
  // On ne lit plus localStorage ici. On utilise la valeur par défaut.
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // CHANGEMENT 2 : Un seul useEffect pour gérer la logique côté client.
  useEffect(() => {
    // Ce code ne s'exécute que sur le client, après le montage du composant.
    let initialTheme: Theme;
    try {
      initialTheme = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    } catch (e) {
      console.warn('Failed to access localStorage:', e);
      initialTheme = defaultTheme;
    }
    setTheme(initialTheme);
  }, [defaultTheme, storageKey]);


  useEffect(() => {
    // Ce useEffect est conservé, il applique la classe au document.
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);


  const value = useMemo(() => ({
    theme,
    setTheme: (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
        setTheme(newTheme);
      } catch (e) {
        console.warn('Failed to save theme to localStorage:', e);
        // On met quand même à jour l'état même si localStorage échoue.
        setTheme(newTheme);
      }
    },
  }), [theme, storageKey]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
