<template>
  <div class="profile-photo-upload">
    <!-- Current Photo Display -->
    <div class="photo-container" @click="triggerFileInput">
      <div class="photo-wrapper">
        <img 
          v-if="displayPhoto" 
          :src="displayPhoto" 
          alt="Profile Photo" 
          class="profile-photo"
        />
        <div v-else class="photo-placeholder">
          <ion-icon :icon="personOutline" class="placeholder-icon"></ion-icon>
        </div>
        
        <!-- Upload Overlay -->
        <div class="upload-overlay">
          <ion-icon :icon="cameraOutline" class="camera-icon"></ion-icon>
          <span class="upload-text">{{ currentPhoto ? 'Change' : 'Add Photo' }}</span>
        </div>
        
        <!-- Loading Overlay -->
        <div v-if="uploading" class="loading-overlay">
          <ion-spinner name="crescent"></ion-spinner>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- File Input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      style="display: none"
    />

    <!-- Photo Actions -->
    <div v-if="currentPhoto && !uploading" class="photo-actions">
      <ion-button
        @click="handleDeletePhoto"
        fill="clear"
        size="small"
        color="danger"
        :disabled="loading"
      >
        <ion-icon :icon="trashOutline" slot="start"></ion-icon>
        Remove Photo
      </ion-button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
      <span>{{ error }}</span>
    </div>

    <!-- Upload Instructions -->
    <div class="upload-instructions">
      <p>Upload a profile photo (JPEG, PNG, or GIF)</p>
      <p class="size-limit">Maximum file size: 2MB</p>
    </div>
  </div>
</template>

<script>
import {
  IonIcon,
  IonButton,
  IonSpinner
} from '@ionic/vue'
import {
  personOutline,
  cameraOutline,
  trashOutline,
  alertCircleOutline
} from 'ionicons/icons'
import { ref, computed } from 'vue'
import { useProfilePhoto } from '../composables/useProfilePhoto'
import { useProfile } from '../composables/useProfile'
import { useToast } from '../../../shared/composables/useToast'

export default {
  name: 'ProfilePhotoUpload',
  components: {
    IonIcon,
    IonButton,
    IonSpinner
  },
  props: {
    currentPhoto: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['photo-updated'],
  setup(props, { emit }) {
    const { showSuccess, showError } = useToast()
    const { deleteProfilePhoto } = useProfile()
    const {
      uploading,
      uploadProgress,
      previewUrl,
      selectedFile,
      error,
      selectFile,
      clearSelection,
      uploadPhotoOnly,
      cleanup
    } = useProfilePhoto()

    // Template refs
    const fileInput = ref(null)

    // Computed properties
    const displayPhoto = computed(() => {
      return previewUrl.value || props.currentPhoto
    })

    // Trigger file input
    const triggerFileInput = () => {
      if (uploading.value || props.loading) return
      fileInput.value?.click()
    }

    // Handle file selection
    const handleFileSelect = async (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      const success = selectFile(file)
      if (success) {
        // Auto-upload the selected file
        try {
          await uploadPhotoOnly()
          await showSuccess('Profile photo updated successfully')
          emit('photo-updated')
        } catch (error) {
          console.error('Failed to upload photo:', error)
          
          if (error.response?.status === 422) {
            const errors = error.response.data.errors
            if (errors.profile_photo) {
              await showError(errors.profile_photo[0])
            } else {
              await showError('Invalid photo file')
            }
          } else {
            await showError(error.message || 'Failed to upload photo')
          }
        }
      }

      // Clear file input
      event.target.value = ''
    }

    // Handle photo deletion
    const handleDeletePhoto = async () => {
      try {
        await deleteProfilePhoto()
        await showSuccess('Profile photo removed successfully')
        emit('photo-updated')
      } catch (error) {
        console.error('Failed to delete photo:', error)
        await showError(error.message || 'Failed to remove photo')
      }
    }

    // Cleanup on unmount
    const onUnmounted = () => {
      cleanup()
    }

    return {
      fileInput,
      uploading,
      uploadProgress,
      error,
      displayPhoto,
      triggerFileInput,
      handleFileSelect,
      handleDeletePhoto,
      onUnmounted,
      
      // Icons
      personOutline,
      cameraOutline,
      trashOutline,
      alertCircleOutline
    }
  },
  beforeUnmount() {
    this.onUnmounted()
  }
}
</script>

<style scoped>
.profile-photo-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.photo-container {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.photo-container:hover {
  transform: scale(1.02);
}

.photo-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--ion-color-light);
  border: 3px solid var(--brand-primary);
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-light-shade);
}

.placeholder-icon {
  font-size: 48px;
  color: var(--ion-color-medium);
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
  gap: 4px;
}

.photo-container:hover .upload-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 24px;
}

.upload-text {
  font-size: 12px;
  font-weight: 500;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 12px;
}

.progress-bar {
  width: 80%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.photo-actions {
  display: flex;
  gap: 12px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-danger);
  font-size: 14px;
  text-align: center;
  padding: 8px 16px;
  background: var(--ion-color-danger-tint);
  border-radius: 8px;
  border: 1px solid var(--ion-color-danger);
}

.error-icon {
  font-size: 16px;
}

.upload-instructions {
  text-align: center;
  color: var(--brand-text-secondary);
}

.upload-instructions p {
  margin: 4px 0;
  font-size: 14px;
}

.size-limit {
  font-size: 12px;
  color: var(--ion-color-medium);
}
</style>
