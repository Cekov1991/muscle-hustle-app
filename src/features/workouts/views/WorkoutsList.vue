<template>
  <ion-page class="workouts-list-page">
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
    
    <ion-content fullscreen class="workouts-list-content">
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
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                  <div>
                    <ion-card-title>{{ workout.name }}</ion-card-title>
                    <ion-card-subtitle v-if="workout.description">
                      {{ workout.description }}
                    </ion-card-subtitle>
                  </div>
                  <!-- Three-dot Menu -->
                  <ion-button 
                      size="small"
                      color="primary"
                      fill="clear"
                      @click.stop="handleShowWorkoutMenu(workout)"
                    >
                  <ion-icon :icon="ellipsisVertical" slot="icon-only" />
                </ion-button>
                </div>
                <div class="badges">
                  <ion-badge 
                    v-if="workout.plan" 
                    color="tertiary"
                    class="plan-badge"
                  >
                    {{ workout.plan.name }}
                  </ion-badge>
                  <ion-badge 
                    v-if="workout.day_of_week !== null" 
                    color="primary"
                    class="day-badge"
                  >
                    {{ getDayName(workout.day_of_week) }}
                  </ion-badge>
                </div>
              </div>
            </ion-card-header>
            
            <ion-card-content>
              <div class="workout-info">
                <div class="exercise-count">
                  <ion-icon :icon="barbellOutline" />
                  <span>{{ workout.exercises?.length || 0 }} {{ workout.exercises?.length === 1 ? 'Exercise' : 'Exercises' }}</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
     <!-- Workout Menu Action Sheet -->
     <ion-action-sheet
      :is-open="showActionSheet"
      header="Workout Actions"
      :buttons="actionSheetButtons"
      @didDismiss="showActionSheet = false"
    ></ion-action-sheet>
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
  alertController,
  IonActionSheet
} from '@ionic/vue'
import { 
  addOutline,
  barbellOutline,
  createOutline,
  trashOutline,
  ellipsisVertical
} from 'ionicons/icons'
import { onMounted, watch, ref, computed } from 'vue'
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
    IonRefresherContent,
    IonActionSheet
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { workouts, loading, fetchWorkouts, deleteWorkout } = useWorkouts()
    // Action sheet state
    const showActionSheet = ref(false);
    const menuWorkout = ref(null)
    // Handle show workout menu
    const handleShowWorkoutMenu = (workout) => {
      menuWorkout.value = workout
      showActionSheet.value = true
    }

    // Action sheet buttons
    const actionSheetButtons = computed(() => [
      {
        text: 'Edit',
        icon: createOutline,
        handler: () => {
          if (menuWorkout.value) {
            handleEditWorkout(menuWorkout.value.id)
          }
        }
      },
      {
        text: 'Delete',
        icon: trashOutline,
        role: 'destructive',
        handler: async () => {
          if (menuWorkout.value) {
            await handleDeleteClick(menuWorkout.value)
          }
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ])

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
      handleShowWorkoutMenu,
      showActionSheet,
      actionSheetButtons,
      // Icons
      addOutline,
      barbellOutline,
      createOutline,
      trashOutline,
      ellipsisVertical
    }
  }
}
</script>

<style scoped>
.workouts-list-page {
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

.workouts-list-content {
  --background: var(--brand-background-color);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 24px;
}

.loading-container ion-spinner {
  --color: var(--brand-primary);
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
}

.loading-container p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-secondary-color);
  margin: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 50vh;
  padding: 60px 24px;
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
}

.empty-icon {
  font-size: 64px;
  color: var(--brand-gray-40, #9ca3af);
  margin-bottom: 16px;
}

.empty-state h2 {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xl);
  color: var(--brand-text-primary-color);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0 0 24px 0;
}

.empty-state ion-button {
  --background: var(--brand-primary);
  --border-radius: var(--brand-button-border-radius, 16px);
  font-family: var(--brand-font-family);
  font-weight: 600;
}

/* Workouts Container */
.workouts-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Workout Card */
.workout-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  --background: var(--brand-card-background-color, #fff);
  border: none;
}

.workout-card:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.workout-card:active {
  transform: scale(0.98);
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.workout-header ion-card-title {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-lg);
  font-weight: 700;
  color: var(--brand-text-primary-color);
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}

.workout-header ion-card-subtitle {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-tertiary-color);
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.plan-badge {
  flex-shrink: 0;
  --background: var(--brand-tertiary-color, #6c757d);
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xs);
  border-radius: 12px;
  padding: 4px 12px;
}

.day-badge {
  flex-shrink: 0;
  --background: var(--brand-primary);
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xs);
  border-radius: 12px;
  padding: 4px 12px;
}

/* Workout Info */
.workout-info {
  margin-bottom: 16px;
}

.exercise-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-tertiary-color);
}

.exercise-count ion-icon {
  font-size: 18px;
  color: var(--brand-gray-40, #9ca3af);
}

/* Workout Actions */
.workout-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid var(--brand-gray-20, #e5e7eb);
  padding-top: 12px;
  margin-top: 12px;
}

.workout-actions ion-button {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  --color: var(--brand-primary);
}

.workout-actions ion-button[color="danger"] {
  --color: var(--brand-danger-color, #eb445a);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .workouts-list-page {
    --background: var(--brand-background-color, #121212);
  }
  
  .empty-state,
  .workout-card {
    background: var(--brand-card-background-color, #1f1f1f);
    --background: var(--brand-card-background-color, #1f1f1f);
  }
  
  .workout-actions {
    border-top-color: var(--brand-gray-30, #3f3f3f);
  }
}

@media (max-width: 768px) {
  .workout-header {
    flex-direction: column;
  }
  
  .badges {
    align-self: flex-start;
  }
}
</style>

