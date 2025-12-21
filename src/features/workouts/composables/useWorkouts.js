import { ref, reactive, toRefs } from 'vue'
import { workoutsAPI } from '../../../shared/services/apiClient'
import { useApiError } from '../../../shared/composables/useApiError'

// Global state - shared across all components using this composable
const workoutsState = reactive({
  workouts: [],
  exercises: [],
  loading: false,
  error: null
})

export const useWorkouts = () => {
  const { handleApiError } = useApiError()

  // Fetch all workout templates
  const fetchWorkouts = async () => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await workoutsAPI.getWorkouts()
      console.log('fetchWorkouts: API response:', response.data)
      workoutsState.workouts = response.data.data || []
      console.log('fetchWorkouts: Set workouts to:', workoutsState.workouts)
      console.log('fetchWorkouts: Workouts count:', workoutsState.workouts.length)
      return workoutsState.workouts
    } catch (error) {
      workoutsState.error = error
      
      // Check if it's an ngrok error - if so, don't throw and just continue with empty state
      const isNgrokError = error.message?.includes('ngrok') || 
                          error.config?.url?.includes('ngrok') ||
                          error.code === 'ERR_NETWORK' ||
                          error.message?.includes('ERR_NGROK')
      
      if (isNgrokError) {
        console.warn('Ngrok connectivity issue, showing empty state instead of error')
        workoutsState.workouts = []
        return workoutsState.workouts
      }
      
      handleApiError(error, 'workouts', 'Failed to fetch workouts')
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
      const response = await workoutsAPI.getWorkout(id)
      return response.data.data
    } catch (error) {
      workoutsState.error = error
      handleApiError(error, 'workouts', 'Failed to fetch workout')
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
      const response = await workoutsAPI.createWorkout(data)
      const newWorkout = response.data.data
      
      // Add to local state
      workoutsState.workouts.push(newWorkout)
      
      return newWorkout
    } catch (error) {
      workoutsState.error = error
      handleApiError(error, 'workouts', 'Failed to create workout')
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
      const response = await workoutsAPI.updateWorkout(id, data)
      const updatedWorkout = response.data.data
      
      // Update in local state
      const index = workoutsState.workouts.findIndex(w => w.id === id)
      if (index !== -1) {
        workoutsState.workouts[index] = updatedWorkout
      }
      
      return updatedWorkout
    } catch (error) {
      workoutsState.error = error
      handleApiError(error, 'workouts', 'Failed to update workout')
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
      await workoutsAPI.deleteWorkout(id)
      
      // Remove from local state
      workoutsState.workouts = workoutsState.workouts.filter(w => w.id !== id)
      
      return true
    } catch (error) {
      workoutsState.error = error
      handleApiError(error, 'workouts', 'Failed to delete workout')
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Fetch all exercises
  const fetchExercises = async () => {
    try {
      const response = await workoutsAPI.getExercises()
      workoutsState.exercises = response.data.data || []
      return workoutsState.exercises
    } catch (error) {
      handleApiError(error, 'exercises', 'Failed to fetch exercises')
      throw error
    }
  }

  // Helper function to update workout in local state
  const updateWorkoutInState = (templateId, updatedWorkout) => {
    const index = workoutsState.workouts.findIndex(w => w.id === templateId)
    if (index !== -1) {
      workoutsState.workouts[index] = updatedWorkout
    }
  }

  // Generic exercise operation handler
  const handleExerciseOperation = async (operation, templateId, exerciseId = null, data = null) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      let response
      
      switch (operation) {
        case 'add':
          response = await workoutsAPI.addExerciseToWorkout(templateId, data)
          break
        case 'update':
          response = await workoutsAPI.updateExerciseInWorkout(templateId, exerciseId, data)
          break
        case 'remove':
          response = await workoutsAPI.removeExerciseFromWorkout(templateId, exerciseId)
          break
        default:
          throw new Error(`Unknown operation: ${operation}`)
      }
      
      const updatedWorkout = response.data.data
      updateWorkoutInState(templateId, updatedWorkout)
      return updatedWorkout
    } catch (error) {
      workoutsState.error = error
      const errorMessage = operation === 'add' ? 'Failed to add exercise' 
        : operation === 'update' ? 'Failed to update exercise'
        : 'Failed to remove exercise'
      handleApiError(error, 'workouts', errorMessage)
      throw error
    } finally {
      workoutsState.loading = false
    }
  }

  // Add exercise to workout template
  const addExerciseToWorkout = async (templateId, exerciseData) => {
    return await handleExerciseOperation('add', templateId, null, exerciseData)
  }

  // Update exercise in workout template
  const updateExerciseInWorkout = async (templateId, exerciseId, data) => {
    return await handleExerciseOperation('update', templateId, exerciseId, data)
  }

  // Remove exercise from workout template
  const removeExerciseFromWorkout = async (templateId, exerciseId) => {
    return await handleExerciseOperation('remove', templateId, exerciseId, null)
  }

  // Reorder exercises in workout template
  const reorderExercises = async (templateId, orderArray) => {
    workoutsState.loading = true
    workoutsState.error = null
    
    try {
      const response = await workoutsAPI.reorderExercises(templateId, orderArray)
      const updatedWorkout = response.data.data
      
      // Update workout in local state
      updateWorkoutInState(templateId, updatedWorkout)
      
      return updatedWorkout
    } catch (error) {
      workoutsState.error = error
      handleApiError(error, 'workouts', 'Failed to reorder exercises')
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