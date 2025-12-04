import { getCardDimensions, getVerbCardDimensions } from '@/utils/responsive';
import { useEffect, useRef } from 'react';
import { LayoutRectangle, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { Colors, getThemedColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

interface GameCardProps {
  text: string;
  isSelected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'verb';
  style?: object;
  cardId?: string | number;
  parentRef?: React.RefObject<View | null>;
  onLayout?: (cardId: string | number, layout: LayoutRectangle) => void;
}

export function GameCard({ 
  text, 
  isSelected = false, 
  onPress, 
  variant = 'default',
  style,
  cardId,
  parentRef,
  onLayout 
}: GameCardProps) {
  const { isDarkMode, highContrast } = useTheme();
  const colors = getThemedColors(isDarkMode, highContrast);
  const isVerb = variant === 'verb';
  const cardDimensions = isVerb ? getVerbCardDimensions() : getCardDimensions();
  const cardRef = useRef<any>(null);
  
  // Animation for selection
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLayout = (event: any) => {
    if (cardId && onLayout && parentRef?.current) {
      // Use requestAnimationFrame for immediate but safe measurement
      requestAnimationFrame(() => {
        if (cardRef.current && parentRef.current) {
          cardRef.current?.measureLayout(
            parentRef.current,
            (x: number, y: number, width: number, height: number) => {
              // console.log(`📍 Card ${cardId} positioned at:`, { 
              //   x: Math.round(x), 
              //   y: Math.round(y), 
              //   w: Math.round(width), 
              //   h: Math.round(height),
              //   centerX: Math.round(x + width/2),
              //   centerY: Math.round(y + height/2)
              // });
              onLayout(cardId, { x, y, width, height });
            },
            (error: any) => console.error('❌ measureLayout error:', error)
          );
        }
      });
    }
  };
  
  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected, scaleAnim]);
  
  // Get margin values separately for verb cards
  const verbMarginVertical = isVerb && 'marginVertical' in cardDimensions 
    ? cardDimensions.marginVertical 
    : 6;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      ref={cardRef}
      onLayout={handleLayout}
    >
      <Animated.View
        testID="game-card"
        style={[
          styles.baseCard,
          {
            width: cardDimensions.width,
            height: cardDimensions.height,
            marginVertical: isVerb ? verbMarginVertical : 6,
            transform: [{ scale: scaleAnim }],
            backgroundColor: isVerb ? colors.cardSelected : (isSelected ? colors.cardSelected : colors.cardBackground),
            borderWidth: 2,
            borderColor: isSelected ? colors.success : 'transparent',
          },
          isVerb && styles.verbCard,
          style
        ]}
      >
        <Text 
          style={[
            isVerb ? styles.verbText : styles.cardText,
            { fontSize: cardDimensions.fontSize, color: colors.text },
            isSelected && { fontWeight: 'bold' }
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {text}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
    padding: 16,
  },
  card: {},
  selectedCard: {},
  cardText: { 
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedText: {},
  verbCard: {
    padding: 20,
  },
  verbText: { 
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});