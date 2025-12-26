import { reactive, computed } from 'vue'
import { DEFAULT_PALETTE, DEFAULT_BRANDING } from '../constants/brandingDefaults'
import { hexToRgb } from '../utils/colorHelpers'

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
  backgroundPattern: DEFAULT_BRANDING.backgroundPattern,
  logo: DEFAULT_BRANDING.logo,
  partnerName: DEFAULT_BRANDING.partnerName,
  fontFamily: DEFAULT_BRANDING.fontFamily,
  isInitialized: false
})

export const useBrandingState = () => {
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

  // Update branding state from partner visual identity
  const updateBrandingState = (partner) => {
    console.log('🎨 [useBrandingState] updateBrandingState called:', {
      hasPartner: !!partner,
      hasVisualIdentity: !!partner?.visual_identity,
      partnerName: partner?.name,
      visualIdentityKeys: partner?.visual_identity ? Object.keys(partner.visual_identity) : []
    })
    
    if (!partner?.visual_identity) {
      console.warn('⚠️ [useBrandingState] No visual identity found for partner:', partner)
      return
    }
    
    console.log('✅ [useBrandingState] Visual identity found, updating branding state...')
    
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
    brandingState.isInitialized = true
    
    console.log('✅ [useBrandingState] Branding state updated:', {
      primaryColor: brandingState.primaryColor,
      secondaryColor: brandingState.secondaryColor,
      partnerName: brandingState.partnerName,
      logo: brandingState.logo,
      fontFamily: brandingState.fontFamily,
      isInitialized: brandingState.isInitialized
    })
  }

  // Reset state to defaults
  const resetBrandingState = () => {
    console.log('Resetting branding state to defaults')
    
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
    brandingState.backgroundPattern = DEFAULT_BRANDING.backgroundPattern
    brandingState.logo = DEFAULT_BRANDING.logo
    brandingState.partnerName = DEFAULT_BRANDING.partnerName
    brandingState.fontFamily = DEFAULT_BRANDING.fontFamily
    brandingState.isInitialized = false
  }

  // Get current branding data (useful for components that need all values)
  const getBrandingData = () => ({
    primaryColor: brandingState.primaryColor,
    secondaryColor: brandingState.secondaryColor,
    primaryColorRgb: brandingState.primaryColorRgb,
    secondaryColorRgb: brandingState.secondaryColorRgb,
    backgroundColor: brandingState.backgroundColor,
    cardBackgroundColor: brandingState.cardBackgroundColor,
    textPrimaryColor: brandingState.textPrimaryColor,
    textSecondaryColor: brandingState.textSecondaryColor,
    textOnPrimaryColor: brandingState.textOnPrimaryColor,
    successColor: brandingState.successColor,
    warningColor: brandingState.warningColor,
    dangerColor: brandingState.dangerColor,
    accentColor: brandingState.accentColor,
    borderColor: brandingState.borderColor,
    backgroundPattern: brandingState.backgroundPattern,
    logo: brandingState.logo,
    partnerName: brandingState.partnerName,
    fontFamily: brandingState.fontFamily,
    isInitialized: brandingState.isInitialized
  })

  return {
    // Computed properties for reactive access
    primaryColor,
    secondaryColor,
    primaryColorRgb,
    secondaryColorRgb,
    backgroundColor,
    cardBackgroundColor,
    textPrimaryColor,
    textSecondaryColor,
    textOnPrimaryColor,
    successColor,
    warningColor,
    dangerColor,
    accentColor,
    borderColor,
    backgroundPattern,
    logo,
    partnerName,
    fontFamily,
    isInitialized,
    
    // State management methods
    updateBrandingState,
    resetBrandingState,
    getBrandingData
  }
}
