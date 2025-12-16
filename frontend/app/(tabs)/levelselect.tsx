import { useDatabaseWordData } from '@/hooks/useDatabaseWordData';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { isDesktop, responsiveFontSize, spacing } from '@/utils/responsive';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, getThemedColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface Set {
  id: number;  // Backend database ID
  name: string;
  displayNumber: number;  // Display number (1, 2, 3)
}

export default function LevelSelectScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const { setCurrentSet } = useDatabaseWordData();
  const { isDarkMode, highContrast } = useTheme();
  const colors = getThemedColors(isDarkMode, highContrast);
  const [selectedSet, setSelectedSet] = useState<number | null>(null);

  // Finnish verb exercise sets - now 3 sets - hardcoded for simplicity
  // Note: Group IDs match the backend WordGroup database IDs
  // Backend has groupId: 2 (name "1"), groupId: 3 (name "2"), groupId: 4 (name "3")
  const sets: Set[] = [
    { id: 2, name: "Taso 1", displayNumber: 1 },
    { id: 3, name: "Taso 2", displayNumber: 2 },
    { id: 4, name: "Taso 3", displayNumber: 3 },
  ];

  const handleSetSelect = async (setId: number) => {
    try {
      console.log('Level select screen: Selecting set', setId);
      // Set the selected set as current in the database service
      await setCurrentSet(setId);
      setSelectedSet(setId);
      console.log('Level select screen: Successfully selected set', setId);
    } catch (error) {
      console.error('Error selecting set:', error);
    }
  };

  const handlePlaySet = () => {
    if (selectedSet !== null) {
      console.log('Level select screen: Navigating to play with set', selectedSet);
      // Just navigate - the set was already loaded by handleSetSelect
      router.push('/play');
    }
  };

  const containerStyle = layout.isMobile ? styles.mobileContainer : styles.container;
  const setsContainerStyle = layout.isMobile ? styles.mobileSetsContainer : styles.setsContainer;

  return (
    <ScrollView style={[containerStyle, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: colors.backgroundGray }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edistyminen</Text>
      </View>
      
      <Text style={[styles.title, { fontSize: isDesktop() ? 32 : responsiveFontSize(layout.isMobile ? 32 : 40), color: colors.text }]}>
        Valitse harjoitussetti
      </Text>
      
      <View style={setsContainerStyle}>
        {sets.map((set) => (
          <TouchableOpacity
            key={set.id}
            style={[
              layout.isMobile ? styles.mobileSetCard : styles.setCard,
              { backgroundColor: colors.primary, borderColor: colors.border },
              selectedSet === set.id && styles.selectedSet,
              selectedSet === set.id && { backgroundColor: colors.buttonSecondary, borderColor: colors.primaryDark }
            ]}
            onPress={() => handleSetSelect(set.id)}
            activeOpacity={0.7}
            accessibilityLabel={`Setti ${set.displayNumber}: ${set.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedSet === set.id }}
          >
            <View style={[styles.setNumberContainer, { backgroundColor: isDarkMode ? '#2c2c2c' : '#ffffff', borderColor: colors.border }]}>
              <Text style={[
                styles.setNumber,
                { fontSize: isDesktop() ? 36 : responsiveFontSize(layout.isMobile ? 36 : 52), color: colors.primaryDark },
                selectedSet === set.id && { color: colors.primary }
              ]}>
                {set.displayNumber}
              </Text>
            </View>
            
            <View style={styles.setNameContainer}>
              <Text style={[
                styles.setName,
                { fontSize: isDesktop() ? 20 : responsiveFontSize(layout.isMobile ? 20 : 26), color: colors.text },
                selectedSet === set.id && { color: colors.text }
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
            { backgroundColor: colors.success },
            layout.isMobile && styles.mobilePlayButton
          ]} 
          onPress={handlePlaySet}
          accessibilityLabel={`Aloita Setti ${sets.find(s => s.id === selectedSet)?.displayNumber || selectedSet}`}
          accessibilityRole="button"
          accessibilityHint="Napauta aloittaaksesi valitun setin harjoitukset"
        >
          <Text style={[
            styles.playButtonText,
            { fontSize: isDesktop() ? 22 : responsiveFontSize(layout.isMobile ? 22 : 26), color: colors.buttonText }
          ]}>
            ▶️ Aloita harjoitus
          </Text>
        </TouchableOpacity>
      )}
      
      {selectedSet === null && (
        <View style={styles.instructionContainer}>
          <Text style={[
            styles.instructionText,
            { fontSize: isDesktop() ? 18 : responsiveFontSize(layout.isMobile ? 18 : 22), color: colors.textLight }
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
  },
  mobileContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
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
    borderRadius: 20,
    padding: 28,
    marginVertical: 14,
    borderWidth: 3,
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
    borderRadius: 20,
    padding: spacing.xl,
    marginVertical: spacing.md,
    borderWidth: 3,
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
    borderWidth: 4,
    transform: [{ scale: 1.03 }],
    elevation: 6,
    shadowOpacity: 0.3,
  },
  setNumberContainer: {
    borderRadius: 16,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
  },
  setNumber: {
    fontWeight: 'bold',
  },
  setNameContainer: {
    flex: 1,
  },
  setName: {
    fontWeight: '600',
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
    borderWidth: 1,
  },
  progressDotComplete: {
    borderWidth: 1,
  },
  selectedSetText: {},
  playButton: {
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
    fontWeight: 'bold',
  },
  instructionContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
  },
  instructionText: {
    textAlign: 'center',
  },
});