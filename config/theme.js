import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

export const colors = {
  light: {
    primary: "#E67E22",    // Burnt Orange
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

// export const colors = {
//   light: {
//     primary: "#015eea",    // Dark blue (as specified)
//     secondary: "#00c0fa",  // Light blue (as specified)
//     tertiary: "#f0f8ff",   // Very light blue for background
//     accent: "#ff6b00",     // Orange for accent (complementary to blue)
//     random: "#e6f3ff",     // Lighter blue for highlights
//     tint: "#b3d9ff",       // Mid-light blue for subtle elements
//     background: "#ffffff", // White background
//     text: "#017eef",       // Text color (as specified)
//   },
//   dark: {
//     primary: "#0147b3",    // Darker version of the light mode primary
//     secondary: "#0096c7",  // Darker version of the light mode secondary
//     tertiary: "#001a33",   // Very dark blue for background
//     accent: "#cc5500",     // Darker orange for accent
//     random: "#002b4d",     // Dark blue for highlights
//     tint: "#004d99",       // Darker blue for subtle elements
//     background: "#000d1a", // Very dark blue background
//     text: "#ffffff",       // White text for contrast
//   }
// };

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