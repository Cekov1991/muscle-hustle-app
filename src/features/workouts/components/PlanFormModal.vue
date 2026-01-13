<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEditMode ? 'Edit Plan' : 'Create Plan' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <div class="modal-content">
        <form @submit.prevent="handleSubmit">
          <!-- Plan Name -->
          <div class="field-card">
            <ion-item lines="none" class="form-item">
              <ion-label position="stacked">Plan Name *</ion-label>
              <ion-input
                v-model="formData.name"
                placeholder="e.g., Bulking Plan"
                :disabled="loading"
                required
              ></ion-input>
            </ion-item>
          </div>

          <!-- Description -->
          <div class="field-card">
            <ion-item lines="none" class="form-item">
              <ion-label position="stacked">Description</ion-label>
              <ion-textarea
                v-model="formData.description"
                placeholder="Optional description"
                rows="3"
                :disabled="loading"
              ></ion-textarea>
            </ion-item>
          </div>

          <!-- Active Status -->
          <div class="field-card">
            <ion-item lines="none" class="form-item toggle-item">
              <ion-label>Active Plan</ion-label>
              <ion-toggle
                v-model="formData.is_active"
                :disabled="loading"
              ></ion-toggle>
            </ion-item>
            <div class="toggle-description">
              <p>Active plans are highlighted and used as the default when creating workouts.</p>
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
              {{ isEditMode ? 'Update' : 'Create' }} Plan
            </ion-button>
            
            <ion-button
              expand="block"
              fill="outline"
              @click="handleClose"
              :disabled="loading"
              class="cancel-button"
            >
              <span class="button-text">Cancel</span>
            </ion-button>
          </div>
        </form>
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
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonToggle,
  IonSpinner
} from '@ionic/vue'
import { closeOutline, checkmarkOutline } from 'ionicons/icons'
import { ref, computed, watch } from 'vue'
import { usePlans } from '../composables/usePlans'

export default {
  name: 'PlanFormModal',
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
    IonTextarea,
    IonToggle,
    IonSpinner
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    plan: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'created', 'updated'],
  setup(props, { emit }) {
    const { loading, createPlan, updatePlan } = usePlans()

    // Determine if we're in edit mode
    const isEditMode = computed(() => !!props.plan?.id)

    // Form data
    const formData = ref({
      name: '',
      description: '',
      is_active: false
    })

    // Form validation
    const isFormValid = computed(() => formData.value.name?.trim().length > 0)

    // Initialize form when modal opens or plan changes
    watch([() => props.isOpen, () => props.plan], ([isOpen, plan]) => {
      if (isOpen) {
        if (plan?.id) {
          // Edit mode - populate from plan data
          formData.value = {
            name: plan.name || '',
            description: plan.description || '',
            is_active: plan.is_active || false
          }
        } else {
          // Create mode - reset form
          formData.value = {
            name: '',
            description: '',
            is_active: false
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
          is_active: formData.value.is_active
        }

        if (isEditMode.value) {
          // Update existing plan
          const updated = await updatePlan(props.plan.id, data)
          emit('updated', updated)
        } else {
          // Create new plan
          const created = await createPlan(data)
          emit('created', created)
        }
      } catch (error) {
        console.error('PlanFormModal: Error saving plan:', error)
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

.modal-content {
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
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}

.form-item ion-input,
.form-item ion-textarea {
  font-family: var(--brand-font-family);
  --color: var(--brand-text-primary-color);
  --placeholder-color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-size: var(--brand-font-size-base);
  font-weight: 600;
}

.toggle-item {
  --inner-padding-top: 12px;
  --inner-padding-bottom: 8px;
}

.toggle-item ion-label {
  font-family: var(--brand-font-family);
  color: var(--brand-text-primary-color);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
}

.toggle-description {
  padding: 0 16px 12px 16px;
}

.toggle-description p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-weight: 400;
  margin: 0;
  line-height: 1.4;
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

