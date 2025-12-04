import { useDatabaseWordData } from '@/hooks/useDatabaseWordData';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Colors, getThemedColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { wordData, isLoading, error } = useDatabaseWordData();
  const { isDarkMode, highContrast } = useTheme();
  const colors = getThemedColors(isDarkMode, highContrast);
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <Text style={{ color: colors.text }}>Loading database...</Text>
      ) : error ? (
        <Text style={{ color: colors.error }}>Error: {error}</Text>
      ) : wordData?.currentVerb ? (
        <Text></Text>
      ) : (
        <Text style={{ color: colors.textLight }}>No data available</Text>
      )}
      <Text style={[styles.title, { color: colors.text }]}>VNeST TerapiaApp</Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.push('/play')}>
        <Text style={[styles.buttonText, { color: colors.buttonText }]}><FontAwesome name="play" size={48} color={colors.buttonText} />   Aloita peli</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.push('/progress')}>
        <Text style={[styles.buttonText, { color: colors.buttonText }]}><Entypo name="bar-graph" size={48} color={colors.buttonText} />   Edistyminen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.push('/settings')}>
        <Text style={[styles.buttonText, { color: colors.buttonText }]}><Ionicons size={48} name="settings-sharp" color={colors.buttonText} />   Asetukset</Text>
      </TouchableOpacity>

      {Platform.OS !== 'web' && (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => router.push('/history')}>
          <Text style={[styles.buttonText, { color: colors.buttonText }]}><Ionicons size={48} name="trending-up-outline" color={colors.buttonText} />   Historia</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    width: '50%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 28,
    textAlign: 'center',
  },
});
