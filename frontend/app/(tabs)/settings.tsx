import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { responsiveFontSize, isDesktop } from '@/utils/responsive';

const spacing = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export default function SettingsScreen() {
  const [fontSize, setFontSize] = useState(20);
  const [highContrast, setHighContrast] = useState(false);
  const layout = useResponsiveLayout();
  
  const MIN_FONT_SIZE = 16;
  const MAX_FONT_SIZE = 32;
  const FONT_STEP = 2;
  
  // Preset font sizes for easier selection
  const FONT_PRESETS = [
    { label: 'Pieni', value: 16, icon: 'A' },
    { label: 'Normaali', value: 20, icon: 'A' },
    { label: 'Suuri', value: 24, icon: 'A' },
    { label: 'Erittäin suuri', value: 28, icon: 'A' },
  ];

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + FONT_STEP, MAX_FONT_SIZE));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - FONT_STEP, MIN_FONT_SIZE));
  };
  
  const selectPreset = (value: number) => {
    setFontSize(value);
  };

  const toggleContrast = () => {
    setHighContrast(!highContrast);
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        layout.isMobile && styles.mobileContainer,
        highContrast && styles.highContrastContainer
      ]}
    >
      <Text style={[
        styles.title,
        highContrast && styles.highContrastText,
        { fontSize: isDesktop() ? 32 : responsiveFontSize(layout.isMobile ? 32 : 40) }
      ]}>
        Asetukset
      </Text>

      {/* Font Size Section - Preset Buttons */}
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          highContrast && styles.highContrastText,
          { fontSize: isDesktop() ? 20 : responsiveFontSize(layout.isMobile ? 20 : 24) }
        ]}>
          📝 Tekstin koko
        </Text>
        
        {/* Quick preset buttons */}
        <View style={styles.presetContainer}>
          {FONT_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.value}
              style={[
                styles.presetButton,
                fontSize === preset.value && styles.presetButtonActive,
                highContrast && styles.highContrastButton
              ]}
              onPress={() => selectPreset(preset.value)}
              activeOpacity={0.7}
              accessibilityLabel={`${preset.label}, ${preset.value} pistettä`}
              accessibilityRole="button"
              accessibilityState={{ selected: fontSize === preset.value }}
            >
              <Text style={[
                styles.presetIcon,
                { fontSize: preset.value },
                fontSize === preset.value && styles.presetIconActive
              ]}>
                {preset.icon}
              </Text>
              <Text style={[
                styles.presetLabel,
                fontSize === preset.value && styles.presetLabelActive,
                highContrast && styles.highContrastText
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fine-tune controls */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[
              styles.fontButton,
              fontSize <= MIN_FONT_SIZE && styles.fontButtonDisabled,
              highContrast && styles.highContrastButton
            ]}
            onPress={decreaseFontSize}
            disabled={fontSize <= MIN_FONT_SIZE}
            accessibilityLabel="Pienennä tekstiä"
            accessibilityRole="button"
            accessibilityHint={`Nykyinen koko ${fontSize} pistettä`}
          >
            <Text style={[
              styles.fontButtonText,
              fontSize <= MIN_FONT_SIZE && styles.fontButtonTextDisabled
            ]}>−</Text>
          </TouchableOpacity>

          <View style={[
            styles.fontPreview,
            highContrast && styles.highContrastPreview
          ]}>
            <Text style={[
              styles.previewText,
              { fontSize },
              highContrast && styles.highContrastText
            ]}>
              Esimerkki
            </Text>
            <Text style={[
              styles.fontSizeLabel,
              highContrast && styles.highContrastText
            ]}>
              {fontSize}px
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.fontButton,
              fontSize >= MAX_FONT_SIZE && styles.fontButtonDisabled,
              highContrast && styles.highContrastButton
            ]}
            onPress={increaseFontSize}
            disabled={fontSize >= MAX_FONT_SIZE}
            accessibilityLabel="Suurenna tekstiä"
            accessibilityRole="button"
            accessibilityHint={`Nykyinen koko ${fontSize} pistettä`}
          >
            <Text style={[
              styles.fontButtonText,
              fontSize >= MAX_FONT_SIZE && styles.fontButtonTextDisabled
            ]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* High Contrast Section */}
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          highContrast && styles.highContrastText,
          { fontSize: isDesktop() ? 20 : responsiveFontSize(layout.isMobile ? 20 : 24) }
        ]}>
          🎨 Värikontrasti
        </Text>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            highContrast && styles.toggleButtonActive,
            highContrast && styles.highContrastButton
          ]}
          onPress={toggleContrast}
          activeOpacity={0.7}
          accessibilityLabel={highContrast ? 'Poista korkea kontrasti käytöstä' : 'Ota korkea kontrasti käyttöön'}
          accessibilityRole="switch"
          accessibilityState={{ checked: highContrast }}
        >
          <Text style={[
            styles.toggleIcon,
            { fontSize: isDesktop() ? 32 : responsiveFontSize(layout.isMobile ? 32 : 40) }
          ]}>
            {highContrast ? '👁️' : '👁️‍🗨️'}
          </Text>
          <Text style={[
            styles.toggleText,
            highContrast && styles.toggleTextActive,
            { fontSize: isDesktop() ? 18 : responsiveFontSize(layout.isMobile ? 18 : 22) }
          ]}>
            {highContrast ? '✓ Korkea kontrasti PÄÄLLÄ' : 'Korkea kontrasti POIS'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: '#fff',
  },
  mobileContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  highContrastContainer: {
    backgroundColor: '#0fb1deff',
  },
  highContrastText: {
    color: '#000',
  },
  highContrastButton: {
    borderWidth: 3,
    borderColor: '#000',
  },
  highContrastPreview: {
    borderWidth: 2,
    borderColor: '#000',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: '#222',
  },
  section: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    color: '#333',
    textAlign: 'center',
  },
  
  // Font preset buttons
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 3,
  },
  presetIcon: {
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  presetIconActive: {
    color: '#2196f3',
  },
  presetLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  presetLabelActive: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
  
  // Fine-tune controls
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fontButton: {
    backgroundColor: '#2196f3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fontButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  fontButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  fontButtonTextDisabled: {
    color: '#999',
  },
  fontPreview: {
    flex: 1,
    marginHorizontal: spacing.md,
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewText: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  fontSizeLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  // Contrast toggle
  toggleButton: {
    backgroundColor: '#fff',
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 80,
  },
  toggleButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 3,
  },
  toggleIcon: {
    marginRight: spacing.sm,
  },
  toggleText: {
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#2196f3',
    fontWeight: 'bold',
  },
});

