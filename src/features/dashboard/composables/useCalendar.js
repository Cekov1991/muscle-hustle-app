import { ref, reactive, toRefs } from 'vue'
import { workoutsAPI } from '../../../shared/services/apiClient'
import { useApiError } from '../../../shared/composables/useApiError'

// Global state - shared across all components using this composable
const calendarState = reactive({
  sessions: [],
  loading: false,
  error: null
})

export const useCalendar = () => {
  const { handleApiError } = useApiError()

  // Calculate current week dates (Sunday to Saturday)
  const getCurrentWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay) // Start from Sunday
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Saturday
    
    return {
      startDate: startOfWeek.toISOString().split('T')[0], // YYYY-MM-DD
      endDate: endOfWeek.toISOString().split('T')[0] // YYYY-MM-DD
    }
  }

  // Fetch calendar sessions for a date range
  const fetchCalendarSessions = async (startDate, endDate) => {
    calendarState.loading = true
    calendarState.error = null
    
    try {
      const response = await workoutsAPI.getCalendarSessions(startDate, endDate)
      console.log('✅ Calendar sessions fetched:', response.data?.data?.sessions?.length || 0)
      calendarState.sessions = response.data?.data?.sessions || []
      return calendarState.sessions
    } catch (error) {
      calendarState.error = error
      
      // Check if it's an ngrok error - if so, don't throw and just continue with empty state
      const isNgrokError = error.message?.includes('ngrok') || 
                          error.config?.url?.includes('ngrok') ||
                          error.code === 'ERR_NETWORK' ||
                          error.message?.includes('ERR_NGROK')
      
      if (isNgrokError) {
        console.warn('Ngrok connectivity issue, showing empty calendar state instead of error')
        calendarState.sessions = []
        return calendarState.sessions
      }
      
      handleApiError(error, 'calendar', 'Failed to fetch workout sessions')
      throw error
    } finally {
      calendarState.loading = false
    }
  }

  // Fetch current week's sessions
  const fetchCurrentWeek = async () => {
    const { startDate, endDate } = getCurrentWeekDates()
    console.log('📅 Fetching calendar data for week:', { startDate, endDate })
    return await fetchCalendarSessions(startDate, endDate)
  }

  // Clear calendar state
  const clearCalendar = () => {
    calendarState.sessions = []
    calendarState.error = null
    calendarState.loading = false
  }

  // Retry failed request
  const retryFetch = async () => {
    if (calendarState.error) {
      return await fetchCurrentWeek()
    }
  }

  return {
    // Reactive state - use toRefs to maintain reactivity when destructuring
    ...toRefs(calendarState),
    
    // Methods
    fetchCalendarSessions,
    fetchCurrentWeek,
    getCurrentWeekDates,
    clearCalendar,
    retryFetch
  }
}
