
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Theme, ChatDensity, DARK_MODE_BG_IMAGE_ENABLED_LS_KEY, CHAT_DENSITY_LS_KEY } from '../constants';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  darkModeBgImageEnabled: boolean;
  setDarkModeBgImageEnabled: (enabled: boolean) => void;
  chatDensity: ChatDensity;
  setChatDensity: (density: ChatDensity) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) return savedTheme;
    }
    return 'dark'; // Default theme
  });

  const [darkModeBgImageEnabled, setDarkModeBgImageEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem(DARK_MODE_BG_IMAGE_ENABLED_LS_KEY);
      return savedPreference ? JSON.parse(savedPreference) : true; // Default to true
    }
    return true;
  });

  const [chatDensity, setChatDensityState] = useState<ChatDensity>(() => {
    if (typeof window !== 'undefined') {
      const savedDensity = localStorage.getItem(CHAT_DENSITY_LS_KEY) as ChatDensity | null;
      return savedDensity || 'comfortable'; // Default to comfortable
    }
    return 'comfortable';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove(`theme-${theme === 'light' ? 'dark' : 'light'}`);
      root.classList.add(`theme-${theme}`);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DARK_MODE_BG_IMAGE_ENABLED_LS_KEY, JSON.stringify(darkModeBgImageEnabled));
    }
  }, [darkModeBgImageEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHAT_DENSITY_LS_KEY, chatDensity);
      // Optionally, add a class to body or root for global density styles
      document.documentElement.classList.remove('chat-density-comfortable', 'chat-density-compact');
      document.documentElement.classList.add(`chat-density-${chatDensity}`);
    }
  }, [chatDensity]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const toggleTheme = () => setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  const setDarkModeBgImageEnabled = (enabled: boolean) => setDarkModeBgImageEnabledState(enabled);
  const setChatDensity = (density: ChatDensity) => setChatDensityState(density);

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme, toggleTheme,
      darkModeBgImageEnabled, setDarkModeBgImageEnabled,
      chatDensity, setChatDensity
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
