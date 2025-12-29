<template>
  <ion-page class="workout-session-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="handleBack" color="medium">
            <ion-icon :icon="arrowBackOutline" />
          </ion-button>
        </ion-buttons>
        <ion-title>{{ workoutTitle }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showCancelConfirm = true" color="danger">
            Cancel
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      
      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${safeProgressPercent}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ Math.round(safeProgressPercent) }}% Complete</span>
      </div>
    </ion-header>
    
    <ion-content class="ion-padding">
      <!-- Loading State -->
      <div v-if="loading && !session" class="loading-state">
        <ion-spinner name="crescent" />
        <p>Loading workout...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error && !session" class="error-state">
        <ion-icon :icon="alertCircleOutline" class="error-icon" />
        <h3>Failed to load workout</h3>
        <p>{{ error.message || 'Something went wrong' }}</p>
        <ion-button fill="outline" @click="loadSession">
          Try Again
        </ion-button>
      </div>
      
      <!-- Workout Content -->
      <template v-else-if="session">
        <!-- Workout Info Card -->
        <div class="workout-info-card">
          <div class="workout-stats">
            <div class="stat">
              <span class="stat-value">{{ exercises.length }}</span>
              <span class="stat-label">Exercises</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ completedExercises }}</span>
              <span class="stat-label">Completed</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ totalSetsLogged }}</span>
              <span class="stat-label">Sets Logged</span>
            </div>
          </div>
        </div>
        
        <!-- Exercise List -->
        <div class="exercises-list">
          <ActiveExerciseCard
            v-for="exercise in exercises"
            :key="exercise.session_exercise?.id"
            :exercise="exercise"
            :loading="loading"
            @log-set="handleLogSet"
            @update-set="handleUpdateSet"
            @delete-set="handleDeleteSet"
            @rest-start="handleRestStart"
          />
        </div>
        
        <!-- Add Exercise Button -->
        <div class="add-exercise-section">
          <ion-button 
            fill="outline" 
            expand="block"
            class="add-exercise-button"
            @click="showAddExercise = true"
          >
            <ion-icon :icon="addOutline" slot="start" />
            Add Exercise
          </ion-button>
        </div>
        
        <!-- Complete Workout Button -->
        <div class="complete-section">
          <ion-button 
            expand="block"
            class="complete-button"
            :disabled="loading"
            @click="showCompleteConfirm = true"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <template v-else>
              <ion-icon :icon="checkmarkCircle" slot="start" />
              Complete Workout
            </template>
          </ion-button>
        </div>
      </template>
    </ion-content>
    
    <!-- Rest Timer Modal -->
    <RestTimerModal
      :is-open="showRestTimer"
      :duration="restTimerDuration"
      :exercise-name="restTimerExercise"
      :next-set-number="restTimerNextSet"
      @close="showRestTimer = false"
      @complete="handleRestComplete"
      @skip="handleRestSkip"
    />
    
    <!-- Add Exercise Modal (using Exercise Selection) -->
    <ExerciseSelectionModal
      :is-open="showAddExercise"
      @close="showAddExercise = false"
      @select="handleAddExercise"
    />
    
    <!-- Cancel Confirmation Alert -->
    <ion-alert
      :is-open="showCancelConfirm"
      header="Cancel Workout?"
      message="This will discard all your logged sets. Are you sure?"
      :buttons="cancelAlertButtons"
      @didDismiss="showCancelConfirm = false"
    />
    
    <!-- Complete Confirmation Alert -->
    <ion-alert
      :is-open="showCompleteConfirm"
      header="Complete Workout?"
      :message="completeMessage"
      :buttons="completeAlertButtons"
      :inputs="completeAlertInputs"
      @didDismiss="showCompleteConfirm = false"
    />
  </ion-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner,
  IonAlert
} from '@ionic/vue'
import {
  arrowBackOutline,
  addOutline,
  checkmarkCircle,
  alertCircleOutline
} from 'ionicons/icons'
import { useWorkoutSession } from '../composables/useWorkoutSession'
import ActiveExerciseCard from '../components/ActiveExerciseCard.vue'
import RestTimerModal from '../components/RestTimerModal.vue'
import ExerciseSelectionModal from '../components/ExerciseSelectionModal.vue'

