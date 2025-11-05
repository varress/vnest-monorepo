import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define breakpoints
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

// Device type detection
export const getDeviceType = () => {
  if (SCREEN_WIDTH < BREAKPOINTS.mobile) return 'mobile';
  if (SCREEN_WIDTH < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

// Check if device is tablet or larger
export const isTabletOrLarger = () => SCREEN_WIDTH >= BREAKPOINTS.tablet;
export const isMobile = () => SCREEN_WIDTH < BREAKPOINTS.mobile;
export const isDesktop = () => SCREEN_WIDTH >= BREAKPOINTS.desktop;

// Platform checks
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Responsive dimensions
export const responsiveWidth = (percentage: number) => {
  return (SCREEN_WIDTH * percentage) / 100;
};

export const responsiveHeight = (percentage: number) => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

// Responsive font sizes with better desktop handling
export const responsiveFontSize = (size: number) => {
  // For web/desktop, use fixed sizes to prevent over-scaling
  if (Platform.OS === 'web' && SCREEN_WIDTH >= BREAKPOINTS.desktop) {
    return Math.min(size, size * 1.2); // Cap at 120% of base size for desktop
  }
  
  const scale = Math.min(SCREEN_WIDTH / 375, 2); // Cap scaling at 2x
  const newSize = size * scale;
  
  // Different limits for different platforms
  const minSize = 12;
  const maxSize = Platform.OS === 'web' ? size * 1.5 : size * 2;
  
  return Math.max(minSize, Math.min(maxSize, PixelRatio.roundToNearestPixel(newSize)));
};

// Responsive spacing with desktop fixes
export const spacing = {
  xs: Platform.OS === 'web' && SCREEN_WIDTH >= BREAKPOINTS.desktop ? 4 : responsiveWidth(1),
  sm: Platform.OS === 'web' && SCREEN_WIDTH >= BREAKPOINTS.desktop ? 8 : responsiveWidth(2),
  md: Platform.OS === 'web' && SCREEN_WIDTH >= BREAKPOINTS.desktop ? 16 : responsiveWidth(4),
  lg: Platform.OS === 'web' && SCREEN_WIDTH >= BREAKPOINTS.desktop ? 24 : responsiveWidth(6),
  xl: Platform.OS === 'web' && SCREEN_WIDTH >= BREAKPOINTS.desktop ? 32 : responsiveWidth(8),
  xxl: Platform.OS === 'web' && SCREEN_WIDTH >= BREAKPOINTS.desktop ? 48 : responsiveWidth(12),
};

// Card dimensions based on device type
export const getCardDimensions = () => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return {
        width: responsiveWidth(70),
        height: responsiveHeight(8),
        fontSize: responsiveFontSize(18),
      };
    case 'tablet':
      return {
        width: responsiveWidth(25),
        height: responsiveHeight(10),
        fontSize: responsiveFontSize(20),
      };
    default: // desktop
      return {
        width: 200,  // Smaller fixed width for desktop
        height: 80,  // Smaller fixed height for desktop
        fontSize: 18, // Smaller fixed font size
      };
  }
};

// Verb card dimensions
export const getVerbCardDimensions = () => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'mobile':
      return {
        width: responsiveWidth(80),
        height: responsiveHeight(10),
        fontSize: responsiveFontSize(28),
        marginVertical: responsiveHeight(6),
      };
    case 'tablet':
      return {
        width: responsiveWidth(30),
        height: responsiveHeight(12),
        fontSize: responsiveFontSize(32),
        marginVertical: responsiveHeight(8),
      };
    default: // desktop
      return {
        width: 200,  // Smaller for desktop
        height: 80,  // Smaller for desktop
        fontSize: 24, // Much smaller font
        marginVertical: 40, // Less margin
      };
  }
};

// Layout configuration
export const getLayoutConfig = () => {
  const deviceType = getDeviceType();
  
  return {
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    cardColumns: deviceType === 'mobile' ? 1 : 3, // Stack on mobile, 3 columns on larger screens
    horizontalPadding: deviceType === 'mobile' ? spacing.md : spacing.lg,
    verticalSpacing: deviceType === 'mobile' ? spacing.sm : spacing.md,
  };
};

// Safe area and status bar helpers
export const getSafeAreaConfig = () => {
  return {
    paddingTop: Platform.select({
      ios: responsiveHeight(6),
      android: responsiveHeight(4), 
      web: SCREEN_WIDTH >= BREAKPOINTS.desktop ? 20 : responsiveHeight(3), // Fixed padding for desktop
    }),
    paddingBottom: Platform.select({
      ios: responsiveHeight(4),
      android: responsiveHeight(2),
      web: SCREEN_WIDTH >= BREAKPOINTS.desktop ? 20 : responsiveHeight(2), // Fixed padding for desktop
    }),
  };
};

// Export screen dimensions for direct use
export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};