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
      partnerName: brandingData.partnerName,
      hasLogo: !!brandingData.logo
    })
    brandingDOM.applyBrandingToDOM(brandingData)
    console.log('✅ [useBranding] Branding applied to DOM')
  }
  
  // Reset to default branding (called on logout)
  const resetBranding = () => {
    console.log('🔄 [useBranding] resetBranding called')
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
      console.log('🔄 [useBranding] Partner removed, resetting branding')
      // User logged out or partner data removed
      resetBranding()
    } else {
      console.log('⏸️ [useBranding] No partner found, skipping branding application')
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
