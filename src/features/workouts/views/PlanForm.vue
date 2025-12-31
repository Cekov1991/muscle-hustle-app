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
      <div class="container">
        <!-- Loading State -->
        <div v-if="initialLoading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading plan...</p>
        </div>

        <!-- Plan Form -->
        <form v-else @submit.prevent="handleSave">
          <ion-list>
            <!-- Plan Name -->
            <ion-item>
              <ion-label position="stacked">Plan Name *</ion-label>
              <ion-input
                v-model="formData.name"
                placeholder="e.g., Bulking Plan"
                :disabled="loading"
                required
              ></ion-input>
            </ion-item>

            <!-- Description -->
            <ion-item>
              <ion-label position="stacked">Description</ion-label>
              <ion-textarea
                v-model="formData.description"
                placeholder="Optional description"
                rows="3"
                :disabled="loading"
              ></ion-textarea>
            </ion-item>

            <!-- Active Status -->
            <ion-item>
              <ion-label>Active Plan</ion-label>
              <ion-toggle
                v-model="formData.is_active"
                :disabled="loading"
              ></ion-toggle>
            </ion-item>
            <ion-item lines="none">
              <ion-label class="toggle-description">
                <p>Active plans are highlighted and used as the default when creating workout templates.</p>
              </ion-label>
            </ion-item>
          </ion-list>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <ion-button
              expand="block"
              type="submit"
              :disabled="loading || !isFormValid"
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
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonToggle,
  alertController
} from '@ionic/vue'
import {
  checkmarkOutline,
  trashOutline
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlans } from '../composables/usePlans'

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
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { fetchPlan, createPlan, updatePlan, deletePlan, loading } = usePlans()
    
    const planId = computed(() => route.params.id ? parseInt(route.params.id) : null)
    const isEditMode = computed(() => !!planId.value)
    const initialLoading = ref(true)
    
    // Form data
    const formData = ref({
      name: '',
      description: '',
      is_active: false
    })
    
    // Computed properties
    const isFormValid = computed(() => formData.value.name.trim().length > 0)
    
    // Initialize form data
    const initializeForm = async () => {
      initialLoading.value = true
      
      try {
        if (isEditMode.value) {
          const plan = await fetchPlan(planId.value)
          formData.value = {
            name: plan.name || '',
            description: plan.description || '',
            is_active: plan.is_active || false
          }
        }
      } catch (error) {
        console.error('InitializeForm error:', error)
        router.back()
      } finally {
        initialLoading.value = false
      }
    }
    
    // Handle save
    const handleSave = async () => {
      if (!isFormValid.value) return
      
      const data = {
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || null,
        is_active: formData.value.is_active
      }
      
      try {
        if (isEditMode.value) {
          await updatePlan(planId.value, data)
        } else {
          await createPlan(data)
        }
        router.back()
      } catch (error) {
        console.error('Save error:', error)
      }
    }
    
    // Handle cancel
    const handleCancel = () => {
      router.back()
    }
    
    // Handle delete
    const handleDelete = async () => {
      const plan = await fetchPlan(planId.value)
      const templateCount = plan.workout_templates?.length || 0
      
      const alert = await alertController.create({
        header: 'Delete Plan',
        message: templateCount > 0
          ? `Are you sure you want to delete "${plan.name}"? This will also delete all ${templateCount} workout template${templateCount === 1 ? '' : 's'} in this plan. This action cannot be undone.`
          : `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: async () => {
              try {
                await deletePlan(planId.value)
                router.back()
              } catch (error) {
                console.error('Delete error:', error)
              }
            }
          }
        ]
      })
      
      await alert.present()
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
      handleCancel,
      handleDelete,
      
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
  --background: var(--brand-background-color);
}

ion-title {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-lg);
  letter-spacing: -0.5px;
}

.plan-form-content {
  --background: var(--brand-background-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
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

ion-list {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  padding: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --background: transparent;
  --border-color: var(--brand-gray-20, #e5e7eb);
  font-family: var(--brand-font-family);
}

ion-label {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  font-weight: 600;
  color: var(--brand-text-primary-color);
}

ion-input,
ion-textarea {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-primary-color);
}

ion-input::placeholder,
ion-textarea::placeholder {
  color: var(--brand-text-tertiary-color);
}

.toggle-description {
  font-size: var(--brand-font-size-xs);
  color: var(--brand-text-secondary-color);
  font-weight: 400;
  margin-top: 4px;
}

.toggle-description p {
  margin: 0;
}

.action-buttons {
  margin-top: 24px;
  margin-bottom: 24px;
}

.action-buttons ion-button {
  margin-bottom: 12px;
  --border-radius: var(--brand-button-border-radius, 16px);
  font-family: var(--brand-font-family);
  font-weight: 600;
}

.action-buttons ion-button[type="submit"] {
  --background: var(--brand-primary);
}

.action-buttons ion-button[color="danger"] {
  --color: var(--brand-danger-color, #eb445a);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .plan-form-page {
    --background: var(--brand-background-color, #121212);
  }
  
  ion-list {
    background: var(--brand-card-background-color, #1f1f1f);
  }
  
  ion-item {
    --border-color: var(--brand-gray-30, #3f3f3f);
  }
}
</style>

