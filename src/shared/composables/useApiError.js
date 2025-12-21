import { useToast } from './useToast'

/**
 * Centralized API error handling
 * Extracted from useAuth.js and useWorkouts.js to eliminate duplication
 */
export const useApiError = () => {
  const { showError } = useToast()

  /**
   * Handle API errors with standardized error mapping
   * @param {Error} error - The error object from axios or other sources
   * @param {string} context - Context for the error (e.g., 'login', 'fetch workouts')
   * @param {string} defaultMessage - Default error message if no specific mapping found
   * @returns {string} The formatted error message
   */
  const handleApiError = (error, context = '', defaultMessage = 'An error occurred') => {
    console.error(`API Error [${context}]:`, error)
    
    let message = defaultMessage
    
    // Check if it's an ngrok connectivity issue - don't show error toast for these
    const isNgrokError = error.message?.includes('ngrok') || 
                        error.config?.url?.includes('ngrok') ||
                        error.code === 'ERR_NETWORK' ||
                        error.message?.includes('ERR_NGROK')
    
    if (isNgrokError) {
      console.warn(`Ngrok connectivity issue in ${context}, continuing silently...`)
      return 'Network connectivity issue (ngrok)'
    }
    
    // Handle different HTTP status codes
    if (error.response?.status === 401) {
      message = 'Unauthorized. Please log in again.'
    } else if (error.response?.status === 403) {
      message = 'You do not have permission to perform this action.'
    } else if (error.response?.status === 404) {
      message = 'Resource not found.'
    } else if (error.response?.status === 422) {
      // Handle validation errors
      const validationErrors = error.response.data?.errors
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0][0]
        message = firstError
      } else {
        message = error.response.data?.message || 'Validation error'
      }
    } else if (error.response?.status >= 500) {
      message = 'Server error. Please try again later.'
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      message = 'Network error. Please check your connection.'
    } else if (error.message) {
      message = error.message
    }
    
    // Show toast notification only for non-ngrok errors
    showError(message)
    
    return message
  }

  /**
   * Handle API errors without showing toast (useful when component wants to handle display)
   * @param {Error} error - The error object
   * @param {string} context - Context for the error
   * @param {string} defaultMessage - Default error message
   * @returns {string} The formatted error message
   */
  const getApiErrorMessage = (error, context = '', defaultMessage = 'An error occurred') => {
    console.error(`API Error [${context}]:`, error)
    
    let message = defaultMessage
    
    if (error.response?.status === 401) {
      message = 'Unauthorized. Please log in again.'
    } else if (error.response?.status === 403) {
      message = 'You do not have permission to perform this action.'
    } else if (error.response?.status === 404) {
      message = 'Resource not found.'
    } else if (error.response?.status === 422) {
      const validationErrors = error.response.data?.errors
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0][0]
        message = firstError
      } else {
        message = error.response.data?.message || 'Validation error'
      }
    } else if (error.response?.status >= 500) {
      message = 'Server error. Please try again later.'
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      message = 'Network error. Please check your connection.'
    } else if (error.message) {
      message = error.message
    }
    
    return message
  }

  /**
   * Create a standardized error handler for specific contexts
   * @param {string} context - The context for errors (e.g., 'authentication', 'workouts')
   * @param {string} defaultMessage - Default message for this context
   * @returns {Function} Error handler function
   */
  const createErrorHandler = (context, defaultMessage) => {
    return (error) => handleApiError(error, context, defaultMessage)
  }

  /**
   * Check if error is a specific HTTP status
   * @param {Error} error - The error object
   * @param {number} status - HTTP status code to check
   * @returns {boolean} True if error matches status
   */
  const isErrorStatus = (error, status) => {
    return error.response?.status === status
  }

  /**
   * Check if error is a network error
   * @param {Error} error - The error object
   * @returns {boolean} True if network error
   */
  const isNetworkError = (error) => {
    return error.code === 'NETWORK_ERROR' || !error.response
  }

  /**
   * Check if error is a validation error (422)
   * @param {Error} error - The error object
   * @returns {boolean} True if validation error
   */
  const isValidationError = (error) => {
    return error.response?.status === 422
  }

  /**
   * Extract validation errors from 422 response
   * @param {Error} error - The error object
   * @returns {Object|null} Validation errors object or null
   */
  const getValidationErrors = (error) => {
    if (isValidationError(error)) {
      return error.response.data?.errors || null
    }
    return null
  }

  return {
    handleApiError,
    getApiErrorMessage,
    createErrorHandler,
    isErrorStatus,
    isNetworkError,
    isValidationError,
    getValidationErrors
  }
}
