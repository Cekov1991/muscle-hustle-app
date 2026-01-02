<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEditMode ? 'Edit Exercise Targets' : 'Add Exercise and Set Targets' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <form @submit.prevent="handleSubmit" class="form-container">
        <!-- Exercise Info Card -->
        <div class="exercise-info-card">
          <!-- Exercise Name -->
          <h2 class="exercise-name">{{ selectedExercise?.name || 'Select an exercise' }}</h2>
          
          <!-- Category -->
          <p v-if="selectedExercise?.category?.name" class="exercise-category">
            {{ selectedExercise.category.name }}
          </p>

          <!-- Target Muscle Groups -->
          <div v-if="selectedExercise?.muscle_groups?.length" class="muscle-groups">
            <span 
              v-for="muscle in selectedExercise.muscle_groups" 
              :key="muscle.id"
              class="muscle-tag"
              :class="{ 'primary': muscle.is_primary }"
            >
              {{ muscle.name }}
            </span>
          </div>

          <!-- Exercise Selection Dropdown (only when no exercise selected) -->
          <ion-item v-if="!isEditMode && !selectedExercise" lines="none" class="form-item select-item">
            <ion-select
              v-model="formData.exercise_id"
              placeholder="Choose exercise..."
              :disabled="loading"
              interface="action-sheet"
            >
              <ion-select-option
                v-for="exercise in availableExercises"
                :key="exercise.id"
                :value="exercise.id"
              >
                {{ exercise.name }}
              </ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- Form Fields Grid -->
        <div class="fields-grid">
          <!-- Target Sets -->
          <div class="field-card">
            <ion-item lines="none" class="form-item">
              <ion-label position="stacked">Target Sets</ion-label>
              <ion-input
                v-model.number="formData.target_sets"
                type="number"
                min="1"
                placeholder="4"
                :disabled="loading"
              ></ion-input>
            </ion-item>
          </div>

          <!-- Target Reps -->
          <div class="field-card">
            <ion-item lines="none" class="form-item">
              <ion-label position="stacked">Target Reps</ion-label>
              <ion-input
                v-model.number="formData.target_reps"
                type="number"
                min="1"
                placeholder="8"
                :disabled="loading"
              ></ion-input>
            </ion-item>
          </div>

          <!-- Target Weight -->
          <div class="field-card">
            <ion-item lines="none" class="form-item">
              <ion-label position="stacked">Target Weight</ion-label>
              <ion-input
                v-model.number="formData.target_weight"
                type="number"
                min="0"
                step="0.01"
                placeholder="80"
                :disabled="loading"
              ></ion-input>
            </ion-item>
          </div>

          <!-- Rest Seconds -->
          <div class="field-card">
            <ion-item lines="none" class="form-item">
              <ion-label position="stacked">Rest Time (sec)</ion-label>
              <ion-input
                v-model.number="formData.rest_seconds"
                type="number"
                min="0"
                placeholder="90"
                :disabled="loading"
              ></ion-input>
            </ion-item>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <ion-button
            expand="block"
            type="submit"
            :disabled="loading || !isFormValid"
            class="save-button"
          >
            <ion-spinner v-if="loading" name="crescent" slot="start" />
            <ion-icon v-else :icon="checkmarkOutline" slot="start" />
            {{ isEditMode ? 'Update' : 'Add' }} Exercise
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-modal>
</template>

<script>
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner
} from '@ionic/vue'
import {
  closeOutline,
  checkmarkOutline
} from 'ionicons/icons'
import { ref, computed, watch } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'

