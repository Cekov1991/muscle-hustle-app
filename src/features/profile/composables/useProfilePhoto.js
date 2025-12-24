import { ref, computed } from 'vue'
import { profileAPI } from '../../../shared/services/apiClient'
import { useApiError } from '../../../shared/composables/useApiError'

export const useProfilePhoto = () => {
  const { getApiErrorMessage } = useApiError()
  
  // Local state for photo operations
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const previewUrl = ref(null)
  const selectedFile = ref(null)
  const error = ref(null)
  
  // Photo validation constraints
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB in bytes
  
  // Computed properties
  const hasSelectedFile = computed(() => !!selectedFile.value)
  const hasPreview = computed(() => !!previewUrl.value)
  
  // Validate selected file
  const validateFile = (file) => {
    const errors = []
    
    if (!file) {
      errors.push('Please select a file')
      return errors
    }
    
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push('File must be an image (JPEG, PNG, or GIF)')
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push('File size must not exceed 2MB')
    }
    
    return errors
  }
  
  // Select and preview file
  const selectFile = (file) => {
    error.value = null
    
    const validationErrors = validateFile(file)
    if (validationErrors.length > 0) {
      error.value = validationErrors.join(', ')
      return false
    }
    
    selectedFile.value = file
    
    // Create preview URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
    
    previewUrl.value = URL.createObjectURL(file)
    return true
  }
  
  // Clear selected file and preview
  const clearSelection = () => {
    selectedFile.value = null
    error.value = null
    
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
  }
  
  // Upload photo with other profile data
  const uploadWithProfileData = async (profileData) => {
    if (!selectedFile.value) {
      throw new Error('No file selected')
    }
    
    uploading.value = true
    uploadProgress.value = 0
    error.value = null
    
    try {
      // Create FormData
      const formData = new FormData()
      
      // Add profile data
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key])
        }
      })
      
      // Add photo file
      formData.append('profile_photo', selectedFile.value)
      
      // Simulate upload progress (since axios doesn't provide real progress for FormData)
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10
        }
      }, 100)
      
      try {
        const response = await profileAPI.updateProfileWithPhoto(formData)
        
        // Complete progress
        clearInterval(progressInterval)
        uploadProgress.value = 100
        
        // Clear selection after successful upload
        clearSelection()
        
        return response.data.user
      } finally {
        clearInterval(progressInterval)
      }
    } catch (error) {
      error.value = getApiErrorMessage(error, 'profile photo', 'Failed to upload profile photo')
      throw error
    } finally {
      uploading.value = false
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }
  
  // Upload photo only (no other profile data)
  const uploadPhotoOnly = async () => {
    if (!selectedFile.value) {
      throw new Error('No file selected')
    }
    
    uploading.value = true
    uploadProgress.value = 0
    error.value = null
    
    try {
      const formData = new FormData()
      formData.append('profile_photo', selectedFile.value)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10
        }
      }, 100)
      
      try {
        const response = await profileAPI.updateProfileWithPhoto(formData)
        
        // Complete progress
        clearInterval(progressInterval)
        uploadProgress.value = 100
        
        // Clear selection after successful upload
        clearSelection()
        
        return response.data.user
      } finally {
        clearInterval(progressInterval)
      }
    } catch (error) {
      error.value = getApiErrorMessage(error, 'profile photo', 'Failed to upload profile photo')
      throw error
    } finally {
      uploading.value = false
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }
  
  // Delete profile photo
  const deletePhoto = async () => {
    uploading.value = true
    error.value = null
    
    try {
      const response = await profileAPI.deleteProfilePhoto()
      return response.data.user
    } catch (error) {
      error.value = getApiErrorMessage(error, 'profile photo', 'Failed to delete profile photo')
      throw error
    } finally {
      uploading.value = false
    }
  }
  
  // Cleanup function
  const cleanup = () => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
    }
  }
  
  return {
    // State
    uploading,
    uploadProgress,
    previewUrl,
    selectedFile,
    error,
    
    // Computed
    hasSelectedFile,
    hasPreview,
    
    // Methods
    selectFile,
    clearSelection,
    uploadWithProfileData,
    uploadPhotoOnly,
    deletePhoto,
    validateFile,
    cleanup,
    
    // Constants
    ALLOWED_TYPES,
    MAX_FILE_SIZE
  }
}
