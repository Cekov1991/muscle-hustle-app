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
          <ion-button v-if="!isCompleted" @click="showCancelConfirm = true" color="danger" class="cancel-btn">
            Cancel
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="workout-content">
      <div class="container">
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
          <!-- Workout Tabs Navigation -->
          <WorkoutTabs v-model="activeTab" />
          
          <!-- Track Tab Content -->
          <template v-if="activeTab === 'track'">
            <!-- Tip Card for current exercise (show on first exercise) -->
            <ExerciseTipCard
              v-if="exercises.length > 0"
              :title="currentExerciseTip.title"
              :storage-key="currentExerciseTip.key"
              :persistent="true"
            >
              {{ currentExerciseTip.text }}
            </ExerciseTipCard>
            
            <!-- Progress Bar -->
            <div class="progress-card">
              <div class="progress-header">
                <span class="progress-label">Progress</span>
                <span class="progress-percent">{{ Math.round(safeProgressPercent) }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${safeProgressPercent}%` }"
                ></div>
              </div>
            </div>
            
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
            
            <!-- Add Exercise Button (only show if not completed) -->
            <div v-if="!isCompleted" class="add-exercise-section">
              <button class="add-exercise-button" @click="showAddExercise = true">
                <ion-icon :icon="addOutline" />
                <span>Add Exercise</span>
              </button>
            </div>
          </template>
          
          <!-- Overview Tab Content -->
          <template v-else-if="activeTab === 'overview'">
            <div class="placeholder-content">
              <ion-icon :icon="listOutline" class="placeholder-icon" />
              <h3>Workout Overview</h3>
              <p>See a summary of all exercises in this workout</p>
            </div>
          </template>
          
          <!-- History Tab Content -->
          <template v-else-if="activeTab === 'history'">
            <div class="placeholder-content">
              <ion-icon :icon="timeOutline" class="placeholder-icon" />
              <h3>Exercise History</h3>
              <p>View your past performance for these exercises</p>
            </div>
          </template>
          
          <!-- Notes Tab Content -->
          <template v-else-if="activeTab === 'notes'">
            <div class="notes-section">
              <div class="notes-card">
                <label class="notes-label">Workout Notes</label>
                <textarea
                  v-model="workoutNotes"
                  class="notes-input"
                  placeholder="Add notes about your workout..."
                  rows="6"
                ></textarea>
              </div>
            </div>
          </template>
          
          <!-- Complete Workout Button - Fixed at bottom (only show if not completed) -->
          <div v-if="!isCompleted" class="complete-section">
            <button 
              class="complete-button"
              :disabled="loading"
              @click="showCompleteConfirm = true"
            >
              <ion-spinner v-if="loading" name="crescent" />
              <span v-else class="button-text">Complete Workout</span>
            </button>
          </div>
        </template>
      </div>
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
    
    <!-- Cancel Confirmation Alert (only for active sessions) -->
    <ion-alert
      v-if="!isCompleted"
      :is-open="showCancelConfirm"
      header="Cancel Workout?"
      message="This will discard all your logged sets. Are you sure?"
      :buttons="cancelAlertButtons"
      @didDismiss="showCancelConfirm = false"
    />
    
    <!-- Complete Confirmation Alert (only for active sessions) -->
    <ion-alert
      v-if="!isCompleted"
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
import { ref, computed, onMounted, watch } from 'vue'
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
  alertCircleOutline,
  listOutline,
  timeOutline
} from 'ionicons/icons'
import { useWorkoutSession } from '../composables/useWorkoutSession'
import ActiveExerciseCard from '../components/ActiveExerciseCard.vue'
import RestTimerModal from '../components/RestTimerModal.vue'
import ExerciseSelectionModal from '../components/ExerciseSelectionModal.vue'
import WorkoutTabs from '../components/WorkoutTabs.vue'
import ExerciseTipCard from '../components/ExerciseTipCard.vue'

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
    ExerciseSelectionModal,
    WorkoutTabs,
    ExerciseTipCard
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
      isCompleted,
      fetchSession,
      logSet,
      updateSet,
      deleteSet,
      addExercise,
      completeWorkout,
      cancelWorkout
    } = useWorkoutSession()
    
    // Local state
    const activeTab = ref('track')
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
      if (isCompleted.value) {
        return 'Completed Workout'
      }
      if (session.value?.workout_template_id) {
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
    
    // Dynamic tip based on current exercise
    const currentExerciseTip = computed(() => {
      const firstExercise = exercises.value[0]
      const exerciseName = firstExercise?.session_exercise?.exercise?.name?.toLowerCase() || ''
      
      // Dumbbell exercise tip
      if (exerciseName.includes('dumbbell')) {
        return {
          key: 'dumbbell-tip',
          title: 'Logging dumbbell exercises?',
          text: "Whether it's single-arm, single-leg, or two-handed exercises, just enter the weight of one dumbbell. We calculate the total! 🏋️"
        }
      }
      
      // Barbell exercise tip
      if (exerciseName.includes('barbell') || exerciseName.includes('bench press') || exerciseName.includes('squat')) {
        return {
          key: 'barbell-tip',
          title: 'Tracking barbell exercises?',
          text: 'Enter the total weight on the bar including the barbell weight. Track your progressive overload! 💪'
        }
      }
      
      // Default tip
      return {
        key: 'general-tip',
        title: 'Track your progress',
        text: "Log your sets as you complete them. We'll remember your previous performance to help you progress! 📈"
      }
    })
    
    // Methods
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
      console.log('Rest complete')
    }
    
    const handleRestSkip = () => {
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
        await completeWorkout(notes || workoutNotes.value || null)
        router.replace('/tabs/dashboard')
      } catch (err) {
        console.error('Failed to complete workout:', err)
      }
    }
    
    // Alert buttons
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
    
    // Watch for session changes to populate notes
    watch(() => session.value, (newSession) => {
      if (newSession?.notes) {
        workoutNotes.value = newSession.notes
      }
    }, { immediate: true })

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
      activeTab,
      showRestTimer,
      restTimerDuration,
      restTimerExercise,
      restTimerNextSet,
      showAddExercise,
      showCancelConfirm,
      showCompleteConfirm,
      workoutNotes,
      workoutTitle,
      isCompleted,
      completedExercises,
      totalSetsLogged,
      completeMessage,
      currentExerciseTip,
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
      alertCircleOutline,
      listOutline,
      timeOutline
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

ion-title {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-lg);
  letter-spacing: -0.5px;
}

.cancel-btn {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
}

.workout-content {
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

/* Progress Card */
.progress-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
}

.progress-percent {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-base);
  color: var(--brand-primary);
}

.progress-bar {
  height: 10px;
  background: var(--brand-gray-20, rgba(0, 0, 0, 0.08));
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--brand-primary);
  border-radius: 5px;
  transition: width 0.3s ease;
}

/* Workout Info Card */
.workout-info-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  font-size: var(--brand-font-size-3xl);
  color: var(--brand-text-primary-color);
  line-height: 1;
}

.stat-label {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  color: var(--brand-text-tertiary-color);
  margin-top: 6px;
  letter-spacing: -0.2px;
}

.exercises-list {
  margin-bottom: 16px;
}

/* Add Exercise Button */
.add-exercise-section {
  margin-bottom: 24px;
}

.add-exercise-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: 2px dashed var(--brand-gray-30, #d1d5db);
  border-radius: 16px;
  cursor: pointer;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-base);
  color: var(--brand-primary);
  transition: all 0.2s ease;
}

.add-exercise-button:hover {
  background: var(--brand-primary-light, rgba(59, 130, 246, 0.08));
  border-color: var(--brand-primary);
}

.add-exercise-button:active {
  transform: scale(0.98);
}

.add-exercise-button ion-icon {
  font-size: 22px;
}

/* Complete Section */
.complete-section {
  padding: 16px 0 32px;
  margin-top: auto;
}

.complete-button {
  width: 100%;
  height: 60px;
  border-radius: var(--brand-button-border-radius, 16px);
  background: var(--brand-primary);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-lg);
  color: var(--brand-text-on-primary-color, #fff);
}

.complete-button:hover:not(:disabled) {
  transform: scale(1.01);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.complete-button:active:not(:disabled) {
  transform: scale(0.98);
}

.complete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.complete-button ion-spinner {
  --color: var(--brand-text-on-primary-color, #fff);
  width: 24px;
  height: 24px;
}

/* Placeholder Content (for other tabs) */
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
}

.placeholder-icon {
  font-size: 48px;
  color: var(--brand-gray-40, #9ca3af);
  margin-bottom: 16px;
}

.placeholder-content h3 {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-lg);
  color: var(--brand-text-primary-color);
  margin: 0 0 8px 0;
}

.placeholder-content p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0;
}

/* Notes Section */
.notes-section {
  padding: 0;
}

.notes-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  padding: 20px;
}

.notes-label {
  display: block;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin-bottom: 12px;
}

.notes-input {
  width: 100%;
  padding: 14px 16px;
  background: var(--brand-background-color, #fafafa);
  border: 2px solid var(--brand-gray-20, #e5e7eb);
  border-radius: 12px;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-primary-color);
  resize: vertical;
  transition: border-color 0.2s ease;
}

.notes-input:focus {
  outline: none;
  border-color: var(--brand-primary);
}

.notes-input::placeholder {
  color: var(--brand-gray-40, #9ca3af);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .progress-card,
  .workout-info-card,
  .placeholder-content,
  .notes-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }
  
  .notes-input {
    background: var(--brand-background-color, #121212);
    border-color: var(--brand-gray-30, #3f3f3f);
  }
  
  .add-exercise-button {
    border-color: var(--brand-gray-40, #4b5563);
  }
}
</style>
