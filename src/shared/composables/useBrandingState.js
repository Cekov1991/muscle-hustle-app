import { reactive, computed } from 'vue'
import { DEFAULT_PALETTE, DEFAULT_BRANDING } from '../constants/brandingDefaults'
import { hexToRgb } from '../utils/colorHelpers'
import { isDarkMode } from '../utils/darkModeHelpers'

// Global branding state - shared across all components using this composable
const brandingState = reactive({
  // Dark mode state
  isDarkMode: isDarkMode(),
  
  // Light mode colors
  primaryColor: DEFAULT_PALETTE.primary,
  secondaryColor: DEFAULT_PALETTE.secondary,
  primaryColorRgb: hexToRgb(DEFAULT_PALETTE.primary),
  secondaryColorRgb: hexToRgb(DEFAULT_PALETTE.secondary),
  backgroundColor: DEFAULT_PALETTE.background,
  cardBackgroundColor: DEFAULT_PALETTE.cardBackground,
  inputBackgroundColor: DEFAULT_PALETTE.cardBackground, // Use card background for inputs in light mode
  textPrimaryColor: DEFAULT_PALETTE.textPrimary,
  textSecondaryColor: DEFAULT_PALETTE.textSecondary,
  textOnPrimaryColor: DEFAULT_PALETTE.textOnPrimary,
  successColor: DEFAULT_PALETTE.success,
  warningColor: DEFAULT_PALETTE.warning,
  dangerColor: DEFAULT_PALETTE.danger,
  accentColor: DEFAULT_PALETTE.accent,
  borderColor: DEFAULT_PALETTE.border,

  // Dark mode colors
  primaryColorDark: DEFAULT_PALETTE.primaryDark,
  secondaryColorDark: DEFAULT_PALETTE.secondaryDark,
  primaryColorRgbDark: hexToRgb(DEFAULT_PALETTE.primaryDark),
  secondaryColorRgbDark: hexToRgb(DEFAULT_PALETTE.secondaryDark),
  backgroundColorDark: DEFAULT_PALETTE.backgroundDark,
  cardBackgroundColorDark: DEFAULT_PALETTE.cardBackgroundDark,
  inputBackgroundColorDark: DEFAULT_PALETTE.inputBackgroundDark,
  textPrimaryColorDark: DEFAULT_PALETTE.textPrimaryDark,
  textSecondaryColorDark: DEFAULT_PALETTE.textSecondaryDark,
  textOnPrimaryColorDark: DEFAULT_PALETTE.textOnPrimaryDark,
  successColorDark: DEFAULT_PALETTE.successDark,
  warningColorDark: DEFAULT_PALETTE.warningDark,
  dangerColorDark: DEFAULT_PALETTE.dangerDark,
  accentColorDark: DEFAULT_PALETTE.accentDark,
  borderColorDark: DEFAULT_PALETTE.borderDark,
  
  // Gray scale colors - light mode
  gray10: DEFAULT_PALETTE.gray10,
  gray20: DEFAULT_PALETTE.gray20,
  gray30: DEFAULT_PALETTE.gray30,
  gray40: DEFAULT_PALETTE.gray40,
  gray50: DEFAULT_PALETTE.gray50,
  
  // Gray scale colors - dark mode
  gray10Dark: DEFAULT_PALETTE.gray10Dark,
  gray20Dark: DEFAULT_PALETTE.gray20Dark,
  gray30Dark: DEFAULT_PALETTE.gray30Dark,
  gray40Dark: DEFAULT_PALETTE.gray40Dark,
  gray50Dark: DEFAULT_PALETTE.gray50Dark,
  
  // Other
  backgroundPattern: DEFAULT_BRANDING.backgroundPattern,
  logo: DEFAULT_BRANDING.logo,
  partnerName: DEFAULT_BRANDING.partnerName,
  fontFamily: DEFAULT_BRANDING.fontFamily,
  isInitialized: false
})

