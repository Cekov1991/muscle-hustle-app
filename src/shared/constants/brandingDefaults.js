/**
 * Default branding constants
 * Extracted from useBranding.js for better organization and testability
 */

// Default color palette (hex format)
export const DEFAULT_PALETTE = {
  primary: '#a44200',              // rust-brown
  secondary: '#d58936',            // bronze
  textPrimary: '#3c1518',          // rich-mahogany
  textSecondary: '#69140e',        // dark-garnet
  textOnPrimary: '#ffffff',        // white
  warning: '#fff94f',              // canary-yellow
  danger: '#69140e',               // dark-garnet
  accent: '#fff94f',               // canary-yellow
  background: '#ffffff',          // white
  cardBackground: '#f8f9fa',       // light gray
  border: '#dee2e6',              // light gray
  success: '#10dc60'              // standard green (not in palette)
}

// Default branding configuration
export const DEFAULT_BRANDING = {
  partnerName: 'Fitness App',
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
  FONT_FAMILY: '--brand-font-family'
}

// CSS class names
export const BRANDING_CLASSES = {
  GYM_BRANDED: 'gym-branded'
}
