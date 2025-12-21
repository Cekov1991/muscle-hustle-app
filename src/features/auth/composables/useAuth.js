import { ref, reactive, computed } from 'vue'
import { authAPI, apiHelpers } from '../../../shared/services/apiClient'
import { useApiError } from '../../../shared/composables/useApiError'


// Global state - shared across all components using this composable
const authState = reactive({
  token: null,
  user: null,
  isInitialized: false
})

// Initialize auth state from localStorage
const initializeAuth = () => {
  const storedToken = localStorage.getItem('auth_token')
  const storedUser = localStorage.getItem('user_data')
  
  if (storedToken) {
    authState.token = storedToken
    apiHelpers.setAuthToken(storedToken)
  }
  
  if (storedUser) {
    try {
      authState.user = JSON.parse(storedUser)
    } catch (e) {
      console.error('Error parsing stored user data:', e)
      localStorage.removeItem('user_data')
    }
  }
  
  authState.isInitialized = true
}

// Initialize on module load
initializeAuth()

export const useAuth = () => {
  const { getApiErrorMessage } = useApiError()
  
  // Computed properties for reactive state
  const isAuthenticated = computed(() => !!authState.token && !!authState.user)
  const user = computed(() => authState.user)
  const token = computed(() => authState.token)
  const isInitialized = computed(() => authState.isInitialized)

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authAPI.login({
        email: credentials.email,
        password: credentials.password
      })
      
      const { token: authToken, user: userData } = response.data
      
      if (!authToken || !userData) {
        throw new Error('Invalid response from server')
      }
      
      // Update reactive state
      authState.token = authToken
      authState.user = userData
      
      // Store in localStorage and set auth header
      localStorage.setItem('user_data', JSON.stringify(userData))
      apiHelpers.setAuthToken(authToken)
      
      return { token: authToken, user: userData }
    } catch (error) {
      const message = getApiErrorMessage(error, 'login', 'Login failed. Please try again.')
      throw new Error(message)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Optionally call logout endpoint on server
      if (authState.token) {
        await authAPI.logout()
      }
    } catch (error) {
      console.warn('Error during server logout:', error)
      // Continue with client logout even if server logout fails
    } finally {
      // Clear reactive state
      authState.token = null
      authState.user = null
      
      // Clear auth token and localStorage
      apiHelpers.clearAuthToken()
    }
  }

  // Check if token is still valid (optional - can be enhanced)
  const validateToken = async () => {
    if (!authState.token) return false
    
    try {
      const response = await authAPI.getUser()
      // Update user data if successful
      authState.user = response.data
      localStorage.setItem('user_data', JSON.stringify(response.data))
      return true
    } catch (error) {
      // Token is invalid, logout user
      console.warn('Token validation failed:', error)
      await logout()
      return false
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    if (!isAuthenticated.value) return null
    
    try {
      const response = await authAPI.getUser()
      authState.user = response.data
      localStorage.setItem('user_data', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      const message = getApiErrorMessage(error, 'refresh user', 'Failed to refresh user data')
      throw new Error(message)
    }
  }

  return {
    // Reactive state
    isAuthenticated,
    user,
    token,
    isInitialized,
    
    // Methods
    login,
    logout,
    validateToken,
    refreshUser
  }
}
