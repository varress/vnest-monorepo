/**
 * VN-EST App Color System
 * 
 * Centralized color definitions for consistency and easy maintenance.
 * All colors follow aphasia-friendly design principles:
 * - High contrast ratios (WCAG AA compliance)
 * - Clear semantic meanings
 * - Simple, memorable names
 */

// ============================================
// 1. BRAND COLORS (Primary Identity)
// ============================================
export const BrandColors = {
  primary: '#EFD48C',      // Blue - Primary actions, selected states
  primaryLight: '#e3f2fd', // Light blue - Backgrounds, highlights
  primaryDark: '#1565c0',  // Dark blue - Text on light backgrounds
  
  secondary: '#EDAB7C',    // iOS blue - Alternative primary
  
  // Aphasia-friendly color system
  success: '#4caf50',      // ✅ Green - Correct answers, completion
  successDark: '#2e7d32',  // Dark green - Borders, emphasis
  
  error: '#CD5656',        // ❌ Red - Wrong answers, warnings
  errorDark: '#AF3E3E',    // Dark red - Emphasis
  
  warning: '#ffc107',      // ⚠️ Yellow - Caution (use sparingly)
  warningDark: '#f57c00',  // Orange - Emphasis
  
  info: '#2196f3',         // ℹ️ Blue - Informational
} as const;

// ============================================
// 2. NEUTRAL COLORS (Backgrounds & Text)
// ============================================
export const NeutralColors = {
  // Whites & Backgrounds
  white: '#ffffff',
  background: '#fff',
  backgroundGray: '#f8f9fa',
  backgroundLightGray: '#f9f9f9',
  
  // Grays (from light to dark)
  gray100: '#f8f9fa',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#e0e0e0',
  gray500: '#bdbdbd',
  gray600: '#999999',
  
  // Text colors
  text: '#333333',
  textLight: '#666666',
  textLighter: '#888888',
  textDark: '#222222',
  
  // Borders
  border: '#e0e0e0',
  borderLight: '#e9ecef',
  borderDark: '#dee2e6',
} as const;

// ============================================
// 3. SEMANTIC COLORS (Contextual Meaning)
// ============================================
export const SemanticColors = {
  // Card states
  cardBackground: '#D6A2A7',
  cardSelected: '#B2829F',      
  cardSelectedBorder: '#28A745',
  
  // Verb cards (special)
  verbBackground: '#B2829F',
  verbText: '#ffffff',
  
  // Feedback states
  correctBanner: '#4caf50',
  incorrectBanner: '#f44336',
  
  // Progress indicators
  progressComplete: '#4caf50',
  progressCompleteBorder: '#2e7d32',
  progressIncomplete: '#e0e0e0',
  progressIncompleteBorder: '#bdbdbd',
  
  // Buttons
  buttonPrimary: '#EFD48C',      
  buttonSecondary: '#D6A2A7',    
  buttonDanger: '#f44336',       
  buttonDisabled: '#e0e0e0',
  buttonText: '#000000',
  buttonTextDisabled: '#999999',
  
  // High contrast dark mode
  highContrastBackground: '#000000', 
  highContrastText: '#c11c84', 
  highContrastBorder: '#ec4c4cff', 
  highContrastButton: '#FFD93D', 
  highContrastButtonText: '#a53d11ff', 
  highContrastButtonActive: '#2196f3', 
  highContrastButtonSuccess: '#4caf50', 
  highContrastButtonDisabled: '#e14c4cff', 
  highContrastButtonTextDisabled: '#8515e1ff', 

  // History screen bars
  historyBarBackground: '#f0d48d',
  historyBarCorrect: '#cedcab',
} as const;

// ============================================
// 4. SHADOW & OVERLAY COLORS
// ============================================
export const ShadowColors = {
  shadow: '#000000',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  textShadow: 'rgba(0, 0, 0, 0.3)',
} as const;

// ============================================
// 5. CONNECTION LINE COLORS (Visual Feedback)
// ============================================
export const ConnectionColors = {
  line: '#B2161A',           
  lineGradientStart: 'rgba(178, 22, 26, 0.7)',
  lineGradientMid: 'rgba(178, 22, 26, 1)',
  lineGradientEnd: 'rgba(178, 22, 26, 0.7)',
  lineGlow: 'rgba(178, 22, 26, 0.3)',
} as const;

// Distinct colors for multiple connection lines
export const ConnectionLineColors = [
  '#4ECDC4', // Teal
  '#FF6B6B', // Red
  '#FFD93D', // Yellow
  '#A78BFA', // Purple
  '#F59E0B', // Orange
  '#10B981', // Green
  '#EC4899', // Pink
] as const;

// ============================================
// 6. THEMED COLORS (For different sets/modes)
// ============================================
export const ThemedColors = {
  // Set categories (can use emojis + these for variety)
  set0: '#FF6B6B', // 🍽️ Ruoka ja juoma - Red/Orange
  set1: '#4ECDC4', // 🚗 Liikenne - Teal
  set2: '#95E1D3', // 📚 Opiskelu - Mint
  set3: '#FFD93D', // 🎨 Vapaa-aika - Yellow
} as const;

// ============================================
// 7. ACCESSIBILITY UTILITIES
// ============================================

/**
 * Get text color with proper contrast for a given background
 */
export function getContrastText(backgroundColor: string): string {
  // Simple luminance calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? NeutralColors.textDark : NeutralColors.white;
}

/**
 * Get opacity variant of a color
 */
export function withOpacity(color: string, opacity: number): string {
  if (color.startsWith('rgba')) return color;
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ============================================
// 8. COMPLETE PALETTE (All colors in one object)
// ============================================
export const Colors = {
  ...BrandColors,
  ...NeutralColors,
  ...SemanticColors,
  ...ShadowColors,
  ...ConnectionColors,
  ...ThemedColors,
  connectionLineColors: ConnectionLineColors,
} as const;

// ============================================
// 9. DARK MODE SUPPORT 
// ============================================
export const DarkModeColors = {
  background: '#151718',
  text: '#ECEDEE',
  primary: '#64B5F6', // Lighter blue for dark backgrounds
  success: '#66BB6A',
  error: '#EF5350',
} as const;

// Export types for TypeScript autocomplete
export type ColorName = keyof typeof Colors;
export type BrandColorName = keyof typeof BrandColors;
export type SemanticColorName = keyof typeof SemanticColors;
