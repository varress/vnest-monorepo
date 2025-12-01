import { Agent, Patient, Verb } from '@/database/schemas';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useCardConnections } from '@/hooks/useCardConnections';
import { isDesktop, responsiveFontSize, spacing } from '@/utils/responsive';
import { ScrollView, StyleSheet, Text, View, LayoutRectangle, TouchableOpacity } from 'react-native';
import { GameCard } from './GameCard';
import { SVGConnectionLine } from './SVGConnectionLine';
import { useRef, useEffect, useState } from 'react';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface GameViewProps {
  subjects: Agent[];
  objects: Patient[];
  currentVerb: Verb | null;
  correctPairs: Array<{ subjectId: number; objectId: number }>;
  onConnect: (subject: Agent, object: Patient) => void;
  feedback: string | null;
  onPreviousVerb?: () => void;
  onNextVerb?: () => void;
}

export function GameView({ 
  subjects, 
  objects, 
  currentVerb, 
  correctPairs,
  onConnect,
  feedback,
  onPreviousVerb,
  onNextVerb
}: GameViewProps) {
  const layout = useResponsiveLayout();
  const containerRef = useRef<View>(null);
  const [selectedSubject, setSelectedSubject] = useState<Agent | null>(null);
  const [selectedObject, setSelectedObject] = useState<Patient | null>(null);
  const [forceRemeasure, setForceRemeasure] = useState(0);
  
  // Use the connection lines hook
  const {
    registerCardPosition,
    createConnection,
    clearConnections,
    connections
  } = useCardConnections();

  // Re-measure all cards when screen dimensions change
  useEffect(() => {
    // Use requestAnimationFrame for synchronous layout updates
    const handle = requestAnimationFrame(() => {
      setForceRemeasure(prev => prev + 1);
    });
    return () => cancelAnimationFrame(handle);
  }, [layout.screenWidth, layout.screenHeight]);

  // Handle card layout updates
  const handleCardLayout = (cardId: string | number, layout: LayoutRectangle) => {
    registerCardPosition(cardId, layout);
  };

  // Create connections for correct pairs AND temporary selections
  useEffect(() => {
    // Clear all connections first
    clearConnections();
    
    // Recreate all correct pair connections
    correctPairs.forEach(pair => {
      createConnection(`subject-${pair.subjectId}`, 'verb');
      createConnection('verb', `object-${pair.objectId}`);
    });

    // Add temporary connections for currently selected cards (if not already in correct pairs)
    if (selectedSubject && currentVerb) {
      const isSubjectInCorrectPair = correctPairs.some(pair => pair.subjectId === selectedSubject.id);
      if (!isSubjectInCorrectPair) {
        setTimeout(() => {
          createConnection(`subject-${selectedSubject.id}`, 'verb');
        }, 50);
      }
    }
    
    if (selectedObject && currentVerb) {
      const isObjectInCorrectPair = correctPairs.some(pair => pair.objectId === selectedObject.id);
      if (!isObjectInCorrectPair) {
        setTimeout(() => {
          createConnection('verb', `object-${selectedObject.id}`);
        }, 50);
      }
    }
  }, [selectedSubject, selectedObject, currentVerb, correctPairs, createConnection, clearConnections]);

  // Clear selections based on feedback
  useEffect(() => {
    if (feedback === 'Väärin!') {
      // Clear selections quickly after showing incorrect feedback
      const timer = setTimeout(() => {
        setSelectedSubject(null);
        setSelectedObject(null);
      }, 1200);
      return () => clearTimeout(timer);
    } else if (feedback === 'Oikein!') {
      // Clear selections after showing correct feedback
      const timer = setTimeout(() => {
        setSelectedSubject(null);
        setSelectedObject(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Clear selections when verb changes (new verb loaded after completing all pairs)
  useEffect(() => {
    setSelectedSubject(null);
    setSelectedObject(null);
  }, [currentVerb?.id]);

  // Handle card selection
  const handleCardSelect = (card: Agent | Patient) => {
    // Check if card is already in a correct pair
    const isInCorrectPair = correctPairs.some(
      pair => pair.subjectId === card.id || pair.objectId === card.id
    );
    
    if (isInCorrectPair) {
      return; // Don't allow selecting already connected cards
    }

    if (card.type === 'Agent') {
      if (selectedSubject?.id === card.id) {
        setSelectedSubject(null); // Deselect if clicking same card
      } else {
        setSelectedSubject(card);
        // If object is already selected, connect them
        if (selectedObject) {
          onConnect(card, selectedObject);
          // Clearing handled by feedback useEffect
        }
      }
    } else if (card.type === 'Patient') {
      if (selectedObject?.id === card.id) {
        setSelectedObject(null); // Deselect if clicking same card
      } else {
        setSelectedObject(card);
        // If subject is already selected, connect them
        if (selectedSubject) {
          onConnect(selectedSubject, card);
          // Clearing handled by feedback useEffect
        }
      }
    }
  };
  
  if (layout.isMobile) {
    // Mobile layout: show all cards, allow connecting pairs
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.mobileContainer} showsVerticalScrollIndicator={false}>
          {/* Title with Navigation Buttons */}
          <View style={styles.titleRow}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={onPreviousVerb}
              disabled={!onPreviousVerb}
            >
              <Ionicons name="arrow-back" size={24} color={onPreviousVerb ? Colors.primary : Colors.textLight} />
            </TouchableOpacity>
            
            <Text style={[styles.title, { fontSize: isDesktop() ? 24 : responsiveFontSize(32) }]}>
              {selectedSubject?.value || '[Kuka]'} {currentVerb?.value?.toLowerCase() || '[verb]'} {selectedObject?.value?.toLowerCase() || '[mitä]'}
            </Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={onNextVerb}
              disabled={!onNextVerb}
            >
              <Ionicons name="arrow-forward" size={24} color={onNextVerb ? Colors.primary : Colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Instruction */}
          <View style={styles.instructionBox}>
            <Text style={[styles.instructionText, { fontSize: responsiveFontSize(16) }]}>
              💡 Yhdistä oikeat parit verbille <Text style={styles.boldText}>{currentVerb?.value}</Text>
            </Text>
          </View>

        {/* Verb Card */}
        <View style={styles.mobileVerbSection}>
          <GameCard 
            text={currentVerb?.value ?? ""}
            variant="verb"
          />
        </View>

        {/* Subject Section */}
        <View style={styles.mobileSection}>
          <Text style={[styles.sectionTitle, { fontSize: isDesktop() ? 18 : responsiveFontSize(20) }]}>
            Kuka?
          </Text>
          <View style={styles.mobileCardGrid}>
            {subjects.map((subject) => {
              const isInCorrectPair = correctPairs.some(pair => pair.subjectId === subject.id);
              const isCurrentlySelected = selectedSubject?.id === subject.id;
              return (
                <GameCard
                  key={subject.id}
                  text={subject.value}
                  isSelected={isInCorrectPair || isCurrentlySelected}
                  onPress={() => handleCardSelect(subject)}
                  style={styles.mobileCard}
                />
              );
            })}
          </View>
        </View>

        {/* Object Section */}
        <View style={styles.mobileSection}>
          <Text style={[styles.sectionTitle, { fontSize: isDesktop() ? 18 : responsiveFontSize(20) }]}>
            Mitä?
          </Text>
          <View style={styles.mobileCardGrid}>
            {objects.map((object) => {
              const isInCorrectPair = correctPairs.some(pair => pair.objectId === object.id);
              const isCurrentlySelected = selectedObject?.id === object.id;
              return (
                <GameCard
                  key={object.id}
                  text={object.value}
                  isSelected={isInCorrectPair || isCurrentlySelected}
                  onPress={() => handleCardSelect(object)}
                  style={styles.mobileCard}
                />
              );
            })}
          </View>
        </View>
        </ScrollView>
        
        {/* Centered Overlay Toast */}
        {feedback && (
          <View style={styles.overlayContainer}>
            <View style={[styles.centeredToast, feedback === 'Oikein!' ? styles.toastCorrect : styles.toastIncorrect]}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Tablet/Desktop layout: show all cards, allow connecting pairs
  return (
    <View ref={containerRef} style={styles.desktopContainer}>
      {/* Title with Navigation Buttons */}
      <View style={styles.titleRow}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={onPreviousVerb}
          disabled={!onPreviousVerb}
        >
          <Ionicons name="arrow-back" size={28} color={onPreviousVerb ? Colors.primary : Colors.textLight} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { fontSize: layout.isDesktop ? 24 : responsiveFontSize(40) }]}>
          {selectedSubject?.value || '[Kuka]'} {currentVerb?.value?.toLowerCase() || '[verb]'} {selectedObject?.value?.toLowerCase() || '[mitä]'}
        </Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={onNextVerb}
          disabled={!onNextVerb}
        >
          <Ionicons name="arrow-forward" size={28} color={onNextVerb ? Colors.primary : Colors.textLight} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.instructionBox}>
        <Text style={[styles.instructionText, { fontSize: layout.isDesktop ? 16 : responsiveFontSize(18) }]}>
          💡 Yhdistä oikeat parit verbille <Text style={styles.boldText}>{currentVerb?.value}</Text>
        </Text>
      </View>
      
      <View style={styles.row}>
        <View style={styles.cardColumn}>
          <Text style={[styles.sectionTitle, { fontSize: layout.isDesktop ? 18 : responsiveFontSize(24) }]}>
            Kuka?
          </Text>
          {subjects.map((subject) => {
            const isInCorrectPair = correctPairs.some(pair => pair.subjectId === subject.id);
            const isCurrentlySelected = selectedSubject?.id === subject.id;
            return (
              <GameCard
                key={`${subject.id}-${forceRemeasure}`}
                cardId={`subject-${subject.id}`}
                parentRef={containerRef}
                onLayout={handleCardLayout}
                text={subject.value}
                isSelected={isInCorrectPair || isCurrentlySelected}
                onPress={() => handleCardSelect(subject)}
              />
            );
          })}
        </View>

        <View style={styles.centerColumn}>
          <GameCard 
            key={`verb-${forceRemeasure}`}
            cardId="verb"
            parentRef={containerRef}
            onLayout={handleCardLayout}
            text={currentVerb?.value ?? ""}
            variant="verb"
          />
        </View>

        <View style={styles.cardColumn}>
          <Text style={[styles.sectionTitle, { fontSize: layout.isDesktop ? 18 : responsiveFontSize(24) }]}>
            Mitä?
          </Text>
          {objects.map((object) => {
            const isInCorrectPair = correctPairs.some(pair => pair.objectId === object.id);
            const isCurrentlySelected = selectedObject?.id === object.id;
            return (
              <GameCard
                key={`${object.id}-${forceRemeasure}`}
                cardId={`object-${object.id}`}
                parentRef={containerRef}
                onLayout={handleCardLayout}
                text={object.value}
                isSelected={isInCorrectPair || isCurrentlySelected}
                onPress={() => handleCardSelect(object)}
              />
            );
          })}
        </View>
      </View>

      {/* Render connection lines for correct pairs only */}
      {connections.map((connection, index) => {
        // Assign distinct color to each pair
        const pairIndex = Math.floor(index / 2); // Each pair has 2 connections (subject->verb, verb->object)
        const colorIndex = pairIndex % Colors.connectionLineColors.length;
        const lineColor = Colors.connectionLineColors[colorIndex];
        
        return (
          <SVGConnectionLine
            key={`${connection.startCardId}-${connection.endCardId}-${index}`}
            fromPosition={connection.startPosition}
            toPosition={connection.endPosition}
            color={lineColor}
          />
        );
      })}
      
      {/* Centered Overlay Toast */}
      {feedback && (
        <View style={styles.overlayContainer}>
          <View style={[styles.centeredToast, feedback === 'Oikein!' ? styles.toastCorrect : styles.toastIncorrect]}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop/Tablet styles
  desktopContainer: {
    flex: 1,
    position: 'relative',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: 20,
  },
  title: { 
    fontWeight: 'bold', 
    flex: 1,
    textAlign: 'center',
    color: Colors.text,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 8,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: { 
    fontWeight: '600', 
    marginBottom: 20, 
    textAlign: 'center',
    color: Colors.textLight,
  },
  cardColumn: { 
    flex: 1, 
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  centerColumn: { 
    flex: 1, 
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  // Mobile styles
  mobileContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  mobileVerbSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  mobileSection: {
    marginBottom: spacing.xl,
  },
  mobileCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  mobileCard: {
    marginBottom: spacing.md,
  },
  instructionBox: {
    backgroundColor: Colors.primaryLight,
    padding: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryDark,
  },
  instructionText: {
    color: Colors.primaryDark,
    textAlign: 'center',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGray,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  centeredToast: {
    padding: 80,
    borderRadius: 20,
    minWidth: 350,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastCorrect: {
    backgroundColor: Colors.success,
  },
  toastIncorrect: {
    backgroundColor: Colors.error,
  },
  feedbackText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    fontSize: 36,
  },
});