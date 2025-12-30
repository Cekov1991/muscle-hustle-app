<template>
  <div class="exercises-section">
    <div class="section-header">
      <h2>Exercises</h2>
      <ion-button 
        size="small" 
        @click="$emit('add-exercise')"
        :disabled="loading"
      >
        <ion-icon :icon="addOutline" slot="start" />
        Add Exercise
      </ion-button>
    </div>

    <!-- Empty State -->
    <div v-if="exercises.length === 0" class="empty-exercises">
      <ion-icon :icon="barbellOutline" />
      <p>No exercises added yet</p>
      <ion-button 
        size="small" 
        fill="outline"
        @click="$emit('add-exercise')"
      >
        Add First Exercise
      </ion-button>
    </div>

    <!-- Exercises List -->
    <div v-else class="exercises-list">
      <ion-card 
        v-for="(exercise, index) in sortedExercises" 
        :key="`${exercise.id}-${index}`"
        class="exercise-card-compact"
      >
        <ion-card-content>
          <div class="exercise-row">
            <!-- Muscle Group Icon -->
            <MuscleGroupIcon :category="exercise.category" />
            
            <!-- Exercise Info -->
            <div class="exercise-info">
              <h3>{{ exercise.name }}</h3>
              <p class="exercise-sets-reps">
                {{ formatSetsReps(exercise.pivot) }}
              </p>
            </div>
            
            <!-- Three-dot Menu -->
            <ion-button 
              size="small"
              color="primary"
              fill="clear"
              @click="$emit('show-exercise-menu', exercise)"
            >
              <ion-icon :icon="ellipsisVertical" slot="icon-only" />
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </div>
  </div>
</template>

<script>
import {
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/vue'
import {
  addOutline,
  barbellOutline,
  ellipsisVertical
} from 'ionicons/icons'
import { computed } from 'vue'
import { formatSetsReps } from '../utils/workoutHelpers'
import MuscleGroupIcon from '../../../shared/components/MuscleGroupIcon.vue'

export default {
  name: 'WorkoutExercisesList',
  components: {
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    MuscleGroupIcon
  },
  props: {
    exercises: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-exercise', 'show-exercise-menu'],
  setup(props) {
    // Sorted exercises by order
    const sortedExercises = computed(() => {
      return [...props.exercises].sort((a, b) => {
        const orderA = a.pivot?.order || 0
        const orderB = b.pivot?.order || 0
        return orderA - orderB
      })
    })

    return {
      sortedExercises,
      formatSetsReps,
      // Icons
      addOutline,
      barbellOutline,
      ellipsisVertical
    }
  }
}
</script>

<style scoped>
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

/* Exercises List Container */
.exercises-list {
  margin-bottom: 1rem;
}

/* Compact Exercise Cards */
.exercise-card-compact {
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.exercise-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.exercise-info {
  flex: 1;
  min-width: 0; /* Allow text to truncate */
}

.exercise-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
  line-height: 1.2;
}

.exercise-sets-reps {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.875rem;
  line-height: 1.2;
}
</style>
