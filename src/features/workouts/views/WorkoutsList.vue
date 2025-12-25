<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Workouts</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleAddWorkout">
            <ion-icon :icon="addOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content fullscreen class="ion-padding">
      <div class="container">
  
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <!-- Loading State -->
        <div v-if="loading && (!workouts || workouts.length === 0)" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading workouts...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && (!workouts || workouts.length === 0)" class="empty-state">
          <ion-icon :icon="barbellOutline" class="empty-icon" />
          <h2>No Workouts Yet</h2>
          <p>Create your first workout template to get started!</p>
          <ion-button @click="handleAddWorkout" color="primary">
            <ion-icon :icon="addOutline" slot="start" />
            Create Workout
          </ion-button>
        </div>

        <!-- Workouts List -->
        <div v-else-if="workouts && workouts.length > 0" class="workouts-container">
          <ion-card 
            v-for="workout in workouts" 
            :key="workout.id" 
            class="workout-card"
            @click="handleEditWorkout(workout.id)"
          >
            <ion-card-header>
              <div class="workout-header">
                <div>
                  <ion-card-title>{{ workout.name }}</ion-card-title>
                  <ion-card-subtitle v-if="workout.description">
                    {{ workout.description }}
                  </ion-card-subtitle>
                </div>
                <ion-badge 
                  v-if="workout.day_of_week !== null" 
                  color="primary"
                  class="day-badge"
                >
                  {{ getDayName(workout.day_of_week) }}
                </ion-badge>
              </div>
            </ion-card-header>
            
            <ion-card-content>
              <div class="workout-info">
                <div class="exercise-count">
                  <ion-icon :icon="barbellOutline" />
                  <span>{{ workout.exercises?.length || 0 }} {{ workout.exercises?.length === 1 ? 'Exercise' : 'Exercises' }}</span>
                </div>
              </div>
              
              <div class="workout-actions" @click.stop>
                <ion-button 
                  fill="clear" 
                  size="small" 
                  @click="handleEditWorkout(workout.id)"
                >
                  <ion-icon :icon="createOutline" slot="start" />
                  Edit
                </ion-button>
                <ion-button 
                  fill="clear" 
                  size="small" 
                  color="danger"
                  @click="handleDeleteClick(workout)"
                >
                  <ion-icon :icon="trashOutline" slot="start" />
                  Delete
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  alertController
} from '@ionic/vue'
import { 
  addOutline,
  barbellOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons'
import { onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWorkouts } from '../composables/useWorkouts'
import { getDayOfWeekName } from '../utils/workoutHelpers'

export default {
  name: 'WorkoutsList',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { workouts, loading, fetchWorkouts, deleteWorkout } = useWorkouts()

    // Fetch workouts function
    const loadWorkouts = async () => {
      try {
        console.log('WorkoutsList: Fetching workouts...')
        await fetchWorkouts()
        console.log('WorkoutsList: Workouts fetched:', workouts?.value?.length || 0)
        console.log('WorkoutsList: Workouts data:', workouts?.value)
      } catch (error) {
        // Error already handled in composable
        console.error('WorkoutsList: Error fetching workouts:', error)
      }
    }

    // Fetch workouts on mount
    onMounted(() => {
      loadWorkouts()
    })

    // Refetch workouts when route changes (e.g., navigating back from form)
    watch(() => route.path, (newPath) => {
      if (newPath === '/tabs/workouts') {
        console.log('WorkoutsList: Route changed to workouts list, refetching...')
        loadWorkouts()
      }
    })

    // Handle refresh
    const handleRefresh = async (event) => {
      try {
        await fetchWorkouts()
      } catch (error) {
        // Error already handled in composable
      } finally {
        event.target.complete()
      }
    }

    // Navigate to add workout
    const handleAddWorkout = () => {
      router.push('/tabs/workouts/new')
    }

    // Navigate to edit workout
    const handleEditWorkout = (id) => {
      router.push(`/tabs/workouts/${id}/edit`)
    }

    // Handle delete click
    const handleDeleteClick = async (workout) => {
      const alert = await alertController.create({
        header: 'Delete Workout',
        message: `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`,
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
                await deleteWorkout(workout.id)
              } catch (error) {
                // Error already handled in composable
              }
            }
          }
        ]
      })

      await alert.present()
    }

    // Get day name
    const getDayName = (dayNumber) => {
      return getDayOfWeekName(dayNumber)
    }

    return {
      workouts,
      loading,
      handleRefresh,
      handleAddWorkout,
      handleEditWorkout,
      handleDeleteClick,
      getDayName,
      // Icons
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  min-height: 50vh;
}

.empty-icon {
  font-size: 4rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: var(--ion-color-dark);
  margin: 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 2rem;
}

.workouts-container {
  max-width: 1200px;
  margin: 0 auto;
}

.workout-card {
  margin-bottom: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.workout-card:active {
  transform: scale(0.98);
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.workout-header ion-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-bottom: 0.25rem;
}

.workout-header ion-card-subtitle {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.day-badge {
  flex-shrink: 0;
}

.workout-info {
  margin-bottom: 1rem;
}

.exercise-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.exercise-count ion-icon {
  font-size: 1.2rem;
}

.workout-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  border-top: 1px solid var(--ion-color-light-shade);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .workout-header {
    flex-direction: column;
  }
  
  .day-badge {
    align-self: flex-start;
  }
}
</style>

