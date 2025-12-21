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
      <form @submit.prevent="handleSubmit">
        <ion-list>
          <!-- Exercise Selection (only when adding) -->
          <ion-item v-if="!isEditMode">
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

          <!-- Exercise Name (read-only when editing) -->
          <ion-item v-if="isEditMode">
            <ion-label position="stacked">Exercise</ion-label>
            <ion-input
              :value="selectedExercise?.name || 'Unknown'"
              readonly
            ></ion-input>
          </ion-item>

          <!-- Target Sets -->
          <ion-item>
            <ion-label position="stacked">Target Sets</ion-label>
            <ion-input
              v-model.number="formData.target_sets"
              type="number"
              min="1"
              placeholder="e.g., 4"
              :disabled="loading"
            ></ion-input>
          </ion-item>

          <!-- Target Reps -->
          <ion-item>
            <ion-label position="stacked">Target Reps</ion-label>
            <ion-input
              v-model.number="formData.target_reps"
              type="number"
              min="1"
              placeholder="e.g., 8"
              :disabled="loading"
            ></ion-input>
          </ion-item>

          <!-- Target Weight -->
          <ion-item>
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

          <!-- Rest Seconds -->
          <ion-item>
            <ion-label position="stacked">Rest Time (seconds)</ion-label>
            <ion-input
              v-model.number="formData.rest_seconds"
              type="number"
              min="0"
              placeholder="e.g., 90"
              :disabled="loading"
            ></ion-input>
          </ion-item>
        </ion-list>

        <!-- Action Buttons -->
        <div class="ion-padding">
          <ion-button
            expand="block"
            type="submit"
            :disabled="loading || !isFormValid"
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
          >
            Cancel
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
  IonList,
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
    IonList,
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
    // Edit mode is when exercise has pivot data (already in workout)
    const isEditMode = computed(() => !!(props.exercise && props.exercise.pivot))

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
ion-item {
  --padding-start: 1rem;
}
</style>

