import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  highContrast: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  toggleHighContrast: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@vnest_theme_mode';
const HIGH_CONTRAST_STORAGE_KEY = '@vnest_high_contrast';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [highContrast, setHighContrast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine actual dark mode state based on mode and system preference
  const isDarkMode = themeMode === 'system' 
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeModeState(savedTheme as ThemeMode);
      }
      
      const savedHighContrast = await AsyncStorage.getItem(HIGH_CONTRAST_STORAGE_KEY);
      if (savedHighContrast !== null) {
        setHighContrast(savedHighContrast === 'true');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = isDarkMode ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  const toggleHighContrast = async () => {
    try {
      const newValue = !highContrast;
      await AsyncStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, newValue.toString());
      setHighContrast(newValue);
    } catch (error) {
      console.error('Failed to save high contrast preference:', error);
    }
  };

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeMode, isDarkMode, highContrast, setThemeMode, toggleTheme, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
