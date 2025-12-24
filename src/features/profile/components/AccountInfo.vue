<template>
  <div class="profile-form">
    <form @submit.prevent="handleSubmit" class="form-container">
      <!-- Account Information Section -->
      <div class="section-header">
        <h3>Account Information</h3>
      </div>

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

      <!-- Fitness Goal -->
      <div class="section-header">
        <h3>Fitness Profile</h3>
      </div>

      <div class="field-card">
        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">Fitness Goal</ion-label>
          <ion-select
            v-model="formData.fitness_goal"
            placeholder="Select your primary goal"
            :class="{ 'ion-invalid': validationErrors.fitness_goal }"
            @ionChange="validateField('fitness_goal')"
          >
            <ion-select-option
              v-for="option in fitnessGoalOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </ion-select-option>
          </ion-select>
          <ion-note v-if="validationErrors.fitness_goal" slot="error">
            {{ validationErrors.fitness_goal }}
          </ion-note>
        </ion-item>
      </div>

      <!-- Personal Information Section -->
      <div class="section-header">
        <h3>Personal Information</h3>
      </div>

      <!-- Age -->
      <div class="field-card">
        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">Age</ion-label>
          <ion-input
            v-model.number="formData.age"
            type="number"
            placeholder="Enter your age"
            min="1"
            max="150"
            :class="{ 'ion-invalid': validationErrors.age }"
            @ion-blur="validateField('age')"
          ></ion-input>
          <ion-note v-if="validationErrors.age" slot="error">
            {{ validationErrors.age }}
          </ion-note>
        </ion-item>
      </div>

      <!-- Gender -->
      <div class="field-card">
        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">Gender</ion-label>
          <ion-select
            v-model="formData.gender"
            placeholder="Select gender"
            :class="{ 'ion-invalid': validationErrors.gender }"
            @ionChange="validateField('gender')"
          >
            <ion-select-option
              v-for="option in genderOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </ion-select-option>
          </ion-select>
          <ion-note v-if="validationErrors.gender" slot="error">
            {{ validationErrors.gender }}
          </ion-note>
        </ion-item>
      </div>

      <!-- Height -->
      <div class="field-card">
        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">Height (cm)</ion-label>
          <ion-input
            v-model.number="formData.height"
            type="number"
            placeholder="Enter height in centimeters"
            min="50"
            max="300"
            :class="{ 'ion-invalid': validationErrors.height }"
            @ion-blur="validateField('height')"
          ></ion-input>
          <ion-note v-if="validationErrors.height" slot="error">
            {{ validationErrors.height }}
          </ion-note>
        </ion-item>
      </div>

      <!-- Weight -->
      <div class="field-card">
        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">Weight (kg)</ion-label>
          <ion-input
            v-model.number="formData.weight"
            type="number"
            placeholder="Enter weight in kilograms"
            min="1"
            max="500"
            step="0.1"
            :class="{ 'ion-invalid': validationErrors.weight }"
            @ion-blur="validateField('weight')"
          ></ion-input>
          <ion-note v-if="validationErrors.weight" slot="error">
            {{ validationErrors.weight }}
          </ion-note>
        </ion-item>
      </div>

      <!-- Training Information Section -->
      <div class="section-header">
        <h3>Training Information</h3>
      </div>

      <!-- Training Experience -->
      <div class="field-card">
        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">Training Experience</ion-label>
          <ion-select
            v-model="formData.training_experience"
            placeholder="Select your experience level"
            :class="{ 'ion-invalid': validationErrors.training_experience }"
            @ionChange="validateField('training_experience')"
          >
            <ion-select-option
              v-for="option in experienceOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </ion-select-option>
          </ion-select>
          <ion-note v-if="validationErrors.training_experience" slot="error">
            {{ validationErrors.training_experience }}
          </ion-note>
        </ion-item>
      </div>

      <!-- Training Days Per Week -->
      <div class="field-card">
        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">Training Days Per Week</ion-label>
          <ion-input
            v-model.number="formData.training_days_per_week"
            type="number"
            placeholder="How many days per week do you train?"
            min="1"
            max="7"
            :class="{ 'ion-invalid': validationErrors.training_days_per_week }"
            @ion-blur="validateField('training_days_per_week')"
          ></ion-input>
          <ion-note v-if="validationErrors.training_days_per_week" slot="error">
            {{ validationErrors.training_days_per_week }}
          </ion-note>
        </ion-item>
      </div>

      <!-- Workout Duration -->
      <div class="field-card">
        <ion-item lines="none" class="form-item">
          <ion-label position="stacked">Workout Duration (minutes)</ion-label>
          <ion-input
            v-model.number="formData.workout_duration_minutes"
            type="number"
            placeholder="Average workout duration"
            min="1"
            max="600"
            :class="{ 'ion-invalid': validationErrors.workout_duration_minutes }"
            @ion-blur="validateField('workout_duration_minutes')"
          ></ion-input>
          <ion-note v-if="validationErrors.workout_duration_minutes" slot="error">
            {{ validationErrors.workout_duration_minutes }}
          </ion-note>
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
  IonSelect,
  IonSelectOption,
  IonNote,
  IonButton,
  IonSpinner,
  IonIcon
} from '@ionic/vue'
import { warningOutline } from 'ionicons/icons'
import { ref, reactive, computed, watch } from 'vue'
import { useProfile, profileEnumOptions } from '../composables/useProfile'

