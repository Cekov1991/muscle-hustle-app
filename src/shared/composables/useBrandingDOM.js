import { generateShade } from '../utils/colorHelpers'
import { BRANDING_CSS_VARS, BRANDING_CLASSES } from '../constants/brandingDefaults'

export const useBrandingDOM = () => {
  // Apply CSS custom properties to document root
  const applyBrandingToDOM = (brandingData) => {
    const root = document.documentElement
    
    // Primary and secondary colors (hex)
    root.style.setProperty(BRANDING_CSS_VARS.PRIMARY, brandingData.primaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.SECONDARY, brandingData.secondaryColor)
    
    // Ionic colors (hex)
    root.style.setProperty(BRANDING_CSS_VARS.ION_PRIMARY, brandingData.primaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.ION_SECONDARY, brandingData.secondaryColor)
    
    // RGB values for Ionic components that need them (only for primary/secondary)
    root.style.setProperty(BRANDING_CSS_VARS.PRIMARY_RGB, brandingData.primaryColorRgb)
    root.style.setProperty(BRANDING_CSS_VARS.SECONDARY_RGB, brandingData.secondaryColorRgb)
    root.style.setProperty(BRANDING_CSS_VARS.ION_PRIMARY_RGB, brandingData.primaryColorRgb)
    root.style.setProperty(BRANDING_CSS_VARS.ION_SECONDARY_RGB, brandingData.secondaryColorRgb)
    
    // Generate and set shade colors for hover/active states
    const primaryShade = generateShade(brandingData.primaryColor)
    const secondaryShade = generateShade(brandingData.secondaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.PRIMARY_SHADE, primaryShade)
    root.style.setProperty(BRANDING_CSS_VARS.SECONDARY_SHADE, secondaryShade)
    root.style.setProperty(BRANDING_CSS_VARS.ION_PRIMARY_SHADE, primaryShade)
    root.style.setProperty(BRANDING_CSS_VARS.ION_SECONDARY_SHADE, secondaryShade)
    
    // Background colors (hex only)
    root.style.setProperty(BRANDING_CSS_VARS.BACKGROUND, brandingData.backgroundColor)
    root.style.setProperty(BRANDING_CSS_VARS.CARD_BACKGROUND, brandingData.cardBackgroundColor)
    
    // Text colors (hex only)
    root.style.setProperty(BRANDING_CSS_VARS.TEXT_PRIMARY, brandingData.textPrimaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.TEXT_SECONDARY, brandingData.textSecondaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.TEXT_ON_PRIMARY, brandingData.textOnPrimaryColor)
    
    // Semantic colors (hex only)
    root.style.setProperty(BRANDING_CSS_VARS.SUCCESS, brandingData.successColor)
    root.style.setProperty(BRANDING_CSS_VARS.WARNING, brandingData.warningColor)
    root.style.setProperty(BRANDING_CSS_VARS.DANGER, brandingData.dangerColor)
    root.style.setProperty(BRANDING_CSS_VARS.ACCENT, brandingData.accentColor)
    
    // Other colors (hex only)
    root.style.setProperty(BRANDING_CSS_VARS.BORDER, brandingData.borderColor)
    
    // Background pattern
    if (brandingData.backgroundPattern) {
      root.style.setProperty(BRANDING_CSS_VARS.BACKGROUND_PATTERN, `url(${brandingData.backgroundPattern})`)
    }
    
    // Logo and font
    if (brandingData.logo) {
      root.style.setProperty(BRANDING_CSS_VARS.LOGO_URL, `url(${brandingData.logo})`)
    }
    
    if (brandingData.fontFamily) {
      root.style.setProperty(BRANDING_CSS_VARS.FONT_FAMILY, brandingData.fontFamily)
    }
    
    // Add gym-branded class to body for CSS targeting
    document.body.classList.add(BRANDING_CLASSES.GYM_BRANDED)
  }

  // Remove all branding CSS custom properties
  const removeBrandingFromDOM = () => {
    const root = document.documentElement
    
    // List of all branding CSS variables to remove
    const propertiesToRemove = Object.values(BRANDING_CSS_VARS)
    
    propertiesToRemove.forEach(prop => {
      root.style.removeProperty(prop)
    })
    
    // Remove branding class
    document.body.classList.remove(BRANDING_CLASSES.GYM_BRANDED)
  }

  // Update specific CSS property (useful for individual updates)
  const updateCSSProperty = (property, value) => {
    if (Object.values(BRANDING_CSS_VARS).includes(property)) {
      document.documentElement.style.setProperty(property, value)
    } else {
      console.warn(`Invalid CSS property for branding: ${property}`)
    }
  }

  // Get current value of a CSS property
  const getCSSPropertyValue = (property) => {
    return getComputedStyle(document.documentElement).getPropertyValue(property)
  }

  // Check if branding is currently applied to DOM
  const isBrandingAppliedToDOM = () => {
    return document.body.classList.contains(BRANDING_CLASSES.GYM_BRANDED)
  }

  return {
    applyBrandingToDOM,
    removeBrandingFromDOM,
    updateCSSProperty,
    getCSSPropertyValue,
    isBrandingAppliedToDOM
  }
}
