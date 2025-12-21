import { watch } from 'vue'
import { useAuth } from '../../features/auth/composables/useAuth'
import { useBrandingState } from './useBrandingState'
import { useBrandingDOM } from './useBrandingDOM'

export const useBranding = () => {
  const { user } = useAuth()
  
  // Use the focused composables
  const brandingState = useBrandingState()
  const brandingDOM = useBrandingDOM()
  
  // Apply branding based on partner visual identity
  const applyPartnerBranding = (partner) => {
    // Update the state
    brandingState.updateBrandingState(partner)
    
    // Apply to DOM
    const brandingData = brandingState.getBrandingData()
    brandingDOM.applyBrandingToDOM(brandingData)
  }
  
  // Reset to default branding (called on logout)
  const resetBranding = () => {
    // Reset the state
    brandingState.resetBrandingState()
    
    // Remove from DOM
    brandingDOM.removeBrandingFromDOM()
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
    // Expose all reactive state properties
    ...brandingState,
    
    // Methods
    applyPartnerBranding,
    resetBranding
  }
}
