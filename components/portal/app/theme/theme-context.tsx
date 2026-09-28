'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme,setThemeState]=useState<Theme>('light');
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    let saved:string|null=null;try{saved=localStorage.getItem('theme');}catch{}
    setThemeState(saved==='light'||saved==='dark'?saved:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
    setReady(true);
  },[]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try { localStorage.setItem('theme', newTheme); } catch { /* Theme still works for this visit. */ }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Apply theme by toggling 'dark' class on document element
  useEffect(() => {
    if(!ready)return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
  }, [theme,ready]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      let savedTheme: string | null = null;
      try { savedTheme = localStorage.getItem('theme'); } catch { /* Use system preference. */ }
      if (!savedTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
