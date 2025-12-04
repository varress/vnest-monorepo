import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors, getThemedColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

export function LoadingView() {
  const { isDarkMode, highContrast } = useTheme();
  const colors = getThemedColors(isDarkMode, highContrast);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator testID="loading-indicator" size="large" color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.textLight }]}>Loading word data...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
  },
});