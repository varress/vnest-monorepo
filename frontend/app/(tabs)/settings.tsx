import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { responsiveFontSize, isDesktop } from '@/utils/responsive';
import { Colors, DarkModeColors, getThemedColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useDataSource, DataSourceType } from '@/contexts/DataSourceContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { databaseService } from '@/services/exerciseManagementService';

const spacing = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

type ThemeMode = 'light' | 'dark';

export default function SettingsScreen() {
  const [fontSize, setFontSize] = useState(20);
  const [testData, setTestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { themeMode, isDarkMode, highContrast, setThemeMode, toggleHighContrast } = useTheme();
  const { dataSource, setDataSource } = useDataSource();
  const layout = useResponsiveLayout();
  const router = useRouter();
  
  // Get themed colors based on current mode
  const colors = getThemedColors(isDarkMode, highContrast);
  
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

  const handleDataSourceChange = async (source: DataSourceType) => {
    await setDataSource(source);
  };

  const testDataFetch = async () => {
    setIsLoading(true);
    try {
      // Test fetching data using current data source
      const wordData = await databaseService.getWordDataForCurrentVerb();
      setTestData({
        dataSource: dataSource,
        verbCount: wordData.verbs?.length || 0,
        subjectCount: wordData.subjects?.length || 0,
        objectCount: wordData.objects?.length || 0,
        currentVerb: wordData.currentVerb?.value || 'No verb set',
        sampleVerbs: wordData.verbs?.slice(0, 3).map(v => v.value) || [],
        sampleSubjects: wordData.subjects?.slice(0, 3).map(s => s.value) || [],
        fetchTime: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setTestData({
        error: error instanceof Error ? error.message : 'Unknown error',
        dataSource: dataSource,
        fetchTime: new Date().toLocaleTimeString()
      });
    }
    setIsLoading(false);
  };

  const toggleContrast = () => {
    toggleHighContrast();
  };

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: colors.background },
        layout.isMobile && styles.mobileContainer,
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.backgroundGray }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Asetukset</Text>
      </View>

      <Text style={[
        styles.title,
        { color: colors.text },
        { fontSize: isDesktop() ? 32 : responsiveFontSize(layout.isMobile ? 32 : 40) }
      ]}>
        Asetukset
      </Text>

      {/* Font Size Section - Preset Buttons */}
      {/*
      <View style={[styles.section, { backgroundColor: colors.backgroundGray, borderColor: colors.border }]}>
        <Text style={[
          styles.sectionTitle,
          { color: colors.text },
          { fontSize: isDesktop() ? 20 : responsiveFontSize(layout.isMobile ? 20 : 24) }
        ]}>
          Tekstin koko
        </Text>
        
        <View style={styles.presetContainer}>
          {FONT_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.value}
              style={[
                styles.presetButton,
                { backgroundColor: isDarkMode ? colors.backgroundGray : "#ffffff", borderColor: colors.border },
                fontSize === preset.value && styles.presetButtonActive,
                fontSize === preset.value && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              ]}
              onPress={() => selectPreset(preset.value)}
              activeOpacity={0.7}
              accessibilityLabel={`${preset.label}, ${preset.value} pistettä`}
              accessibilityRole="button"
              accessibilityState={{ selected: fontSize === preset.value }}
            >
              <Text style={[
                styles.presetIcon,
                { fontSize: preset.value, color: colors.textLight },
                fontSize === preset.value && { color: colors.primary }
              ]}>
                {preset.icon}
              </Text>
              <Text style={[
                styles.presetLabel,
                { color: colors.textLight },
                fontSize === preset.value && { color: colors.primary, fontWeight: 'bold' }
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[
              styles.fontButton,
              { backgroundColor: colors.primary },
              fontSize <= MIN_FONT_SIZE && styles.fontButtonDisabled,
              fontSize <= MIN_FONT_SIZE && { backgroundColor: colors.buttonDisabled }
            ]}
            onPress={decreaseFontSize}
            disabled={fontSize <= MIN_FONT_SIZE}
            accessibilityLabel="Pienennä tekstiä"
            accessibilityRole="button"
            accessibilityHint={`Nykyinen koko ${fontSize} pistettä`}
          >
            <Text style={[
              styles.fontButtonText,
              { color: colors.buttonText },
              fontSize <= MIN_FONT_SIZE && { color: colors.buttonTextDisabled }
            ]}>−</Text>
          </TouchableOpacity>

          <View style={[
            styles.fontPreview,
            { backgroundColor: isDarkMode ? colors.backgroundGray : "#ffffff", borderColor: colors.border }
          ]}>
            <Text style={[
              styles.previewText,
              { fontSize, color: colors.textDark }
            ]}>
              Esimerkki
            </Text>
            <Text style={[
              styles.fontSizeLabel,
              { color: colors.textLight }
            ]}>
              {fontSize}px
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.fontButton,
              { backgroundColor: colors.primary },
              fontSize >= MAX_FONT_SIZE && styles.fontButtonDisabled,
              fontSize >= MAX_FONT_SIZE && { backgroundColor: colors.buttonDisabled }
            ]}
            onPress={increaseFontSize}
            disabled={fontSize >= MAX_FONT_SIZE}
            accessibilityLabel="Suurenna tekstiä"
            accessibilityRole="button"
            accessibilityHint={`Nykyinen koko ${fontSize} pistettä`}
          >
            <Text style={[
              styles.fontButtonText,
              { color: colors.buttonText },
              fontSize >= MAX_FONT_SIZE && { color: colors.buttonTextDisabled }
            ]}>+</Text>
          </TouchableOpacity>
        </View>
      </View> 
      */}

      {/* Dark Mode Section */}
      <View style={[styles.section, { backgroundColor: colors.backgroundGray, borderColor: colors.border }]}>
        <Text style={[
          styles.sectionTitle,
          { color: colors.text },
          { fontSize: isDesktop() ? 20 : responsiveFontSize(layout.isMobile ? 20 : 24) }
        ]}>
          Tumma tila
        </Text>
        
        {/* Theme mode options */}
        <View style={styles.themeOptionsContainer}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              { backgroundColor: isDarkMode ? colors.backgroundGray : "#ffffff", borderColor: colors.border },
              themeMode === 'light' && styles.themeOptionActive,
              themeMode === 'light' && { borderColor: colors.primary }
            ]}
            onPress={() => setThemeMode('light')}
            activeOpacity={0.7}
            accessibilityLabel="Vaalea tila"
            accessibilityRole="button"
            accessibilityState={{ selected: themeMode === 'light' }}
          >
            <Ionicons 
              name="sunny" 
              size={32} 
              color={themeMode === 'light' ? colors.primary : colors.textLight} 
            />
            <Text style={[
              styles.themeOptionLabel,
              { color: colors.text },
              themeMode === 'light' && { color: colors.primary, fontWeight: 'bold' }
            ]}>
              Vaalea
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              { backgroundColor: isDarkMode ? colors.backgroundGray : "#ffffff", borderColor: colors.border },
              themeMode === 'dark' && styles.themeOptionActive,
              themeMode === 'dark' && { borderColor: colors.primary }
            ]}
            onPress={() => setThemeMode('dark')}
            activeOpacity={0.7}
            accessibilityLabel="Tumma tila"
            accessibilityRole="button"
            accessibilityState={{ selected: themeMode === 'dark' }}
          >
            <Ionicons 
              name="moon" 
              size={32} 
              color={themeMode === 'dark' ? colors.primary : colors.textLight} 
            />
            <Text style={[
              styles.themeOptionLabel,
              { color: colors.text },
              themeMode === 'dark' && { color: colors.primary, fontWeight: 'bold' }
            ]}>
              Tumma
            </Text>
          </TouchableOpacity>

        </View>
        
        {themeMode === 'system' && (
          <Text style={[
            styles.helperText,
            { color: colors.textLight }
          ]}>
            Seuraa laitteen asetuksia
          </Text>
        )}
      </View>

      {/* High Contrast Section */}
      <View style={[styles.section, { backgroundColor: colors.backgroundGray, borderColor: colors.border }]}>
        <Text style={[
          styles.sectionTitle,
          { color: colors.text },
          { fontSize: isDesktop() ? 20 : responsiveFontSize(layout.isMobile ? 20 : 24) }
        ]}>
          Värikontrasti
        </Text>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: isDarkMode ? colors.backgroundGray : "#ffffff", borderColor: colors.border },
            highContrast && styles.toggleButtonActive,
            highContrast && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
          ]}
          onPress={toggleContrast}
          activeOpacity={0.7}
          accessibilityLabel={highContrast ? 'Poista korkea kontrasti käytöstä' : 'Ota korkea kontrasti käyttöön'}
          accessibilityRole="switch"
          accessibilityState={{ checked: highContrast }}
        >
          <Text style={[
            styles.toggleText,
            { color: colors.text },
            highContrast && { fontWeight: 'bold' },
            { fontSize: isDesktop() ? 18 : responsiveFontSize(layout.isMobile ? 18 : 22) }
          ]}>
            {highContrast ? '✓ Korkea kontrasti PÄÄLLÄ' : 'Korkea kontrasti POIS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data Source Section - Only show on web */}
      {Platform.OS === 'web' && (
        <View style={[styles.section, { backgroundColor: colors.backgroundGray, borderColor: colors.border }]}>
          <Text style={[
            styles.sectionTitle,
            { color: colors.text },
            { fontSize: isDesktop() ? 20 : responsiveFontSize(layout.isMobile ? 20 : 24) }
          ]}>
            Tietolähde
          </Text>
          
          <Text style={[
            styles.helperText,
            { color: colors.textLight, marginBottom: spacing.md }
          ]}>
            Valitse käytetäänkö paikallista tietokantaa vai backend API:a
          </Text>

          <View style={styles.dataSourceContainer}>
            <TouchableOpacity
              style={[
                styles.dataSourceButton,
                { backgroundColor: isDarkMode ? colors.backgroundGray : "#ffffff", borderColor: colors.border },
                dataSource === 'local' && styles.dataSourceButtonActive,
                dataSource === 'local' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              ]}
              onPress={() => handleDataSourceChange('local')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="phone-portrait-outline" 
                size={24} 
                color={dataSource === 'local' ? colors.primary : colors.text} 
              />
              <Text style={[
                styles.dataSourceText,
                { color: dataSource === 'local' ? colors.primary : colors.text },
                dataSource === 'local' && { fontWeight: 'bold' }
              ]}>
                Paikallinen tietokanta
              </Text>
              {dataSource === 'local' && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dataSourceButton,
                { backgroundColor: isDarkMode ? colors.backgroundGray : "#ffffff", borderColor: colors.border },
                dataSource === 'api' && styles.dataSourceButtonActive,
                dataSource === 'api' && { backgroundColor: colors.primaryLight, borderColor: colors.primary }
              ]}
              onPress={() => handleDataSourceChange('api')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="cloud-outline" 
                size={24} 
                color={dataSource === 'api' ? colors.primary : colors.text} 
              />
              <Text style={[
                styles.dataSourceText,
                { color: dataSource === 'api' ? colors.primary : colors.text },
                dataSource === 'api' && { fontWeight: 'bold' }
              ]}>
                Backend API
              </Text>
              {dataSource === 'api' && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Test Data Fetching Section */}
          <View style={styles.testDataSection}>
            <TouchableOpacity
              style={[
                styles.testButton,
                { backgroundColor: colors.primary },
                isLoading && { opacity: 0.6 }
              ]}
              onPress={testDataFetch}
              disabled={isLoading}
            >
              <Ionicons 
                name={isLoading ? "sync" : "download-outline"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.testButtonText}>
                {isLoading ? 'Fetching...' : 'Test Data Fetch'}
              </Text>
            </TouchableOpacity>

            {testData && (
              <View style={[
                styles.testDataDisplay,
                { backgroundColor: isDarkMode ? colors.backgroundGray : "#f5f5f5", borderColor: colors.border }
              ]}>
                <Text style={[styles.testDataTitle, { color: colors.text }]}>
                  Data Fetch Result:
                </Text>
                
                {testData.error ? (
                  <Text style={[styles.testDataError, { color: colors.error || '#ff4444' }]}>
                    Error: {testData.error}
                  </Text>
                ) : (
                  <View>
                    <Text style={[styles.testDataItem, { color: colors.text }]}>
                      Source: {testData.dataSource === 'api' ? 'Backend API' : 'Local Database'}
                    </Text>
                    <Text style={[styles.testDataItem, { color: colors.text }]}>
                      Current Verb: {testData.currentVerb}
                    </Text>
                    <Text style={[styles.testDataItem, { color: colors.text }]}>
                      Verbs: {testData.verbCount}, Subjects: {testData.subjectCount}, Objects: {testData.objectCount}
                    </Text>
                    <Text style={[styles.testDataItem, { color: colors.text }]}>
                      Sample Verbs: {testData.sampleVerbs.join(', ')}
                    </Text>
                    <Text style={[styles.testDataItem, { color: colors.text }]}>
                      Sample Subjects: {testData.sampleSubjects.join(', ')}
                    </Text>
                  </View>
                )}
                
                <Text style={[styles.testDataTime, { color: colors.textLight }]}>
                  Fetched at: {testData.fetchTime}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: Colors.white,
  },
  mobileContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
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
  highContrastContainer: {
    backgroundColor: Colors.highContrastBackground,
  },
  highContrastText: {
    color: Colors.highContrastText,
  },
  highContrastButton: {
    borderWidth: 3,
    borderColor: Colors.highContrastBorder,
    backgroundColor: Colors.highContrastButton,
  },
  highContrastPreview: {
    borderWidth: 2,
    borderColor: Colors.highContrastBorder,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: spacing.xl,
    textAlign: 'center',
    color: Colors.textDark,
  },
  section: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHighContrast: {
    backgroundColor: Colors.highContrastBackground,
    borderColor: Colors.highContrastBorder,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    color: Colors.text,
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
    backgroundColor: Colors.white,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    minHeight: 90,
    justifyContent: 'center',
  },
  presetButtonHighContrast: {
    backgroundColor: Colors.highContrastBackground,
    borderColor: Colors.highContrastBorder,
  },
  presetButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  presetIcon: {
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: 4,
  },
  presetIconActive: {
    color: Colors.primary,
  },
  presetLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  presetLabelHighContrast: {
    color: Colors.highContrastText,
  },
  presetLabelActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  
  // Fine-tune controls
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fontButton: {
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fontButtonHighContrast: {
    backgroundColor: Colors.highContrastButton,
    borderColor: Colors.highContrastBorder,
  },
  fontButtonDisabled: {
    backgroundColor: Colors.buttonDisabled,
  },
  fontButtonDisabledHighContrast: {
    backgroundColor: Colors.highContrastButtonDisabled,
    borderColor: Colors.highContrastBorder,
  },
  fontButtonText: {
    fontSize: 32,
    color: Colors.buttonText,
    fontWeight: 'bold',
  },
  fontButtonTextHighContrast: {
    color: Colors.highContrastButtonText,
  },
  fontButtonTextDisabledHighContrast: {
    color: Colors.highContrastButtonTextDisabled,
  },
  fontButtonTextDisabled: {
    color: Colors.buttonTextDisabled,
  },
  fontPreview: {
    flex: 1,
    marginHorizontal: spacing.md,
    backgroundColor: Colors.white,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fontPreviewHighContrast: {
    backgroundColor: Colors.highContrastBackground,
    borderColor: Colors.highContrastBorder,
  },
  previewText: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.textDark,
  },
  previewTextHighContrast: {
    color: Colors.highContrastButtonText,
  },
  fontSizeLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  fontSizeLabelHighContrast: {
    color: Colors.highContrastButtonText,
  },
  
  // Contrast toggle
  toggleButton: {
    backgroundColor: Colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 80,
  },
  toggleButtonHighContrastBg: {
    backgroundColor: Colors.highContrastBackground,
    borderColor: Colors.highContrastBorder,
  },
  toggleButtonHighContrast: {
    backgroundColor: Colors.highContrastButton,
    borderColor: Colors.highContrastBorder,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  toggleButtonActiveHighContrast: {
    backgroundColor: Colors.highContrastButtonActive,
    borderColor: Colors.highContrastBorder,
  },
  toggleIcon: {
    marginRight: spacing.sm,
  },
  toggleText: {
    fontWeight: '600',
    color: Colors.highContrastButtonText,
  },
  toggleTextHighContrastColor: {
    color: Colors.highContrastText,
  },
  toggleTextHighContrast: {
    color: Colors.highContrastButtonText,
  },
  toggleTextActive: {
    color: Colors.highContrastButtonText,
    fontWeight: 'bold',
  },
  toggleTextActiveHighContrast: {
    color: Colors.highContrastButtonText,
    fontWeight: 'bold',
  },
  
  // Dark mode section
  themeOptionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  themeOption: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  themeOptionActive: {
    borderWidth: 3,
  },
  themeOptionLabel: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Data Source Settings Styles
  dataSourceContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dataSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    gap: spacing.md,
  },
  dataSourceButtonActive: {
    borderWidth: 3,
  },
  dataSourceText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },

  // Test Data Styles
  testDataSection: {
    marginTop: spacing.lg,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 8,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testDataDisplay: {
    padding: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
  },
  testDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  testDataItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  testDataError: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  testDataTime: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    textAlign: 'right',
  },

});