export default {
  name: 'AccountInfo',
  components: {
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
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

    // Enum options
    const fitnessGoalOptions = profileEnumOptions.fitness_goal
    const genderOptions = profileEnumOptions.gender
    const experienceOptions = profileEnumOptions.training_experience

    // Form data - combined account and fitness data
    const formData = reactive({
      name: '',
      email: '',
      fitness_goal: null,
      age: null,
      gender: null,
      height: null,
      weight: null,
      training_experience: null,
      training_days_per_week: null,
      workout_duration_minutes: null
    })

    // Validation state
    const validationErrors = reactive({})
    const hasValidated = ref(false)

    // Initialize form data when profile changes
    watch(() => props.profile, (newProfile) => {
      if (newProfile) {
        // Account info
        formData.name = newProfile.name || ''
        formData.email = newProfile.email || ''
        
        // Fitness profile
        if (newProfile.profile) {
          const profileData = newProfile.profile
          formData.fitness_goal = profileData.fitness_goal || null
          formData.age = profileData.age || null
          formData.gender = profileData.gender || null
          formData.height = profileData.height || null
          formData.weight = profileData.weight || null
          formData.training_experience = profileData.training_experience || null
          formData.training_days_per_week = profileData.training_days_per_week || null
          formData.workout_duration_minutes = profileData.workout_duration_minutes || null
        } else {
          // Reset fitness fields if no profile data
          formData.fitness_goal = null
          formData.age = null
          formData.gender = null
          formData.height = null
          formData.weight = null
          formData.training_experience = null
          formData.training_days_per_week = null
          formData.workout_duration_minutes = null
        }
        
        // Clear validation errors when profile updates
        Object.keys(validationErrors).forEach(key => {
          delete validationErrors[key]
        })
        hasValidated.value = false
      }
    }, { immediate: true })

    // Computed properties
    const hasChanges = computed(() => {
      if (!props.profile) {
        // If no existing profile, check if any field has a value
        return Object.values(formData).some(value => 
          value !== null && value !== '' && value !== 0
        )
      }
      
      // Check account info changes
      const accountChanged = formData.name !== (props.profile.name || '') ||
                            formData.email !== (props.profile.email || '')
      
      // Check fitness profile changes
      let fitnessChanged = false
      if (props.profile.profile) {
        const profileData = props.profile.profile
        fitnessChanged = Object.keys({
          fitness_goal: formData.fitness_goal,
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          training_experience: formData.training_experience,
          training_days_per_week: formData.training_days_per_week,
          workout_duration_minutes: formData.workout_duration_minutes
        }).some(key => {
          return formData[key] !== (profileData[key] || null)
        })
      } else {
        // If no existing fitness profile, check if any fitness field has a value
        fitnessChanged = formData.fitness_goal !== null ||
                        formData.age !== null ||
                        formData.gender !== null ||
                        formData.height !== null ||
                        formData.weight !== null ||
                        formData.training_experience !== null ||
                        formData.training_days_per_week !== null ||
                        formData.workout_duration_minutes !== null
      }
      
      return accountChanged || fitnessChanged
    })

    const isFormValid = computed(() => {
      // Account info must be valid
      const accountValid = formData.name.trim() !== '' &&
                          formData.email.trim() !== '' &&
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      
      // No validation errors
      const noErrors = Object.keys(validationErrors).length === 0
      
      return accountValid && noErrors
    })

    // Validate single field
    const validateField = (fieldName) => {
      // Skip validation for empty optional fitness fields
      if (formData[fieldName] === null || formData[fieldName] === '') {
        // Only validate required account fields
        if (fieldName === 'name' || fieldName === 'email') {
          const fieldData = { [fieldName]: formData[fieldName] }
          const errors = validateProfileData(fieldData)
          
          if (errors && errors[fieldName]) {
            validationErrors[fieldName] = errors[fieldName]
          } else {
            delete validationErrors[fieldName]
          }
        } else {
          // Clear error for optional fields that are empty
          delete validationErrors[fieldName]
        }
        hasValidated.value = true
        return
      }
      
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
      // Only validate fields that have values (for optional fitness fields)
      const dataToValidate = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          dataToValidate[key] = formData[key]
        } else if (key === 'name' || key === 'email') {
          // Always validate required account fields
          dataToValidate[key] = formData[key]
        }
      })
      
      const errors = validateProfileData(dataToValidate)
      
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

      // Combine account and fitness data
      const updateData = { ...formData }
      
      // Remove null values for optional fitness fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null && key !== 'name' && key !== 'email') {
          delete updateData[key]
        }
      })

      try {
        await emit('update', updateData)
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
        
        if (props.profile.profile) {
          const profileData = props.profile.profile
          formData.fitness_goal = profileData.fitness_goal || null
          formData.age = profileData.age || null
          formData.gender = profileData.gender || null
          formData.height = profileData.height || null
          formData.weight = profileData.weight || null
          formData.training_experience = profileData.training_experience || null
          formData.training_days_per_week = profileData.training_days_per_week || null
          formData.workout_duration_minutes = profileData.workout_duration_minutes || null
        } else {
          formData.fitness_goal = null
          formData.age = null
          formData.gender = null
          formData.height = null
          formData.weight = null
          formData.training_experience = null
          formData.training_days_per_week = null
          formData.workout_duration_minutes = null
        }
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
      fitnessGoalOptions,
      genderOptions,
      experienceOptions,
      validateField,
      handleSubmit,
      resetForm,
      warningOutline
    }
  }
}
</script>

<style scoped>
.profile-form {
  padding: 16px;
  background: var(--brand-background-color, #fafafa);
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
}

.section-header {
  margin: 24px 0 16px 0;
  padding: 0 4px;
}

.section-header:first-child {
  margin-top: 0;
}

.section-header h3 {
  font-family: var(--brand-font-family);
  color: var(--brand-text-primary-color);
  font-size: var(--brand-font-size-xl);
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.7px;
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
  
  .profile-form {
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

.form-item ion-input,
.form-item ion-select {
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


