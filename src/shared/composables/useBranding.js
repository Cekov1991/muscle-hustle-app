import { reactive, computed, watch } from 'vue'
import { useAuth } from '../../features/auth/composables/useAuth'

// Default color palette (hex format)
const DEFAULT_PALETTE = {
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

// Helper function to convert hex color to RGB string (for Ionic RGB variables)
const hexToRgb = (hex) => {
  if (!hex) return '0, 0, 0'
  
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return `${r}, ${g}, ${b}`
  }
  
  // Handle 6-digit hex
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `${r}, ${g}, ${b}`
  }
  
  return '0, 0, 0'
}

// Helper function to generate shade colors (darker version for hover/active states)
const generateShade = (hex, factor = 0.2) => {
  if (!hex) return '#000000'
  
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  let r, g, b
  
  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    // Handle 6-digit hex
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
  } else {
    return '#000000'
  }
  
  // Calculate darker shade
  const newR = Math.max(0, Math.floor(r * (1 - factor)))
  const newG = Math.max(0, Math.floor(g * (1 - factor)))
  const newB = Math.max(0, Math.floor(b * (1 - factor)))
  
  // Convert back to hex
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`
}

// Global branding state - shared across all components using this composable
const brandingState = reactive({
  // Primary colors
  primaryColor: DEFAULT_PALETTE.primary,
  secondaryColor: DEFAULT_PALETTE.secondary,
  primaryColorRgb: hexToRgb(DEFAULT_PALETTE.primary),
  secondaryColorRgb: hexToRgb(DEFAULT_PALETTE.secondary),
  
  // Background colors
  backgroundColor: DEFAULT_PALETTE.background,
  cardBackgroundColor: DEFAULT_PALETTE.cardBackground,
  
  // Text colors
  textPrimaryColor: DEFAULT_PALETTE.textPrimary,
  textSecondaryColor: DEFAULT_PALETTE.textSecondary,
  textOnPrimaryColor: DEFAULT_PALETTE.textOnPrimary,
  
  // Semantic colors
  successColor: DEFAULT_PALETTE.success,
  warningColor: DEFAULT_PALETTE.warning,
  dangerColor: DEFAULT_PALETTE.danger,
  accentColor: DEFAULT_PALETTE.accent,
  
  // Other
  borderColor: DEFAULT_PALETTE.border,
  backgroundPattern: null,
  logo: null,
  partnerName: 'Fitness App',
  fontFamily: 'Nunito',
  isInitialized: false
})

export const useBranding = () => {
  const { user } = useAuth()
  
  // Computed properties for reactive branding access
  const primaryColor = computed(() => brandingState.primaryColor)
  const secondaryColor = computed(() => brandingState.secondaryColor)
  const primaryColorRgb = computed(() => brandingState.primaryColorRgb)
  const secondaryColorRgb = computed(() => brandingState.secondaryColorRgb)
  
  // Background colors
  const backgroundColor = computed(() => brandingState.backgroundColor)
  const cardBackgroundColor = computed(() => brandingState.cardBackgroundColor)
  
  // Text colors
  const textPrimaryColor = computed(() => brandingState.textPrimaryColor)
  const textSecondaryColor = computed(() => brandingState.textSecondaryColor)
  const textOnPrimaryColor = computed(() => brandingState.textOnPrimaryColor)
  
  // Semantic colors
  const successColor = computed(() => brandingState.successColor)
  const warningColor = computed(() => brandingState.warningColor)
  const dangerColor = computed(() => brandingState.dangerColor)
  const accentColor = computed(() => brandingState.accentColor)
  
  // Other
  const borderColor = computed(() => brandingState.borderColor)
  const backgroundPattern = computed(() => brandingState.backgroundPattern)
  const logo = computed(() => brandingState.logo)
  const partnerName = computed(() => brandingState.partnerName)
  const fontFamily = computed(() => brandingState.fontFamily)
  const isInitialized = computed(() => brandingState.isInitialized)
  
  // Apply branding based on partner visual identity
  const applyPartnerBranding = (partner) => {
    if (!partner?.visual_identity) {
      console.warn('No visual identity found for partner:', partner)
      return
    }
    
    const { visual_identity } = partner
    
    // Backend provides colors as hex (e.g., "#a44200")
    // Extract all colors with fallbacks to defaults
    const primaryHex = visual_identity.primary_color || DEFAULT_PALETTE.primary
    const secondaryHex = visual_identity.secondary_color || DEFAULT_PALETTE.secondary
    const backgroundColorHex = visual_identity.background_color || DEFAULT_PALETTE.background
    const cardBackgroundColorHex = visual_identity.card_background_color || DEFAULT_PALETTE.cardBackground
    const textPrimaryHex = visual_identity.text_primary_color || DEFAULT_PALETTE.textPrimary
    const textSecondaryHex = visual_identity.text_secondary_color || DEFAULT_PALETTE.textSecondary
    const textOnPrimaryHex = visual_identity.text_on_primary_color || DEFAULT_PALETTE.textOnPrimary
    const successHex = visual_identity.success_color || DEFAULT_PALETTE.success
    const warningHex = visual_identity.warning_color || DEFAULT_PALETTE.warning
    const dangerHex = visual_identity.danger_color || DEFAULT_PALETTE.danger
    const accentHex = visual_identity.accent_color || DEFAULT_PALETTE.accent
    const borderHex = visual_identity.border_color || DEFAULT_PALETTE.border
    
    // Convert primary/secondary to RGB for Ionic RGB variables
    const primaryRgb = hexToRgb(primaryHex)
    const secondaryRgb = hexToRgb(secondaryHex)
    
    // Update branding state
    brandingState.primaryColor = primaryHex
    brandingState.secondaryColor = secondaryHex
    brandingState.primaryColorRgb = primaryRgb
    brandingState.secondaryColorRgb = secondaryRgb
    brandingState.backgroundColor = backgroundColorHex
    brandingState.cardBackgroundColor = cardBackgroundColorHex
    brandingState.textPrimaryColor = textPrimaryHex
    brandingState.textSecondaryColor = textSecondaryHex
    brandingState.textOnPrimaryColor = textOnPrimaryHex
    brandingState.successColor = successHex
    brandingState.warningColor = warningHex
    brandingState.dangerColor = dangerHex
    brandingState.accentColor = accentHex
    brandingState.borderColor = borderHex
    brandingState.backgroundPattern = visual_identity.background_pattern || null
    brandingState.logo = visual_identity.logo || brandingState.logo
    brandingState.partnerName = partner.name || brandingState.partnerName
    brandingState.fontFamily = visual_identity.font_family || brandingState.fontFamily
    
    // Apply CSS custom properties dynamically to document root
    const root = document.documentElement
    
    // Primary and secondary colors (hex)
    root.style.setProperty('--brand-primary', primaryHex)
    root.style.setProperty('--brand-secondary', secondaryHex)
    
    // Ionic colors (hex)
    root.style.setProperty('--ion-color-primary', primaryHex)
    root.style.setProperty('--ion-color-secondary', secondaryHex)
    
    // RGB values for Ionic components that need them (only for primary/secondary)
    root.style.setProperty('--brand-primary-rgb', primaryRgb)
    root.style.setProperty('--brand-secondary-rgb', secondaryRgb)
    root.style.setProperty('--ion-color-primary-rgb', primaryRgb)
    root.style.setProperty('--ion-color-secondary-rgb', secondaryRgb)
    
    // Generate and set shade colors for hover/active states
    const primaryShade = generateShade(primaryHex)
    const secondaryShade = generateShade(secondaryHex)
    root.style.setProperty('--brand-primary-shade', primaryShade)
    root.style.setProperty('--brand-secondary-shade', secondaryShade)
    root.style.setProperty('--ion-color-primary-shade', primaryShade)
    root.style.setProperty('--ion-color-secondary-shade', secondaryShade)
    
    // Background colors (hex only)
    root.style.setProperty('--brand-background-color', backgroundColorHex)
    root.style.setProperty('--brand-card-background-color', cardBackgroundColorHex)
    
    // Text colors (hex only)
    root.style.setProperty('--brand-text-primary-color', textPrimaryHex)
    root.style.setProperty('--brand-text-secondary-color', textSecondaryHex)
    root.style.setProperty('--brand-text-on-primary-color', textOnPrimaryHex)
    
    // Semantic colors (hex only)
    root.style.setProperty('--brand-success-color', successHex)
    root.style.setProperty('--brand-warning-color', warningHex)
    root.style.setProperty('--brand-danger-color', dangerHex)
    root.style.setProperty('--brand-accent-color', accentHex)
    
    // Other colors (hex only)
    root.style.setProperty('--brand-border-color', borderHex)
    
    // Background pattern
    if (brandingState.backgroundPattern) {
      root.style.setProperty('--brand-background-pattern', `url(${brandingState.backgroundPattern})`)
    }
    
    // Logo and font
    if (brandingState.logo) {
      root.style.setProperty('--brand-logo-url', `url(${brandingState.logo})`)
    }
    
    if (brandingState.fontFamily) {
      root.style.setProperty('--brand-font-family', brandingState.fontFamily)
    }
    
    // Add gym-branded class to body for CSS targeting
    document.body.classList.add('gym-branded')
    
    brandingState.isInitialized = true
  }
  
  // Reset to default branding (called on logout)
  const resetBranding = () => {
    console.log('Resetting branding to defaults')
    
    // Reset state to defaults
    brandingState.primaryColor = DEFAULT_PALETTE.primary
    brandingState.secondaryColor = DEFAULT_PALETTE.secondary
    brandingState.primaryColorRgb = hexToRgb(DEFAULT_PALETTE.primary)
    brandingState.secondaryColorRgb = hexToRgb(DEFAULT_PALETTE.secondary)
    brandingState.backgroundColor = DEFAULT_PALETTE.background
    brandingState.cardBackgroundColor = DEFAULT_PALETTE.cardBackground
    brandingState.textPrimaryColor = DEFAULT_PALETTE.textPrimary
    brandingState.textSecondaryColor = DEFAULT_PALETTE.textSecondary
    brandingState.textOnPrimaryColor = DEFAULT_PALETTE.textOnPrimary
    brandingState.successColor = DEFAULT_PALETTE.success
    brandingState.warningColor = DEFAULT_PALETTE.warning
    brandingState.dangerColor = DEFAULT_PALETTE.danger
    brandingState.accentColor = DEFAULT_PALETTE.accent
    brandingState.borderColor = DEFAULT_PALETTE.border
    brandingState.backgroundPattern = null
    brandingState.logo = null
    brandingState.partnerName = 'Fitness App'
    brandingState.fontFamily = 'Inter'
    
    // Remove custom CSS properties
    const root = document.documentElement
    const propertiesToRemove = [
      '--brand-primary',
      '--brand-secondary', 
      '--ion-color-primary',
      '--ion-color-secondary',
      '--brand-primary-rgb',
      '--brand-secondary-rgb',
      '--ion-color-primary-rgb',
      '--ion-color-secondary-rgb',
      '--brand-primary-shade',
      '--brand-secondary-shade',
      '--ion-color-primary-shade',
      '--ion-color-secondary-shade',
      '--brand-background-color',
      '--brand-card-background-color',
      '--brand-text-primary-color',
      '--brand-text-secondary-color',
      '--brand-text-on-primary-color',
      '--brand-success-color',
      '--brand-warning-color',
      '--brand-danger-color',
      '--brand-accent-color',
      '--brand-border-color',
      '--brand-background-pattern',
      '--brand-logo-url',
      '--brand-font-family'
    ]
    
    propertiesToRemove.forEach(prop => {
      root.style.removeProperty(prop)
    })
    
    // Remove branding class
    document.body.classList.remove('gym-branded')
    
    brandingState.isInitialized = false
  }
  
  // Watch for user changes to auto-apply branding
  watch(user, (newUser, oldUser) => {
    if (newUser?.partner) {
      // User logged in or user data updated with partner info
      applyPartnerBranding(newUser.partner)
    } else if (oldUser?.partner && !newUser?.partner) {
      // User logged out or partner data removed
      resetBranding()
    }
  }, { 
    immediate: true, // Apply branding immediately if user is already logged in
    deep: true // Watch for deep changes in user object
  })
  
  return {
    // Primary colors
    primaryColor,
    secondaryColor,
    primaryColorRgb,
    secondaryColorRgb,
    
    // Background colors
    backgroundColor,
    cardBackgroundColor,
    
    // Text colors
    textPrimaryColor,
    textSecondaryColor,
    textOnPrimaryColor,
    
    // Semantic colors
    successColor,
    warningColor,
    dangerColor,
    accentColor,
    
    // Other
    borderColor,
    backgroundPattern,
    logo,
    partnerName,
    fontFamily,
    isInitialized,
    
    // Methods
    applyPartnerBranding,
    resetBranding
  }
}
