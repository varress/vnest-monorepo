import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { isDesktop, responsiveFontSize, spacing } from '@/utils/responsive';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const layout = useResponsiveLayout();
  const percentage = (current / total) * 100;

  return (
    <>
      <View style={[
        layout.isMobile ? styles.mobileProgressContainer : styles.progressContainer
      ]}>
        <Text style={[
          styles.progress,
          { fontSize: isDesktop() ? 18 : responsiveFontSize(layout.isMobile ? 16 : 24) }
        ]}>
          {label || `Olet suorittanut ${current}/${total} lauseharjoitusta`}
        </Text>
      </View>
      
      <View style={[
        styles.progressBarContainer,
        layout.isMobile && styles.mobileProgressBarContainer
      ]}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${percentage}%` }
            ]} 
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  progressContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: '#f5f5f5',
    padding: spacing.md,
    borderRadius: 12, 
    width: '70%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mobileProgressContainer: {
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: '#f5f5f5',
    padding: spacing.md,
    borderRadius: 12, 
    width: '90%',
    alignSelf: 'center',
    marginHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  progress: {
    textAlign: 'center',
    color: '#555',
    fontWeight: '600',
  },
  progressBarContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '80%',
    alignSelf: 'center',
  },
  mobileProgressBarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '90%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  progressBarBackground: {
    width: '100%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 8,
    shadowColor: '#4caf50',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});