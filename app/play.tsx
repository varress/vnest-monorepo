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
  FeedbackView,
  GameHeader,
  GameView,
  LoadingView
} from '@/components/game';
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
  
  // Database integration hook - manages language data and validation
  const { 
    wordData, 
    isLoading, 
    error, 
    refreshData,
    isCorrectCombination,
    nextVerb,
    setCurrentSet
  } = useDatabaseWordData();
  const [currentVerbIndex, setCurrentVerbIndex] = useState(3);
  const [selectedSubject, setSelectedSubject] = useState<Agent | null>(null);
  const [selectedObject, setSelectedObject] = useState<Patient | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [currentSetId, setCurrentSetId] = useState<number>(0);

  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [subjects, setSubjects] = useState<Agent[]>([]);
  const [objects, setObjects] = useState<Patient[]>([]);

  // Initialize data on component mount
  useEffect(() => {
  if (wordData && wordData.currentVerb) {
    console.log('wordData loaded, populating verbs, subjects, objects');
    setVerbs([wordData.currentVerb]);
    setSubjects(wordData.subjects);
    setObjects(wordData.objects);
  }
}, [wordData]);
  useEffect(() => {
    if (wordData && selectedSubject && selectedObject && wordData.currentVerb) {
      const timer = setTimeout(async () => {
        const isCorrect = await avpService.isCorrectCombination(selectedSubject, verbs[0], selectedObject);
        setFeedback(isCorrect ? '✅ Hyvin tehty!' : '❌ Yritä uudelleen');
        
        // If correct, automatically move to next verb after a short delay
        if (isCorrect) {
          setTimeout(async () => {
            await handleCorrectAnswer();
          }, 1500); // Show success message for 1.5 seconds, then move to next verb
        }
      }, 800); // Time delay before showing feedback

      return () => clearTimeout(timer); // Cleanup timer if component unmounts or dependencies change
    }
  }, [selectedSubject, selectedObject, wordData, isCorrectCombination]);

  const handleCorrectAnswer = async () => {
    try {
      // Move to next verb and refresh data
      await nextVerb();
      // Reset selections for the new verb
      setSelectedSubject(null);
      setSelectedObject(null);
      setFeedback(null);
    } catch (error) {
      console.error('Error moving to next verb:', error);
    }
  };

  const handleSelect = (word: Agent | Patient) => {
    if      (word.type === "Agent")  {setSelectedSubject(word);}
    else if (word.type == "Patient") {setSelectedObject(word)}
    else throw new TypeError (`Expects type Agent or Patient, but ${typeof word} was given.`) 
  };

  const handleNext = () => {
    setSelectedSubject(null);
    setSelectedObject(null);
    setFeedback(null);
    if (wordData) {
      const nextIndex = currentVerbIndex + 1;
      if (nextIndex >= wordData.verbs.length) {
        // Set completed! Show congrats view for navigation to next set
        setShowCongrats(true);
      } else {
        setCurrentVerbIndex(nextIndex);
      }
    }
  };

  const handleReset = () => {
    setSelectedSubject(null);
    setSelectedObject(null);
    setFeedback(null);
  };

  const handleReplay = () => {
    setCurrentVerbIndex(0);
    setSelectedSubject(null);
    setSelectedObject(null);
    setFeedback(null);
    setShowCongrats(false);
  };

  const handleNextSet = async () => {
    try {
      const nextSetId = currentSetId + 1;
      
      // For example if we have 6 sets (mapped to verb data in database service)
      if (nextSetId <= 6) {
        await setCurrentSet(nextSetId);
        setCurrentSetId(nextSetId);
        setCurrentVerbIndex(0);
        setSelectedSubject(null);
        setSelectedObject(null);
        setFeedback(null);
        setShowCongrats(false);
        // Refresh data to load new set
        await refreshData();
      } else {
        // No more sets, go back to progress screen
        router.push('/progress');
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
            onReplay={handleReplay}
            onNextSet={handleNextSet}
          />
        ) : !feedback ? (
          <GameView
            subjects={subjects}
            objects={objects}
            currentVerb={currentVerb}
            selectedSubject={selectedSubject}
            selectedObject={selectedObject}
            onSelect={handleSelect}
          />
        ) : (
          <FeedbackView
            feedback={feedback}
            currentVerbIndex={currentVerbIndex}
            totalVerbs={verbs.length}
            selectedSubject={selectedSubject}
            selectedObject={selectedObject}
            currentVerb={currentVerb}
            onNext={handleNext}
            onReset={handleReset}
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
    backgroundColor: '#fff' 
  },
  mobileContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
