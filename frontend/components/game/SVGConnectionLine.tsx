import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Stop } from 'react-native-svg';

interface SVGConnectionLineProps {
  fromPosition: { x: number; y: number } | null;
  toPosition: { x: number; y: number } | null;
  color?: string;
}

export const SVGConnectionLine: React.FC<SVGConnectionLineProps> = ({
  fromPosition,
  toPosition,
  color = '#0ea5e9'
}) => {
  if (!fromPosition || !toPosition) {
    return null;
  }

  // Use the positions directly - they're already calculated as edge positions
  const fromX = fromPosition.x;
  const fromY = fromPosition.y;
  const toX = toPosition.x;
  const toY = toPosition.y;

  console.log('SVG Connection Line - Container-relative positions:', {
    from: { x: fromX, y: fromY },
    to: { x: toX, y: toY },
    note: 'These should be small values relative to container, not huge screen coordinates'
  });

  // Calculate SVG container dimensions to fit the line
  const minX = Math.min(fromX, toX) - 10;
  const minY = Math.min(fromY, toY) - 10;
  const maxX = Math.max(fromX, toX) + 10;
  const maxY = Math.max(fromY, toY) + 10;
  
  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;

  console.log('SVG Container calculated bounds:', {
    minX, minY, maxX, maxY,
    svgWidth, svgHeight,
    svgPosition: { left: minX, top: minY }
  });

  // Adjust coordinates relative to SVG container
  const relativeFromX = fromX - minX;
  const relativeFromY = fromY - minY;
  const relativeToX = toX - minX;
  const relativeToY = toY - minY;

  console.log('Final line coordinates within SVG:', {
    relativeFrom: { x: relativeFromX, y: relativeFromY },
    relativeTo: { x: relativeToX, y: relativeToY }
  });

  return (
    <View style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}>
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
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </LinearGradient>
        </Defs>
        
        {/* Connection line */}
        <Line
          x1={relativeFromX}
          y1={relativeFromY}
          x2={relativeToX}
          y2={relativeToY}
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Start dot */}
        <Circle
          cx={relativeFromX}
          cy={relativeFromY}
          r="4"
          fill={color}
        />
        
        {/* End dot */}
        <Circle
          cx={relativeToX}
          cy={relativeToY}
          r="4"
          fill={color}
        />
      </Svg>
    </View>
  );
};