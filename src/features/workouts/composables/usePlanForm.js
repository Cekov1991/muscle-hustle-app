import { ref, computed, unref } from 'vue'
import { useRouter } from 'vue-router'
import { alertController } from '@ionic/vue'
import { usePlans } from './usePlans'

export const usePlanForm = (planId) => {
  const router = useRouter()
  const { fetchPlan, createPlan, updatePlan, deletePlan, loading } = usePlans()

  // Form state
  const initialLoading = ref(true)

  // Form data
  const formData = ref({
    name: '',
    description: '',
    is_active: false
  })

  // Computed properties
  const isEditMode = computed(() => !!unref(planId))
  const isFormValid = computed(() => formData.value.name.trim().length > 0)

  // Get the resolved plan ID
  const getPlanId = () => unref(planId)

  // Initialize form data
  const initializeForm = async () => {
    initialLoading.value = true

    try {
      if (isEditMode.value) {
        const plan = await fetchPlan(getPlanId())
        formData.value = {
          name: plan.name || '',
          description: plan.description || '',
          is_active: plan.is_active || false
        }
      }
    } catch (error) {
      console.error('InitializeForm error:', error)
      router.back()
    } finally {
      initialLoading.value = false
    }
  }

  // Save plan (create or update)
  const savePlan = async () => {
    if (!isFormValid.value) return null

    const data = {
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || null,
      is_active: formData.value.is_active
    }

    try {
      if (isEditMode.value) {
        const updated = await updatePlan(getPlanId(), data)
        return updated
      } else {
        const newPlan = await createPlan(data)
        return newPlan
      }
    } catch (error) {
      throw error
    }
  }

  // Remove plan with confirmation dialog
  const removePlan = async () => {
    const plan = await fetchPlan(getPlanId())
    const templateCount = plan.workout_templates?.length || 0

    const alert = await alertController.create({
      header: 'Delete Plan',
      message: templateCount > 0
        ? `Are you sure you want to delete "${plan.name}"? This will also delete all ${templateCount} workout template${templateCount === 1 ? '' : 's'} in this plan. This action cannot be undone.`
        : `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              await deletePlan(getPlanId())
              router.back()
            } catch (error) {
              console.error('Delete error:', error)
            }
          }
        }
      ]
    })

    await alert.present()
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
      is_active: false
    }
  }

  return {
    // State
    loading,
    initialLoading,
    formData,

    // Computed
    isEditMode,
    isFormValid,

    // Methods
    initializeForm,
    savePlan,
    removePlan,
    cancelForm,
    resetForm
  }
}

