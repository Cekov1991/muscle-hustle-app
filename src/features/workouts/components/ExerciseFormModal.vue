<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEditMode ? 'Edit Exercise' : 'Add Exercise' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <form @submit.prevent="handleSubmit" class="form-container">
        <!-- Exercise Selection (only when adding) -->
        <div v-if="!isEditMode" class="field-card">
          <ion-item lines="none" class="form-item">
            <ion-label position="stacked">Exercise</ion-label>
            <ion-select
              v-model="formData.exercise_id"
              placeholder="Select exercise"
              :disabled="loading"
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

        <!-- Exercise Name (read-only when editing) -->
        <div v-if="isEditMode" class="field-card">
          <ion-item lines="none" class="form-item">
            <ion-label position="stacked">Exercise</ion-label>
            <ion-input
              :value="selectedExercise?.name || 'Unknown'"
              readonly
            ></ion-input>
          </ion-item>
        </div>

        <!-- Target Sets -->
        <div class="field-card">
          <ion-item lines="none" class="form-item">
            <ion-label position="stacked">Target Sets</ion-label>
            <ion-input
              v-model.number="formData.target_sets"
              type="number"
              min="1"
              placeholder="e.g., 4"
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
              placeholder="e.g., 8"
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
              placeholder="e.g., 80.00"
              :disabled="loading"
            ></ion-input>
          </ion-item>
        </div>

        <!-- Rest Seconds -->
        <div class="field-card">
          <ion-item lines="none" class="form-item">
            <ion-label position="stacked">Rest Time (seconds)</ion-label>
            <ion-input
              v-model.number="formData.rest_seconds"
              type="number"
              min="0"
              placeholder="e.g., 90"
              :disabled="loading"
            ></ion-input>
          </ion-item>
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
          
          <ion-button
            expand="block"
            fill="outline"
            @click="handleClose"
            :disabled="loading"
            class="cancel-button"
          >
          <span class="button-text"> Cancel </span>
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

.field-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  
  .field-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }
}
</style>

