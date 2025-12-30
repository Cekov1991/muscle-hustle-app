import axios from 'axios'
import appConfig from '../../config/app'

/**
 * Centralized API client service
 * Replaces scattered axios imports and config throughout the application
 */

// Configuration from app config
const API_BASE_URL = appConfig.api.baseURL

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // Bypass ngrok warning page
  }
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Ensure ngrok skip header is always present (safety measure)
    config.headers['ngrok-skip-browser-warning'] = 'true'
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }
    
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for handling common response patterns
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }
    
    return response
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data)
    }
    
    // Only handle 401 if it's a genuine auth error, not a network/ngrok issue
    if (error.response?.status === 401 && 
        error.response?.data && 
        !error.message?.includes('ngrok') && 
        !error.config?.url?.includes('ngrok')) {
      
      // Clear auth data only for genuine auth failures
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      delete apiClient.defaults.headers.common['Authorization']
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

/**
 * API client methods for common HTTP operations
 */
export const api = {
  // GET request
  get: (url, config = {}) => apiClient.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // Upload file
  upload: (url, formData, config = {}) => {
    const uploadConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      }
    }
    return apiClient.post(url, formData, uploadConfig)
  },
  
  // Download file
  download: (url, config = {}) => {
    const downloadConfig = {
      ...config,
      responseType: 'blob'
    }
    return apiClient.get(url, downloadConfig)
  }
}

/**
 * Auth-specific API endpoints
 */
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  register: (userData) => api.post('/register', userData),
  getUser: () => api.get('/user'),
  refreshToken: () => api.post('/refresh'),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  resetPassword: (data) => api.post('/reset-password', data)
}

/**
 * Workouts-specific API endpoints
 */
export const workoutsAPI = {
  // Workout templates
  getWorkouts: () => api.get('/workout-templates'),
  getWorkout: (id) => api.get(`/workout-templates/${id}`),
  createWorkout: (data) => api.post('/workout-templates', data),
  updateWorkout: (id, data) => api.put(`/workout-templates/${id}`, data),
  deleteWorkout: (id) => api.delete(`/workout-templates/${id}`),
  
  // Exercises
  getExercises: () => api.get('/exercises'),
  getExercise: (id) => api.get(`/exercises/${id}`),
  
  // Workout template exercises
  addExerciseToWorkout: (templateId, data) => api.post(`/workout-templates/${templateId}/exercises`, data),
  updateExerciseInWorkout: (templateId, exerciseId, data) => api.put(`/workout-templates/${templateId}/exercises/${exerciseId}`, data),
  removeExerciseFromWorkout: (templateId, exerciseId) => api.delete(`/workout-templates/${templateId}/exercises/${exerciseId}`),
  reorderExercises: (templateId, orderArray) => api.post(`/workout-templates/${templateId}/order`, { order: orderArray }),
  
  // Workout sessions (for future use)
  createWorkoutSession: (data) => api.post('/workout-sessions', data),
  getWorkoutSessions: () => api.get('/workout-sessions'),
  getWorkoutSession: (id) => api.get(`/workout-sessions/${id}`),
  updateWorkoutSession: (id, data) => api.put(`/workout-sessions/${id}`, data),
  deleteWorkoutSession: (id) => api.delete(`/workout-sessions/${id}`),
  
  // Calendar endpoint
  getCalendarSessions: (startDate, endDate) => 
    api.get('/workout-sessions/calendar', { 
      params: { 
        start_date: startDate, 
        end_date: endDate 
      } 
    })
}

/**
 * Workout Sessions API endpoints
 * For active workout tracking and set logging
 */
export const workoutSessionsAPI = {
  // Get today's scheduled workout and active session
  getToday: () => api.get('/workout-sessions/today'),
  
  // Start a new workout session (optionally from template)
  start: (templateId = null) => api.post('/workout-sessions/start', 
    templateId ? { template_id: templateId } : {}),
  
  // Get session details with progress and previous sets
  getSession: (id) => api.get(`/workout-sessions/${id}`),
  
  // Log a completed set
  logSet: (sessionId, data) => api.post(`/workout-sessions/${sessionId}/sets`, data),
  
  // Update a logged set
  updateSet: (sessionId, setId, data) => api.put(`/workout-sessions/${sessionId}/sets/${setId}`, data),
  
  // Delete the last logged set for an exercise
  deleteSet: (sessionId, setId) => api.delete(`/workout-sessions/${sessionId}/sets/${setId}`),
  
  // Add exercise to session mid-workout
  addExercise: (sessionId, data) => api.post(`/workout-sessions/${sessionId}/exercises`, data),
  
  // Update exercise targets mid-workout
  updateExercise: (sessionId, exerciseId, data) => api.put(`/workout-sessions/${sessionId}/exercises/${exerciseId}`, data),
  
  // Remove exercise from session
  removeExercise: (sessionId, exerciseId) => api.delete(`/workout-sessions/${sessionId}/exercises/${exerciseId}`),
  
  // Reorder exercises in session
  reorderExercises: (sessionId, exerciseIds) => api.post(`/workout-sessions/${sessionId}/exercises/reorder`, { exercise_ids: exerciseIds }),
  
  // Complete the workout session
  complete: (sessionId, notes = null) => api.post(`/workout-sessions/${sessionId}/complete`, notes ? { notes } : {}),
  
  // Cancel/discard the workout session
  cancel: (sessionId) => api.delete(`/workout-sessions/${sessionId}/cancel`)
}

/**
 * Fitness metrics API endpoints
 */
export const fitnessAPI = {
  // Get current fitness metrics (all-time values)
  getMetrics: () => api.get('/user/fitness-metrics')
}

/**
 * Profile API endpoints
 */
export const profileAPI = {
  // Get user profile
  getProfile: () => api.get('/profile'),
  
  // Update profile (JSON)
  updateProfile: (data) => api.patch('/profile', data)
}

/**
 * Generic API helpers
 */
export const apiHelpers = {
  // Set auth token for all future requests
  setAuthToken: (token) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('auth_token', token)
    } else {
      delete apiClient.defaults.headers.common['Authorization']
      localStorage.removeItem('auth_token')
    }
  },
  
  // Clear auth token
  clearAuthToken: () => {
    delete apiClient.defaults.headers.common['Authorization']
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  },
  
  // Check if request is authenticated
  isAuthenticated: () => {
    return !!apiClient.defaults.headers.common['Authorization']
  },
  
  // Get base URL
  getBaseURL: () => API_BASE_URL,
  
  // Create cancel token for request cancellation
  createCancelToken: () => axios.CancelToken.source(),
  
  // Check if error is cancel error
  isCancel: (error) => axios.isCancel(error),
  
  // Set custom timeout for specific request
  withTimeout: (timeout) => (config = {}) => ({
    ...config,
    timeout
  }),
  
  // Add custom headers to request
  withHeaders: (headers) => (config = {}) => ({
    ...config,
    headers: {
      ...config.headers,
      ...headers
    }
  })
}

// Export the raw axios instance for advanced usage if needed
export { apiClient }

// Default export
export default api
