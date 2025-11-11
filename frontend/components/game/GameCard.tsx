import { getCardDimensions, getVerbCardDimensions } from '@/utils/responsive';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface GameCardProps {
  text: string;
  isSelected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'verb';
  style?: object;
}

export function GameCard({ 
  text, 
  isSelected = false, 
  onPress, 
  variant = 'default',
  style 
}: GameCardProps) {
  const isVerb = variant === 'verb';
  const cardDimensions = isVerb ? getVerbCardDimensions() : getCardDimensions();
  
  // Animation for selection
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
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
    >
      <Animated.View
        style={[
          styles.baseCard,
          {
            width: cardDimensions.width,
            height: cardDimensions.height,
            marginVertical: isVerb ? verbMarginVertical : 6,
            transform: [{ scale: scaleAnim }],
          },
          isVerb ? styles.verbCard : styles.card,
          isSelected && styles.selectedCard,
          style
        ]}
      >
        <Text 
          style={[
            isVerb ? styles.verbText : styles.cardText,
            isSelected && styles.selectedText,
            { fontSize: cardDimensions.fontSize }
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
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: { 
    backgroundColor: '#34C759',
    borderColor: '#28A745',
    shadowOpacity: 0.25,
    elevation: 6,
  },
  cardText: { 
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  verbCard: {
    backgroundColor: '#007AFF',
    padding: 20,
  },
  verbText: { 
    color: '#fff', 
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});