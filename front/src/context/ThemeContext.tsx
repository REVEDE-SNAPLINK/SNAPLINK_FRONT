import React, { createContext, useContext } from 'react';
import { theme, Theme } from '../constants/theme.ts';

type ThemeContextValue = {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue>({ theme });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);