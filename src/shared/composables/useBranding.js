import { reactive, computed, watch } from 'vue'
import { useAuth } from '../../features/auth/composables/useAuth'

// Global branding state - shared across all components using this composable
const brandingState = reactive({
  primaryColor: '#3880ff',
  secondaryColor: '#0cd1e8',
  primaryColorRgb: '56, 128, 255',
  secondaryColorRgb: '12, 209, 232',
  logo: null,
  partnerName: 'Fitness App',
  fontFamily: null,
  isInitialized: false
})

// Helper function to convert RGB string to hex color
const rgbToHex = (rgb) => {
  if (!rgb) return '#000000'
  
  // Handle RGB string format like "255,107,53"
  const values = rgb.split(',').map(v => parseInt(v.trim()))
  if (values.length !== 3) return '#000000'
  
  const [r, g, b] = values
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// Helper function to generate shade colors (darker version for hover/active states)
const generateShade = (rgb, factor = 0.2) => {
  if (!rgb) return '#000000'
  
  // Handle RGB string format like "255,107,53"
  const values = rgb.split(',').map(v => parseInt(v.trim()))
  if (values.length !== 3) return '#000000'
  
  const [r, g, b] = values
  
  // Calculate darker shade
  const newR = Math.max(0, Math.floor(r * (1 - factor)))
  const newG = Math.max(0, Math.floor(g * (1 - factor)))
  const newB = Math.max(0, Math.floor(b * (1 - factor)))
  
  // Convert back to hex
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`
}

export const useBranding = () => {
  const { user } = useAuth()
  
  // Computed properties for reactive branding access
  const primaryColor = computed(() => brandingState.primaryColor)
  const secondaryColor = computed(() => brandingState.secondaryColor)
  const primaryColorRgb = computed(() => brandingState.primaryColorRgb)
  const secondaryColorRgb = computed(() => brandingState.secondaryColorRgb)
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
    
    // Backend provides colors as RGB strings (e.g., "255,107,53")
    // We need to convert them to hex for CSS properties that expect hex
    const primaryRgb = visual_identity.primary_color || brandingState.primaryColorRgb
    const secondaryRgb = visual_identity.secondary_color || brandingState.secondaryColorRgb
    const primaryHex = rgbToHex(primaryRgb)
    const secondaryHex = rgbToHex(secondaryRgb)
    
    // Update branding state
    brandingState.primaryColor = primaryHex
    brandingState.secondaryColor = secondaryHex
    brandingState.primaryColorRgb = primaryRgb
    brandingState.secondaryColorRgb = secondaryRgb
    brandingState.logo = visual_identity.logo || brandingState.logo
    brandingState.partnerName = partner.name || brandingState.partnerName
    brandingState.fontFamily = visual_identity.font_family || brandingState.fontFamily
    
    // Apply CSS custom properties dynamically to document root
    const root = document.documentElement
    
    // Brand colors (hex)
    root.style.setProperty('--brand-primary', primaryHex)
    root.style.setProperty('--brand-secondary', secondaryHex)
    
    // Ionic colors (hex)
    root.style.setProperty('--ion-color-primary', primaryHex)
    root.style.setProperty('--ion-color-secondary', secondaryHex)
    
    // RGB values for Ionic components that need them
    root.style.setProperty('--brand-primary-rgb', primaryRgb)
    root.style.setProperty('--brand-secondary-rgb', secondaryRgb)
    root.style.setProperty('--ion-color-primary-rgb', primaryRgb)
    root.style.setProperty('--ion-color-secondary-rgb', secondaryRgb)
    
    // Generate and set shade colors for hover/active states
    const primaryShade = generateShade(primaryRgb)
    const secondaryShade = generateShade(secondaryRgb)
    root.style.setProperty('--brand-primary-shade', primaryShade)
    root.style.setProperty('--brand-secondary-shade', secondaryShade)
    root.style.setProperty('--ion-color-primary-shade', primaryShade)
    root.style.setProperty('--ion-color-secondary-shade', secondaryShade)
    
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
    brandingState.primaryColor = '#3880ff'
    brandingState.secondaryColor = '#0cd1e8'
    brandingState.primaryColorRgb = '56, 128, 255'
    brandingState.secondaryColorRgb = '12, 209, 232'
    brandingState.logo = null
    brandingState.partnerName = 'Fitness App'
    brandingState.fontFamily = null
    
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
    // Reactive state
    primaryColor,
    secondaryColor,
    primaryColorRgb,
    secondaryColorRgb,
    logo,
    partnerName,
    fontFamily,
    isInitialized,
    
    // Methods
    applyPartnerBranding,
    resetBranding
  }
}
