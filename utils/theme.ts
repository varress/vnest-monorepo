import { Dimensions, Platform } from 'react-native';
import { BREAKPOINTS, responsiveFontSize, spacing } from './responsive';

// Get screen width for desktop detection
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && SCREEN_WIDTH >= BREAKPOINTS.desktop;

// Color palette
export const colors = {
  primary: '#2196f3',
  primaryLight: '#e3f2fd',
  secondary: '#4caf50',
  secondaryLight: '#e8f5e8',
  accent: '#ff9800',
  
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  
  background: '#ffffff',
  surface: '#f8f9fa',
  surfaceElevated: '#ffffff',
  
  text: '#333333',
  textSecondary: '#666666',
  textDisabled: '#999999',
  
  border: '#e9ecef',
  borderActive: '#2196f3',
  
  cardBackground: '#f2f2f2',
  cardSelected: '#34c759',
  
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowStrong: 'rgba(0, 0, 0, 0.2)',
};

// Typography scale with desktop optimization
export const typography = {
  // Headers
  h1: {
    fontSize: isDesktop ? 28 : responsiveFontSize(32),
    fontWeight: 'bold' as const,
    lineHeight: isDesktop ? 36 : responsiveFontSize(40),
    color: colors.text,
  },
  h2: {
    fontSize: isDesktop ? 24 : responsiveFontSize(28),
    fontWeight: 'bold' as const,
    lineHeight: isDesktop ? 32 : responsiveFontSize(36),
    color: colors.text,
  },
  h3: {
    fontSize: isDesktop ? 20 : responsiveFontSize(24),
    fontWeight: '600' as const,
    lineHeight: isDesktop ? 28 : responsiveFontSize(32),
    color: colors.text,
  },
  h4: {
    fontSize: isDesktop ? 18 : responsiveFontSize(20),
    fontWeight: '600' as const,
    lineHeight: isDesktop ? 24 : responsiveFontSize(28),
    color: colors.text,
  },
  
  // Body text
  body1: {
    fontSize: responsiveFontSize(16),
    fontWeight: '400' as const,
    lineHeight: responsiveFontSize(24),
    color: colors.text,
  },
  body2: {
    fontSize: responsiveFontSize(14),
    fontWeight: '400' as const,
    lineHeight: responsiveFontSize(20),
    color: colors.textSecondary,
  },
  
  // UI text
  button: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  caption: {
    fontSize: responsiveFontSize(12),
    fontWeight: '400' as const,
    lineHeight: responsiveFontSize(16),
    color: colors.textSecondary,
  },
  
  // Game specific
  gameTitle: {
    fontSize: isDesktop ? 32 : responsiveFontSize(40),
    fontWeight: 'bold' as const,
    color: colors.text,
    textAlign: 'center' as const,
  },
  cardText: {
    fontSize: isDesktop ? 16 : responsiveFontSize(24),
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center' as const,
  },
  verbText: {
    fontSize: isDesktop ? 20 : responsiveFontSize(36),
    fontWeight: 'bold' as const,
    color: '#ffffff',
    textAlign: 'center' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
};

// Common shadow styles
export const shadows = {
  none: {},
  small: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
  }),
  medium: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    },
  }),
  large: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    },
  }),
};

// Common component styles
export const components = {
  // Buttons
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 48,
    ...shadows.medium,
  },
  
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  
  buttonError: {
    backgroundColor: colors.error,
  },
  
  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.small,
  },
  
  cardElevated: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: spacing.lg,
    ...shadows.medium,
  },
  
  // Game specific components
  gameCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...shadows.small,
  },
  
  gameCardSelected: {
    backgroundColor: colors.cardSelected,
    ...shadows.medium,
  },
  
  verbCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...shadows.large,
  },
  
  // Containers
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  screenPadded: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  
  screenMobile: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Common layouts
export const layouts = {
  row: {
    flexDirection: 'row' as const,
  },
  rowCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowSpaceBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  column: {
    flexDirection: 'column' as const,
  },
  columnCenter: {
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
  },
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

// Export a complete theme object
export const theme = {
  colors,
  typography,
  shadows,
  components,
  animations,
  layouts,
  spacing,
};