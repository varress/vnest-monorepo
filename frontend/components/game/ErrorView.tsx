import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorViewProps {
  error?: string | null;
  onRetry: () => void;
  onForceReload: () => void;
}

export function ErrorView({ error, onRetry, onForceReload }: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>
        Error: {error || 'Failed to load word data'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: '#c71910ff', marginTop: 10 }]} 
        onPress={onForceReload}
      >
        <Text style={styles.buttonText}>Force Reload Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#c71910ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});