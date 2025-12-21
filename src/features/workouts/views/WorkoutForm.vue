<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/workouts"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEditMode ? 'Edit Workout' : 'New Workout' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleSave" :disabled="loading || !isFormValid">
            <ion-icon :icon="checkmarkOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content fullscreen class="ion-padding">
      <!-- Loading State -->
      <div v-if="initialLoading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading workout...</p>
      </div>

      <!-- Workout Summary Card -->
      <WorkoutSummaryCard 
        v-if="!initialLoading && !editMode"
        :workout="{ ...currentWorkout, ...formData }"
        @show-menu="handleShowWorkoutMenu"
      />

      <!-- Workout Details Form -->
      <WorkoutDetailsForm
        v-if="!initialLoading && editMode"
        v-model="formData"
        :loading="loading"
        :is-edit-mode="isEditMode"
        :is-valid="isFormValid"
        @submit="handleSave"
        @cancel="handleCancel"
      />

      <!-- Exercises Section -->
      <WorkoutExercisesList
        v-if="!initialLoading"
        :exercises="workoutExercises"
        :loading="loading"
        @add-exercise="exerciseModalsRef?.openSelection"
        @show-exercise-menu="exerciseModalsRef?.showExerciseMenu"
      />
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
import { useWorkoutForm } from '../composables/useWorkoutForm'
import WorkoutSummaryCard from '../components/WorkoutSummaryCard.vue'
import WorkoutDetailsForm from '../components/WorkoutDetailsForm.vue'
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
    WorkoutDetailsForm,
    WorkoutExercisesList,
    ExerciseModals
  },
  setup() {
    console.log('WorkoutForm component loaded')
    const route = useRoute()
    const { exercises, loading, fetchExercises, fetchWorkout } = useWorkouts()
    
    const workoutId = computed(() => route.params.id ? parseInt(route.params.id) : null)
    
    // Use workout form composable
    const {
      editMode,
      initialLoading,
      currentWorkout,
      formData,
      isEditMode,
      isFormValid,
      initializeForm,
      saveWorkout,
      cancelForm
    } = useWorkoutForm(workoutId)

    // Workout exercises
    const workoutExercises = ref([])
    
    // Exercise modals ref
    const exerciseModalsRef = ref(null)

    // Available exercises for selection
    const availableExercises = computed(() => exercises?.value || [])

    // Initialize form and fetch data
    const initialize = async () => {
      initialLoading.value = true

      try {
        // Fetch exercises for selection
        if (!exercises?.value || exercises.value.length === 0) {
          console.log('Fetching exercises...')
          await fetchExercises()
          console.log('Exercises fetched:', exercises?.value?.length || 0)
        }

        // Initialize form data and fetch workout if editing
        await initializeForm()
        
        // Set workout exercises if we have a current workout
        if (currentWorkout.value) {
          workoutExercises.value = currentWorkout.value.exercises || []
        }
      } catch (error) {
        console.error('Initialize error:', error)
      } finally {
        initialLoading.value = false
      }
    }

    // Handle save
    const handleSave = async () => {
      try {
        const result = await saveWorkout()
        if (result) {
          currentWorkout.value = result
          workoutExercises.value = result.exercises || []
          editMode.value = false
        }
      } catch (error) {
        console.error('Save error:', error)
      }
    }

    // Handle cancel
    const handleCancel = () => {
      if (editMode.value) {
        editMode.value = false
      } else {
        cancelForm()
      }
    }

    // Handle workout menu
    const handleShowWorkoutMenu = () => {
      editMode.value = true
    }

    // Handle exercise updated
    const handleExerciseUpdated = async () => {
      // Refresh workout to get updated exercises
      if (currentWorkout.value?.id) {
        try {
          const updated = await fetchWorkout(currentWorkout.value.id)
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
      editMode,
      formData,
      workoutExercises,
      availableExercises,
      currentWorkout,
      isFormValid,
      exerciseModalsRef,
      workoutId,
      
      // Methods
      handleSave,
      handleCancel,
      handleShowWorkoutMenu,
      handleExerciseUpdated,
      
      // Icons
      checkmarkOutline
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-container p {
  margin-top: 1rem;
  color: var(--ion-color-medium);
}
</style>

