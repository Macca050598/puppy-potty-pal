import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

export const colors = {
    light: {
      primary: "#6D57FC",
      secondary: "#261E58",
      tertiary: "#0C0A1C",
      accent: "#FFFFFF",
      random: "#E8E4FF",
      tint: "#B0A4FD",
      text: "#0C0A1C",
    },
    dark: {
      primary: "#8F7CFF",
      secondary: "#3D3470",
      tertiary: "#1E1A3C",
      accent: "#2D2654",
      tint: "#C2B7FE",
      text: "#FFFFFF", // Added white text color for dark mode
    }
  };
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const theme = {
    isDark,
    colors: isDark ? colors.dark : colors.light,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);