export default {
  name: 'WorkoutSession',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonSpinner,
    IonAlert,
    ActiveExerciseCard,
    RestTimerModal,
    ExerciseSelectionModal
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const {
      session,
      exercises,
      progress,
      loading,
      error,
      progressPercent,
      fetchSession,
      logSet,
      updateSet,
      deleteSet,
      addExercise,
      completeWorkout,
      cancelWorkout
    } = useWorkoutSession()
    
    // Local state
    const showRestTimer = ref(false)
    const restTimerDuration = ref(90)
    const restTimerExercise = ref('')
    const restTimerNextSet = ref(2)
    
    const showAddExercise = ref(false)
    const showCancelConfirm = ref(false)
    const showCompleteConfirm = ref(false)
    const workoutNotes = ref('')
    
    // Computed
    const sessionId = computed(() => route.params.id)
    
    const workoutTitle = computed(() => {
      if (session.value?.workout_template_id) {
        // Could fetch template name, but for now use generic
        return 'Workout Session'
      }
      return 'Free Workout'
    })
    
    // Safe progress percent that handles NaN/undefined
    const safeProgressPercent = computed(() => {
      const value = progressPercent.value
      if (value === null || value === undefined || isNaN(value)) {
        return 0
      }
      return value
    })
    
    const completedExercises = computed(() => {
      return exercises.value.filter(e => e.is_completed).length
    })
    
    const totalSetsLogged = computed(() => {
      return exercises.value.reduce((total, ex) => {
        return total + (ex.logged_sets?.length || 0)
      }, 0)
    })
    
    const completeMessage = computed(() => {
      const percent = progressPercent.value || 0
      if (percent < 100) {
        return `You've completed ${Math.round(percent)}% of your workout. Would you like to finish now?`
      }
      return 'Great job! Ready to finish your workout?'
    })
    
    // Methods - define these BEFORE alert buttons that reference them
    const loadSession = async () => {
      try {
        await fetchSession(sessionId.value)
      } catch (err) {
        console.error('Failed to load session:', err)
      }
    }
    
    const handleBack = () => {
      router.back()
    }
    
    const handleLogSet = async ({ exerciseId, set_number, weight, reps }) => {
      try {
        await logSet(exerciseId, { set_number, weight, reps })
      } catch (err) {
        console.error('Failed to log set:', err)
      }
    }
    
    const handleUpdateSet = async ({ id, weight, reps }) => {
      try {
        await updateSet(id, { weight, reps })
      } catch (err) {
        console.error('Failed to update set:', err)
      }
    }
    
    const handleDeleteSet = async (setId) => {
      try {
        await deleteSet(setId)
      } catch (err) {
        console.error('Failed to delete set:', err)
      }
    }
    
    const handleRestStart = ({ exerciseName, duration, nextSetNumber }) => {
      restTimerExercise.value = exerciseName
      restTimerDuration.value = duration
      restTimerNextSet.value = nextSetNumber
      showRestTimer.value = true
    }
    
    const handleRestComplete = () => {
      // Timer completed naturally
      console.log('Rest complete')
    }
    
    const handleRestSkip = () => {
      // User skipped the timer
      console.log('Rest skipped')
    }
    
    const handleAddExercise = async (exercise) => {
      showAddExercise.value = false
      try {
        await addExercise({
          exercise_id: exercise.id,
          target_sets: 3,
          target_reps: 10,
          target_weight: 0,
          rest_seconds: exercise.default_rest_sec || 90
        })
      } catch (err) {
        console.error('Failed to add exercise:', err)
      }
    }
    
    const handleCancelWorkout = async () => {
      try {
        await cancelWorkout()
        router.replace('/tabs/dashboard')
      } catch (err) {
        console.error('Failed to cancel workout:', err)
      }
    }
    
    const handleCompleteWorkout = async (notes) => {
      try {
        await completeWorkout(notes || null)
        router.replace('/tabs/dashboard')
      } catch (err) {
        console.error('Failed to complete workout:', err)
      }
    }
    
    // Alert buttons - defined AFTER handlers
    const cancelAlertButtons = [
      {
        text: 'Keep Going',
        role: 'cancel'
      },
      {
        text: 'Cancel Workout',
        role: 'destructive',
        handler: handleCancelWorkout
      }
    ]
    
    const completeAlertButtons = [
      {
        text: 'Not Yet',
        role: 'cancel'
      },
      {
        text: 'Complete',
        handler: (data) => {
          handleCompleteWorkout(data.notes || '')
        }
      }
    ]
    
    const completeAlertInputs = [
      {
        name: 'notes',
        type: 'textarea',
        placeholder: 'Add workout notes (optional)...'
      }
    ]
    
    onMounted(() => {
      loadSession()
    })
    
    return {
      session,
      exercises,
      progress,
      loading,
      error,
      progressPercent,
      safeProgressPercent,
      showRestTimer,
      restTimerDuration,
      restTimerExercise,
      restTimerNextSet,
      showAddExercise,
      showCancelConfirm,
      showCompleteConfirm,
      workoutTitle,
      completedExercises,
      totalSetsLogged,
      completeMessage,
      cancelAlertButtons,
      completeAlertButtons,
      completeAlertInputs,
      loadSession,
      handleBack,
      handleLogSet,
      handleUpdateSet,
      handleDeleteSet,
      handleRestStart,
      handleRestComplete,
      handleRestSkip,
      handleAddExercise,
      // Icons
      arrowBackOutline,
      addOutline,
      checkmarkCircle,
      alertCircleOutline
    }
  }
}
</script>

