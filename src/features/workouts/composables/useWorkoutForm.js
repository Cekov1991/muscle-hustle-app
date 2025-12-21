import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkouts } from './useWorkouts'

export const useWorkoutForm = (workoutId) => {
  const router = useRouter()
  const { createWorkout, updateWorkout, fetchWorkout } = useWorkouts()

  // Form state
  const editMode = ref(false)
  const initialLoading = ref(true)
  const currentWorkout = ref(null)

  // Form data
  const formData = ref({
    name: '',
    description: '',
    day_of_week: null
  })

  // Computed properties
  const isEditMode = computed(() => !!workoutId?.value || !!workoutId)
  const isFormValid = computed(() => formData.value.name.trim().length > 0)

  // Initialize form data
  const initializeForm = async () => {
    initialLoading.value = true

    try {
      if (isEditMode.value) {
        const id = workoutId?.value || workoutId
        const workout = await fetchWorkout(id)
        currentWorkout.value = workout
        
        formData.value = {
          name: workout.name || '',
          description: workout.description || '',
          day_of_week: workout.day_of_week
        }
      }
    } catch (error) {
      console.error('InitializeForm error:', error)
      router.back()
    } finally {
      initialLoading.value = false
    }
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    editMode.value = !editMode.value
  }

  // Save workout
  const saveWorkout = async () => {
    if (!isFormValid.value) return null

    const data = {
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || null,
      day_of_week: formData.value.day_of_week
    }

    try {
      if (isEditMode.value) {
        const id = workoutId?.value || workoutId
        const updated = await updateWorkout(id, data)
        currentWorkout.value = updated
        return updated
      } else {
        const newWorkout = await createWorkout(data)
        currentWorkout.value = newWorkout
        // Navigate to edit mode for the new workout
        router.replace(`/tabs/workouts/${newWorkout.id}/edit`)
        return newWorkout
      }
    } catch (error) {
      throw error
    }
  }

  // Cancel and go back
  const cancelForm = () => {
    router.back()
  }

  // Reset form
  const resetForm = () => {
    formData.value = {
      name: '',
      description: '',
      day_of_week: null
    }
    editMode.value = false
  }

  return {
    // State
    editMode,
    initialLoading,
    currentWorkout,
    formData,
    
    // Computed
    isEditMode,
    isFormValid,
    
    // Methods
    initializeForm,
    toggleEditMode,
    saveWorkout,
    cancelForm,
    resetForm
  }
}