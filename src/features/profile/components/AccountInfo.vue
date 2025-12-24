<template>
  <div class="account-info">
    <form @submit.prevent="handleSubmit" class="account-form">
      <!-- Name Field -->
      <div class="field-card">
        <ion-item lines="none" class="form-item">
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
      </div>

      <!-- Email Field -->
      <div class="field-card">
        <ion-item lines="none" class="form-item">
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
      </div>

      <!-- Email Verification Notice -->
      <div v-if="profile?.email_verified_at === null" class="field-card verification-card">
        <ion-item lines="none" class="verification-notice">
          <ion-icon :icon="warningOutline" slot="start" color="warning"></ion-icon>
          <ion-label>
            <h3>Email Verification Required</h3>
            <p>Please verify your email address to secure your account.</p>
          </ion-label>
        </ion-item>
      </div>

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
  padding: 16px;
  background: var(--brand-background-color, #fafafa);
}

.account-form {
  max-width: 500px;
  margin: 0 auto;
}

.field-card {
  background: var(--brand-gray-10, var(--brand-card-background-color));
  border-radius: 20px;
  margin-bottom: 12px;
  overflow: hidden;
}

@media (prefers-color-scheme: dark) {
  .field-card {
    background: var(--brand-gray-10, var(--brand-card-background-color));
  }
  
  .account-info {
    background: var(--brand-background-color, #1a1a1a);
  }
}

.form-item {
  --background: transparent;
  --border-color: transparent;
  --inner-padding-start: 6px;
  --inner-padding-end: 16px;
  --inner-padding-top: 6px;
  --inner-padding-bottom: 6px;
  --min-height: auto;
}

.form-item ion-label {
  font-family: var(--brand-font-family);
  color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}

.form-item ion-input {
  font-family: var(--brand-font-family);
  --color: var(--brand-text-primary-color);
  --placeholder-color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-size: var(--brand-font-size-base);
  font-weight: 600;
}

.verification-card {
  background: var(--brand-gray-10, var(--brand-card-background-color));
  border: 2px solid var(--brand-warning-color);
}

@media (prefers-color-scheme: dark) {
  .verification-card {
    background: var(--brand-gray-10, var(--brand-card-background-color));
    border-color: var(--brand-warning-color);
  }
}

.verification-notice {
  --background: transparent;
  --border-color: transparent;
}

.verification-notice ion-label h3 {
  font-family: var(--brand-font-family);
  color: var(--brand-warning-color);
  margin: 0 0 4px 0;
  font-size: var(--brand-font-size-sm);
  font-weight: 600;
  letter-spacing: -0.3px;
}

.verification-notice ion-label p {
  font-family: var(--brand-font-family);
  color: var(--brand-warning-color);
  margin: 0;
  font-size: var(--brand-font-size-xs);
  letter-spacing: -0.2px;
}

.form-actions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
}

.save-button {
  --background: var(--brand-primary);
  --background-hover: var(--brand-primary-shade);
  --color: var(--brand-text-on-primary-color);
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  border-radius: var(--brand-button-border-radius, 12px);
  height: 48px;
  letter-spacing: -0.3px;
}

.cancel-button {
  font-family: var(--brand-font-family);
  --color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  border-radius: var(--brand-button-border-radius, 12px);
  height: 48px;
  letter-spacing: -0.3px;
}

.save-button:disabled {
  --background: var(--brand-gray-10, var(--brand-card-background-color));
  --color: var(--brand-gray-50, var(--brand-text-secondary-color));
}
</style>


