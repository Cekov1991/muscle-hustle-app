<template>
  <div class="account-info">
    <form @submit.prevent="handleSubmit" class="account-form">
      <!-- Name Field -->
      <ion-item class="form-item">
        <ion-label position="stacked">Full Name *</ion-label>
        <ion-input
          v-model="formData.name"
          type="text"
          placeholder="Enter your full name"
          :class="{ 'ion-invalid': validationErrors.name }"
          @ion-blur="validateField('name')"
        ></ion-input>
        <ion-note v-if="validationErrors.name" slot="error">
          {{ validationErrors.name }}
        </ion-note>
      </ion-item>

      <!-- Email Field -->
      <ion-item class="form-item">
        <ion-label position="stacked">Email Address *</ion-label>
        <ion-input
          v-model="formData.email"
          type="email"
          placeholder="Enter your email address"
          :class="{ 'ion-invalid': validationErrors.email }"
          @ion-blur="validateField('email')"
        ></ion-input>
        <ion-note v-if="validationErrors.email" slot="error">
          {{ validationErrors.email }}
        </ion-note>
      </ion-item>

      <!-- Email Verification Notice -->
      <ion-item v-if="profile?.email_verified_at === null" class="verification-notice">
        <ion-icon :icon="warningOutline" slot="start" color="warning"></ion-icon>
        <ion-label>
          <h3>Email Verification Required</h3>
          <p>Please verify your email address to secure your account.</p>
        </ion-label>
      </ion-item>

      <!-- Form Actions -->
      <div class="form-actions">
        <ion-button
          type="submit"
          expand="block"
          :disabled="loading || !hasChanges || !isFormValid"
          class="save-button"
        >
          <ion-spinner v-if="loading" name="crescent" slot="start"></ion-spinner>
          <span v-else>Save Changes</span>
        </ion-button>

        <ion-button
          v-if="hasChanges"
          @click="resetForm"
          fill="clear"
          expand="block"
          :disabled="loading"
          class="cancel-button"
        >
          Cancel
        </ion-button>
      </div>
    </form>
  </div>
</template>

<script>
import {
  IonItem,
  IonLabel,
  IonInput,
  IonNote,
  IonButton,
  IonSpinner,
  IonIcon
} from '@ionic/vue'
import { warningOutline } from 'ionicons/icons'
import { ref, reactive, computed, watch } from 'vue'
import { useProfile } from '../composables/useProfile'

export default {
  name: 'AccountInfo',
  components: {
    IonItem,
    IonLabel,
    IonInput,
    IonNote,
    IonButton,
    IonSpinner,
    IonIcon
  },
  props: {
    profile: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const { validateProfileData } = useProfile()

    // Form data
    const formData = reactive({
      name: '',
      email: ''
    })

    // Validation state
    const validationErrors = reactive({})
    const hasValidated = ref(false)

    // Initialize form data when profile changes
    watch(() => props.profile, (newProfile) => {
      if (newProfile) {
        formData.name = newProfile.name || ''
        formData.email = newProfile.email || ''
        // Clear validation errors when profile updates
        Object.keys(validationErrors).forEach(key => {
          delete validationErrors[key]
        })
        hasValidated.value = false
      }
    }, { immediate: true })

    // Computed properties
    const hasChanges = computed(() => {
      if (!props.profile) return false
      return formData.name !== (props.profile.name || '') ||
             formData.email !== (props.profile.email || '')
    })

    const isFormValid = computed(() => {
      return formData.name.trim() !== '' &&
             formData.email.trim() !== '' &&
             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
             Object.keys(validationErrors).length === 0
    })

    // Validate single field
    const validateField = (fieldName) => {
      const fieldData = { [fieldName]: formData[fieldName] }
      const errors = validateProfileData(fieldData)
      
      if (errors && errors[fieldName]) {
        validationErrors[fieldName] = errors[fieldName]
      } else {
        delete validationErrors[fieldName]
      }
      
      hasValidated.value = true
    }

    // Validate all fields
    const validateForm = () => {
      const errors = validateProfileData(formData)
      
      // Clear existing errors
      Object.keys(validationErrors).forEach(key => {
        delete validationErrors[key]
      })
      
      // Set new errors
      if (errors) {
        Object.keys(errors).forEach(key => {
          validationErrors[key] = errors[key]
        })
      }
      
      hasValidated.value = true
      return !errors
    }

    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) {
        return
      }

      try {
        await emit('update', { ...formData })
      } catch (error) {
        // Handle validation errors from API
        if (error.response?.status === 422 && error.response?.data?.errors) {
          const apiErrors = error.response.data.errors
          Object.keys(apiErrors).forEach(key => {
            if (apiErrors[key] && apiErrors[key].length > 0) {
              validationErrors[key] = apiErrors[key][0]
            }
          })
        }
      }
    }

    // Reset form to original values
    const resetForm = () => {
      if (props.profile) {
        formData.name = props.profile.name || ''
        formData.email = props.profile.email || ''
      }
      
      // Clear validation errors
      Object.keys(validationErrors).forEach(key => {
        delete validationErrors[key]
      })
      hasValidated.value = false
    }

    return {
      formData,
      validationErrors,
      hasChanges,
      isFormValid,
      validateField,
      handleSubmit,
      resetForm,
      warningOutline
    }
  }
}
</script>

<style scoped>
.account-info {
  padding: 20px;
}

.account-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-item {
  margin-bottom: 16px;
  --background: var(--brand-background-color);
  --border-color: var(--ion-color-light-shade);
}

.form-item ion-label {
  color: var(--brand-text-primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.form-item ion-input {
  --color: var(--brand-text-primary);
  --placeholder-color: var(--brand-text-secondary);
}

.verification-notice {
  --background: var(--ion-color-warning-tint);
  --border-color: var(--ion-color-warning);
  border-radius: 8px;
  margin: 16px 0;
}

.verification-notice ion-label h3 {
  color: var(--ion-color-warning-shade);
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.verification-notice ion-label p {
  color: var(--ion-color-warning-shade);
  margin: 0;
  font-size: 12px;
}

.form-actions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-button {
  --background: var(--brand-primary);
  --background-hover: var(--brand-primary-hover);
  --color: white;
  font-weight: 600;
}

.cancel-button {
  --color: var(--brand-text-secondary);
}

.save-button:disabled {
  --background: var(--ion-color-light);
  --color: var(--ion-color-medium);
}
</style>
