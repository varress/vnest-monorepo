import { Agent, Patient, Verb } from '@/database/schemas';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { isDesktop, responsiveFontSize, spacing } from '@/utils/responsive';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameCard } from './GameCard';
import { Colors } from '@/constants/colors';

interface FeedbackViewProps {
  feedback: string;
  currentVerbIndex: number;
  totalVerbs: number;
  selectedSubject: Agent | null;
  selectedObject: Patient | null;
  currentVerb: Verb | null;
  correctAnswersCount: number;
  requiredAnswers: number;
  onContinue: () => void;
  onReset: () => void;
}

export function FeedbackView({
  feedback,
  currentVerbIndex,
  totalVerbs,
  selectedSubject,
  selectedObject,
  currentVerb,
  correctAnswersCount,
  requiredAnswers,
  onContinue,
  onReset
}: FeedbackViewProps) {
  const layout = useResponsiveLayout();
  const isCorrect = feedback.includes('✅');
  
  // Animation for feedback
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Reset and animate when feedback changes
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [feedback, fadeAnim, scaleAnim]);

  if (layout.isMobile) {
    return (
      <ScrollView style={styles.mobileContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}>
          <View style={[
            styles.feedbackBanner,
            isCorrect ? styles.correctBanner : styles.incorrectBanner
          ]}>
            <Text style={[
              styles.title, 
              styles.bannerText,
              { fontSize: isDesktop() ? 20 : responsiveFontSize(28) }
            ]}>
              {feedback}
            </Text>
          </View>
        </Animated.View>
        
        {/* Progress tracking */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Oikeat vastaukset: {correctAnswersCount} / {requiredAnswers}
          </Text>
          <View style={styles.progressBarContainer}>
            {[...Array(requiredAnswers)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index < correctAnswersCount && styles.progressDotFilled
                ]}
              />
            ))}
          </View>
        </View>
        
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
            onPress={onContinue}
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
      <Animated.View style={{ 
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}>
        <View style={[
          styles.feedbackBanner,
          isCorrect ? styles.correctBanner : styles.incorrectBanner
        ]}>
          <Text style={[
            styles.title,
            styles.bannerText,
            { fontSize: isDesktop() ? 24 : responsiveFontSize(40) }
          ]}>
            {feedback}
          </Text>
        </View>
      </Animated.View>
      
      {/* Progress tracking */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Oikeat vastaukset: {correctAnswersCount} / {requiredAnswers}
        </Text>
        <View style={styles.progressBarContainer}>
          {[...Array(requiredAnswers)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index < correctAnswersCount && styles.progressDotFilled
              ]}
            />
          ))}
        </View>
      </View>
      
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
        <TouchableOpacity style={styles.nextButton} onPress={onContinue}>
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
  feedbackBanner: {
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  correctBanner: {
    backgroundColor: Colors.success,
  },
  incorrectBanner: {
    backgroundColor: Colors.error,
  },
  bannerText: {
    color: Colors.buttonText,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  title: { 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center',
    color: Colors.text,
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
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 40,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resetButton: {
    backgroundColor: Colors.error,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginHorizontal: 40,
    elevation: 3,
    shadowColor: Colors.shadow,
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
    color: Colors.buttonText, 
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  progressText: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  progressDotFilled: {
    backgroundColor: Colors.success,
    borderColor: Colors.successDark,
  },
});