<style scoped>
.workout-session-page {
  --background: var(--brand-background-color, #fafafa);
}

ion-header {
  --background: var(--brand-background-color);
}

ion-toolbar {
  --background: var(--brand-card-background-color, #fff);
  --border-width: 0;
}

ion-title {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-lg);
}

.progress-bar-container {
  background: var(--brand-card-background-color, #fff);
  padding: 8px 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--brand-gray-20, rgba(0, 0, 0, 0.1));
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  white-space: nowrap;
}

ion-content {
  --background: var(--brand-background-color);
}

.loading-state,
.error-state {
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

.error-icon {
  font-size: 64px;
  color: var(--ion-color-danger, #eb445a);
  margin-bottom: 16px;
}

.error-state h3 {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-lg);
  color: var(--brand-text-primary-color);
  margin: 0 0 8px 0;
}

.error-state p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-secondary-color);
  margin: 0 0 24px 0;
}

.workout-info-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.workout-stats {
  display: flex;
  justify-content: space-around;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-2xl);
  color: var(--brand-text-primary-color);
  line-height: 1;
}

.stat-label {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  color: var(--brand-text-tertiary-color);
  margin-top: 4px;
}

.exercises-list {
  margin-bottom: 16px;
}

.add-exercise-section {
  margin-bottom: 24px;
}

.add-exercise-button {
  --border-radius: 12px;
  --border-color: var(--brand-primary);
  --color: var(--brand-primary);
  --background: transparent;
  --background-hover: var(--brand-primary-light, rgba(249, 115, 22, 0.1));
  font-family: var(--brand-font-family);
  font-weight: 600;
  min-height: 48px;
}

.complete-section {
  padding-bottom: 32px;
}

.complete-button {
  --background: var(--brand-primary);
  --border-radius: 16px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  min-height: 56px;
}

.complete-button ion-spinner {
  width: 20px;
  height: 20px;
}
</style>

