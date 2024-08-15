import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

export const colors = {
  light: {
    primary: "#10b9fd",    // Light mode primary color (Bright Blue)
    secondary: "#767ffe",  // Light mode secondary color (Soft Purple-Blue)
    tertiary: "#f9fdff",   // Light mode background color (Very Light Blue/White)
    accent: "#6548fd",     // Light mode accent color (Deep Purple)
    random: "#e1f3ff",     // Light blue for background highlights
    tint: "#a3d8ff",       // Lighter blue tint for subtle elements
    background: "#f9fdff", // Background color (Very Light Blue/White)
    text: "#000e13",       // Text color (Very Dark Blue)
  },
  dark: {
    primary: "#0a8cd1",    // Dark mode primary color (Muted Bright Blue)
    secondary: "#5c68d7",  // Dark mode secondary color (Darker Soft Purple-Blue)
    tertiary: "#0b0f14",   // Dark mode background color (Very Dark Blue)
    accent: "#4a3ac1",     // Dark mode accent color (Deep Muted Purple)
    random: "#132436",     // Darker blue for background highlights
    tint: "#334f67",       // Dark blue-gray tint for subtle elements
    background: "#0b0f14", // Background color (Very Dark Blue)
    text: "#f9fdff",       // Text color (Very Light Blue/White)
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