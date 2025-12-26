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
  console.log('🔧 [useAuth] initializeAuth called')
  const storedToken = localStorage.getItem('auth_token')
  const storedUser = localStorage.getItem('user_data')
  
  console.log('🔧 [useAuth] localStorage check:', {
    hasToken: !!storedToken,
    hasUserData: !!storedUser
  })
  
  if (storedToken) {
    authState.token = storedToken
    apiHelpers.setAuthToken(storedToken)
    console.log('✅ [useAuth] Token loaded from localStorage')
  }
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser)
      authState.user = parsedUser
      console.log('✅ [useAuth] User loaded from localStorage:', {
        hasUser: !!authState.user,
        hasPartner: !!authState.user?.partner,
        hasVisualIdentity: !!authState.user?.partner?.visual_identity,
        partnerName: authState.user?.partner?.name,
        visualIdentityKeys: authState.user?.partner?.visual_identity ? Object.keys(authState.user.partner.visual_identity) : []
      })
    } catch (e) {
      console.error('❌ [useAuth] Error parsing stored user data:', e)
      localStorage.removeItem('user_data')
    }
  } else {
    console.log('⚠️ [useAuth] No user data in localStorage')
  }
  
  authState.isInitialized = true
  console.log('✅ [useAuth] Auth initialization complete:', {
    isInitialized: authState.isInitialized,
    isAuthenticated: !!authState.token && !!authState.user
  })
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
    console.log('🔐 [useAuth] login called')
    try {
      const response = await authAPI.login({
        email: credentials.email,
        password: credentials.password
      })
      
      const { token: authToken, user: userData } = response.data
      
      if (!authToken || !userData) {
        throw new Error('Invalid response from server')
      }
      
      console.log('✅ [useAuth] Login successful:', {
        hasToken: !!authToken,
        hasUser: !!userData,
        hasPartner: !!userData?.partner,
        hasVisualIdentity: !!userData?.partner?.visual_identity,
        partnerName: userData?.partner?.name,
        visualIdentityKeys: userData?.partner?.visual_identity ? Object.keys(userData.partner.visual_identity) : []
      })
      
      // Update reactive state
      authState.token = authToken
      authState.user = userData
      
      // Store in localStorage and set auth header
      localStorage.setItem('user_data', JSON.stringify(userData))
      apiHelpers.setAuthToken(authToken)
      
      console.log('✅ [useAuth] User data stored in localStorage and state updated')
      
      return { token: authToken, user: userData }
    } catch (error) {
      // For validation errors (422), preserve the original error object
      // so the component can extract validation errors from error.response.data.errors
      if (error.response?.status === 422) {
        throw error // Re-throw original error with response data intact
      }
      
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
      // Backend returns { user: {...} }, extract user object
      const userData = response.data?.user || response.data
      // Update user data if successful
      authState.user = userData
      localStorage.setItem('user_data', JSON.stringify(userData))
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
    console.log('🔄 [useAuth] refreshUser called')
    console.log('🔄 [useAuth] Current state:', {
      isAuthenticated: isAuthenticated.value,
      hasToken: !!authState.token,
      hasUser: !!authState.user,
      userHasPartner: !!authState.user?.partner,
      userHasVisualIdentity: !!authState.user?.partner?.visual_identity
    })
    
    if (!isAuthenticated.value) {
      console.log('⚠️ [useAuth] Not authenticated, skipping refresh')
      return null
    }
    
    try {
      console.log('📡 [useAuth] Fetching fresh user data from /user endpoint...')
      const response = await authAPI.getUser()
      // Backend returns { user: {...} }, extract user object
      const freshUserData = response.data?.user || response.data
      
      console.log('✅ [useAuth] Fresh user data received:', {
        responseStructure: response.data?.user ? 'wrapped in user key' : 'direct user object',
        hasUser: !!freshUserData,
        hasPartner: !!freshUserData?.partner,
        hasVisualIdentity: !!freshUserData?.partner?.visual_identity,
        partnerName: freshUserData?.partner?.name,
        visualIdentityKeys: freshUserData?.partner?.visual_identity ? Object.keys(freshUserData.partner.visual_identity) : []
      })
      
      const oldUser = { ...authState.user }
      
      // Use fresh data directly (backend returns complete data with partner/visual_identity)
      authState.user = freshUserData
      localStorage.setItem('user_data', JSON.stringify(freshUserData))
      
      console.log('✅ [useAuth] User state updated:', {
        oldUserHadPartner: !!oldUser?.partner,
        oldUserHadVisualIdentity: !!oldUser?.partner?.visual_identity,
        freshDataHadPartner: !!freshUserData?.partner,
        freshDataHadVisualIdentity: !!freshUserData?.partner?.visual_identity,
        newUserHasPartner: !!authState.user?.partner,
        newUserHasVisualIdentity: !!authState.user?.partner?.visual_identity
      })
      
      return freshUserData
    } catch (error) {
      console.error('❌ [useAuth] Failed to refresh user data:', error)
      console.error('❌ [useAuth] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
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
