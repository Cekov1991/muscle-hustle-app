// Test utility for dynamic branding system
// This simulates the actual backend response format

export const simulateBackendResponse = () => {
  return {
    "message": "Login successful",
    "user": {
      "id": 1,
      "name": "Kiril Atanasoski",
      "email": "atanasoski992@gmail.com",
      "profile_photo": null,
      "partner": {
        "id": 1,
        "name": "Muscle Hustle",
        "slug": "muscle-hustle",
        "visual_identity": {
          "primary_color": "255,107,53",      // RGB format from backend
          "secondary_color": "78,205,196",    // RGB format from backend
          "logo": "/images/muscle-hustle-logo.png",
          "font_family": "Inter"
        }
      },
      "email_verified_at": "2025-12-20T20:25:08.000000Z",
      "created_at": "2025-12-20T20:25:08.000000Z",
      "updated_at": "2025-12-20T20:25:08.000000Z"
    },
    "token": "6|LAjvxQOGxPU3X4QgKMIC83tQWo0FKhuoSp7kevIu2060da53"
  }
}

// Function to test branding application
export const testBrandingApplication = async (useAuth, useBranding) => {
  console.log('🧪 Testing Dynamic Branding System')
  
  const backendResponse = simulateBackendResponse()
  const { user: userData } = backendResponse
  
  console.log('📥 Simulated Backend Response:', {
    partnerName: userData.partner.name,
    primaryColor: userData.partner.visual_identity.primary_color,
    secondaryColor: userData.partner.visual_identity.secondary_color,
    logo: userData.partner.visual_identity.logo,
    fontFamily: userData.partner.visual_identity.font_family
  })
  
  // Simulate login by updating auth state (in real app, this happens in login function)
  const { login } = useAuth()
  const { primaryColor, secondaryColor, primaryColorRgb, secondaryColorRgb, partnerName, logo } = useBranding()
  
  console.log('🎨 Expected Branding Changes:')
  console.log('  - Primary Color (RGB):', userData.partner.visual_identity.primary_color, '→ Hex conversion')
  console.log('  - Secondary Color (RGB):', userData.partner.visual_identity.secondary_color, '→ Hex conversion')
  console.log('  - Partner Name:', userData.partner.name)
  console.log('  - Logo:', userData.partner.visual_identity.logo)
  console.log('  - Font:', userData.partner.visual_identity.font_family)
  
  // In a real test, you would call login() with credentials
  // For this demo, we'll show what the values should be after branding is applied
  
  return {
    expectedResults: {
      partnerName: userData.partner.name,
      primaryColorHex: '#FF6B35',  // Converted from "255,107,53"
      secondaryColorHex: '#4ECDC4', // Converted from "78,205,196"  
      primaryColorRgb: userData.partner.visual_identity.primary_color,
      secondaryColorRgb: userData.partner.visual_identity.secondary_color,
      logo: userData.partner.visual_identity.logo,
      fontFamily: userData.partner.visual_identity.font_family
    }
  }
}

// Color conversion utility (matches the one in useBranding)
export const rgbToHex = (rgb) => {
  if (!rgb) return '#000000'
  
  const values = rgb.split(',').map(v => parseInt(v.trim()))
  if (values.length !== 3) return '#000000'
  
  const [r, g, b] = values
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

// Example usage and verification
console.log('🎯 Color Conversion Examples:')
console.log('RGB "255,107,53" → Hex:', rgbToHex('255,107,53'))  // Should be #FF6B35
console.log('RGB "78,205,196" → Hex:', rgbToHex('78,205,196'))  // Should be #4ECDC4
