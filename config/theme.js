import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

export const colors = {
  light: {
    primary: "#FF6B6B",    // Coral
    secondary: "#FFA86B",  // Light Orange
    tertiary: "#FFF3E0",   // Warm White
    accent: "#4ECDC4",     // Turquoise
    random: "#FFE0B2",     // Light Peach
    tint: "#FFCCBC",       // Pale Pink
    background: "#FFF3E0", // Warm White
    text: "#2C3E50",       // Dark Slate
  },
  dark: {
    primary: "#E74C3C",    // Darker Coral
    secondary: "#E67E22",  // Burnt Orange
    tertiary: "#2C3E50",   // Dark Slate
    accent: "#1ABC9C",     // Dark Turquoise
    random: "#34495E",     // Midnight Blue
    tint: "#7F8C8D",       // Cool Gray
    background: "#2C3E50", // Dark Slate
    text: "#ECF0F1",       // Off-White
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