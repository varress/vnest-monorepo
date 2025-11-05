import { getLayoutConfig, SCREEN_DIMENSIONS } from '@/utils/responsive';
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

interface LayoutConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  cardColumns: number;
  horizontalPadding: number;
  verticalSpacing: number;
  screenWidth: number;
  screenHeight: number;
}

export function useResponsiveLayout(): LayoutConfig {
  const [screenDimensions, setScreenDimensions] = useState(SCREEN_DIMENSIONS);
  const [layoutConfig, setLayoutConfig] = useState(getLayoutConfig());

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions({ width: window.width, height: window.height });
      setLayoutConfig(getLayoutConfig());
    });

    return () => subscription?.remove();
  }, []);

  return {
    ...layoutConfig,
    screenWidth: screenDimensions.width,
    screenHeight: screenDimensions.height,
  };
}