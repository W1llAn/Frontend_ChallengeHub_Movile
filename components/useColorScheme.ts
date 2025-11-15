import { useTheme } from '@/contexts/ThemeContext';

/**
 * Custom hook that returns the current color scheme
 * This hook integrates with ThemeContext to support manual theme switching
 * Falls back to system theme if ThemeContext is not available
 */
export function useColorScheme() {
  try {
    const { colorScheme } = useTheme();
    return colorScheme;
  } catch {
    // Fallback to system color scheme if ThemeContext is not available
    const { useColorScheme: useSystemColorScheme } = require('react-native');
    return useSystemColorScheme() || 'light';
  }
}

