import { ref, reactive, toRefs, computed } from 'vue'
import { workoutSessionsAPI } from '../../../shared/services/apiClient'
import { useApiError } from '../../../shared/composables/useApiError'

// Global state - shared across all components using this composable
const sessionState = reactive({
  todayData: null, // { template, session } from GET /today
  session: null, // Active session with full details
  exercises: [], // Processed exercises with logged/previous sets
  progress: null, // { total_exercises, completed_exercises, progress_percent }
  loading: false,
  startingSession: false,
  error: null
})

export const useWorkoutSession = () => {
  const { handleApiError } = useApiError()
  
  // Loading states for individual operations
  const loggingSet = ref(false)
  const updatingSet = ref(false)
  const deletingSet = ref(false)
  
  // Computed
  const hasActiveSession = computed(() => !!sessionState.session && !sessionState.session.completed_at)
  const isCompleted = computed(() => !!sessionState.session?.completed_at)
  const progressPercent = computed(() => sessionState.progress?.progress_percent || 0)
  
  /**
   * Fetch today's workout data (template and/or active session)
   */
  const fetchToday = async () => {
    sessionState.loading = true
    sessionState.error = null
    
    try {
      const response = await workoutSessionsAPI.getToday()
      sessionState.todayData = response.data?.data || null
      
      // If there's an active session, also load its full details
      if (sessionState.todayData?.session) {
        await fetchSession(sessionState.todayData.session.id)
      }
      
      return sessionState.todayData
    } catch (error) {
      sessionState.error = error
      handleApiError(error, 'workout', 'Failed to fetch today\'s workout')
      throw error
    } finally {
      sessionState.loading = false
    }
  }
  
  /**
   * Start a new workout session
   * @param {number|null} templateId - Optional template ID to start from
   */
  const startSession = async (templateId = null) => {
    sessionState.startingSession = true
    sessionState.error = null
    
    try {
      const response = await workoutSessionsAPI.start(templateId)
      const newSession = response.data?.data
      
      // Load full session details
      if (newSession?.id) {
        await fetchSession(newSession.id)
      }
      
      return newSession
    } catch (error) {
      sessionState.error = error
      handleApiError(error, 'workout', 'Failed to start workout')
      throw error
    } finally {
      sessionState.startingSession = false
    }
  }
  
  /**
   * Fetch full session details with progress and previous sets
   * @param {number} sessionId 
   */
  const fetchSession = async (sessionId) => {
    sessionState.loading = true
    sessionState.error = null
    
    try {
      const response = await workoutSessionsAPI.getSession(sessionId)
      const data = response.data?.data
      
      sessionState.session = data?.session || null
      sessionState.exercises = data?.exercises || []
      sessionState.progress = data?.progress || null
      
      return data
    } catch (error) {
      sessionState.error = error
      handleApiError(error, 'workout', 'Failed to load workout session')
      throw error
    } finally {
      sessionState.loading = false
    }
  }
  
  /**
   * Log a completed set
   * @param {number} exerciseId - The exercise ID
   * @param {object} setData - { set_number, weight, reps, rest_seconds? }
   */
  const logSet = async (exerciseId, setData) => {
    if (!sessionState.session?.id) {
      throw new Error('No active session')
    }
    
    loggingSet.value = true
    
    try {
      const response = await workoutSessionsAPI.logSet(sessionState.session.id, {
        exercise_id: exerciseId,
        ...setData
      })
      
      // Refresh session to get updated progress
      await fetchSession(sessionState.session.id)
      
      return response.data?.data
    } catch (error) {
      handleApiError(error, 'workout', 'Failed to log set')
      throw error
    } finally {
      loggingSet.value = false
    }
  }
  
  /**
   * Update a logged set
   * @param {number} setId - The set log ID
   * @param {object} updates - { weight?, reps? }
   */
  const updateSet = async (setId, updates) => {
    if (!sessionState.session?.id) {
      throw new Error('No active session')
    }
    
    updatingSet.value = true
    
    try {
      const response = await workoutSessionsAPI.updateSet(
        sessionState.session.id, 
        setId, 
        updates
      )
      
      // Refresh session to get updated data
      await fetchSession(sessionState.session.id)
      
      return response.data?.data
    } catch (error) {
      handleApiError(error, 'workout', 'Failed to update set')
      throw error
    } finally {
      updatingSet.value = false
    }
  }
  
  /**
   * Delete the last logged set for an exercise
   * @param {number} setId - The set log ID
   */
  const deleteSet = async (setId) => {
    if (!sessionState.session?.id) {
      throw new Error('No active session')
    }
    
    deletingSet.value = true
    
    try {
      await workoutSessionsAPI.deleteSet(sessionState.session.id, setId)
      
      // Refresh session to get updated progress
      await fetchSession(sessionState.session.id)
      
      return true
    } catch (error) {
      handleApiError(error, 'workout', 'Failed to delete set')
      throw error
    } finally {
      deletingSet.value = false
    }
  }
  
  /**
   * Add an exercise to the current session
   * @param {object} exerciseData - { exercise_id, order?, target_sets?, target_reps?, target_weight?, rest_seconds? }
   */
  const addExercise = async (exerciseData) => {
    if (!sessionState.session?.id) {
      throw new Error('No active session')
    }
    
    sessionState.loading = true
    
    try {
      const response = await workoutSessionsAPI.addExercise(
        sessionState.session.id, 
        exerciseData
      )
      
      // Refresh session to get updated exercises
      await fetchSession(sessionState.session.id)
      
      return response.data?.data
    } catch (error) {
      handleApiError(error, 'workout', 'Failed to add exercise')
      throw error
    } finally {
      sessionState.loading = false
    }
  }
  
  /**
   * Update exercise targets in the current session
   * @param {number} sessionExerciseId 
   * @param {object} updates - { target_sets?, target_reps?, target_weight?, rest_seconds? }
   */
  const updateExercise = async (sessionExerciseId, updates) => {
    if (!sessionState.session?.id) {
      throw new Error('No active session')
    }
    
    try {
      const response = await workoutSessionsAPI.updateExercise(
        sessionState.session.id,
        sessionExerciseId,
        updates
      )
      
      // Refresh session
      await fetchSession(sessionState.session.id)
      
      return response.data?.data
    } catch (error) {
      handleApiError(error, 'workout', 'Failed to update exercise')
      throw error
    }
  }
  
  /**
   * Remove an exercise from the current session
   * @param {number} sessionExerciseId 
   */
  const removeExercise = async (sessionExerciseId) => {
    if (!sessionState.session?.id) {
      throw new Error('No active session')
    }
    
    try {
      await workoutSessionsAPI.removeExercise(
        sessionState.session.id,
        sessionExerciseId
      )
      
      // Refresh session
      await fetchSession(sessionState.session.id)
      
      return true
    } catch (error) {
      handleApiError(error, 'workout', 'Failed to remove exercise')
      throw error
    }
  }
  
  /**
   * Complete the workout session
   * @param {string|null} notes - Optional workout notes
   */
  const completeWorkout = async (notes = null) => {
    if (!sessionState.session?.id) {
      throw new Error('No active session')
    }
    
    sessionState.loading = true
    
    try {
      const response = await workoutSessionsAPI.complete(
        sessionState.session.id,
        notes
      )
      
      // Update session state
      sessionState.session = response.data?.data || sessionState.session
      
      return response.data?.data
    } catch (error) {
      handleApiError(error, 'workout', 'Failed to complete workout')
      throw error
    } finally {
      sessionState.loading = false
    }
  }
  
  /**
   * Cancel/discard the workout session
   */
  const cancelWorkout = async () => {
    if (!sessionState.session?.id) {
      throw new Error('No active session')
    }
    
    sessionState.loading = true
    
    try {
      await workoutSessionsAPI.cancel(sessionState.session.id)
      
      // Clear session state
      sessionState.session = null
      sessionState.exercises = []
      sessionState.progress = null
      sessionState.todayData = null
      
      return true
    } catch (error) {
      handleApiError(error, 'workout', 'Failed to cancel workout')
      throw error
    } finally {
      sessionState.loading = false
    }
  }
  
  /**
   * Clear local session state (without API call)
   */
  const clearSession = () => {
    sessionState.session = null
    sessionState.exercises = []
    sessionState.progress = null
    sessionState.todayData = null
    sessionState.error = null
  }
  
  /**
   * Get previous set data for a specific exercise and set number
   * @param {number} exerciseId 
   * @param {number} setNumber 
   */
  const getPreviousSet = (exerciseId, setNumber) => {
    const exercise = sessionState.exercises.find(
      e => e.session_exercise?.exercise_id === exerciseId
    )
    return exercise?.previous_sets?.find(s => s.set_number === setNumber) || null
  }
  
  /**
   * Get logged sets for a specific exercise
   * @param {number} exerciseId 
   */
  const getLoggedSets = (exerciseId) => {
    const exercise = sessionState.exercises.find(
      e => e.session_exercise?.exercise_id === exerciseId
    )
    return exercise?.logged_sets || []
  }
  
  return {
    // Reactive state
    ...toRefs(sessionState),
    
    // Loading states
    loggingSet,
    updatingSet,
    deletingSet,
    
    // Computed
    hasActiveSession,
    isCompleted,
    progressPercent,
    
    // Methods
    fetchToday,
    startSession,
    fetchSession,
    logSet,
    updateSet,
    deleteSet,
    addExercise,
    updateExercise,
    removeExercise,
    completeWorkout,
    cancelWorkout,
    clearSession,
    getPreviousSet,
    getLoggedSets
  }
}

