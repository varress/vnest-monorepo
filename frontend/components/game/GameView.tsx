import { Agent, Patient, Verb } from '@/database/schemas';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useCardConnections } from '@/hooks/useCardConnections';
import { isDesktop, responsiveFontSize, spacing } from '@/utils/responsive';
import { ScrollView, StyleSheet, Text, View, LayoutRectangle } from 'react-native';
import { GameCard } from './GameCard';
import { SVGConnectionLine } from './SVGConnectionLine';
import { useRef, useEffect } from 'react';

interface GameViewProps {
  subjects: Agent[];
  objects: Patient[];
  currentVerb: Verb | null;
  selectedSubject: Agent | null;
  selectedObject: Patient | null;
  onSelect: (word: Agent | Patient) => void;
}

export function GameView({ 
  subjects, 
  objects, 
  currentVerb, 
  selectedSubject, 
  selectedObject, 
  onSelect 
}: GameViewProps) {
  const layout = useResponsiveLayout();
  const containerRef = useRef<View>(null);
  
  // Use the connection lines hook
  const {
    registerCardPosition,
    createConnection,
    removeConnection,
    clearConnections,
    connections
  } = useCardConnections();

  // Handle card layout updates
  const handleCardLayout = (cardId: string | number, layout: LayoutRectangle) => {
    registerCardPosition(cardId, layout);
  };

  // Create connections when cards are selected
  useEffect(() => {
    if (selectedSubject && currentVerb) {
      createConnection(`subject-${selectedSubject.id}`, 'verb');
    } else {
      removeConnection('verb');
    }
  }, [selectedSubject, currentVerb, createConnection, removeConnection]);

  useEffect(() => {
    if (selectedObject && currentVerb) {
      createConnection('verb', `object-${selectedObject.id}`);
    }
  }, [selectedObject, currentVerb, createConnection]);

  // Clear connections when component unmounts or selections reset
  useEffect(() => {
    return () => clearConnections();
  }, [clearConnections]);
  
  if (layout.isMobile) {
    // Mobile layout: vertical stacking
    return (
      <ScrollView style={styles.mobileContainer} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { fontSize: isDesktop() ? 24 : responsiveFontSize(32) }]}>
          Yhdistä kortit
        </Text>
        
        <View style={styles.instructionBox}>
          <Text style={[styles.instructionText, { fontSize: responsiveFontSize(16) }]}>
            💡 Valitse ensin <Text style={styles.boldText}>Kuka</Text>, sitten <Text style={styles.boldText}>Mitä</Text>
          </Text>
        </View>
        
        <Text style={[styles.mobileSentence, { fontSize: isDesktop() ? 16 : responsiveFontSize(18) }]}>
          {selectedSubject?.value || '[Kuka]'} {currentVerb?.value.toLowerCase() || '[verb]'} {selectedObject?.value.toLowerCase() || '[mitä]'}
        </Text>

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
            {subjects.map((subject) => (
              <GameCard
                key={subject.id}
                text={subject.value}
                isSelected={selectedSubject?.id === subject.id}
                onPress={() => onSelect(subject)}
                style={styles.mobileCard}
              />
            ))}
          </View>
        </View>

        {/* Object Section */}
        <View style={styles.mobileSection}>
          <Text style={[styles.sectionTitle, { fontSize: isDesktop() ? 18 : responsiveFontSize(20) }]}>
            Mitä?
          </Text>
          <View style={styles.mobileCardGrid}>
            {objects.map((object) => (
              <GameCard
                key={object.id}
                text={object.value}
                isSelected={selectedObject?.id === object.id}
                onPress={() => onSelect(object)}
                style={styles.mobileCard}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  // Tablet/Desktop layout: horizontal columns
  return (
    <View ref={containerRef} style={styles.desktopContainer}>
      <Text style={[styles.title, { fontSize: layout.isDesktop ? 24 : responsiveFontSize(40) }]}>
        Yhdistä kortit
      </Text>
      
      <View style={styles.instructionBox}>
        <Text style={[styles.instructionText, { fontSize: layout.isDesktop ? 16 : responsiveFontSize(18) }]}>
          💡 Valitse <Text style={styles.boldText}>Kuka</Text> ja <Text style={styles.boldText}>Mitä</Text> muodostaaksesi oikean lauseen
        </Text>
      </View>
      
      <View style={styles.row}>
        <View style={styles.cardColumn}>
          <Text style={[styles.sectionTitle, { fontSize: layout.isDesktop ? 18 : responsiveFontSize(24) }]}>
            Kuka?
          </Text>
          {subjects.map((subject) => (
            <GameCard
              key={subject.id}
              cardId={`subject-${subject.id}`}
              parentRef={containerRef}
              onLayout={handleCardLayout}
              text={subject.value}
              isSelected={selectedSubject?.id === subject.id}
              onPress={() => onSelect(subject)}
            />
          ))}
        </View>

        <View style={styles.centerColumn}>
          <Text style={[styles.sectionTitle, { fontSize: layout.isDesktop ? 14 : responsiveFontSize(20) }]}>
            {selectedSubject?.value || '[Kuka]'} {currentVerb?.value.toLowerCase() || '[verb]'} {selectedObject?.value.toLowerCase() || '[mitä]'}
          </Text>
          <GameCard 
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
          {objects.map((object) => (
            <GameCard
              key={object.id}
              cardId={`object-${object.id}`}
              parentRef={containerRef}
              onLayout={handleCardLayout}
              text={object.value}
              isSelected={selectedObject?.id === object.id}
              onPress={() => onSelect(object)}
            />
          ))}
        </View>
      </View>

      {/* Render connection lines */}
      {connections.map((connection, index) => (
        <SVGConnectionLine
          key={`${connection.startCardId}-${connection.endCardId}-${index}`}
          fromPosition={connection.startPosition}
          toPosition={connection.endPosition}
          color="#4CAF50"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop/Tablet styles
  desktopContainer: {
    flex: 1,
    position: 'relative',
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
  sectionTitle: { 
    fontWeight: '600', 
    marginBottom: 20, 
    textAlign: 'center',
    color: '#555',
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
  mobileSentence: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingVertical: spacing.md,
    borderRadius: 12,
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
    backgroundColor: '#e3f2fd',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  instructionText: {
    color: '#1565c0',
    textAlign: 'center',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#0d47a1',
  },
});