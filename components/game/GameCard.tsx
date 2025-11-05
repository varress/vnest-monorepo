import { getCardDimensions, getVerbCardDimensions } from '@/utils/responsive';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

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
  
  // Get margin values separately for verb cards
  const verbMarginVertical = isVerb && 'marginVertical' in cardDimensions 
    ? cardDimensions.marginVertical 
    : 6;
  
  return (
    <TouchableOpacity
      style={[
        styles.baseCard,
        {
          width: cardDimensions.width,
          height: cardDimensions.height,
          marginVertical: isVerb ? verbMarginVertical : 6,
        },
        isVerb ? styles.verbCard : styles.card,
        isSelected && styles.selectedCard,
        style
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          isVerb ? styles.verbText : styles.cardText,
          { fontSize: cardDimensions.fontSize }
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {text}
      </Text>
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
  },
  selectedCard: { 
    backgroundColor: '#34C759',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  cardText: { 
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
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