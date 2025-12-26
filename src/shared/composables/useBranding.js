import { watch } from 'vue'
import { useAuth } from '../../features/auth/composables/useAuth'
import { useBrandingState } from './useBrandingState'
import { useBrandingDOM } from './useBrandingDOM'
import { createDarkModeListener } from '../utils/darkModeHelpers'

export const useBranding = () => {
  const { user } = useAuth()
  
  // Use the focused composables
  const brandingState = useBrandingState()
  const brandingDOM = useBrandingDOM()
  
  // Track dark mode listener cleanup function
  let darkModeCleanup = null
  
  // Apply branding based on partner visual identity with dark mode awareness
  const applyPartnerBranding = (partner) => {
    console.log('🎨 [useBranding] applyPartnerBranding called:', {
      hasPartner: !!partner,
      hasVisualIdentity: !!partner?.visual_identity,
      partnerName: partner?.name,
      visualIdentityKeys: partner?.visual_identity ? Object.keys(partner.visual_identity) : []
    })
    
    // Update the state
    brandingState.updateBrandingState(partner)
    
    // Apply to DOM
    const brandingData = brandingState.getBrandingData()
    console.log('🎨 [useBranding] Branding data prepared:', {
      isInitialized: brandingData.isInitialized,
      primaryColor: brandingData.primaryColor,
      primaryColorDark: brandingData.primaryColorDark,
      partnerName: brandingData.partnerName,
      hasLogo: !!brandingData.logo
    })
    brandingDOM.applyBrandingToDOM(brandingData)
    
    // Setup dark mode listener for automatic switching
    if (darkModeCleanup) {
      darkModeCleanup() // Cleanup previous listener
    }
    darkModeCleanup = brandingDOM.setupDarkModeListener(brandingData)
    
    // Also setup state listener for dark mode changes
    const stateCleanup = createDarkModeListener((isDark) => {
      brandingState.updateDarkModeState(isDark)
      // Re-apply branding when dark mode state changes
      const updatedBrandingData = brandingState.getBrandingData()
      brandingDOM.applyBrandingToDOM(updatedBrandingData)
    })
    
    // Combine cleanups
    const originalCleanup = darkModeCleanup
    darkModeCleanup = () => {
      if (originalCleanup) originalCleanup()
      if (stateCleanup) stateCleanup()
    }
    
    console.log('✅ [useBranding] Branding applied to DOM with dark mode support')
  }
  
  // Apply default branding (no partner) with dark mode support
  const applyDefaultBranding = () => {
    console.log('🎨 [useBranding] applyDefaultBranding called')
    
    // Reset to defaults but keep initialized state for dark mode
    brandingState.resetBrandingState()
    
    // Get default branding data
    const brandingData = brandingState.getBrandingData()
    console.log('🎨 [useBranding] Default branding data prepared:', {
      isInitialized: brandingData.isInitialized,
      primaryColor: brandingData.primaryColor,
      primaryColorDark: brandingData.primaryColorDark,
      isDarkMode: brandingData.isDarkMode
    })
    
    // Apply default branding to DOM
    brandingDOM.applyBrandingToDOM(brandingData)
    
    // Setup dark mode listener for default branding
    if (darkModeCleanup) {
      darkModeCleanup() // Cleanup previous listener
    }
    darkModeCleanup = brandingDOM.setupDarkModeListener(brandingData)
    
    // Also setup state listener for dark mode changes
    const stateCleanup = createDarkModeListener((isDark) => {
      brandingState.updateDarkModeState(isDark)
      // Re-apply branding when dark mode state changes
      const updatedBrandingData = brandingState.getBrandingData()
      brandingDOM.applyBrandingToDOM(updatedBrandingData)
    })
    
    // Combine cleanups
    const originalCleanup = darkModeCleanup
    darkModeCleanup = () => {
      if (originalCleanup) originalCleanup()
      if (stateCleanup) stateCleanup()
    }
    
    console.log('✅ [useBranding] Default branding applied to DOM with dark mode support')
  }

  // Reset to default branding (called on logout)
  const resetBranding = () => {
    console.log('🔄 [useBranding] resetBranding called')
    
    // Cleanup dark mode listeners
    if (darkModeCleanup) {
      darkModeCleanup()
      darkModeCleanup = null
    }
    
    // Reset the state
    brandingState.resetBrandingState()
    
    // Remove from DOM
    brandingDOM.removeBrandingFromDOM()
    console.log('✅ [useBranding] Branding reset to defaults')
  }
  
  // Watch for user changes to auto-apply branding
  watch(user, (newUser, oldUser) => {
    console.log('👀 [useBranding] User watcher triggered:', {
      hasNewUser: !!newUser,
      hasOldUser: !!oldUser,
      newUserHasPartner: !!newUser?.partner,
      newUserHasVisualIdentity: !!newUser?.partner?.visual_identity,
      oldUserHasPartner: !!oldUser?.partner,
      oldUserHasVisualIdentity: !!oldUser?.partner?.visual_identity,
      partnerName: newUser?.partner?.name,
      visualIdentityKeys: newUser?.partner?.visual_identity ? Object.keys(newUser.partner.visual_identity) : []
    })
    
    if (newUser?.partner) {
      console.log('🎨 [useBranding] Partner found, applying branding...')
      // User logged in or user data updated with partner info
      applyPartnerBranding(newUser.partner)
    } else if (oldUser?.partner && !newUser?.partner) {
      console.log('🔄 [useBranding] Partner removed, applying default branding')
      // User logged out or partner data removed - apply default branding with dark mode support
      applyDefaultBranding()
    } else if (!newUser?.partner) {
      console.log('🎨 [useBranding] No partner found, applying default branding')
      // No partner - apply default branding with dark mode support
      applyDefaultBranding()
    }
  }, { 
    immediate: true, // Apply branding immediately if user is already logged in
    deep: true // Watch for deep changes in user object
  })
  
  return {
    // Expose all reactive state properties
    ...brandingState,
    
    // Methods
    applyPartnerBranding,
    applyDefaultBranding,
    resetBranding
  }
}
