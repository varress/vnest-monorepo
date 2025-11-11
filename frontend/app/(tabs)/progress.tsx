import { useDatabaseWordData } from '@/hooks/useDatabaseWordData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { isDesktop, responsiveFontSize, spacing } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Set {
  id: number;
  name: string;
}

export default function ProgressScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const { setCurrentSet } = useDatabaseWordData();
  const [selectedSet, setSelectedSet] = useState<number | null>(null);

  // Finnish verb exercise sets - 4 themed categories with emojis for better recognition
  const sets: Set[] = [
    { id: 0, name: "🍽️ Ruoka ja juoma" }, 
    { id: 1, name: "🚗 Liikenne ja liikunta" }, 
    { id: 2, name: "📚 Opiskelu ja työ" }, 
    { id: 3, name: "🎨 Vapaa-aika ja harrastukset" }, 
  ];

  const handleSetSelect = async (setId: number) => {
    try {
      console.log('Progress screen: Selecting set', setId);
      // Set the selected set as current in the database service
      await setCurrentSet(setId);
      setSelectedSet(setId);
      console.log('Progress screen: Successfully selected set', setId);
    } catch (error) {
      console.error('Error selecting set:', error);
    }
  };

  const handlePlaySet = () => {
    if (selectedSet !== null) {
      console.log('Progress screen: Navigating to play with set', selectedSet);
      router.push('/play');
    }
  };

  const containerStyle = layout.isMobile ? styles.mobileContainer : styles.container;
  const setsContainerStyle = layout.isMobile ? styles.mobileSetsContainer : styles.setsContainer;

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { fontSize: isDesktop() ? 32 : responsiveFontSize(layout.isMobile ? 32 : 40) }]}>
        Valitse harjoitussetti
      </Text>
      <Text style={[styles.subtitle, { fontSize: isDesktop() ? 18 : responsiveFontSize(layout.isMobile ? 18 : 22) }]}>
        💡 Napauta settiä aloittaaksesi
      </Text>
      
      <View style={setsContainerStyle}>
        {sets.map((set) => (
          <TouchableOpacity
            key={set.id}
            style={[
              layout.isMobile ? styles.mobileSetCard : styles.setCard,
              selectedSet === set.id && styles.selectedSet
            ]}
            onPress={() => handleSetSelect(set.id)}
            activeOpacity={0.7}
            accessibilityLabel={`Setti ${set.id + 1}: ${set.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedSet === set.id }}
          >
            <View style={styles.setNumberContainer}>
              <Text style={[
                styles.setNumber,
                { fontSize: isDesktop() ? 36 : responsiveFontSize(layout.isMobile ? 36 : 52) },
                selectedSet === set.id && styles.selectedSetText
              ]}>
                {set.id + 1}
              </Text>
            </View>
            
            <View style={styles.setNameContainer}>
              <Text style={[
                styles.setName,
                { fontSize: isDesktop() ? 20 : responsiveFontSize(layout.isMobile ? 20 : 26) },
                selectedSet === set.id && styles.selectedSetText
              ]}>
                {set.name}
              </Text>
              
              
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSet !== null && (
        <TouchableOpacity 
          style={[
            styles.playButton,
            layout.isMobile && styles.mobilePlayButton
          ]} 
          onPress={handlePlaySet}
          accessibilityLabel={`Aloita Setti ${selectedSet + 1}`}
          accessibilityRole="button"
          accessibilityHint="Napauta aloittaaksesi valitun setin harjoitukset"
        >
          <Text style={[
            styles.playButtonText,
            { fontSize: isDesktop() ? 22 : responsiveFontSize(layout.isMobile ? 22 : 26) }
          ]}>
            ▶️ Aloita harjoitus
          </Text>
        </TouchableOpacity>
      )}
      
      {selectedSet === null && (
        <View style={styles.instructionContainer}>
          <Text style={[
            styles.instructionText,
            { fontSize: isDesktop() ? 18 : responsiveFontSize(layout.isMobile ? 18 : 22) }
          ]}>
            👆 Valitse setti ylhäältä
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  setsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  mobileSetsContainer: {
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  setCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 28,
    marginVertical: 14,
    borderWidth: 3,
    borderColor: '#dee2e6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    minHeight: 100,
  },
  mobileSetCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: spacing.xl,
    marginVertical: spacing.md,
    borderWidth: 3,
    borderColor: '#dee2e6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    minHeight: 110,
  },
  selectedSet: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 4,
    transform: [{ scale: 1.03 }],
    elevation: 6,
    shadowOpacity: 0.3,
  },
  setNumberContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  setNumber: {
    fontWeight: 'bold',
    color: '#2196f3',
  },
  setNameContainer: {
    flex: 1,
  },
  setName: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressIndicator: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  progressDotComplete: {
    backgroundColor: '#4caf50',
    borderColor: '#2e7d32',
  },
  selectedSetText: {
    color: '#2196f3',
  },
  playButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mobilePlayButton: {
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    elevation: 4,
    shadowOpacity: 0.25,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  instructionContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
  },
  instructionText: {
    color: '#888',
    textAlign: 'center',
  },
});