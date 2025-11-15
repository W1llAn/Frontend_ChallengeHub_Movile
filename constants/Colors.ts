/**
 * Color palette based on the design system
 * Includes light and dark mode support following UI best practices
 */

const Colors = {
  light: {
    // Primary colors
    primary: '#591D87',
    primaryLight: '#7232A8',
    primaryDark: '#3E1461',
    
    // Secondary colors
    secondary: '#F5A623',
    accent: '#00BFA6',
    
    // Background colors
    background: '#F9F7FC',
    backgroundSecondary: '#FFFFFF',
    backgroundTertiary: '#F0EDF5',
    
    // Text colors
    text: '#1E1E1E',
    textSecondary: '#5A5A5A',
    textTertiary: '#8E8E8E',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#E2D8F3',
    borderLight: '#F0EDF5',
    borderDark: '#D1C4E6',
    
    // Tint colors (for tabs and interactive elements)
    tint: '#591D87',
    tabIconDefault: '#9E9E9E',
    tabIconSelected: '#591D87',
    
    // Semantic colors
    success: '#00BFA6',
    warning: '#F5A623',
    error: '#E53935',
    info: '#2196F3',
    
    // Surface colors (for cards, modals, etc.)
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  dark: {
    // Primary colors (slightly adjusted for better contrast in dark mode)
    primary: '#9C5FCF',
    primaryLight: '#B67FE8',
    primaryDark: '#7232A8',
    
    // Secondary colors (adjusted for dark mode visibility)
    secondary: '#FFB84D',
    accent: '#26D9C3',
    
    // Background colors (dark theme)
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2A2A2A',
    
    // Text colors (inverted for dark mode)
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#8E8E8E',
    textInverse: '#1E1E1E',
    
    // Border colors (adjusted for dark mode)
    border: '#3A3A3A',
    borderLight: '#2A2A2A',
    borderDark: '#4A4A4A',
    
    // Tint colors
    tint: '#9C5FCF',
    tabIconDefault: '#757575',
    tabIconSelected: '#9C5FCF',
    
    // Semantic colors (adjusted for dark mode)
    success: '#26D9C3',
    warning: '#FFB84D',
    error: '#EF5350',
    info: '#42A5F5',
    
    // Surface colors (for cards, modals, etc. in dark mode)
    surface: '#1E1E1E',
    surfaceElevated: '#2A2A2A',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

/**
 * Font families for the design system
 * Note: Fonts need to be loaded in the app using expo-font
 */
export const Fonts = {
  sans: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  serif: {
    regular: 'Merriweather-Regular',
    bold: 'Merriweather-Bold',
  },
  mono: {
    regular: 'FiraCode-Regular',
    medium: 'FiraCode-Medium',
  },
};

/**
 * Typography scale following the design system
 */
export const Typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h5: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
};

/**
 * Spacing scale following the 8pt grid system
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border radius scale
 */
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

/**
 * Shadow styles for both platforms
 */
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default Colors;
