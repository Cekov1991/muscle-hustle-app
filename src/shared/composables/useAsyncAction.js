import { ref, computed } from 'vue'

/**
 * Reusable async action wrapper with loading states and error handling
 * Replaces manual loading state management throughout the application
 */
export const useAsyncAction = (asyncFunction, options = {}) => {
  const {
    immediate = false,
    onSuccess = null,
    onError = null,
    successMessage = null,
    errorMessage = null,
    throwOnError = false
  } = options

  // State
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)
  const lastExecuted = ref(null)

  // Computed
  const isSuccess = computed(() => !loading.value && !error.value && data.value !== null)
  const isError = computed(() => !loading.value && !!error.value)
  const hasData = computed(() => data.value !== null)

  /**
   * Execute the async action
   * @param  {...any} args - Arguments to pass to the async function
   * @returns {Promise} The result of the async operation
   */
  const execute = async (...args) => {
    if (loading.value) {
      console.warn('Async action is already in progress')
      return null
    }

    loading.value = true
    error.value = null
    lastExecuted.value = new Date()

    try {
      const result = await asyncFunction(...args)
      data.value = result
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result, ...args)
      }

      return result
    } catch (err) {
      error.value = err
      
      // Call error callback if provided
      if (onError) {
        onError(err, ...args)
      }

      // Re-throw error if specified
      if (throwOnError) {
        throw err
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset the action state
   */
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
    lastExecuted.value = null
  }

  /**
   * Clear only the error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Clear only the data
   */
  const clearData = () => {
    data.value = null
  }

  // Execute immediately if specified
  if (immediate) {
    execute()
  }

  return {
    // State
    loading: loading,
    error: error,
    data: data,
    lastExecuted: lastExecuted,
    
    // Computed
    isSuccess,
    isError,
    hasData,
    
    // Methods
    execute,
    reset,
    clearError,
    clearData
  }
}

/**
 * Create multiple async actions that can be managed together
 * @param {Object} actions - Object with action names as keys and async functions as values
 * @param {Object} globalOptions - Global options to apply to all actions
 * @returns {Object} Object with action names as keys and useAsyncAction results as values
 */
export const useAsyncActions = (actions, globalOptions = {}) => {
  const actionResults = {}
  
  Object.keys(actions).forEach(actionName => {
    actionResults[actionName] = useAsyncAction(actions[actionName], globalOptions)
  })

  // Global state computed properties
  const anyLoading = computed(() => 
    Object.values(actionResults).some(action => action.loading.value)
  )

  const anyError = computed(() => 
    Object.values(actionResults).some(action => action.error.value)
  )

  const allSuccessful = computed(() => 
    Object.values(actionResults).every(action => action.isSuccess.value)
  )

  // Global methods
  const resetAll = () => {
    Object.values(actionResults).forEach(action => action.reset())
  }

  const clearAllErrors = () => {
    Object.values(actionResults).forEach(action => action.clearError())
  }

  return {
    ...actionResults,
    
    // Global computed
    anyLoading,
    anyError,
    allSuccessful,
    
    // Global methods
    resetAll,
    clearAllErrors
  }
}

/**
 * Specialized hook for form submission with validation
 * @param {Function} submitFunction - The async function to call on submit
 * @param {Function} validateFunction - Optional validation function
 * @param {Object} options - Options for the async action
 * @returns {Object} Enhanced async action with form-specific methods
 */
export const useFormSubmit = (submitFunction, validateFunction = null, options = {}) => {
  const asyncAction = useAsyncAction(submitFunction, options)

  /**
   * Submit form with optional validation
   * @param {*} formData - Form data to submit
   * @param  {...any} args - Additional arguments
   * @returns {Promise} The result of the submission
   */
  const submitForm = async (formData, ...args) => {
    // Run validation if provided
    if (validateFunction) {
      const isValid = validateFunction(formData)
      if (!isValid) {
        return null
      }
    }

    return asyncAction.execute(formData, ...args)
  }

  return {
    ...asyncAction,
    submitForm,
    isSubmitting: asyncAction.loading
  }
}

/**
 * Hook for paginated data loading
 * @param {Function} fetchFunction - Function to fetch data (should accept page, limit params)
 * @param {Object} options - Options including initial page size
 * @returns {Object} Async action with pagination controls
 */
export const usePaginatedAsync = (fetchFunction, options = {}) => {
  const { pageSize = 20, immediate = true } = options
  
  const currentPage = ref(1)
  const totalItems = ref(0)
  const totalPages = ref(0)
  const items = ref([])

  const asyncAction = useAsyncAction(
    async (page = 1, limit = pageSize) => {
      const result = await fetchFunction(page, limit)
      
      // Expected result format: { data: [], total: number, page: number, totalPages: number }
      if (result.data) {
        items.value = result.data
        totalItems.value = result.total || 0
        totalPages.value = result.totalPages || Math.ceil(totalItems.value / limit)
        currentPage.value = result.page || page
      }
      
      return result
    },
    { immediate: false }
  )

  const loadPage = (page) => asyncAction.execute(page, pageSize)
  const loadNextPage = () => {
    if (currentPage.value < totalPages.value) {
      return loadPage(currentPage.value + 1)
    }
  }
  const loadPreviousPage = () => {
    if (currentPage.value > 1) {
      return loadPage(currentPage.value - 1)
    }
  }
  const reload = () => loadPage(currentPage.value)

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPreviousPage = computed(() => currentPage.value > 1)

  // Load initial data if specified
  if (immediate) {
    loadPage(1)
  }

  return {
    ...asyncAction,
    
    // Pagination state
    currentPage: currentPage,
    totalItems: totalItems,
    totalPages: totalPages,
    items: items,
    
    // Pagination computed
    hasNextPage,
    hasPreviousPage,
    
    // Pagination methods
    loadPage,
    loadNextPage,
    loadPreviousPage,
    reload
  }
}
