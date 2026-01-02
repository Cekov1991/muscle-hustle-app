<template>
  <ion-page class="plan-form-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/plans"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? 'Edit Plan' : 'New Plan' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleSave" :disabled="loading || !isFormValid">
            <ion-icon :icon="checkmarkOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content fullscreen class="plan-form-content">
      <div class="form-container">
        <!-- Loading State -->
        <div v-if="initialLoading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading plan...</p>
        </div>

        <!-- Plan Form -->
        <form v-else @submit.prevent="handleSave">
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
              <p>Active plans are highlighted and used as the default when creating workout templates.</p>
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
              @click="handleCancel"
              :disabled="loading"
              class="cancel-button"
            >
              <span class="button-text">Cancel</span>
            </ion-button>

            <!-- Delete Button (only in edit mode) -->
            <ion-button
              v-if="isEditMode"
              expand="block"
              fill="outline"
              color="danger"
              @click="handleDelete"
              :disabled="loading"
              class="delete-button"
            >
              <ion-icon :icon="trashOutline" slot="start" />
              Delete Plan
            </ion-button>
          </div>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonBackButton,
  IonSpinner,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonToggle
} from '@ionic/vue'
import {
  checkmarkOutline,
  trashOutline
} from 'ionicons/icons'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlanForm } from '../composables/usePlanForm'

export default {
  name: 'PlanForm',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonBackButton,
    IonSpinner,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle
  },
  setup() {
    const route = useRoute()
    const planId = computed(() => route.params.id ? parseInt(route.params.id) : null)

    const {
      loading,
      initialLoading,
      formData,
      isEditMode,
      isFormValid,
      initializeForm,
      savePlan,
      removePlan,
      cancelForm
    } = usePlanForm(planId)

    // Handle save with navigation
    const handleSave = async () => {
      try {
        await savePlan()
        cancelForm() // Navigate back after successful save
      } catch (error) {
        console.error('Save error:', error)
      }
    }

    // Initialize on mount
    onMounted(() => {
      initializeForm()
    })

    return {
      // State
      loading,
      initialLoading,
      isEditMode,
      formData,
      isFormValid,

      // Methods
      handleSave,
      handleCancel: cancelForm,
      handleDelete: removePlan,

      // Icons
      checkmarkOutline,
      trashOutline
    }
  }
}
</script>

<style scoped>
.plan-form-page {
  --background: var(--brand-background-color, #fafafa);
}

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

.plan-form-content {
  --background: var(--brand-background-color, #fafafa);
}

.form-container {
  padding: 16px;
  max-width: 500px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 24px;
}

.loading-state ion-spinner {
  --color: var(--brand-primary);
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
}

.loading-state p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-secondary-color);
  margin: 0;
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

.delete-button {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  border-radius: var(--brand-button-border-radius, 16px);
  height: 48px;
  letter-spacing: -0.3px;
  --color: var(--brand-danger-color, #eb445a);
}

.save-button:disabled {
  --background: var(--brand-card-background-color, var(--brand-gray-10));
  --color: var(--brand-gray-50, var(--brand-text-secondary-color));
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .plan-form-content {
    --background: var(--brand-background-color, #121212);
  }
  
  .field-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }
}
</style>

