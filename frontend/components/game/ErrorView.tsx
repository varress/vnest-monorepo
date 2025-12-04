import { Colors, getThemedColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorViewProps {
  error?: string | null;
  onRetry: () => void;
  onForceReload: () => void;
}

export function ErrorView({ error, onRetry, onForceReload }: ErrorViewProps) {
  const { isDarkMode, highContrast } = useTheme();
  const colors = getThemedColors(isDarkMode, highContrast);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.errorText, { color: colors.error }]}>
        Error: {error || 'Failed to load word data'}
      </Text>
      <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={onRetry}>
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: colors.error, marginTop: 10 }]} 
        onPress={onForceReload}
      >
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>Force Reload Data</Text>
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
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});