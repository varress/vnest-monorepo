import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const setNames = [
    "Ruoka ja juoma",
    "Liikenne ja liikunta", 
    "Opiskelu ja työ",
    "Vapaa-aika ja harrastukset"
  ];
  
  return (
    <>
      <View style={styles.congratsContainer}>
        <Text style={styles.congratsEmoji}>🎉</Text>
        <Text style={styles.congratsTitle}>Onnittelut!</Text>
        <Text style={styles.congratsSubtitle}>
          Olet saanut {correctAnswersCount} oikeaa vastausta!
        </Text>
        <Text style={styles.congratsMessage}>
          Hienoa työtä! Olet suorittanut {requiredAnswers} harjoitusta ja voit nyt siirtyä seuraavaan settiin.
        </Text>
        {currentSetId < 3 && (
          <Text style={styles.nextSetInfo}>
            Seuraavaksi: Setti {currentSetId + 2} - {setNames[currentSetId + 1]}
          </Text>
        )}
      </View>
      
      <View style={styles.congratsButtons}>
        <TouchableOpacity 
          style={styles.replayButton} 
          onPress={onReplay}
        >
          <Text style={styles.replayButtonText}>🔄 Pelaa uudelleen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.nextSetButton} 
          onPress={onNextSet}
        >
          <Text style={styles.nextSetButtonText}>➡️ Seuraava setti</Text>
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
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 16,
  },
  congratsSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  congratsMessage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  nextSetInfo: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4caf50',
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
    backgroundColor: '#2196f3',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextSetButton: {
    backgroundColor: '#4caf50',
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
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});