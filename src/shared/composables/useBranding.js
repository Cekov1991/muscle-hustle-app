import { watch, computed, ref } from 'vue'
import { useAuth } from '../../features/auth/composables/useAuth'
import { useBrandingState } from './useBrandingState'
import { useBrandingDOM } from './useBrandingDOM'
import { createDarkModeListener } from '../utils/darkModeHelpers'

// Debug flag for conditional logging
const DEBUG = import.meta.env.DEV

const debugLog = (...args) => {
  if (DEBUG) console.log(...args)
}

export const useBranding = () => {
  const { user } = useAuth()
  
  // Use the focused composables
  const brandingState = useBrandingState()
  const brandingDOM = useBrandingDOM()
  
  // Track dark mode listener cleanup functions using ref to avoid closure issues
  const cleanupFunctions = ref([])
  
  // Helper to cleanup all listeners
  const cleanupListeners = () => {
    cleanupFunctions.value.forEach(cleanup => {
      if (cleanup && typeof cleanup === 'function') {
        try {
          cleanup()
        } catch (error) {
          if (DEBUG) console.error('[useBranding] Error during cleanup:', error)
        }
      }
    })
    cleanupFunctions.value = []
  }
  
  // Helper to setup single dark mode listener that handles both state and DOM updates
  const setupDarkModeListener = () => {
    cleanupListeners() // Cleanup any existing listeners first
    
    const cleanup = createDarkModeListener((isDark) => {
      debugLog('🌙 [useBranding] Dark mode changed:', { isDark })
      
      // Update state
      brandingState.updateDarkModeState(isDark)
      
      // Re-apply branding to DOM with updated colors
      const updatedBrandingData = brandingState.getBrandingData()
      brandingDOM.applyBrandingToDOM(updatedBrandingData)
    })
    
    cleanupFunctions.value = [cleanup]
    return cleanup
  }
  
  /**
   * Apply branding based on partner visual identity with dark mode awareness
   * Updates state, applies CSS variables to DOM, and sets up dark mode listener
   * @param {Object} partner - Partner object with visual_identity property
   * @param {Object} partner.visual_identity - Visual identity object with colors, logo, font, etc.
   * @param {string} partner.name - Partner name
   * @example
   * branding.apply({
   *   name: "Muscle Hustle",
   *   visual_identity: {
   *     primary_color: "255,107,53",
   *     logo: "/images/logo.png"
   *   }
   * })
   */
  const applyPartnerBranding = (partner) => {
    debugLog('🎨 [useBranding] applyPartnerBranding called:', {
      hasPartner: !!partner,
      hasVisualIdentity: !!partner?.visual_identity,
      partnerName: partner?.name,
      visualIdentityKeys: partner?.visual_identity ? Object.keys(partner.visual_identity) : []
    })
    
    // Update the state
    brandingState.updateBrandingState(partner)
    
    // Apply to DOM
    const brandingData = brandingState.getBrandingData()
    debugLog('🎨 [useBranding] Branding data prepared:', {
      isInitialized: brandingData.isInitialized,
      primaryColor: brandingData.primaryColor,
      primaryColorDark: brandingData.primaryColorDark,
      partnerName: brandingData.partnerName,
      hasLogo: !!brandingData.logo
    })
    brandingDOM.applyBrandingToDOM(brandingData)
    
    // Setup single dark mode listener that handles both state and DOM updates
    setupDarkModeListener()
    
    debugLog('✅ [useBranding] Branding applied to DOM with dark mode support')
  }
  
  /**
   * Apply default branding (no partner) with dark mode support
   * Resets to default colors and applies them to DOM
   * @example
   * branding.applyDefault()
   */
  const applyDefaultBranding = () => {
    debugLog('🎨 [useBranding] applyDefaultBranding called')
    
    // Reset to defaults but keep initialized state for dark mode
    brandingState.resetBrandingState()
    
    // Get default branding data
    const brandingData = brandingState.getBrandingData()
    debugLog('🎨 [useBranding] Default branding data prepared:', {
      isInitialized: brandingData.isInitialized,
      primaryColor: brandingData.primaryColor,
      primaryColorDark: brandingData.primaryColorDark,
      isDarkMode: brandingData.isDarkMode
    })
    
    // Apply default branding to DOM
    brandingDOM.applyBrandingToDOM(brandingData)
    
    // Setup single dark mode listener that handles both state and DOM updates
    setupDarkModeListener()
    
    debugLog('✅ [useBranding] Default branding applied to DOM with dark mode support')
  }

  /**
   * Reset to default branding (called on logout)
   * Cleans up listeners, resets state, and removes branding from DOM
   * @example
   * branding.reset()
   */
  const resetBranding = () => {
    debugLog('🔄 [useBranding] resetBranding called')
    
    // Cleanup dark mode listeners
    cleanupListeners()
    
    // Reset the state
    brandingState.resetBrandingState()
    
    // Remove from DOM
    brandingDOM.removeBrandingFromDOM()
    debugLog('✅ [useBranding] Branding reset to defaults')
  }
  
  // Extract partner from user for more efficient watching
  const userPartner = computed(() => user.value?.partner)
  
  // Watch for partner changes to auto-apply branding (more efficient than watching entire user object)
  watch(userPartner, (newPartner, oldPartner) => {
    debugLog('👀 [useBranding] Partner watcher triggered:', {
      hasNewPartner: !!newPartner,
      hasOldPartner: !!oldPartner,
      newPartnerName: newPartner?.name,
      hasVisualIdentity: !!newPartner?.visual_identity
    })
    
    if (newPartner) {
      debugLog('🎨 [useBranding] Partner found, applying branding...')
      // User logged in or user data updated with partner info
      applyPartnerBranding(newPartner)
    } else if (oldPartner && !newPartner) {
      debugLog('🔄 [useBranding] Partner removed, applying default branding')
      // User logged out or partner data removed - apply default branding with dark mode support
      applyDefaultBranding()
    } else if (!newPartner) {
      debugLog('🎨 [useBranding] No partner found, applying default branding')
      // No partner - apply default branding with dark mode support
      applyDefaultBranding()
    }
  }, { 
    immediate: true // Apply branding immediately if user is already logged in
  })
  
  return {
    // Clean grouped API
    colors: brandingState.colors,
    assets: brandingState.assets,
    metadata: brandingState.metadata,
    
    // Methods
    apply: applyPartnerBranding,
    applyDefault: applyDefaultBranding,
    reset: resetBranding,
    
    // Legacy API (deprecated - use grouped API above)
    ...brandingState,
    applyPartnerBranding,
    applyDefaultBranding,
    resetBranding
  }
}
