import { Agent, Patient, Verb } from '@/database/schemas';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { isDesktop, responsiveFontSize, spacing } from '@/utils/responsive';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameCard } from './GameCard';
import { ProgressBar } from './ProgressBar';

interface FeedbackViewProps {
  feedback: string;
  currentVerbIndex: number;
  totalVerbs: number;
  selectedSubject: Agent | null;
  selectedObject: Patient | null;
  currentVerb: Verb | null;
  onNext: () => void;
  onReset: () => void;
}

export function FeedbackView({
  feedback,
  currentVerbIndex,
  totalVerbs,
  selectedSubject,
  selectedObject,
  currentVerb,
  onNext,
  onReset
}: FeedbackViewProps) {
  const layout = useResponsiveLayout();
  const isCorrect = feedback.includes('✅');

  if (layout.isMobile) {
    return (
      <ScrollView style={styles.mobileContainer} showsVerticalScrollIndicator={false}>
        <Text style={[
          styles.title, 
          { fontSize: isDesktop() ? 20 : responsiveFontSize(28) }
        ]}>
          {feedback}
        </Text>
        
        <ProgressBar 
          current={currentVerbIndex + 1}
          total={totalVerbs}
        />

        {/* Chosen cards displayed */}
        <View style={styles.mobileRow}>
          <View style={styles.cardColumn}>
            <GameCard text={selectedSubject?.value || ''} />
          </View>

          <View style={styles.cardColumn}>
            <GameCard text={currentVerb?.value ?? ""} />
          </View>

          <View style={styles.cardColumn}>
            <GameCard text={selectedObject?.value || ''} />
          </View>
        </View>

        {isCorrect ? (
          <TouchableOpacity 
            style={[styles.nextButton, styles.mobileButton]} 
            onPress={onNext}
          >
            <Text style={[styles.buttonText, { fontSize: isDesktop() ? 16 : responsiveFontSize(18) }]}>
              Jatka
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.resetButton, styles.mobileButton]} 
            onPress={onReset}
          >
            <Text style={[styles.buttonText, { fontSize: isDesktop() ? 16 : responsiveFontSize(18) }]}>
              Yritä uudelleen
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  // Desktop/tablet layout
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: isDesktop() ? 24 : responsiveFontSize(40) }]}>
        {feedback}
      </Text>
      
      <ProgressBar 
        current={currentVerbIndex + 1}
        total={totalVerbs}
      />

      {/* Chosen cards displayed */}
      <View style={styles.row}>
        <View style={styles.cardColumn}>
          <GameCard text={selectedSubject?.value || ''} />
        </View>

        <View style={styles.cardColumn}>
          <GameCard text={currentVerb?.value ?? ""} />
        </View>

        <View style={styles.cardColumn}>
          <GameCard text={selectedObject?.value || ''} />
        </View>
      </View>

      {isCorrect ? (
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={[styles.buttonText, { fontSize: isDesktop() ? 18 : responsiveFontSize(22) }]}>
            Jatka
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={[styles.buttonText, { fontSize: isDesktop() ? 18 : responsiveFontSize(22) }]}>
            Yritä uudelleen
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mobileContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  title: { 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center',
    color: '#333',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 8,
    paddingHorizontal: spacing.md,
  },
  mobileRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  cardColumn: { 
    flex: 1, 
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  nextButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resetButton: {
    backgroundColor: '#f44336',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mobileButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
  },
  buttonText: { 
    color: '#fff', 
    textAlign: 'center',
    fontWeight: 'bold',
  },
});