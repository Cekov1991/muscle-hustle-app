import { ref, reactive, computed } from 'vue'

/**
 * Reusable form validation composable
 * Extracted from Login.vue to eliminate repetitive validation logic
 */
export const useFormValidation = (validationRules = {}) => {
  // Form field values
  const formData = reactive({})
  
  // Error messages for each field
  const errors = reactive({})
  
  // Touched state for each field (to show errors only after user interaction)
  const touched = reactive({})

  /**
   * Built-in validation rules
   */
  const builtInRules = {
    required: (value, fieldName) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} is required`
      }
      return null
    },
    
    email: (value) => {
      if (!value) return null
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) ? null : 'Please enter a valid email address'
    },
    
    minLength: (min) => (value) => {
      if (!value) return null
      return value.length >= min ? null : `Must be at least ${min} characters`
    },
    
    maxLength: (max) => (value) => {
      if (!value) return null
      return value.length <= max ? null : `Must be no more than ${max} characters`
    },
    
    pattern: (regex, message) => (value) => {
      if (!value) return null
      return regex.test(value) ? null : message
    },
    
    numeric: (value) => {
      if (!value) return null
      const num = Number(value)
      return !isNaN(num) && isFinite(num) ? null : 'Must be a valid number'
    },
    
    min: (minValue) => (value) => {
      if (!value) return null
      const num = Number(value)
      return !isNaN(num) && num >= minValue ? null : `Must be at least ${minValue}`
    },
    
    max: (maxValue) => (value) => {
      if (!value) return null
      const num = Number(value)
      return !isNaN(num) && num <= maxValue ? null : `Must be no more than ${maxValue}`
    },
    
    confirm: (originalField) => (value) => {
      if (!value) return null
      return value === formData[originalField] ? null : 'Values do not match'
    }
  }

  /**
   * Initialize form with field definitions
   * @param {Object} fields - Field definitions with initial values and validation rules
   */
  const initializeForm = (fields) => {
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      
      // Set initial value
      formData[fieldName] = field.value || ''
      
      // Initialize error and touched state
      errors[fieldName] = ''
      touched[fieldName] = false
    })
  }

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field to validate
   * @returns {boolean} True if field is valid
   */
  const validateField = (fieldName) => {
    const fieldRules = validationRules[fieldName]
    if (!fieldRules) {
      errors[fieldName] = ''
      return true
    }

    const value = formData[fieldName]
    let error = null

    // Run through each validation rule for this field
    for (const rule of fieldRules) {
      if (typeof rule === 'string') {
        // Built-in rule name
        if (builtInRules[rule]) {
          error = builtInRules[rule](value, fieldName)
        }
      } else if (typeof rule === 'object') {
        // Rule with parameters
        const { type, ...params } = rule
        if (builtInRules[type]) {
          if (type === 'minLength' || type === 'min' || type === 'max') {
            const paramValue = params.value || Object.values(params)[0]
            error = builtInRules[type](paramValue)(value)
          } else if (type === 'maxLength') {
            error = builtInRules[type](params.value || Object.values(params)[0])(value)
          } else if (type === 'pattern') {
            error = builtInRules[type](params.regex, params.message)(value)
          } else if (type === 'confirm') {
            error = builtInRules[type](params.field)(value)
          } else {
            error = builtInRules[type](value, fieldName)
          }
        }
      } else if (typeof rule === 'function') {
        // Custom validation function
        error = rule(value, fieldName, formData)
      }

      // Stop on first error
      if (error) break
    }

    errors[fieldName] = error || ''
    return !error
  }

  /**
   * Validate all fields
   * @returns {boolean} True if all fields are valid
   */
  const validateForm = () => {
    let isValid = true
    
    Object.keys(validationRules).forEach(fieldName => {
      const fieldValid = validateField(fieldName)
      if (!fieldValid) {
        isValid = false
      }
    })
    
    return isValid
  }

  /**
   * Mark field as touched (for showing errors after user interaction)
   * @param {string} fieldName - Name of the field
   */
  const touchField = (fieldName) => {
    touched[fieldName] = true
  }

  /**
   * Clear all form data and validation state
   */
  const clearForm = () => {
    Object.keys(formData).forEach(fieldName => {
      formData[fieldName] = ''
      errors[fieldName] = ''
      touched[fieldName] = false
    })
  }

  /**
   * Set form data from an object
   * @param {Object} data - Data to populate the form
   */
  const setFormData = (data) => {
    Object.keys(data).forEach(fieldName => {
      if (formData.hasOwnProperty(fieldName)) {
        formData[fieldName] = data[fieldName]
      }
    })
  }

  /**
   * Get form data as a plain object
   * @returns {Object} Form data
   */
  const getFormData = () => {
    return { ...formData }
  }

  // Computed properties
  const isFormValid = computed(() => {
    return Object.keys(validationRules).every(fieldName => 
      !errors[fieldName] && (formData[fieldName] || validationRules[fieldName].some(rule => 
        typeof rule === 'string' && rule !== 'required'
      ))
    )
  })

  const hasErrors = computed(() => {
    return Object.values(errors).some(error => !!error)
  })

  const touchedFields = computed(() => {
    return Object.keys(touched).filter(fieldName => touched[fieldName])
  })

  /**
   * Helper to get field error only if field is touched
   * @param {string} fieldName - Name of the field
   * @returns {string} Error message or empty string
   */
  const getFieldError = (fieldName) => {
    return touched[fieldName] ? errors[fieldName] : ''
  }

  /**
   * Helper to check if field has error and is touched
   * @param {string} fieldName - Name of the field
   * @returns {boolean} True if field has error and is touched
   */
  const hasFieldError = (fieldName) => {
    return touched[fieldName] && !!errors[fieldName]
  }

  /**
   * Set field errors from backend validation (useful for 422 responses)
   * @param {Object} backendErrors - Errors object from backend (e.g., { email: ["Error message"] })
   */
  const setFieldErrors = (backendErrors) => {
    Object.keys(backendErrors).forEach(fieldName => {
      if (Object.prototype.hasOwnProperty.call(formData, fieldName)) {
        const errorMessages = backendErrors[fieldName]
        if (Array.isArray(errorMessages) && errorMessages.length > 0) {
          errors[fieldName] = errorMessages[0] // Use first error message
          touched[fieldName] = true // Mark as touched to show error
        } else if (typeof errorMessages === 'string') {
          errors[fieldName] = errorMessages
          touched[fieldName] = true
        }
      }
    })
  }

  return {
    // Reactive state
    formData,
    errors,
    touched,
    
    // Computed
    isFormValid,
    hasErrors,
    touchedFields,
    
    // Methods
    initializeForm,
    validateField,
    validateForm,
    touchField,
    clearForm,
    setFormData,
    getFormData,
    getFieldError,
    hasFieldError,
    setFieldErrors,
    
    // Built-in rules (for reference or extension)
    builtInRules
  }
}
