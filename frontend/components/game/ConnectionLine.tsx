import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface ConnectionLineProps {
  startPosition: { x: number; y: number } | null;
  endPosition: { x: number; y: number } | null;
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
}

export function ConnectionLine({
  startPosition,
  endPosition,
  color = '#e79231ff',
  strokeWidth = 4,
  animated = true,
}: ConnectionLineProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  console.log('ConnectionLine render:', { startPosition, endPosition }); // Debug log

  useEffect(() => {
    if (startPosition && endPosition) {
      if (animated) {
        // Reset animations
        animatedValue.setValue(0);
        scaleX.setValue(0);
        opacity.setValue(0);
        
        // Animate the line appearance
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleX, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        animatedValue.setValue(1);
        scaleX.setValue(1);
        opacity.setValue(1);
      }
    } else {
      // Fade out when no connection
      if (animated) {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        opacity.setValue(0);
      }
    }
  }, [startPosition, endPosition, animated, animatedValue, scaleX, opacity]);

  if (!startPosition || !endPosition) {
    console.log('ConnectionLine: Missing positions', { startPosition, endPosition });
    return null;
  }

  console.log('ConnectionLine calculating:', {
    startPosition,
    endPosition,
    deltaX: endPosition.x - startPosition.x,
    deltaY: endPosition.y - startPosition.y
  });

  // Calculate line properties
  const deltaX = endPosition.x - startPosition.x - 10;
  const deltaY = endPosition.y - startPosition.y - 10;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY) ;
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) ;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacity,
        }
      ]}
      pointerEvents="none"
    >
      {/* Main line - using direct start-to-end positioning */}
      <Animated.View
        style={[
          styles.line,
          {
            width: length,
            height: strokeWidth,
            backgroundColor: color,
            left: startPosition.x,
            top: startPosition.y - strokeWidth / 2, // Center the line vertically on start point
            transformOrigin: '0 50%', // Transform from left edge, centered vertically
            transform: [
              { rotate: `${angle}deg` },
              { scaleX: scaleX },
            ],
          },
        ]}
      />
      
      {/* Glowing effect - same positioning as main line */}
      <Animated.View
        style={[
          styles.line,
          styles.glow,
          {
            width: length,
            height: strokeWidth + 4,
            backgroundColor: color,
            left: startPosition.x,
            top: startPosition.y - (strokeWidth + 4) / 2, // Center the glow on start point
            transformOrigin: '0 50%',
            transform: [
              { rotate: `${angle}deg` },
              { scaleX: scaleX },
            ],
          },
        ]}
      />

      {/* Start dot */}
      <Animated.View
        style={[
          styles.dot,
          {
            left: startPosition.x - 6,
            top: startPosition.y - 6,
            backgroundColor: color,
            transform: [
              { scale: animatedValue },
            ],
          },
        ]}
      />
      
      {/* End dot */}
      <Animated.View
        style={[
          styles.dot,
          {
            left: endPosition.x - 6,
            top: endPosition.y - 6,
            backgroundColor: color,
            transform: [
              { scale: animatedValue },
            ],
          },
        ]}
      />

      {/* Arrow indicator at end */}
      <Animated.View
        style={[
          styles.arrow,
          {
            left: endPosition.x - 8,
            top: endPosition.y - 8,
            backgroundColor: color,
            transform: [
              { scale: animatedValue },
              { rotate: `${angle + 45}deg` },
            ],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10, // Increased z-index
    pointerEvents: 'none',
  },
  line: {
    position: 'absolute',
    borderRadius: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  glow: {
    opacity: 0.4,
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  arrow: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
});