import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import appConfig from '../../../config/app'

// Configuration from app config
const API_BASE_URL = appConfig.api.baseURL

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
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
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
  // Computed properties for reactive state
  const isAuthenticated = computed(() => !!authState.token && !!authState.user)
  const user = computed(() => authState.user)
  const token = computed(() => authState.token)
  const isInitialized = computed(() => authState.isInitialized)

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
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
      
      // Store in localStorage for persistence
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      // Set default authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      return { token: authToken, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password')
      } else if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors
        if (validationErrors) {
          const firstError = Object.values(validationErrors)[0][0]
          throw new Error(firstError)
        }
        throw new Error('Please check your input')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.')
      }
      
      throw new Error('Login failed. Please try again.')
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Optionally call logout endpoint on server
      if (authState.token) {
        await axios.post(`${API_BASE_URL}/logout`)
      }
    } catch (error) {
      console.warn('Error during server logout:', error)
      // Continue with client logout even if server logout fails
    } finally {
      // Clear reactive state
      authState.token = null
      authState.user = null
      
      // Clear localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      // Clear authorization header
      delete axios.defaults.headers.common['Authorization']
    }
  }

  // Check if token is still valid (optional - can be enhanced)
  const validateToken = async () => {
    if (!authState.token) return false
    
    try {
      const response = await axios.get(`${API_BASE_URL}/user`)
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
      const response = await axios.get(`${API_BASE_URL}/user`)
      authState.user = response.data
      localStorage.setItem('user_data', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      console.error('Error refreshing user data:', error)
      throw error
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