export const useBrandingState = () => {
  // Dark mode state
  const isDarkModeActive = computed(() => brandingState.isDarkMode)

  // Mode-aware computed properties that automatically return the correct color based on current mode
  const primaryColor = computed(() => brandingState.isDarkMode ? brandingState.primaryColorDark : brandingState.primaryColor)
  const secondaryColor = computed(() => brandingState.isDarkMode ? brandingState.secondaryColorDark : brandingState.secondaryColor)
  const primaryColorRgb = computed(() => brandingState.isDarkMode ? brandingState.primaryColorRgbDark : brandingState.primaryColorRgb)
  const secondaryColorRgb = computed(() => brandingState.isDarkMode ? brandingState.secondaryColorRgbDark : brandingState.secondaryColorRgb)
  
  // Background colors
  const backgroundColor = computed(() => brandingState.isDarkMode ? brandingState.backgroundColorDark : brandingState.backgroundColor)
  const cardBackgroundColor = computed(() => brandingState.isDarkMode ? brandingState.cardBackgroundColorDark : brandingState.cardBackgroundColor)
  const inputBackgroundColor = computed(() => brandingState.isDarkMode ? brandingState.inputBackgroundColorDark : brandingState.inputBackgroundColor)
  
  // Text colors
  const textPrimaryColor = computed(() => brandingState.isDarkMode ? brandingState.textPrimaryColorDark : brandingState.textPrimaryColor)
  const textSecondaryColor = computed(() => brandingState.isDarkMode ? brandingState.textSecondaryColorDark : brandingState.textSecondaryColor)
  const textOnPrimaryColor = computed(() => brandingState.isDarkMode ? brandingState.textOnPrimaryColorDark : brandingState.textOnPrimaryColor)
  
  // Semantic colors
  const successColor = computed(() => brandingState.isDarkMode ? brandingState.successColorDark : brandingState.successColor)
  const warningColor = computed(() => brandingState.isDarkMode ? brandingState.warningColorDark : brandingState.warningColor)
  const dangerColor = computed(() => brandingState.isDarkMode ? brandingState.dangerColorDark : brandingState.dangerColor)
  const accentColor = computed(() => brandingState.isDarkMode ? brandingState.accentColorDark : brandingState.accentColor)
  
  // Other
  const borderColor = computed(() => brandingState.isDarkMode ? brandingState.borderColorDark : brandingState.borderColor)
  
  // Gray scale colors (mode-aware)
  const gray10 = computed(() => brandingState.isDarkMode ? brandingState.gray10Dark : brandingState.gray10)
  const gray20 = computed(() => brandingState.isDarkMode ? brandingState.gray20Dark : brandingState.gray20)
  const gray30 = computed(() => brandingState.isDarkMode ? brandingState.gray30Dark : brandingState.gray30)
  const gray40 = computed(() => brandingState.isDarkMode ? brandingState.gray40Dark : brandingState.gray40)
  const gray50 = computed(() => brandingState.isDarkMode ? brandingState.gray50Dark : brandingState.gray50)
  
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
    
    // Light mode colors - extract from visual identity with fallbacks to defaults
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

    // Dark mode colors - use dark variants if provided, fallback to light colors, then to defaults
    const primaryHexDark = visual_identity.primary_color_dark || visual_identity.primary_color || DEFAULT_PALETTE.primaryDark
    const secondaryHexDark = visual_identity.secondary_color_dark || visual_identity.secondary_color || DEFAULT_PALETTE.secondaryDark
    const backgroundColorHexDark = visual_identity.background_color_dark || DEFAULT_PALETTE.backgroundDark
    const cardBackgroundColorHexDark = visual_identity.card_background_color_dark || DEFAULT_PALETTE.cardBackgroundDark
    const textPrimaryHexDark = visual_identity.text_primary_color_dark || DEFAULT_PALETTE.textPrimaryDark
    const textSecondaryHexDark = visual_identity.text_secondary_color_dark || DEFAULT_PALETTE.textSecondaryDark
    const textOnPrimaryHexDark = visual_identity.text_on_primary_color_dark || DEFAULT_PALETTE.textOnPrimaryDark
    const successHexDark = visual_identity.success_color_dark || DEFAULT_PALETTE.successDark
    const warningHexDark = visual_identity.warning_color_dark || DEFAULT_PALETTE.warningDark
    const dangerHexDark = visual_identity.danger_color_dark || DEFAULT_PALETTE.dangerDark
    const accentHexDark = visual_identity.accent_color_dark || DEFAULT_PALETTE.accentDark
    const borderHexDark = visual_identity.border_color_dark || DEFAULT_PALETTE.borderDark
    
    // Convert primary/secondary to RGB for Ionic RGB variables (both modes)
    const primaryRgb = hexToRgb(primaryHex)
    const secondaryRgb = hexToRgb(secondaryHex)
    const primaryRgbDark = hexToRgb(primaryHexDark)
    const secondaryRgbDark = hexToRgb(secondaryHexDark)
    
    // Update light mode colors
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

    // Update dark mode colors
    brandingState.primaryColorDark = primaryHexDark
    brandingState.secondaryColorDark = secondaryHexDark
    brandingState.primaryColorRgbDark = primaryRgbDark
    brandingState.secondaryColorRgbDark = secondaryRgbDark
    brandingState.backgroundColorDark = backgroundColorHexDark
    brandingState.cardBackgroundColorDark = cardBackgroundColorHexDark
    brandingState.textPrimaryColorDark = textPrimaryHexDark
    brandingState.textSecondaryColorDark = textSecondaryHexDark
    brandingState.textOnPrimaryColorDark = textOnPrimaryHexDark
    brandingState.successColorDark = successHexDark
    brandingState.warningColorDark = warningHexDark
    brandingState.dangerColorDark = dangerHexDark
    brandingState.accentColorDark = accentHexDark
    brandingState.borderColorDark = borderHexDark

    // Update other properties
    brandingState.backgroundPattern = visual_identity.background_pattern || null
    brandingState.logo = visual_identity.logo || brandingState.logo
    brandingState.partnerName = partner.name || brandingState.partnerName
    brandingState.fontFamily = visual_identity.font_family || brandingState.fontFamily
    brandingState.isInitialized = true
    
    console.log('✅ [useBrandingState] Branding state updated:', {
      primaryColor: brandingState.primaryColor,
      primaryColorDark: brandingState.primaryColorDark,
      secondaryColor: brandingState.secondaryColor,
      partnerName: brandingState.partnerName,
      logo: brandingState.logo,
      fontFamily: brandingState.fontFamily,
      isInitialized: brandingState.isInitialized
    })
  }

  // Update dark mode state
  const updateDarkModeState = (isDark) => {
    console.log('🌙 [useBrandingState] updateDarkModeState called:', { isDark })
    brandingState.isDarkMode = isDark
  }

  // Reset state to defaults
  const resetBrandingState = () => {
    console.log('Resetting branding state to defaults')
    
    // Reset light mode colors to defaults
    brandingState.primaryColor = DEFAULT_PALETTE.primary
    brandingState.secondaryColor = DEFAULT_PALETTE.secondary
    brandingState.primaryColorRgb = hexToRgb(DEFAULT_PALETTE.primary)
    brandingState.secondaryColorRgb = hexToRgb(DEFAULT_PALETTE.secondary)
    brandingState.backgroundColor = DEFAULT_PALETTE.background
    brandingState.cardBackgroundColor = DEFAULT_PALETTE.cardBackground
    brandingState.inputBackgroundColor = DEFAULT_PALETTE.cardBackground
    brandingState.textPrimaryColor = DEFAULT_PALETTE.textPrimary
    brandingState.textSecondaryColor = DEFAULT_PALETTE.textSecondary
    brandingState.textOnPrimaryColor = DEFAULT_PALETTE.textOnPrimary
    brandingState.successColor = DEFAULT_PALETTE.success
    brandingState.warningColor = DEFAULT_PALETTE.warning
    brandingState.dangerColor = DEFAULT_PALETTE.danger
    brandingState.accentColor = DEFAULT_PALETTE.accent
    brandingState.borderColor = DEFAULT_PALETTE.border

    // Reset dark mode colors to defaults
    brandingState.primaryColorDark = DEFAULT_PALETTE.primaryDark
    brandingState.secondaryColorDark = DEFAULT_PALETTE.secondaryDark
    brandingState.primaryColorRgbDark = hexToRgb(DEFAULT_PALETTE.primaryDark)
    brandingState.secondaryColorRgbDark = hexToRgb(DEFAULT_PALETTE.secondaryDark)
    brandingState.backgroundColorDark = DEFAULT_PALETTE.backgroundDark
    brandingState.cardBackgroundColorDark = DEFAULT_PALETTE.cardBackgroundDark
    brandingState.inputBackgroundColorDark = DEFAULT_PALETTE.inputBackgroundDark
    brandingState.textPrimaryColorDark = DEFAULT_PALETTE.textPrimaryDark
    brandingState.textSecondaryColorDark = DEFAULT_PALETTE.textSecondaryDark
    brandingState.textOnPrimaryColorDark = DEFAULT_PALETTE.textOnPrimaryDark
    brandingState.successColorDark = DEFAULT_PALETTE.successDark
    brandingState.warningColorDark = DEFAULT_PALETTE.warningDark
    brandingState.dangerColorDark = DEFAULT_PALETTE.dangerDark
    brandingState.accentColorDark = DEFAULT_PALETTE.accentDark
    brandingState.borderColorDark = DEFAULT_PALETTE.borderDark

    // Reset gray scale colors to defaults
    brandingState.gray10 = DEFAULT_PALETTE.gray10
    brandingState.gray20 = DEFAULT_PALETTE.gray20
    brandingState.gray30 = DEFAULT_PALETTE.gray30
    brandingState.gray40 = DEFAULT_PALETTE.gray40
    brandingState.gray50 = DEFAULT_PALETTE.gray50
    brandingState.gray10Dark = DEFAULT_PALETTE.gray10Dark
    brandingState.gray20Dark = DEFAULT_PALETTE.gray20Dark
    brandingState.gray30Dark = DEFAULT_PALETTE.gray30Dark
    brandingState.gray40Dark = DEFAULT_PALETTE.gray40Dark
    brandingState.gray50Dark = DEFAULT_PALETTE.gray50Dark

    // Reset other properties
    brandingState.backgroundPattern = DEFAULT_BRANDING.backgroundPattern
    brandingState.logo = DEFAULT_BRANDING.logo
    brandingState.partnerName = DEFAULT_BRANDING.partnerName
    brandingState.fontFamily = DEFAULT_BRANDING.fontFamily
    brandingState.isInitialized = false
  }

  // Get current branding data (useful for components that need all values)
  const getBrandingData = () => ({
    // Dark mode state
    isDarkMode: brandingState.isDarkMode,
    
    // Light mode colors
    primaryColor: brandingState.primaryColor,
    secondaryColor: brandingState.secondaryColor,
    primaryColorRgb: brandingState.primaryColorRgb,
    secondaryColorRgb: brandingState.secondaryColorRgb,
    backgroundColor: brandingState.backgroundColor,
    cardBackgroundColor: brandingState.cardBackgroundColor,
    inputBackgroundColor: brandingState.inputBackgroundColor,
    textPrimaryColor: brandingState.textPrimaryColor,
    textSecondaryColor: brandingState.textSecondaryColor,
    textOnPrimaryColor: brandingState.textOnPrimaryColor,
    successColor: brandingState.successColor,
    warningColor: brandingState.warningColor,
    dangerColor: brandingState.dangerColor,
    accentColor: brandingState.accentColor,
    borderColor: brandingState.borderColor,

    // Dark mode colors
    primaryColorDark: brandingState.primaryColorDark,
    secondaryColorDark: brandingState.secondaryColorDark,
    primaryColorRgbDark: brandingState.primaryColorRgbDark,
    secondaryColorRgbDark: brandingState.secondaryColorRgbDark,
    backgroundColorDark: brandingState.backgroundColorDark,
    cardBackgroundColorDark: brandingState.cardBackgroundColorDark,
    inputBackgroundColorDark: brandingState.inputBackgroundColorDark,
    textPrimaryColorDark: brandingState.textPrimaryColorDark,
    textSecondaryColorDark: brandingState.textSecondaryColorDark,
    textOnPrimaryColorDark: brandingState.textOnPrimaryColorDark,
    successColorDark: brandingState.successColorDark,
    warningColorDark: brandingState.warningColorDark,
    dangerColorDark: brandingState.dangerColorDark,
    accentColorDark: brandingState.accentColorDark,
    borderColorDark: brandingState.borderColorDark,

    // Gray scale colors
    gray10: brandingState.gray10,
    gray20: brandingState.gray20,
    gray30: brandingState.gray30,
    gray40: brandingState.gray40,
    gray50: brandingState.gray50,
    gray10Dark: brandingState.gray10Dark,
    gray20Dark: brandingState.gray20Dark,
    gray30Dark: brandingState.gray30Dark,
    gray40Dark: brandingState.gray40Dark,
    gray50Dark: brandingState.gray50Dark,

    // Other properties
    backgroundPattern: brandingState.backgroundPattern,
    logo: brandingState.logo,
    partnerName: brandingState.partnerName,
    fontFamily: brandingState.fontFamily,
    isInitialized: brandingState.isInitialized
  })

  return {
    // Computed properties for reactive access (mode-aware)
    isDarkModeActive,
    primaryColor,
    secondaryColor,
    primaryColorRgb,
    secondaryColorRgb,
    backgroundColor,
    cardBackgroundColor,
    inputBackgroundColor,
    textPrimaryColor,
    textSecondaryColor,
    textOnPrimaryColor,
    successColor,
    warningColor,
    dangerColor,
    accentColor,
    borderColor,
    gray10,
    gray20,
    gray30,
    gray40,
    gray50,
    backgroundPattern,
    logo,
    partnerName,
    fontFamily,
    isInitialized,
    
    // State management methods
    updateBrandingState,
    updateDarkModeState,
    resetBrandingState,
    getBrandingData
  }
}
