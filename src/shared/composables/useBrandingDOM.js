import { generateShade } from '../utils/colorHelpers'
import { BRANDING_CSS_VARS, BRANDING_CLASSES } from '../constants/brandingDefaults'
import { resolveColorsForCurrentMode } from '../services/colorResolver'
import { isDarkMode, createDarkModeListener } from '../utils/darkModeHelpers'

export const useBrandingDOM = () => {
  // Apply CSS custom properties to document root with dark mode awareness
  const applyBrandingToDOM = (brandingData) => {
    const root = document.documentElement
    const currentIsDark = isDarkMode()
    
    console.log('🎨 [useBrandingDOM] applyBrandingToDOM called:', {
      isDark: currentIsDark,
      hasLightColors: !!brandingData.primaryColor,
      hasDarkColors: !!brandingData.primaryColorDark
    })
    
    // Resolve colors for current mode
    const resolvedColors = resolveColorsForCurrentMode(brandingData, currentIsDark)
    
    // Primary and secondary colors (resolved for current mode)
    root.style.setProperty(BRANDING_CSS_VARS.PRIMARY, resolvedColors.primaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.SECONDARY, resolvedColors.secondaryColor)
    
    // Ionic colors (resolved for current mode)
    root.style.setProperty(BRANDING_CSS_VARS.ION_PRIMARY, resolvedColors.primaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.ION_SECONDARY, resolvedColors.secondaryColor)
    
    // RGB values for Ionic components (resolved for current mode)
    root.style.setProperty(BRANDING_CSS_VARS.PRIMARY_RGB, resolvedColors.primaryColorRgb)
    root.style.setProperty(BRANDING_CSS_VARS.SECONDARY_RGB, resolvedColors.secondaryColorRgb)
    root.style.setProperty(BRANDING_CSS_VARS.ION_PRIMARY_RGB, resolvedColors.primaryColorRgb)
    root.style.setProperty(BRANDING_CSS_VARS.ION_SECONDARY_RGB, resolvedColors.secondaryColorRgb)
    
    // Generate and set shade colors for hover/active states
    const primaryShade = generateShade(resolvedColors.primaryColor)
    const secondaryShade = generateShade(resolvedColors.secondaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.PRIMARY_SHADE, primaryShade)
    root.style.setProperty(BRANDING_CSS_VARS.SECONDARY_SHADE, secondaryShade)
    root.style.setProperty(BRANDING_CSS_VARS.ION_PRIMARY_SHADE, primaryShade)
    root.style.setProperty(BRANDING_CSS_VARS.ION_SECONDARY_SHADE, secondaryShade)
    
    // Background colors (resolved for current mode)
    root.style.setProperty(BRANDING_CSS_VARS.BACKGROUND, resolvedColors.backgroundColor)
    root.style.setProperty(BRANDING_CSS_VARS.CARD_BACKGROUND, resolvedColors.cardBackgroundColor)
    root.style.setProperty(BRANDING_CSS_VARS.INPUT_BACKGROUND, resolvedColors.inputBackgroundColor)
    
    // Text colors (resolved for current mode)
    root.style.setProperty(BRANDING_CSS_VARS.TEXT_PRIMARY, resolvedColors.textPrimaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.TEXT_SECONDARY, resolvedColors.textSecondaryColor)
    root.style.setProperty(BRANDING_CSS_VARS.TEXT_ON_PRIMARY, resolvedColors.textOnPrimaryColor)
    
    // Semantic colors (resolved for current mode)
    root.style.setProperty(BRANDING_CSS_VARS.SUCCESS, resolvedColors.successColor)
    root.style.setProperty(BRANDING_CSS_VARS.WARNING, resolvedColors.warningColor)
    root.style.setProperty(BRANDING_CSS_VARS.DANGER, resolvedColors.dangerColor)
    root.style.setProperty(BRANDING_CSS_VARS.ACCENT, resolvedColors.accentColor)
    
    // Other colors (resolved for current mode)
    root.style.setProperty(BRANDING_CSS_VARS.BORDER, resolvedColors.borderColor)
    
    // Gray scale colors (resolved for current mode)
    root.style.setProperty(BRANDING_CSS_VARS.GRAY_10, resolvedColors.gray10)
    root.style.setProperty(BRANDING_CSS_VARS.GRAY_20, resolvedColors.gray20)
    root.style.setProperty(BRANDING_CSS_VARS.GRAY_30, resolvedColors.gray30)
    root.style.setProperty(BRANDING_CSS_VARS.GRAY_40, resolvedColors.gray40)
    root.style.setProperty(BRANDING_CSS_VARS.GRAY_50, resolvedColors.gray50)
    
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
    
    console.log('✅ [useBrandingDOM] Branding applied to DOM:', {
      primaryColor: resolvedColors.primaryColor,
      backgroundColor: resolvedColors.backgroundColor,
      textPrimaryColor: resolvedColors.textPrimaryColor
    })
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

  // Setup dark mode listener for automatic re-application
  const setupDarkModeListener = (brandingData) => {
    console.log('🌙 [useBrandingDOM] Setting up dark mode listener')
    
    return createDarkModeListener((isDark) => {
      console.log('🌙 [useBrandingDOM] Dark mode changed:', { isDark })
      
      // Re-apply branding when dark mode changes
      applyBrandingToDOM(brandingData)
    })
  }

  return {
    applyBrandingToDOM,
    removeBrandingFromDOM,
    updateCSSProperty,
    getCSSPropertyValue,
    isBrandingAppliedToDOM,
    setupDarkModeListener
  }
}
