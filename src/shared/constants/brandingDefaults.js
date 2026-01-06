/**
 * Default branding constants
 * Extracted from useBranding.js for better organization and testability
 */

import { appConfig } from '../../config/app'

// Default color palette (hex format) - Ulpift design
export const DEFAULT_PALETTE = {
  // Light mode colors
  primary: '#f97316',              // pulse-orange
  secondary: '#111214',            // sandow-gray-100
  textPrimary: '#111214',          // sandow-gray-100
  textSecondary: '#393c43',        // sandow-gray-80
  textOnPrimary: '#ffffff',        // white
  warning: '#fff94f',              // canary-yellow
  danger: '#69140e',               // dark-garnet
  accent: '#fff94f',               // canary-yellow
  background: '#ffffff',           // white
  cardBackground: '#f3f3f4',       // sandow-gray-10
  border: '#babbbe',               // sandow-gray-30
  success: '#10dc60',              // standard green

  // Dark mode variants
  primaryDark: '#fa812d',          // lighter tint for dark mode
  secondaryDark: '#292a2c',        // lighter tint for dark mode
  textPrimaryDark: '#ffffff',      // white for primary text
  textSecondaryDark: '#b0b0b0',    // light gray for secondary text
  textOnPrimaryDark: '#ffffff',    // white text on primary (unchanged)
  warningDark: '#fff94f',          // canary-yellow (unchanged)
  dangerDark: '#ff6b6b',           // lighter red for dark mode
  accentDark: '#fff94f',           // canary-yellow (unchanged)
  backgroundDark: '#121212',       // dark background
  cardBackgroundDark: '#1e1e1e',   // dark card background
  inputBackgroundDark: '#2a2a2a',  // dark input background
  borderDark: '#3a3a3a',           // dark border color
  successDark: '#4ade80',          // lighter green for dark mode
  
  // Gray scale colors - light mode
  gray10: '#ededed',                // for card backgrounds
  gray20: '#babbbe',                // for borders/icons
  gray30: '#7a7a7a',                // for secondary text
  gray40: '#707070',                // for labels
  gray50: '#989898',                // for tertiary text
  
  // Gray scale colors - dark mode
  gray10Dark: '#2a2a2a',            // dark card backgrounds
  gray20Dark: '#3a3a3a',            // dark borders/icons
  gray30Dark: '#808080',            // medium gray for secondary text
  gray40Dark: '#707070',            // slightly darker for labels
  gray50Dark: '#989898'              // light gray for tertiary text
}

// Default branding configuration
export const DEFAULT_BRANDING = {
  partnerName: appConfig.name,
  fontFamily: 'Nunito',
  backgroundPattern: null,
  logo: null
}

// CSS Custom property names for branding
export const BRANDING_CSS_VARS = {
  // Primary colors
  PRIMARY: '--brand-primary',
  SECONDARY: '--brand-secondary',
  PRIMARY_RGB: '--brand-primary-rgb',
  SECONDARY_RGB: '--brand-secondary-rgb',
  PRIMARY_SHADE: '--brand-primary-shade',
  SECONDARY_SHADE: '--brand-secondary-shade',
  
  // Ionic color overrides
  ION_PRIMARY: '--ion-color-primary',
  ION_SECONDARY: '--ion-color-secondary',
  ION_PRIMARY_RGB: '--ion-color-primary-rgb',
  ION_SECONDARY_RGB: '--ion-color-secondary-rgb',
  ION_PRIMARY_SHADE: '--ion-color-primary-shade',
  ION_SECONDARY_SHADE: '--ion-color-secondary-shade',
  
  // Background colors
  BACKGROUND: '--brand-background-color',
  CARD_BACKGROUND: '--brand-card-background-color',
  INPUT_BACKGROUND: '--brand-input-background-color',
  
  // Text colors
  TEXT_PRIMARY: '--brand-text-primary-color',
  TEXT_SECONDARY: '--brand-text-secondary-color',
  TEXT_ON_PRIMARY: '--brand-text-on-primary-color',
  
  // Semantic colors
  SUCCESS: '--brand-success-color',
  WARNING: '--brand-warning-color',
  DANGER: '--brand-danger-color',
  ACCENT: '--brand-accent-color',
  
  // Other
  BORDER: '--brand-border-color',
  BACKGROUND_PATTERN: '--brand-background-pattern',
  LOGO_URL: '--brand-logo-url',
  FONT_FAMILY: '--brand-font-family',
  
  // Gray scale colors
  GRAY_10: '--brand-gray-10',
  GRAY_20: '--brand-gray-20',
  GRAY_30: '--brand-gray-30',
  GRAY_40: '--brand-gray-40',
  GRAY_50: '--brand-gray-50',

  // Dark mode variants
  PRIMARY_DARK: '--brand-primary-dark',
  SECONDARY_DARK: '--brand-secondary-dark',
  TEXT_PRIMARY_DARK: '--brand-text-primary-dark',
  TEXT_SECONDARY_DARK: '--brand-text-secondary-dark',
  TEXT_ON_PRIMARY_DARK: '--brand-text-on-primary-dark',
  BACKGROUND_DARK: '--brand-background-dark',
  CARD_BACKGROUND_DARK: '--brand-card-background-dark',
  BORDER_DARK: '--brand-border-dark',
  SUCCESS_DARK: '--brand-success-dark',
  WARNING_DARK: '--brand-warning-dark',
  DANGER_DARK: '--brand-danger-dark',
  ACCENT_DARK: '--brand-accent-dark'
}

// CSS class names
export const BRANDING_CLASSES = {
  GYM_BRANDED: 'gym-branded'
}
