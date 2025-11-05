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

  // Finnish verb exercise sets
  const sets: Set[] = [
    { id: 1, name: "Setti 1" }, 
    { id: 2, name: "Setti 2" }, 
    { id: 3, name: "Setti 3" }, 
    { id: 4, name: "Setti 4" }, 
    { id: 5, name: "Sett 5" }, 
    { id: 6, name: "Setti 6" }, 
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
    if (selectedSet) {
      console.log('Progress screen: Navigating to play with set', selectedSet);
      router.push('/play');
    }
  };

  const containerStyle = layout.isMobile ? styles.mobileContainer : styles.container;
  const setsContainerStyle = layout.isMobile ? styles.mobileSetsContainer : styles.setsContainer;

  return (
    <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { fontSize: isDesktop() ? 28 : responsiveFontSize(layout.isMobile ? 28 : 36) }]}>
        Valitse setti
      </Text>
      <Text style={[styles.subtitle, { fontSize: isDesktop() ? 16 : responsiveFontSize(layout.isMobile ? 16 : 18) }]}>
        Klikkaa settiä aloittaaksesi
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
            activeOpacity={0.8}
          >
            <Text style={[
              styles.setNumber,
              { fontSize: isDesktop() ? 32 : responsiveFontSize(layout.isMobile ? 32 : 48) },
              selectedSet === set.id && styles.selectedSetText
            ]}>
              {set.id}
            </Text>
            
            <Text style={[
              styles.setName,
              { fontSize: isDesktop() ? 18 : responsiveFontSize(layout.isMobile ? 18 : 24) },
              selectedSet === set.id && styles.selectedSetText
            ]}>
              {set.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSet && (
        <TouchableOpacity 
          style={[
            styles.playButton,
            layout.isMobile && styles.mobilePlayButton
          ]} 
          onPress={handlePlaySet}
        >
          <Text style={[
            styles.playButtonText,
            { fontSize: isDesktop() ? 18 : responsiveFontSize(layout.isMobile ? 18 : 20) }
          ]}>
            Aloita Setti {selectedSet}
          </Text>
        </TouchableOpacity>
      )}
      
      {!selectedSet && (
        <View style={styles.instructionContainer}>
          <Text style={[
            styles.instructionText,
            { fontSize: isDesktop() ? 16 : responsiveFontSize(layout.isMobile ? 16 : 18) }
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
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mobileSetCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 2,
    borderColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  selectedSet: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    transform: [{ scale: 1.02 }],
    elevation: 4,
    shadowOpacity: 0.2,
  },
  setNumber: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 20,
    minWidth: 60,
    textAlign: 'center',
  },
  setName: {
    fontWeight: '600',
    color: '#555',
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