export default {
  name: 'ExerciseFormModal',
  components: {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: v => ['create', 'edit'].includes(v)
    },
    exercise: {
      type: Object,
      default: null
    },
    availableExercises: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const { loading } = useWorkouts()
    // Edit mode is explicitly set via prop for clarity
    const isEditMode = computed(() => props.mode === 'edit')

    // Form data
    const formData = ref({
      exercise_id: null,
      target_sets: null,
      target_reps: null,
      target_weight: null,
      rest_seconds: null
    })

    // Selected exercise (for display when editing)
    const selectedExercise = computed(() => {
      if (isEditMode.value) {
        return props.exercise
      }
      return props.availableExercises.find(ex => ex.id === formData.value.exercise_id)
    })

    // Form validation
    const isFormValid = computed(() => {
      if (!isEditMode.value && !formData.value.exercise_id) {
        return false
      }
      return true
    })

    // Initialize form when modal opens or exercise changes
    watch([() => props.isOpen, () => props.exercise], ([isOpen, exercise]) => {
      if (isOpen) {
        if (exercise && exercise.pivot) {
          // Edit mode - populate from exercise pivot data
          formData.value = {
            exercise_id: exercise.id,
            target_sets: exercise.pivot.target_sets || null,
            target_reps: exercise.pivot.target_reps || null,
            target_weight: exercise.pivot.target_weight ? parseFloat(exercise.pivot.target_weight) : null,
            rest_seconds: exercise.pivot.rest_seconds || null
          }
        } else if (exercise && !exercise.pivot) {
          // Add mode - exercise selected but not yet added to workout
          formData.value = {
            exercise_id: exercise.id,
            target_sets: null,
            target_reps: null,
            target_weight: null,
            rest_seconds: exercise.default_rest_sec || null
          }
        } else {
          // Add mode - no exercise selected yet, reset form
          formData.value = {
            exercise_id: null,
            target_sets: null,
            target_reps: null,
            target_weight: null,
            rest_seconds: null
          }
        }
      }
    }, { immediate: true })

    // Handle form submission
    const handleSubmit = () => {
      if (!isFormValid.value) return

      const data = {
        ...formData.value
      }

      // Remove exercise_id if editing (it's not needed in update)
      if (isEditMode.value) {
        delete data.exercise_id
      }

      emit('submit', data)
    }

    // Handle close
    const handleClose = () => {
      formData.value = {
        exercise_id: null,
        target_sets: null,
        target_reps: null,
        target_weight: null,
        rest_seconds: null
      }
      emit('close')
    }

    return {
      loading,
      isEditMode,
      formData,
      selectedExercise,
      isFormValid,
      handleSubmit,
      handleClose,
      // Icons
      closeOutline,
      checkmarkOutline
    }
  }
}
</script>

<style scoped>
ion-header {
  --background: var(--brand-background-color, #ffffff);
}

ion-toolbar {
  --background: var(--brand-background-color, #ffffff);
  --color: var(--brand-primary);
}

ion-title {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-lg);
  letter-spacing: -0.5px;
  color: var(--brand-primary);
}

ion-content {
  --background: var(--brand-background-color, #fafafa);
}

.form-container {
  padding: 16px;
  max-width: 500px;
  margin: 0 auto;
}

/* Fields Grid Layout */
.fields-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.field-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-item {
  --background: transparent;
  --border-color: transparent;
  --inner-padding-start: 16px;
  --inner-padding-end: 16px;
  --inner-padding-top: 12px;
  --inner-padding-bottom: 12px;
  --min-height: auto;
}

.form-item ion-label {
  font-family: var(--brand-font-family);
  color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  margin-bottom: 6px;
  letter-spacing: -0.3px;
}

.form-item ion-input,
.form-item ion-select {
  font-family: var(--brand-font-family);
  --color: var(--brand-text-primary-color);
  --placeholder-color: var(--brand-gray-40, #9ca3af);
  font-size: var(--brand-font-size-xl);
  font-weight: 700;
}

/* Exercise Info Card */
.exercise-info-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  margin-bottom: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.exercise-name {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-lg);
  font-weight: 700;
  color: var(--brand-text-primary-color);
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.exercise-category {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0 0 12px 0;
}

.muscle-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--brand-gray-20, #e5e7eb);
}

.muscle-tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 10px;
  font-family: var(--brand-font-family);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: var(--brand-gray-20, #e5e7eb);
  color: var(--brand-text-secondary-color, #6b7280);
}

.muscle-tag.primary {
  background: var(--brand-primary-light, rgba(249, 115, 22, 0.15));
  color: var(--brand-primary);
}

.select-item {
  margin-top: 8px;
  --padding-start: 0;
  --inner-padding-start: 0;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-button {
  --background: var(--brand-primary);
  --background-hover: var(--brand-primary-shade);
  --color: var(--brand-text-on-primary-color);
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  border-radius: var(--brand-button-border-radius, 16px);
  height: 48px;
  letter-spacing: -0.3px;
}

.cancel-button {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  border-radius: var(--brand-button-border-radius, 16px);
  height: 48px;
  letter-spacing: -0.3px;
}

.save-button:disabled {
  --background: var(--brand-card-background-color, var(--brand-gray-10));
  --color: var(--brand-gray-50, var(--brand-text-secondary-color));
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  ion-content {
    --background: var(--brand-background-color, #121212);
  }
  
  .field-card,
  .exercise-info-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }

  .muscle-groups {
    border-top-color: var(--brand-gray-60, #4b5563);
  }

  .muscle-tag {
    background: var(--brand-gray-70, #374151);
    color: var(--brand-gray-30, #d1d5db);
  }

  .muscle-tag.primary {
    background: var(--brand-primary-light, rgba(249, 115, 22, 0.2));
    color: var(--brand-primary);
  }
}
</style>

