import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
const ThemeContext = createContext(null);

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Provider component
export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'blue');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'medium');

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#1a1a1a' : '#ffffff'
      );
    }
  }, [theme]);

  // Apply accent color
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous accent color classes
    const colorClasses = ['blue', 'green', 'purple', 'orange', 'red'];
    colorClasses.forEach(color => {
      root.classList.remove(`accent-${color}`);
    });
    
    // Add new accent color class
    root.classList.add(`accent-${accentColor}`);
    
    // Save to localStorage
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous font size classes
    root.classList.remove('text-small', 'text-medium', 'text-large');
    
    // Add new font size class
    root.classList.add(`text-${fontSize}`);
    
    // Save to localStorage
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Set specific theme
  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  // Set accent color
  const changeAccentColor = (color) => {
    if (['blue', 'green', 'purple', 'orange', 'red'].includes(color)) {
      setAccentColor(color);
    }
  };

  // Set font size
  const changeFontSize = (size) => {
    if (['small', 'medium', 'large'].includes(size)) {
      setFontSize(size);
    }
  };

  // Get CSS variables for current theme
  const getThemeVariables = () => {
    return {
      '--bg-primary': theme === 'dark' ? '#1a1a1a' : '#ffffff',
      '--bg-secondary': theme === 'dark' ? '#2d2d2d' : '#f3f4f6',
      '--text-primary': theme === 'dark' ? '#ffffff' : '#111827',
      '--text-secondary': theme === 'dark' ? '#9ca3af' : '#6b7280',
      '--border-color': theme === 'dark' ? '#404040' : '#e5e7eb',
    };
  };

  // Available options
  const availableAccentColors = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
  ];

  const availableFontSizes = [
    { value: 'small', label: 'Small', scale: '0.875rem' },
    { value: 'medium', label: 'Medium', scale: '1rem' },
    { value: 'large', label: 'Large', scale: '1.125rem' },
  ];

  // Context value
  const value = {
    theme,
    accentColor,
    fontSize,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    changeAccentColor,
    changeFontSize,
    getThemeVariables,
    availableAccentColors,
    availableFontSizes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};