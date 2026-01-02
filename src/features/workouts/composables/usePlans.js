import { ref, reactive, toRefs } from 'vue'
import { plansAPI } from '../../../shared/services/apiClient'
import { useApiError } from '../../../shared/composables/useApiError'

// Global state - shared across all components using this composable
const plansState = reactive({
  plans: [],
  loading: false,
  error: null
})

export const usePlans = () => {
  const { handleApiError } = useApiError()

  // Fetch all plans
  const fetchPlans = async () => {
    plansState.loading = true
    plansState.error = null
    
    try {
      const response = await plansAPI.getPlans()
      plansState.plans = response.data.data || []
      return plansState.plans
    } catch (error) {
      plansState.error = error
      handleApiError(error, 'plans', 'Failed to fetch plans')
      throw error
    } finally {
      plansState.loading = false
    }
  }

  // Fetch single plan
  const fetchPlan = async (id) => {
    plansState.loading = true
    plansState.error = null
    
    try {
      const response = await plansAPI.getPlan(id)
      return response.data.data
    } catch (error) {
      plansState.error = error
      handleApiError(error, 'plans', 'Failed to fetch plan')
      throw error
    } finally {
      plansState.loading = false
    }
  }

  // Create plan
  const createPlan = async (data) => {
    plansState.loading = true
    plansState.error = null
    
    try {
      const response = await plansAPI.createPlan(data)
      const newPlan = response.data.data
      
      // Add to local state
      plansState.plans.push(newPlan)
      
      return newPlan
    } catch (error) {
      plansState.error = error
      handleApiError(error, 'plans', 'Failed to create plan')
      throw error
    } finally {
      plansState.loading = false
    }
  }

  // Update plan
  const updatePlan = async (id, data) => {
    plansState.loading = true
    plansState.error = null
    
    try {
      const response = await plansAPI.updatePlan(id, data)
      const updatedPlan = response.data.data
      
      // Update in local state
      const index = plansState.plans.findIndex(p => p.id === id)
      if (index !== -1) {
        plansState.plans[index] = updatedPlan
      }
      
      return updatedPlan
    } catch (error) {
      plansState.error = error
      handleApiError(error, 'plans', 'Failed to update plan')
      throw error
    } finally {
      plansState.loading = false
    }
  }

  // Delete plan
  const deletePlan = async (id) => {
    plansState.loading = true
    plansState.error = null
    
    try {
      await plansAPI.deletePlan(id)
      
      // Remove from local state
      plansState.plans = plansState.plans.filter(p => p.id !== id)
      
      return true
    } catch (error) {
      plansState.error = error
      handleApiError(error, 'plans', 'Failed to delete plan')
      throw error
    } finally {
      plansState.loading = false
    }
  }

  // Get active plan
  const getActivePlan = () => {
    return plansState.plans.find(p => p.is_active) || null
  }

  // Ensure plans exist - check if user has any plans, create default if none
  const ensurePlansExist = async () => {
    if (plansState.plans.length === 0) {
      try {
        await fetchPlans()
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      }
    }
    
    if (plansState.plans.length === 0) {
      // Create default plan
      try {
        const defaultPlan = await createPlan({
          name: 'My Training Plan',
          description: 'Main workout plan',
          is_active: true
        })
        return defaultPlan
      } catch (error) {
        console.error('Failed to create default plan:', error)
        throw error
      }
    }
    
    return plansState.plans[0]
  }

  // Ensure active plan exists - check if user has active plan, prompt or auto-activate
  const ensureActivePlan = async () => {
    await ensurePlansExist()
    
    const activePlan = getActivePlan()
    
    if (!activePlan && plansState.plans.length > 0) {
      // Auto-activate the first plan if none is active
      try {
        await updatePlan(plansState.plans[0].id, { is_active: true })
        return plansState.plans[0]
      } catch (error) {
        console.error('Failed to activate plan:', error)
        throw error
      }
    }
    
    return activePlan
  }

  return {
    // Reactive state - use toRefs to maintain reactivity when destructuring
    ...toRefs(plansState),
    
    // Methods
    fetchPlans,
    fetchPlan,
    createPlan,
    updatePlan,
    deletePlan,
    getActivePlan,
    ensurePlansExist,
    ensureActivePlan
  }
}

