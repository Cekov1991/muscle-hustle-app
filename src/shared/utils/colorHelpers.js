/**
 * Pure color utility functions for branding system
 * Extracted from useBranding.js to promote reusability and testability
 */

/**
 * Convert hex color to RGB string (for Ionic RGB variables)
 * @param {string} hex - Hex color code (with or without #)
 * @returns {string} RGB string in format "r, g, b"
 */
export const hexToRgb = (hex) => {
  if (!hex) return '0, 0, 0'
  
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return `${r}, ${g}, ${b}`
  }
  
  // Handle 6-digit hex
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `${r}, ${g}, ${b}`
  }
  
  return '0, 0, 0'
}

/**
 * Generate a darker shade of a color
 * @param {string} hex - Hex color code (with or without #)
 * @param {number} factor - Darkening factor (0-1, default 0.2)
 * @returns {string} Darker hex color
 */
export const generateShade = (hex, factor = 0.2) => {
  if (!hex) return '#000000'
  
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  let r, g, b
  
  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    // Handle 6-digit hex
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
  } else {
    return '#000000'
  }
  
  // Calculate darker shade
  const newR = Math.max(0, Math.floor(r * (1 - factor)))
  const newG = Math.max(0, Math.floor(g * (1 - factor)))
  const newB = Math.max(0, Math.floor(b * (1 - factor)))
  
  // Convert back to hex
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`
}

/**
 * Generate a lighter tint of a color
 * @param {string} hex - Hex color code (with or without #)
 * @param {number} factor - Lightening factor (0-1, default 0.2)
 * @returns {string} Lighter hex color
 */
export const generateTint = (hex, factor = 0.2) => {
  if (!hex) return '#ffffff'
  
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  let r, g, b
  
  // Handle 3-digit hex
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    // Handle 6-digit hex
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
  } else {
    return '#ffffff'
  }
  
  // Calculate lighter tint
  const newR = Math.min(255, Math.floor(r + (255 - r) * factor))
  const newG = Math.min(255, Math.floor(g + (255 - g) * factor))
  const newB = Math.min(255, Math.floor(b + (255 - b) * factor))
  
  // Convert back to hex
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`
}

/**
 * Validate if a string is a valid hex color
 * @param {string} hex - Color string to validate
 * @returns {boolean} True if valid hex color
 */
export const isValidHex = (hex) => {
  if (!hex || typeof hex !== 'string') return false
  
  const cleanHex = hex.replace('#', '')
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)
}

/**
 * Ensure hex color has # prefix
 * @param {string} hex - Hex color code
 * @returns {string} Hex color with # prefix
 */
export const normalizeHex = (hex) => {
  if (!hex) return '#000000'
  return hex.startsWith('#') ? hex : `#${hex}`
}

/**
 * Get contrast ratio between two colors
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color  
 * @returns {number} Contrast ratio (1-21)
 */
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (hex) => {
    const cleanHex = hex.replace('#', '')
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255
    
    const sRGBToLinear = (c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    
    const rLinear = sRGBToLinear(r)
    const gLinear = sRGBToLinear(g)  
    const bLinear = sRGBToLinear(b)
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}
