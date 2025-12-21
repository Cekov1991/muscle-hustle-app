import { ref, reactive } from 'vue'
import { useWorkouts } from './useWorkouts'
import { getPivotId } from '../utils/workoutHelpers'

export const useExerciseModals = (workoutId, workoutExercises) => {
  const {
    fetchWorkout,
    addExerciseToWorkout,
    updateExerciseInWorkout,
    removeExerciseFromWorkout
  } = useWorkouts()

  // Modal states
  const modals = reactive({
    selection: false,
    form: false
  })

  // Selected exercise for editing/adding
  const selectedExercise = ref(null)

  // Open exercise selection modal
  const openExerciseSelection = () => {
    selectedExercise.value = null
    modals.selection = true
  }

  // Open exercise form modal
  const openExerciseForm = (exercise = null) => {
    selectedExercise.value = exercise
    modals.form = true
  }

  // Close all modals
  const closeModals = () => {
    modals.selection = false
    modals.form = false
    selectedExercise.value = null
  }

  // Handle exercise selected from selection modal
  const handleExerciseSelected = (exercise) => {
    selectedExercise.value = exercise
    modals.selection = false
    modals.form = true
  }

  // Handle exercise form submission
  const handleExerciseFormSubmit = async (exerciseData, currentWorkout) => {
    try {
      const templateId = workoutId?.value || workoutId || currentWorkout?.value?.id || currentWorkout?.id

      if (!templateId) {
        throw new Error('No workout template ID available')
      }

      if (selectedExercise.value && selectedExercise.value.pivot) {
        // Edit mode - update existing exercise
        const pivotId = getPivotId(selectedExercise.value)
        if (!pivotId) {
          throw new Error('Cannot update exercise: pivot ID not found')
        }
        await updateExerciseInWorkout(templateId, pivotId, exerciseData)
      } else {
        // Add mode - add new exercise
        await addExerciseToWorkout(templateId, exerciseData)
      }
      
      // Refresh workout to get updated exercises
      const updated = await fetchWorkout(templateId)
      
      // Update the workout exercises
      if (workoutExercises?.value) {
        workoutExercises.value = updated.exercises || []
      } else if (typeof workoutExercises === 'function') {
        workoutExercises(updated.exercises || [])
      }
      
      closeModals()
      return updated
    } catch (error) {
      closeModals()
      throw error
    }
  }

  // Handle exercise removal
  const handleExerciseRemove = async (exercise, currentWorkout) => {
    const templateId = workoutId?.value || workoutId || currentWorkout?.value?.id || currentWorkout?.id

    if (!templateId) {
      // If workout not saved yet, remove from local array
      if (workoutExercises?.value) {
        workoutExercises.value = workoutExercises.value.filter(ex => ex.id !== exercise.id)
      }
      return
    }

    try {
      const pivotId = getPivotId(exercise)
      if (!pivotId) {
        throw new Error('Cannot remove exercise: pivot ID not found')
      }
      
      await removeExerciseFromWorkout(templateId, pivotId)
      
      // Refresh workout to get updated exercises
      const updated = await fetchWorkout(templateId)
      
      // Update the workout exercises
      if (workoutExercises?.value) {
        workoutExercises.value = updated.exercises || []
      } else if (typeof workoutExercises === 'function') {
        workoutExercises(updated.exercises || [])
      }
      
      return updated
    } catch (error) {
      throw error
    }
  }

  return {
    // State
    modals,
    selectedExercise,
    
    // Methods
    openExerciseSelection,
    openExerciseForm,
    closeModals,
    handleExerciseSelected,
    handleExerciseFormSubmit,
    handleExerciseRemove
  }
}
