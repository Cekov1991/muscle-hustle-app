<template>
  <ion-page class="workout-form-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/workouts"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? 'Edit Workout' : 'New Workout' }}</ion-title>
        
      </ion-toolbar>
    </ion-header>
    
    <ion-content fullscreen class="workout-form-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="initialLoading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading workout...</p>
        </div>

        <!-- Workout Summary Card -->
        <WorkoutSummaryCard 
          v-if="!initialLoading"
          :workout="currentWorkout"
        />

        <!-- Exercises Section -->
        <WorkoutExercisesList
          v-if="!initialLoading"
          :exercises="workoutExercises"
          :loading="loading"
          @add-exercise="exerciseModalsRef?.openSelection"
          @show-exercise-menu="exerciseModalsRef?.showExerciseMenu"
        />
      </div>
    </ion-content>

    <!-- Exercise Modals -->
    <ExerciseModals
      ref="exerciseModalsRef"
      :workout-id="workoutId"
      :current-workout="currentWorkout"
      :workout-exercises="workoutExercises"
      :available-exercises="availableExercises"
      :exclude-exercise-ids="workoutExercises.map(ex => ex.id)"
      @exercise-updated="handleExerciseUpdated"
    />
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
  IonSpinner
} from '@ionic/vue'
import {
  checkmarkOutline
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkouts } from '../composables/useWorkouts'
import WorkoutSummaryCard from '../components/WorkoutSummaryCard.vue'
import WorkoutExercisesList from '../components/WorkoutExercisesList.vue'
import ExerciseModals from '../components/ExerciseModals.vue'

export default {
  name: 'WorkoutForm',
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
    WorkoutSummaryCard,
    WorkoutExercisesList,
    ExerciseModals
  },
  setup() {
    console.log('WorkoutForm component loaded')
    const route = useRoute()
    const { exercises, loading, fetchExercises, fetchWorkout } = useWorkouts()
    
    const workoutId = computed(() => route.params.id ? parseInt(route.params.id) : null)
    
    // State
    const initialLoading = ref(true)
    const currentWorkout = ref(null)
    const workoutExercises = ref([])
    const exerciseModalsRef = ref(null)

    // Computed
    const isEditMode = computed(() => !!workoutId.value)
    const availableExercises = computed(() => exercises?.value || [])

    // Initialize and fetch data
    const initialize = async () => {
      initialLoading.value = true

      try {
        // Fetch exercises for selection
        if (!exercises?.value || exercises.value.length === 0) {
          console.log('Fetching exercises...')
          await fetchExercises()
          console.log('Exercises fetched:', exercises?.value?.length || 0)
        }

        // Fetch workout if editing
        if (workoutId.value) {
          const workout = await fetchWorkout(workoutId.value)
          currentWorkout.value = workout
          workoutExercises.value = workout.exercises || []
        }
      } catch (error) {
        console.error('Initialize error:', error)
      } finally {
        initialLoading.value = false
      }
    }

    // Handle exercise updated
    const handleExerciseUpdated = async () => {
      // Refresh workout to get updated exercises
      if (currentWorkout.value?.id) {
        try {
          const updated = await fetchWorkout(currentWorkout.value.id)
          currentWorkout.value = updated
          workoutExercises.value = updated.exercises || []
        } catch (error) {
          console.error('Error refreshing workout:', error)
        }
      }
    }

    // Initialize on mount
    onMounted(() => {
      console.log('WorkoutForm onMounted called')
      initialize()
    })

    return {
      // State
      loading,
      initialLoading,
      isEditMode,
      workoutExercises,
      availableExercises,
      currentWorkout,
      exerciseModalsRef,
      workoutId,
      
      // Methods
      handleExerciseUpdated,
      
      // Icons
      checkmarkOutline
    }
  }
}
</script>

<style scoped>
.workout-form-page {
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

.workout-form-content {
  --background: var(--brand-background-color, #fafafa);
}

.container {
  max-width: 500px;
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

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .workout-form-page {
    --background: var(--brand-background-color, #121212);
  }
  
  .workout-form-content {
    --background: var(--brand-background-color, #121212);
  }
}
</style>

