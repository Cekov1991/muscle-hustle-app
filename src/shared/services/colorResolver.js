/**
 * Color resolution service for dark/light mode
 * Resolves the appropriate colors based on current mode and branding data
 */

/**
 * Resolve colors for the current mode (light or dark)
 * @param {Object} brandingData - Complete branding data with light and dark variants
 * @param {boolean} isDark - Whether to resolve for dark mode
 * @returns {Object} Resolved colors for the current mode
 */
export const resolveColorsForCurrentMode = (brandingData, isDark) => {
  return {
    // Primary colors
    primaryColor: isDark ? brandingData.primaryColorDark : brandingData.primaryColor,
    secondaryColor: isDark ? brandingData.secondaryColorDark : brandingData.secondaryColor,
    primaryColorRgb: isDark ? brandingData.primaryColorRgbDark : brandingData.primaryColorRgb,
    secondaryColorRgb: isDark ? brandingData.secondaryColorRgbDark : brandingData.secondaryColorRgb,
    
    // Background colors
    backgroundColor: isDark ? brandingData.backgroundColorDark : brandingData.backgroundColor,
    cardBackgroundColor: isDark ? brandingData.cardBackgroundColorDark : brandingData.cardBackgroundColor,
    inputBackgroundColor: isDark ? brandingData.inputBackgroundColorDark : brandingData.inputBackgroundColor,
    
    // Text colors
    textPrimaryColor: isDark ? brandingData.textPrimaryColorDark : brandingData.textPrimaryColor,
    textSecondaryColor: isDark ? brandingData.textSecondaryColorDark : brandingData.textSecondaryColor,
    textOnPrimaryColor: isDark ? brandingData.textOnPrimaryColorDark : brandingData.textOnPrimaryColor,
    
    // Semantic colors
    successColor: isDark ? brandingData.successColorDark : brandingData.successColor,
    warningColor: isDark ? brandingData.warningColorDark : brandingData.warningColor,
    dangerColor: isDark ? brandingData.dangerColorDark : brandingData.dangerColor,
    accentColor: isDark ? brandingData.accentColorDark : brandingData.accentColor,
    
    // Other colors
    borderColor: isDark ? brandingData.borderColorDark : brandingData.borderColor,
    
    // Gray scale colors
    gray10: isDark ? brandingData.gray10Dark : brandingData.gray10,
    gray20: isDark ? brandingData.gray20Dark : brandingData.gray20,
    gray30: isDark ? brandingData.gray30Dark : brandingData.gray30,
    gray40: isDark ? brandingData.gray40Dark : brandingData.gray40,
    gray50: isDark ? brandingData.gray50Dark : brandingData.gray50
  }
}

/**
 * Get resolved colors directly from branding data based on its internal dark mode state
 * @param {Object} brandingData - Complete branding data with isDarkMode property
 * @returns {Object} Resolved colors for the current mode
 */
export const getResolvedColors = (brandingData) => {
  return resolveColorsForCurrentMode(brandingData, brandingData.isDarkMode)
}

/**
 * Resolve colors with fallback logic
 * Useful when not all dark variants are provided
 * @param {Object} brandingData - Branding data (may have missing dark variants)
 * @param {boolean} isDark - Whether to resolve for dark mode
 * @param {Object} fallbacks - Fallback colors for missing variants
 * @returns {Object} Resolved colors with fallbacks applied
 */
export const resolveColorsWithFallbacks = (brandingData, isDark, fallbacks = {}) => {
  const resolved = resolveColorsForCurrentMode(brandingData, isDark)
  
  // Apply fallbacks for any undefined colors
  Object.keys(resolved).forEach(key => {
    if (resolved[key] === undefined && fallbacks[key]) {
      resolved[key] = fallbacks[key]
    }
  })
  
  return resolved
}
