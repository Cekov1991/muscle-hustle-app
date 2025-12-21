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

      <!-- Form -->
      <form v-else @submit.prevent="handleSave">
        <ion-list>
          <!-- Workout Name -->
          <ion-item>
            <ion-label position="stacked">Workout Name *</ion-label>
            <ion-input
              v-model="formData.name"
              placeholder="e.g., Push Day"
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

          <!-- Day of Week -->
          <ion-item>
            <ion-label position="stacked">Day of Week</ion-label>
            <ion-select
              v-model="formData.day_of_week"
              placeholder="Select day (optional)"
              :disabled="loading"
            >
              <ion-select-option :value="null">None</ion-select-option>
              <ion-select-option :value="0">Sunday</ion-select-option>
              <ion-select-option :value="1">Monday</ion-select-option>
              <ion-select-option :value="2">Tuesday</ion-select-option>
              <ion-select-option :value="3">Wednesday</ion-select-option>
              <ion-select-option :value="4">Thursday</ion-select-option>
              <ion-select-option :value="5">Friday</ion-select-option>
              <ion-select-option :value="6">Saturday</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-list>

        <!-- Exercises Section -->
        <div class="exercises-section">
          <div class="section-header">
            <h2>Exercises</h2>
            <ion-button 
              size="small" 
              @click="showExerciseSelection = true"
              :disabled="loading"
            >
              <ion-icon :icon="addOutline" slot="start" />
              Add Exercise
            </ion-button>
          </div>

          <!-- Exercises List -->
          <div v-if="workoutExercises.length === 0" class="empty-exercises">
            <ion-icon :icon="barbellOutline" />
            <p>No exercises added yet</p>
            <ion-button 
              size="small" 
              fill="outline"
              @click="showExerciseSelection = true"
            >
              Add First Exercise
            </ion-button>
          </div>

          <ion-reorder-group 
            v-else
            :disabled="loading"
            @ionItemReorder="handleReorder"
          >
            <ion-card 
              v-for="(exercise, index) in sortedExercises" 
              :key="`${exercise.id}-${index}`"
              class="exercise-card"
            >
              <ion-card-content>
                <div class="exercise-header">
                  <div class="exercise-info">
                    <h3>{{ exercise.name }}</h3>
                    <p v-if="exercise.category" class="exercise-category">
                      {{ exercise.category.name }}
                    </p>
                  </div>
                  <ion-reorder slot="end"></ion-reorder>
                </div>

                <div class="exercise-details">
                  <div class="detail-item">
                    <span class="detail-label">Sets:</span>
                    <span class="detail-value">{{ exercise.pivot?.target_sets || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Reps:</span>
                    <span class="detail-value">{{ exercise.pivot?.target_reps || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Weight:</span>
                    <span class="detail-value">
                      {{ formatWeight(exercise.pivot?.target_weight) }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Rest:</span>
                    <span class="detail-value">
                      {{ formatRestTime(exercise.pivot?.rest_seconds) }}
                    </span>
                  </div>
                </div>

                <div class="exercise-actions">
                  <ion-button 
                    fill="clear" 
                    size="small"
                    @click="handleEditExercise(exercise)"
                  >
                    <ion-icon :icon="createOutline" slot="start" />
                    Edit
                  </ion-button>
                  <ion-button 
                    fill="clear" 
                    size="small"
                    color="danger"
                    @click="handleRemoveExercise(exercise)"
                  >
                    <ion-icon :icon="trashOutline" slot="start" />
                    Remove
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-reorder-group>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <ion-button
            expand="block"
            type="submit"
            :disabled="loading || !isFormValid"
          >
            <ion-spinner v-if="loading" name="crescent" slot="start" />
            <ion-icon v-else :icon="checkmarkOutline" slot="start" />
            {{ isEditMode ? 'Update' : 'Create' }} Workout
          </ion-button>
          
          <ion-button
            expand="block"
            fill="outline"
            @click="handleCancel"
            :disabled="loading"
          >
            Cancel
          </ion-button>
        </div>
      </form>
    </ion-content>

    <!-- Exercise Selection Modal -->
    <ExerciseSelectionModal
      :is-open="showExerciseSelection"
      :exclude-exercise-ids="workoutExercises.map(ex => ex.id)"
      @close="showExerciseSelection = false"
      @select="handleExerciseSelected"
    />

    <!-- Exercise Form Modal -->
    <ExerciseFormModal
      :is-open="showExerciseForm"
      :exercise="selectedExercise"
      :available-exercises="availableExercises"
      @close="handleExerciseFormClose"
      @submit="handleExerciseFormSubmit"
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
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonReorder,
  IonReorderGroup,
  IonSpinner
} from '@ionic/vue'
import {
  checkmarkOutline,
  addOutline,
  barbellOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkouts } from '../composables/useWorkouts'
import { formatWeight, formatRestTime, getPivotId } from '../utils/workoutHelpers'
import ExerciseSelectionModal from '../components/ExerciseSelectionModal.vue'
import ExerciseFormModal from '../components/ExerciseFormModal.vue'

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
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent,
    IonReorder,
    IonReorderGroup,
    IonSpinner,
    ExerciseSelectionModal,
    ExerciseFormModal
  },
  setup() {
    console.log('WorkoutForm component loaded')
    const route = useRoute()
    const router = useRouter()
    const {
      exercises,
      loading,
      fetchWorkout,
      createWorkout,
      updateWorkout,
      fetchExercises,
      addExerciseToWorkout,
      updateExerciseInWorkout,
      removeExerciseFromWorkout,
      reorderExercises
    } = useWorkouts()

    const workoutId = computed(() => route.params.id ? parseInt(route.params.id) : null)
    const isEditMode = computed(() => !!workoutId.value)
    const initialLoading = ref(true)
    const showExerciseSelection = ref(false)
    const showExerciseForm = ref(false)
    const selectedExercise = ref(null)
    const currentWorkout = ref(null)

    // Form data
    const formData = ref({
      name: '',
      description: '',
      day_of_week: null
    })

    // Workout exercises
    const workoutExercises = ref([])

    // Available exercises for selection
    const availableExercises = computed(() => exercises?.value || [])

    // Sorted exercises by order
    const sortedExercises = computed(() => {
      return [...workoutExercises.value].sort((a, b) => {
        const orderA = a.pivot?.order || 0
        const orderB = b.pivot?.order || 0
        return orderA - orderB
      })
    })

    // Form validation
    const isFormValid = computed(() => {
      return formData.value.name.trim().length > 0
    })

    // Initialize form
    const initializeForm = async () => {
      console.log('initializeForm called, isEditMode:', isEditMode.value)
      initialLoading.value = true

      try {
        // Fetch exercises for selection
        if (!exercises?.value || exercises.value.length === 0) {
          console.log('Fetching exercises...')
          await fetchExercises()
          console.log('Exercises fetched:', exercises?.value?.length || 0)
        }

        // If edit mode, fetch workout data
        if (isEditMode.value) {
          console.log('Edit mode: fetching workout', workoutId.value)
          const workout = await fetchWorkout(workoutId.value)
          currentWorkout.value = workout
          
          formData.value = {
            name: workout.name || '',
            description: workout.description || '',
            day_of_week: workout.day_of_week
          }
          
          workoutExercises.value = workout.exercises || []
        } else {
          console.log('Create mode: no workout to fetch')
        }
      } catch (error) {
        // Error already handled in composable
        console.error('InitializeForm error:', error)
        console.log('Navigating back due to error')
        router.back()
      } finally {
        console.log('initializeForm completed')
        initialLoading.value = false
      }
    }

    // Handle save
    const handleSave = async () => {
      if (!isFormValid.value) return

      try {
        const data = {
          name: formData.value.name.trim(),
          description: formData.value.description.trim() || null,
          day_of_week: formData.value.day_of_week
        }

        if (isEditMode.value) {
          await updateWorkout(workoutId.value, data)
        } else {
          const newWorkout = await createWorkout(data)
          // Navigate to edit mode for the new workout
          router.replace(`/tabs/workouts/${newWorkout.id}/edit`)
          currentWorkout.value = newWorkout
          workoutExercises.value = newWorkout.exercises || []
        }
      } catch (error) {
        // Error already handled in composable
      }
    }

    // Handle cancel
    const handleCancel = () => {
      router.back()
    }

    // Handle exercise selected from modal
    const handleExerciseSelected = async (exercise) => {
      // Store the selected exercise (for adding new exercise to workout)
      selectedExercise.value = exercise
      showExerciseSelection.value = false
      showExerciseForm.value = true
    }

    // Handle exercise form close
    const handleExerciseFormClose = () => {
      showExerciseForm.value = false
      selectedExercise.value = null
    }

    // Handle exercise form submit
    const handleExerciseFormSubmit = async (exerciseData) => {
      try {
        const templateId = isEditMode.value ? workoutId.value : currentWorkout.value?.id

        if (!templateId) {
          // If creating new workout, save it first
          await handleSave()
          // After save, currentWorkout should be set, try again
          if (currentWorkout.value?.id) {
            await addExerciseToWorkout(currentWorkout.value.id, exerciseData)
            // Refresh workout to get updated exercises
            const updated = await fetchWorkout(currentWorkout.value.id)
            workoutExercises.value = updated.exercises || []
          }
        } else {
          if (selectedExercise.value) {
            // Edit mode - update existing exercise
            // Use the pivot ID (WorkoutTemplateExercise record ID)
            const pivotId = getPivotId(selectedExercise.value)
            if (!pivotId) {
              throw new Error('Cannot update exercise: pivot ID not found')
            }
            await updateExerciseInWorkout(templateId, pivotId, exerciseData)
          } else {
            // Add mode - add new exercise
            await addExerciseToWorkout(templateId, exerciseData)
          }
          
          // Refresh workout to get updated exercises
          const updated = await fetchWorkout(templateId)
          workoutExercises.value = updated.exercises || []
        }
      } catch (error) {
        // Error already handled in composable
      } finally {
        handleExerciseFormClose()
      }
    }

    // Handle edit exercise
    const handleEditExercise = (exercise) => {
      selectedExercise.value = exercise
      showExerciseForm.value = true
    }

    // Handle remove exercise
    const handleRemoveExercise = async (exercise) => {
      const templateId = isEditMode.value ? workoutId.value : currentWorkout.value?.id

      if (!templateId) {
        // If workout not saved yet, just remove from local array
        workoutExercises.value = workoutExercises.value.filter(ex => ex.id !== exercise.id)
        return
      }

      try {
        // Use the pivot ID (WorkoutTemplateExercise record ID)
        const pivotId = getPivotId(exercise)
        if (!pivotId) {
          throw new Error('Cannot remove exercise: pivot ID not found')
        }
        await removeExerciseFromWorkout(templateId, pivotId)
        
        // Refresh workout to get updated exercises
        const updated = await fetchWorkout(templateId)
        workoutExercises.value = updated.exercises || []
      } catch (error) {
        // Error already handled in composable
      }
    }

    // Handle reorder
    const handleReorder = async (event) => {
      const templateId = isEditMode.value ? workoutId.value : currentWorkout.value?.id

      if (!templateId) {
        // If workout not saved yet, just reorder locally
        const item = workoutExercises.value.splice(event.detail.from, 1)[0]
        workoutExercises.value.splice(event.detail.to, 0, item)
        event.detail.complete()
        return
      }

      try {
        // Reorder locally first for immediate feedback
        const item = workoutExercises.value.splice(event.detail.from, 1)[0]
        workoutExercises.value.splice(event.detail.to, 0, item)
        event.detail.complete()

        // Get pivot IDs in new order
        const orderArray = sortedExercises.value.map(ex => {
          const pivotId = getPivotId(ex)
          if (!pivotId) {
            console.warn('Exercise missing pivot ID, skipping:', ex)
            return null
          }
          return pivotId
        }).filter(id => id !== null) // Remove any null values

        await reorderExercises(templateId, orderArray)
        
        // Refresh workout to get updated exercises
        const updated = await fetchWorkout(templateId)
        workoutExercises.value = updated.exercises || []
      } catch (error) {
        // Error already handled in composable
        // Revert on error
        const updated = await fetchWorkout(templateId)
        workoutExercises.value = updated.exercises || []
      }
    }

    // Initialize on mount
    onMounted(() => {
      console.log('WorkoutForm onMounted called')
      initializeForm()
    })

    return {
      loading,
      initialLoading,
      isEditMode,
      formData,
      workoutExercises,
      availableExercises,
      sortedExercises,
      isFormValid,
      showExerciseSelection,
      showExerciseForm,
      selectedExercise,
      handleSave,
      handleCancel,
      handleExerciseSelected,
      handleExerciseFormClose,
      handleExerciseFormSubmit,
      handleEditExercise,
      handleRemoveExercise,
      handleReorder,
      formatWeight,
      formatRestTime,
      // Icons
      checkmarkOutline,
      addOutline,
      barbellOutline,
      createOutline,
      trashOutline
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

ion-item {
  --padding-start: 1rem;
}

.exercises-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.empty-exercises {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  background: var(--ion-color-light);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.empty-exercises ion-icon {
  font-size: 3rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.empty-exercises p {
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.exercise-card {
  margin-bottom: 1rem;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.exercise-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.exercise-category {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.exercise-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.exercise-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  border-top: 1px solid var(--ion-color-light-shade);
  padding-top: 0.75rem;
}

.action-buttons {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.action-buttons ion-button {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .exercise-details {
    grid-template-columns: 1fr;
  }
}
</style>

