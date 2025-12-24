import { ref, reactive, computed } from 'vue'
import { profileAPI } from '../../../shared/services/apiClient'
import { useApiError } from '../../../shared/composables/useApiError'
import { useAuth } from '../../auth/composables/useAuth'

// Global state - shared across all components using this composable
const profileState = reactive({
  profile: null,
  loading: false,
  error: null,
  saving: false
})

// Validation rules based on API specification
export const profileValidationRules = {
  // User account fields
  name: {
    required: true,
    maxLength: 255
  },
  email: {
    required: true,
    type: 'email',
    maxLength: 255
  },
  
  // Profile fields
  age: {
    type: 'number',
    min: 1,
    max: 150
  },
  height: {
    type: 'number',
    min: 50,
    max: 300
  },
  weight: {
    type: 'number',
    min: 1,
    max: 500
  },
  training_days_per_week: {
    type: 'number',
    min: 1,
    max: 7
  },
  workout_duration_minutes: {
    type: 'number',
    min: 1,
    max: 600
  },
  
  // Enum fields
  fitness_goal: {
    type: 'enum',
    values: ['fat_loss', 'muscle_gain', 'strength', 'general_fitness']
  },
  gender: {
    type: 'enum',
    values: ['male', 'female', 'other']
  },
  training_experience: {
    type: 'enum',
    values: ['beginner', 'intermediate', 'advanced']
  }
}

// Enum options for UI
export const profileEnumOptions = {
  fitness_goal: [
    { value: 'fat_loss', label: 'Fat Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'strength', label: 'Strength' },
    { value: 'general_fitness', label: 'General Fitness' }
  ],
  gender: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ],
  training_experience: [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]
}

export const useProfile = () => {
  const { getApiErrorMessage } = useApiError()
  const { refreshUser } = useAuth()
  
  // Computed properties for reactive state
  const profile = computed(() => profileState.profile)
  const loading = computed(() => profileState.loading)
  const error = computed(() => profileState.error)
  const saving = computed(() => profileState.saving)
  
  // Check if profile is complete
  const isProfileComplete = computed(() => {
    if (!profileState.profile?.profile) return false
    
    const requiredFields = ['fitness_goal', 'age', 'gender', 'height', 'weight', 'training_experience']
    return requiredFields.every(field => 
      profileState.profile.profile[field] !== null && 
      profileState.profile.profile[field] !== undefined
    )
  })
  
  // Fetch user profile
  const fetchProfile = async () => {
    profileState.loading = true
    profileState.error = null
    
    try {
      const response = await profileAPI.getProfile()
      profileState.profile = response.data.user
      return profileState.profile
    } catch (error) {
      profileState.error = error
      const message = getApiErrorMessage(error, 'profile', 'Failed to fetch profile')
      throw new Error(message)
    } finally {
      profileState.loading = false
    }
  }
  
  // Update profile (JSON data only)
  const updateProfile = async (data) => {
    profileState.saving = true
    profileState.error = null
    
    try {
      const response = await profileAPI.updateProfile(data)
      profileState.profile = response.data.user
      
      // Refresh auth user data to keep it in sync
      await refreshUser()
      
      return profileState.profile
    } catch (error) {
      profileState.error = error
      
      // For validation errors (422), preserve the original error object
      if (error.response?.status === 422) {
        throw error
      }
      
      const message = getApiErrorMessage(error, 'profile', 'Failed to update profile')
      throw new Error(message)
    } finally {
      profileState.saving = false
    }
  }
  
  // Update profile with photo upload
  const updateProfileWithPhoto = async (formData) => {
    profileState.saving = true
    profileState.error = null
    
    try {
      const response = await profileAPI.updateProfileWithPhoto(formData)
      profileState.profile = response.data.user
      
      // Refresh auth user data to keep it in sync
      await refreshUser()
      
      return profileState.profile
    } catch (error) {
      profileState.error = error
      
      // For validation errors (422), preserve the original error object
      if (error.response?.status === 422) {
        throw error
      }
      
      const message = getApiErrorMessage(error, 'profile', 'Failed to update profile')
      throw new Error(message)
    } finally {
      profileState.saving = false
    }
  }
  
  // Delete profile photo
  const deleteProfilePhoto = async () => {
    profileState.saving = true
    profileState.error = null
    
    try {
      const response = await profileAPI.deleteProfilePhoto()
      profileState.profile = response.data.user
      
      // Refresh auth user data to keep it in sync
      await refreshUser()
      
      return profileState.profile
    } catch (error) {
      profileState.error = error
      const message = getApiErrorMessage(error, 'profile', 'Failed to delete profile photo')
      throw new Error(message)
    } finally {
      profileState.saving = false
    }
  }
  
  // Validate form data
  const validateProfileData = (data) => {
    const errors = {}
    
    Object.keys(data).forEach(field => {
      const value = data[field]
      const rules = profileValidationRules[field]
      
      if (!rules) return
      
      // Required validation
      if (rules.required && (!value || value.toString().trim() === '')) {
        errors[field] = `${field.replace('_', ' ')} is required`
        return
      }
      
      // Skip other validations if value is empty and not required
      if (!value) return
      
      // Type validation
      if (rules.type === 'number' && isNaN(Number(value))) {
        errors[field] = `${field.replace('_', ' ')} must be a number`
        return
      }
      
      if (rules.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field] = 'Please enter a valid email address'
        return
      }
      
      // Range validations for numbers
      if (rules.type === 'number') {
        const numValue = Number(value)
        if (rules.min !== undefined && numValue < rules.min) {
          errors[field] = `${field.replace('_', ' ')} must be at least ${rules.min}`
          return
        }
        if (rules.max !== undefined && numValue > rules.max) {
          errors[field] = `${field.replace('_', ' ')} cannot exceed ${rules.max}`
          return
        }
      }
      
      // String length validation
      if (rules.maxLength && value.toString().length > rules.maxLength) {
        errors[field] = `${field.replace('_', ' ')} cannot exceed ${rules.maxLength} characters`
        return
      }
      
      // Enum validation
      if (rules.type === 'enum' && !rules.values.includes(value)) {
        errors[field] = `${field.replace('_', ' ')} must be one of: ${rules.values.join(', ')}`
        return
      }
    })
    
    return Object.keys(errors).length > 0 ? errors : null
  }
  
  // Clear error state
  const clearError = () => {
    profileState.error = null
  }
  
  // Reset profile state
  const resetProfile = () => {
    profileState.profile = null
    profileState.error = null
    profileState.loading = false
    profileState.saving = false
  }
  
  return {
    // Reactive state
    profile,
    loading,
    error,
    saving,
    isProfileComplete,
    
    // Methods
    fetchProfile,
    updateProfile,
    updateProfileWithPhoto,
    deleteProfilePhoto,
    validateProfileData,
    clearError,
    resetProfile,
    
    // Validation helpers
    profileValidationRules,
    profileEnumOptions
  }
}
