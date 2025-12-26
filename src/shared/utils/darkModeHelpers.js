/**
 * Dark mode detection and management utilities
 * Handles system color scheme preference detection and monitoring
 */

/**
 * Check if system is currently in dark mode
 * @returns {boolean} True if system prefers dark mode
 */
export const isDarkMode = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Create a listener for dark mode changes
 * @param {Function} callback - Function to call when dark mode preference changes
 * @returns {Function} Cleanup function to remove the listener
 */
export const createDarkModeListener = (callback) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  // Call callback immediately with current state
  callback(mediaQuery.matches)
  
  // Add change listener
  mediaQuery.addEventListener('change', (e) => callback(e.matches))
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', callback)
}

/**
 * Get the current color scheme preference
 * @returns {string} Either 'light' or 'dark'
 */
export const getColorScheme = () => {
  return isDarkMode() ? 'dark' : 'light'
}
