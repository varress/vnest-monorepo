import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, getThemedColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

interface CongratsViewProps {
  currentSetId: number;
  verbCount?: number;
  correctAnswersCount: number;
  requiredAnswers: number;
  onReplay: () => void;
  onNextSet: () => void;
}

export function CongratsView({ 
  currentSetId, 
  verbCount, 
  correctAnswersCount,
  requiredAnswers,
  onReplay, 
  onNextSet 
}: CongratsViewProps) {
  const { isDarkMode, highContrast } = useTheme();
  const colors = getThemedColors(isDarkMode, highContrast);
  
  return (
    <>
      <View style={styles.congratsContainer}>
        <Text style={styles.congratsEmoji}>🎉</Text>
        <Text style={[styles.congratsTitle, { color: colors.success }]}>Onnittelut!</Text>
        <Text style={[styles.congratsSubtitle, { color: colors.text }]}>
          Olet saanut {correctAnswersCount} oikeaa vastausta!
        </Text>
        <Text style={[styles.congratsMessage, { color: colors.textLight }]}>
          Hienoa työtä! Olet suorittanut {requiredAnswers} harjoitusta ja voit nyt siirtyä seuraavaan settiin.
        </Text>
        {currentSetId < 3 && (
          <Text style={[styles.nextSetInfo, { color: colors.success }]}>
            Seuraavaksi: Setti {currentSetId + 2}
          </Text>
        )}
      </View>
      
      <View style={styles.congratsButtons}>
        <TouchableOpacity 
          style={[styles.replayButton, { backgroundColor: colors.primary }]} 
          onPress={onReplay}
        >
          <Text style={[styles.replayButtonText, { color: isDarkMode ? colors.buttonText : '#ffffff' }]}>🔄 Pelaa uudelleen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextSetButton, { backgroundColor: colors.success }]} 
          onPress={onNextSet}
        >
          <Text style={[styles.nextSetButtonText, { color: colors.buttonText }]}>➡️ Seuraava setti</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  congratsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  congratsEmoji: {
    fontSize: 80,
    marginBottom: 20,
    textAlign: 'center',
  },
  congratsTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  congratsSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  congratsMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  nextSetInfo: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  congratsButtons: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  replayButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  replayButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextSetButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextSetButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});