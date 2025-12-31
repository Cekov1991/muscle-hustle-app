import { ref, computed, unref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkouts } from './useWorkouts'
import { usePlans } from './usePlans'

export const useWorkoutForm = (workoutId) => {
  const router = useRouter()
  const { createWorkout, updateWorkout, fetchWorkout } = useWorkouts()
  const { plans, fetchPlans, getActivePlan, ensurePlansExist } = usePlans()

  // Form state
  const editMode = ref(false)
  const initialLoading = ref(true)
  const currentWorkout = ref(null)

  // Form data
  const formData = ref({
    plan_id: null,
    name: '',
    description: '',
    day_of_week: null
  })

  // Computed properties
  const isEditMode = computed(() => !!unref(workoutId))
  const isFormValid = computed(() => {
    const hasName = formData.value.name.trim().length > 0
    // plan_id is required for new workouts, optional for updates
    const hasPlan = isEditMode.value ? true : !!formData.value.plan_id
    return hasName && hasPlan
  })

  // Initialize form data
  const initializeForm = async () => {
    initialLoading.value = true

    try {
      // Ensure plans exist and fetch them
      await ensurePlansExist()
      await fetchPlans()
      
      if (isEditMode.value) {
        const workout = await fetchWorkout(unref(workoutId))
        currentWorkout.value = workout
        
        formData.value = {
          plan_id: workout.plan_id || null,
          name: workout.name || '',
          description: workout.description || '',
          day_of_week: workout.day_of_week
        }
      } else {
        // For new workouts, auto-select active plan or first plan
        const activePlan = getActivePlan()
        if (activePlan) {
          formData.value.plan_id = activePlan.id
        } else if (plans.value && plans.value.length > 0) {
          formData.value.plan_id = plans.value[0].id
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

    // Include plan_id for create, optionally for update
    if (!isEditMode.value) {
      // Required for new workouts
      data.plan_id = formData.value.plan_id
    } else if (formData.value.plan_id) {
      // Optional for updates - only include if changed
      data.plan_id = formData.value.plan_id
    }

    
    if (isEditMode.value) {
      const updated = await updateWorkout(unref(workoutId), data)
      currentWorkout.value = updated
      return updated
    } else {
      const newWorkout = await createWorkout(data)
      currentWorkout.value = newWorkout
      // Navigate to edit mode for the new workout
      router.replace(`/tabs/workouts/${newWorkout.id}/edit`)
      return newWorkout
    }
  }

  // Cancel and go back
  const cancelForm = () => {
    router.back()
  }

  // Reset form
  const resetForm = async () => {
    // Ensure plans exist before resetting
    await ensurePlansExist()
    await fetchPlans()
    
    const activePlan = getActivePlan()
    formData.value = {
      plan_id: activePlan ? activePlan.id : (plans.value && plans.value.length > 0 ? plans.value[0].id : null),
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