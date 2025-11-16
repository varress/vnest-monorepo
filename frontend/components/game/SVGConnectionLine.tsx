import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Stop } from 'react-native-svg';

interface SVGConnectionLineProps {
  fromPosition: { x: number; y: number } | null;
  toPosition: { x: number; y: number } | null;
  color?: string;
  strokeWidth?: number;
}

export const SVGConnectionLine: React.FC<SVGConnectionLineProps> = ({
  fromPosition,
  toPosition,
  color = '#4CAF50',
  strokeWidth = 4
}) => {
  if (!fromPosition || !toPosition) {
    return null;
  }

  // Use the positions directly - they're already calculated as edge positions
  const fromX = fromPosition.x;
  const fromY = fromPosition.y;
  const toX = toPosition.x;
  const toY = toPosition.y;

  // Calculate SVG container dimensions to fit the line with padding
  const padding = 20; // Extra space for dots and glow effects
  const minX = Math.min(fromX, toX) - padding;
  const minY = Math.min(fromY, toY) - padding;
  const maxX = Math.max(fromX, toX) + padding;
  const maxY = Math.max(fromY, toY) + padding;
  
  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;

  // Adjust coordinates relative to SVG container
  const relativeFromX = fromX - minX;
  const relativeFromY = fromY - minY;
  const relativeToX = toX - minX;
  const relativeToY = toY - minY;

  return (
    <View style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none', zIndex: 5 }]}>
      <Svg
        width={svgWidth}
        height={svgHeight}
        style={{
          position: 'absolute',
          left: minX,
          top: minY,
        }}
      >
        <Defs>
          <LinearGradient id={`lineGradient-${fromX}-${fromY}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.7" />
            <Stop offset="50%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </LinearGradient>
        </Defs>
        
        {/* Glow effect line (behind main line) */}
        <Line
          x1={relativeFromX}
          y1={relativeFromY}
          x2={relativeToX}
          y2={relativeToY}
          stroke={color}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          opacity={0.3}
        />
        
        {/* Main connection line */}
        <Line
          x1={relativeFromX}
          y1={relativeFromY}
          x2={relativeToX}
          y2={relativeToY}
          stroke={`url(#lineGradient-${fromX}-${fromY})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Start dot with glow */}
        <Circle
          cx={relativeFromX}
          cy={relativeFromY}
          r="8"
          fill={color}
          opacity={0.3}
        />
        <Circle
          cx={relativeFromX}
          cy={relativeFromY}
          r="5"
          fill={color}
        />
        
        {/* End dot with glow */}
        <Circle
          cx={relativeToX}
          cy={relativeToY}
          r="8"
          fill={color}
          opacity={0.3}
        />
        <Circle
          cx={relativeToX}
          cy={relativeToY}
          r="5"
          fill={color}
        />
      </Svg>
    </View>
  );
};