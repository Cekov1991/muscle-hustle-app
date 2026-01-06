import { reactive, toRefs } from 'vue'
import { fitnessAPI } from '../../../shared/services/apiClient'
import { useApiError } from '../../../shared/composables/useApiError'

// Global state - shared across all components using this composable
const metricsState = reactive({
  metrics: {
    strengthScore: { current: 0, level: '', recentGain: 0 },
    strengthBalance: { percentage: 0, level: '', recentChange: 0, muscleGroups: {} },
    weeklyProgress: { percentage: 0, trend: '' }
  },
  loading: false,
  error: null
})

export const useMetrics = () => {
  const { handleApiError } = useApiError()

  // Fetch fitness metrics from API
  const fetchMetrics = async () => {
    metricsState.loading = true
    metricsState.error = null
    
    try {
      const response = await fitnessAPI.getMetrics()
      console.log('✅ Fitness metrics fetched:', response.data)
      
      // Map API response (snake_case) to our reactive data (camelCase)
      if (response.data?.success && response.data.data) {
        const apiData = response.data.data
        metricsState.metrics = {
          strengthScore: {
            current: apiData.strength_score?.current || 0,
            level: apiData.strength_score?.level || '',
            recentGain: apiData.strength_score?.recent_gain || 0
          },
          strengthBalance: {
            percentage: apiData.strength_balance?.percentage || 0,
            level: apiData.strength_balance?.level || '',
            recentChange: apiData.strength_balance?.recent_change || 0,
            muscleGroups: apiData.strength_balance?.muscle_groups || {}
          },
          weeklyProgress: {
            percentage: apiData.weekly_progress?.percentage || 0,
            trend: apiData.weekly_progress?.trend || ''
          }
        }
      }
      
      return metricsState.metrics
    } catch (error) {
      metricsState.error = error
      
      // Check if it's an ngrok error - if so, don't throw and just continue with empty state
      const isNgrokError = error.message?.includes('ngrok') || 
                          error.config?.url?.includes('ngrok') ||
                          error.code === 'ERR_NETWORK' ||
                          error.message?.includes('ERR_NGROK')
      
      if (isNgrokError) {
        console.warn('Ngrok connectivity issue, showing empty metrics state instead of error')
        metricsState.metrics = {
          strengthScore: { current: 0, level: 'N/A', recentGain: 0 },
          strengthBalance: { percentage: 0, level: 'N/A', recentChange: 0, muscleGroups: {} },
          weeklyProgress: { percentage: 0, trend: 'N/A' }
        }
        return metricsState.metrics
      }
      
      handleApiError(error, 'metrics', 'Failed to fetch fitness metrics')
      throw error
    } finally {
      metricsState.loading = false
    }
  }

  // Clear metrics state
  const clearMetrics = () => {
    metricsState.metrics = {
      strengthScore: { current: 0, level: '', recentGain: 0 },
      strengthBalance: { percentage: 0, level: '', recentChange: 0, muscleGroups: {} },
      weeklyProgress: { percentage: 0, trend: '' }
    }
    metricsState.error = null
    metricsState.loading = false
  }

  // Retry failed request
  const retryFetch = async () => {
    if (metricsState.error) {
      return await fetchMetrics()
    }
  }

  return {
    // Reactive state - use toRefs to maintain reactivity when destructuring
    ...toRefs(metricsState),
    
    // Methods
    fetchMetrics,
    clearMetrics,
    retryFetch
  }
}
