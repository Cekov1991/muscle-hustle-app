import { ref, reactive, toRefs } from 'vue'
import axios from 'axios'
import appConfig from '../../../config/app'
import { useToast } from '../../../shared/composables/useToast'

// Configuration from app config
const API_BASE_URL = appConfig.api.baseURL

// Global state - shared across all components using this composable
const workoutsState = reactive({
  workouts: [],
  exercises: [],
  loading: false,
  error: null
})

export const useWorkouts = () => {
  const { showError, showSuccess } = useToast()

  // Helper function to handle API errors
  const handleError = (error, defaultMessage = 'An error occurred') => {
    console.error('Workouts API error:', error)
    
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
    
    showError(message)
    throw new Error(message)
  }

  // Fetch all workout templates
  const fetchWorkouts = async () => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await axios.get(`${API_BASE_URL}/workout-templates`)
      console.log('fetchWorkouts: API response:', response.data)
      workoutsState.workouts = response.data.data || []
      console.log('fetchWorkouts: Set workouts to:', workoutsState.workouts)
      console.log('fetchWorkouts: Workouts count:', workoutsState.workouts.length)
      return workoutsState.workouts
    } catch (error) {
      workoutsState.error = error
      handleError(error, 'Failed to fetch workouts')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Fetch single workout template
  const fetchWorkout = async (id) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await axios.get(`${API_BASE_URL}/workout-templates/${id}`)
      return response.data.data
    } catch (error) {
      workoutsState.error = error
      handleError(error, 'Failed to fetch workout')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Create workout template
  const createWorkout = async (data) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await axios.post(`${API_BASE_URL}/workout-templates`, data)
      const newWorkout = response.data.data
      
      // Add to local state
      workoutsState.workouts.push(newWorkout)
      
      showSuccess('Workout created successfully')
      return newWorkout
    } catch (error) {
      workoutsState.error = error
      handleError(error, 'Failed to create workout')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Update workout template
  const updateWorkout = async (id, data) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await axios.put(`${API_BASE_URL}/workout-templates/${id}`, data)
      const updatedWorkout = response.data.data
      
      // Update in local state
      const index = workoutsState.workouts.findIndex(w => w.id === id)
      if (index !== -1) {
        workoutsState.workouts[index] = updatedWorkout
      }
      
      showSuccess('Workout updated successfully')
      return updatedWorkout
    } catch (error) {
      workoutsState.error = error
      handleError(error, 'Failed to update workout')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Delete workout template
  const deleteWorkout = async (id) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      await axios.delete(`${API_BASE_URL}/workout-templates/${id}`)
      
      // Remove from local state
      workoutsState.workouts = workoutsState.workouts.filter(w => w.id !== id)
      
      showSuccess('Workout deleted successfully')
      return true
    } catch (error) {
      workoutsState.error = error
      handleError(error, 'Failed to delete workout')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Fetch all exercises
  const fetchExercises = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/exercises`)
      workoutsState.exercises = response.data.data || []
      return workoutsState.exercises
    } catch (error) {
      handleError(error, 'Failed to fetch exercises')
      throw error
    }
  }

  // Add exercise to workout template
  const addExerciseToWorkout = async (templateId, exerciseData) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/workout-templates/${templateId}/exercises`,
        exerciseData
      )
      const updatedWorkout = response.data.data
      
      // Update workout in local state
      const index = workoutsState.workouts.findIndex(w => w.id === templateId)
      if (index !== -1) {
        workoutsState.workouts[index] = updatedWorkout
      }
      
      showSuccess('Exercise added successfully')
      return updatedWorkout
    } catch (error) {
      workoutsState.error = error
      handleError(error, 'Failed to add exercise')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Update exercise in workout template
  const updateExerciseInWorkout = async (templateId, exerciseId, data) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/workout-templates/${templateId}/exercises/${exerciseId}`,
        data
      )
      const updatedWorkout = response.data.data
      
      // Update workout in local state
      const index = workoutsState.workouts.findIndex(w => w.id === templateId)
      if (index !== -1) {
        workoutsState.workouts[index] = updatedWorkout
      }
      
      showSuccess('Exercise updated successfully')
      return updatedWorkout
    } catch (error) {
      workoutsState.error = error
      handleError(error, 'Failed to update exercise')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Remove exercise from workout template
  const removeExerciseFromWorkout = async (templateId, exerciseId) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/workout-templates/${templateId}/exercises/${exerciseId}`
      )
      const updatedWorkout = response.data.data
      
      // Update workout in local state
      const index = workoutsState.workouts.findIndex(w => w.id === templateId)
      if (index !== -1) {
        workoutsState.workouts[index] = updatedWorkout
      }
      
      showSuccess('Exercise removed successfully')
      return updatedWorkout
    } catch (error) {
      workoutsState.error = error
      handleError(error, 'Failed to remove exercise')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Reorder exercises in workout template
  const reorderExercises = async (templateId, orderArray) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/workout-templates/${templateId}/order`,
        { order: orderArray }
      )
      const updatedWorkout = response.data.data
      
      // Update workout in local state
      const index = workoutsState.workouts.findIndex(w => w.id === templateId)
      if (index !== -1) {
        workoutsState.workouts[index] = updatedWorkout
      }
      
      showSuccess('Exercise order updated successfully')
      return updatedWorkout
    } catch (error) {
      workoutsState.error = error
      handleError(error, 'Failed to reorder exercises')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  return {
    // Reactive state - use toRefs to maintain reactivity when destructuring
    ...toRefs(workoutsState),
    
    // Methods
    fetchWorkouts,
    fetchWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    fetchExercises,
    addExerciseToWorkout,
    updateExerciseInWorkout,
    removeExerciseFromWorkout,
    reorderExercises
  }
}

