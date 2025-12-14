/**
 * Main Exercise Screen for VN-EST App
 * 
 * This screen handles the core gameplay where users learn Finnish sentence structure
 * by combining subjects (agents), verbs, and objects (patients) to form correct sentences.
 * 
 * Features:
 * - Interactive card-based sentence building
 * - Real-time feedback on combinations
 * - Responsive design for mobile and desktop
 * - Set progression and completion handling
 * 
 * Game Flow:
 * 1. Display current verb and available subject/object cards (in a selected set)
 * 2. User selects subject and object cards
 * 3. System validates the combination
 * 4. Provide immediate feedback (correct/incorrect)
 * 5. Progress to next combination or next set
 */

import {
  CongratsView,
  ErrorView,
  GameHeader,
  GameView,
  LoadingView
} from '@/components/game';
import { Colors, getThemedColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Agent, Patient, Verb } from '@/database/schemas';
import { useDatabaseWordData } from '@/hooks/useDatabaseWordData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { avpService } from '@/services/avpService';
import { getSafeAreaConfig, spacing } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function PlayScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const safeArea = getSafeAreaConfig();
  const { isDarkMode, highContrast } = useTheme();
  const colors = getThemedColors(isDarkMode, highContrast);
  
  // Database integration hook - manages language data and validation
  const { 
    wordData, 
    isLoading, 
    error, 
    refreshData,
    nextVerb,
    setCurrentSet
  } = useDatabaseWordData();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctPairs, setCorrectPairs] = useState<Array<{ subjectId: number; objectId: number }>>([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [currentSetId, setCurrentSetId] = useState<number>(0);
  const [completedVerbsCount, setCompletedVerbsCount] = useState<number>(0);

  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [subjects, setSubjects] = useState<Agent[]>([]);
  const [objects, setObjects] = useState<Patient[]>([]);

  // Refresh data when screen comes into focus to get the latest set from database
  useEffect(() => {
    console.log('PlayScreen mounted - refreshing data');
    refreshData();
  }, [refreshData]);

  // Initialize data on component mount and sync currentSetId with the actual current set
  useEffect(() => {
    if (wordData && wordData.currentVerb) {
      console.log('Updating local state with wordData - verb:', wordData.currentVerb.value, 'groupId:', wordData.currentVerb.groupId);
      setVerbs([wordData.currentVerb]);
      setSubjects(wordData.subjects);
      setObjects(wordData.objects);
      // Sync currentSetId with the actual group ID from the loaded verb
      if (wordData.currentVerb.groupId !== undefined) {
        setCurrentSetId(wordData.currentVerb.groupId);
      }
    }
  }, [wordData]);

  // Reset correct pairs when verb changes
  useEffect(() => {
    setCorrectPairs([]);
    setFeedback(null);
  }, [verbs[0]?.id]);



  const handleSkipVerb = async () => {
    try {
      const hasNextVerb = await nextVerb();
      if (hasNextVerb) {
        setCorrectPairs([]);
        setFeedback(null);
      } else {
        // No more verbs in set, show congrats
        setShowCongrats(true);
      }
    } catch (error) {
      console.error('Error skipping verb:', error);
    }
  };

  // Connect subject-object pair
  const handleConnect = async (subject: Agent, object: Patient) => {
    if (!verbs[0]) return;
    const isCorrect = await avpService.isCorrectCombination(subject, verbs[0], object);
    if (isCorrect) {
      const newCorrectPairs = [...correctPairs, { subjectId: subject.id, objectId: object.id }];
      setCorrectPairs(newCorrectPairs);
      setFeedback('Oikein!');
      
      // Check if all pairs for this verb are connected
      const expectedPairs = wordData?.pairings?.length || 0;
      const allPairsConnected = expectedPairs === newCorrectPairs.length;
      
      if (allPairsConnected) {
        // Increment completed verbs count
        const newCompletedCount = completedVerbsCount + 1;
        setCompletedVerbsCount(newCompletedCount);
        
        // Move to next verb or show congrats after short delay
        setTimeout(async () => {
          try {
            // Try to move to next verb
            const hasNextVerb = await nextVerb();
            if (hasNextVerb) {
              // Successfully moved to next verb
              setCorrectPairs([]);
              setFeedback(null);
            } else {
              // No more verbs in set, show congrats
              setShowCongrats(true);
            }
          } catch (error) {
            console.error('Error moving to next verb:', error);
            // If error occurs, show congrats as fallback
            setShowCongrats(true);
          }
        }, 1500);
      } else {
        // Clear feedback after delay
        setTimeout(() => setFeedback(null), 1500);
      }
    } else {
      setFeedback('Väärin!');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleReplay = async () => {
    setCorrectPairs([]);
    setFeedback(null);
    setShowCongrats(false);
    setCompletedVerbsCount(0);
    // Reset to first verb in the set
    await setCurrentSet(currentSetId);
  };

  const handleNextSet = async () => {
    try {
      const nextSetId = currentSetId + 1;
      
      // We have 4 sets (0-3)
      if (nextSetId <= 3) {
        // Clear current state immediately to prevent showing old verb
        setVerbs([]);
        setSubjects([]);
        setObjects([]);
        setCorrectPairs([]);
        setFeedback(null);
        setShowCongrats(false);
        setCompletedVerbsCount(0);
        
        // Update set and refresh data
        await setCurrentSet(nextSetId);
        setCurrentSetId(nextSetId);
        await refreshData();
      } else {
        // No more sets, go back to level select screen
        router.push('/levelselect');
      }
    } catch (error) {
      console.error('Error going to next set:', error);
    }
  };

  // Early return for loading or error states after all hooks are called
  if (isLoading) {
    return (
      <>
        <GameHeader />
        <LoadingView />
      </>
    );
  }

  if (error || !wordData) {
    return (
      <>
        <GameHeader />
        <ErrorView 
          error={error}
          onRetry={refreshData}
          onForceReload={refreshData}
        />
      </>
    );
  }

  const currentVerb = verbs[0];

  return (
    <>
      <GameHeader />
      <View style={[
        styles.container,
        { backgroundColor: colors.background },
        layout.isMobile && styles.mobileContainer,
        {
          paddingTop: safeArea.paddingTop,
          paddingBottom: safeArea.paddingBottom,
        }
      ]}>
        {showCongrats ? (
          <CongratsView
            currentSetId={currentSetId}
            verbCount={wordData?.verbs.length}
            correctAnswersCount={completedVerbsCount}
            requiredAnswers={wordData?.verbs.length || 0}
            onReplay={handleReplay}
            onNextSet={handleNextSet}
          />
        ) : (
          <GameView
            subjects={subjects}
            objects={objects}
            currentVerb={currentVerb}
            correctPairs={correctPairs}
            onConnect={handleConnect}
            feedback={feedback}
            onNextVerb={handleSkipVerb}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: spacing.lg,
  },
  mobileContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
