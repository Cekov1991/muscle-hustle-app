<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEditMode ? 'Edit Workout' : 'Create Workout' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="modal-content">
        <WorkoutDetailsForm
          v-model="formData"
          :loading="loading"
          :is-edit-mode="isEditMode"
          :is-valid="isFormValid"
          @submit="handleSubmit"
          @cancel="handleClose"
        />
      </div>
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
  IonIcon
} from '@ionic/vue'
import { closeOutline } from 'ionicons/icons'
import { ref, computed, watch } from 'vue'
import WorkoutDetailsForm from './WorkoutDetailsForm.vue'
import { useWorkouts } from '../composables/useWorkouts'

export default {
  name: 'WorkoutFormModal',
  components: {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    WorkoutDetailsForm
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    planId: {
      type: [Number, String],
      default: null
    },
    workout: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'created', 'updated'],
  setup(props, { emit }) {
    const { loading, createWorkout, updateWorkout } = useWorkouts()

    // Determine if we're in edit mode
    const isEditMode = computed(() => !!props.workout?.id)

    // Form data
    const formData = ref({
      plan_id: null,
      name: '',
      description: '',
      day_of_week: null
    })

    // Form validation
    const isFormValid = computed(() => {
      const hasName = formData.value.name?.trim().length > 0
      // plan_id is required for new workouts, optional for updates
      const hasPlan = isEditMode.value ? true : !!formData.value.plan_id
      return hasName && hasPlan
    })

    // Initialize form when modal opens or workout/planId changes
    watch([() => props.isOpen, () => props.workout, () => props.planId], ([isOpen, workout, planId]) => {
      if (isOpen) {
        if (workout?.id) {
          // Edit mode - populate from workout data
          formData.value = {
            plan_id: workout.plan_id || null,
            name: workout.name || '',
            description: workout.description || '',
            day_of_week: workout.day_of_week ?? null
          }
        } else {
          // Create mode - reset form with pre-selected plan
          formData.value = {
            plan_id: planId ? parseInt(planId) : null,
            name: '',
            description: '',
            day_of_week: null
          }
        }
      }
    }, { immediate: true })

    // Handle form submission
    const handleSubmit = async () => {
      if (!isFormValid.value) return

      try {
        const data = {
          name: formData.value.name.trim(),
          description: formData.value.description?.trim() || null,
          day_of_week: formData.value.day_of_week
        }

        if (isEditMode.value) {
          // Update existing workout
          if (formData.value.plan_id) {
            data.plan_id = formData.value.plan_id
          }
          const updated = await updateWorkout(props.workout.id, data)
          emit('updated', updated)
        } else {
          // Create new workout
          data.plan_id = formData.value.plan_id
          const created = await createWorkout(data)
          emit('created', created)
        }
      } catch (error) {
        console.error('WorkoutFormModal: Error saving workout:', error)
        // Error is already handled in composable with toast
      }
    }

    // Handle close
    const handleClose = () => {
      emit('close')
    }

    return {
      loading,
      isEditMode,
      formData,
      isFormValid,
      handleSubmit,
      handleClose,
      closeOutline
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

.modal-content {
  padding: 16px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  ion-content {
    --background: var(--brand-background-color, #121212);
  }
}
</style>

