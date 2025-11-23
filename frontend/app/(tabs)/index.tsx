import { useDatabaseWordData } from '@/hooks/useDatabaseWordData';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/colors';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { wordData, isLoading, error } = useDatabaseWordData();

  const router = useRouter();

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Text>Loading database...</Text>
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : wordData?.currentVerb ? (
        <Text></Text>
      ) : (
        <Text>No data available</Text>
      )}
      <Text style={styles.title}>Puhupala</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/play')}>
        <Text style={styles.buttonText}><FontAwesome name="play" size={48} color="black" /> Aloita peli</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/progress')}>
        <Text style={styles.buttonText}><Entypo name="bar-graph" size={48} color="black" /> Edistyminen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/settings')}>
        <Text style={styles.buttonText}><Ionicons size={48} name="settings-sharp" color="black" /> Asetukset</Text>
      </TouchableOpacity>

      {Platform.OS !== 'web' && (
        <TouchableOpacity style={styles.button} onPress={() => router.push('/history')}>
          <Text style={styles.buttonText}><Ionicons size={48} name="trending-up-outline" color="black" /></Text>
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
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.buttonPrimary,
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
    color: Colors.buttonText,
    fontSize: 28,
    textAlign: 'center',
  },
});
