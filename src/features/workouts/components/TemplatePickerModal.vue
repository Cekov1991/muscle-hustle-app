<template>
  <ion-modal 
    :is-open="isOpen" 
    @didDismiss="handleDismiss"
    class="template-picker-modal"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Choose Workout</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleDismiss">
            <ion-icon :icon="closeOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <ion-spinner name="crescent" />
        <p>Loading workouts...</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="!templates.length" class="empty-state">
        <ion-icon :icon="barbellOutline" class="empty-icon" />
        <h3>No Workout Templates</h3>
        <p>Create a workout template first to get started.</p>
        <ion-button fill="outline" @click="goToWorkouts">
          Create Workout
        </ion-button>
      </div>
      
      <!-- Templates List -->
      <div v-else class="templates-list">
        <p class="list-subtitle">Select a workout to start or begin a blank session.</p>
        
        <!-- Blank Session Option -->
        <div class="template-card blank-card" @click="handleSelectBlank">
          <div class="template-icon">
            <ion-icon :icon="addOutline" />
          </div>
          <div class="template-info">
            <h4>Blank Session</h4>
            <p>Start fresh and add exercises as you go</p>
          </div>
          <ion-icon :icon="chevronForwardOutline" class="arrow-icon" />
        </div>
        
        <div class="divider">
          <span>or choose a template</span>
        </div>
        
        <!-- Template Cards -->
        <div 
          v-for="template in templates" 
          :key="template.id"
          class="template-card"
          @click="handleSelectTemplate(template)"
        >
          <div class="template-icon">
            <ion-icon :icon="barbellOutline" />
          </div>
          <div class="template-info">
            <h4>{{ template.name }}</h4>
            <p>{{ getExerciseCount(template) }} exercises</p>
            <div v-if="template.day_of_week !== null" class="template-day">
              {{ getDayName(template.day_of_week) }}
            </div>
          </div>
          <ion-icon :icon="chevronForwardOutline" class="arrow-icon" />
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  IonModal, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonContent, 
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import { 
  closeOutline, 
  barbellOutline, 
  addOutline, 
  chevronForwardOutline 
} from 'ionicons/icons'
import { useWorkouts } from '../composables/useWorkouts'

export default {
  name: 'TemplatePickerModal',
  components: {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonSpinner
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'select'],
  setup(props, { emit }) {
    const router = useRouter()
    const { workouts, loading, fetchWorkouts } = useWorkouts()
    
    const templates = computed(() => workouts.value || [])
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    const getDayName = (dayIndex) => {
      return dayNames[dayIndex] || ''
    }
    
    const getExerciseCount = (template) => {
      return template.workoutTemplateExercises?.length || 
             template.workout_template_exercises?.length || 
             0
    }
    
    const handleDismiss = () => {
      emit('close')
    }
    
    const handleSelectTemplate = (template) => {
      emit('select', template.id)
    }
    
    const handleSelectBlank = () => {
      emit('select', null)
    }
    
    const goToWorkouts = () => {
      emit('close')
      router.push('/tabs/workouts')
    }
    
    onMounted(async () => {
      if (!workouts.value?.length) {
        try {
          await fetchWorkouts()
        } catch (error) {
          console.error('Failed to fetch workouts:', error)
        }
      }
    })
    
    return {
      templates,
      loading,
      getDayName,
      getExerciseCount,
      handleDismiss,
      handleSelectTemplate,
      handleSelectBlank,
      goToWorkouts,
      // Icons
      closeOutline,
      barbellOutline,
      addOutline,
      chevronForwardOutline
    }
  }
}
</script>

<style scoped>
.template-picker-modal {
  --height: 80%;
  --border-radius: 20px 20px 0 0;
}

ion-toolbar {
  --background: var(--brand-background-color);
}

ion-title {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-lg);
}

ion-content {
  --background: var(--brand-background-color);
}

.loading-state,
.empty-state {
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

.loading-state p,
.empty-state p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-secondary-color);
  margin: 8px 0 0 0;
}

.empty-icon {
  font-size: 64px;
  color: var(--brand-gray-30);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-lg);
  color: var(--brand-text-primary-color);
  margin: 0;
}

.empty-state ion-button {
  margin-top: 24px;
  --border-radius: 12px;
  font-family: var(--brand-font-family);
  font-weight: 600;
}

.list-subtitle {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0 0 16px 0;
}

.templates-list {
  padding-bottom: 24px;
}

.template-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--brand-card-background-color, var(--brand-gray-10));
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-card:active {
  transform: translateY(0);
}

.template-card.blank-card {
  background: var(--brand-primary-light, rgba(249, 115, 22, 0.08));
  border: 1px dashed var(--brand-primary);
}

.template-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--brand-background-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.template-icon ion-icon {
  font-size: 24px;
  color: var(--brand-primary);
}

.blank-card .template-icon {
  background: var(--brand-primary);
}

.blank-card .template-icon ion-icon {
  color: var(--brand-text-on-primary-color, #fff);
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-info h4 {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-primary-color);
  margin: 0 0 4px 0;
}

.template-info p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0;
}

.template-day {
  display: inline-block;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  font-weight: 500;
  color: var(--brand-primary);
  background: var(--brand-primary-light, rgba(249, 115, 22, 0.1));
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.arrow-icon {
  font-size: 20px;
  color: var(--brand-gray-40);
  flex-shrink: 0;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--brand-gray-20);
}

.divider span {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  color: var(--brand-text-tertiary-color);
  padding: 0 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>

