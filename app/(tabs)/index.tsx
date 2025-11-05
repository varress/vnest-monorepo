import { useDatabaseWordData } from '@/hooks/useDatabaseWordData';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        <Text>Current verb: {wordData.currentVerb.value} (Subjects: {wordData.subjects.length}, Objects: {wordData.objects.length})</Text>
      ) : (
        <Text>No data available</Text>
      )}
      <Text style={styles.title}>VNeST App</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/play')}>
        <Text style={styles.buttonText}><FontAwesome name="play" size={48} color="black" /></Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/progress')}>
        <Text style={styles.buttonText}><Entypo name="bar-graph" size={48} color="black" /></Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/settings')}>
        <Text style={styles.buttonText}><Ionicons size={48} name="settings-sharp" color="black" /></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
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
    color: '#fff',
    fontSize: 28,
    textAlign: 'center',
  },
});
