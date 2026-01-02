<template>
  <div class="exercises-section">
    <div class="section-header">
      <h2>Exercises</h2>
      
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
        <span class="button-text">Add First Exercise</span>
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
            <!-- Exercise Icon -->
            <div class="exercise-icon">
              <ion-icon :icon="barbellOutline" />
            </div>
            
            <!-- Exercise Info -->
            <div class="exercise-info">
              <h3>{{ exercise.name }}</h3>
              <p class="exercise-sets-reps">
                {{ formatSetsReps(exercise.pivot) }}
              </p>
              <!-- Muscle Groups -->
              <div v-if="exercise.muscle_groups?.length" class="muscle-groups">
                <span 
                  v-for="muscle in exercise.muscle_groups" 
                  :key="muscle.id"
                  class="muscle-tag"
                  :class="{ 'primary': muscle.is_primary }"
                >
                  {{ muscle.name }}
                </span>
              </div>
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
      <button 
        @click="$emit('add-exercise')"
        :disabled="loading"
        class="dashed-button"
      >
        Add Exercise
      </button>
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

export default {
  name: 'WorkoutExercisesList',
  components: {
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent
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
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-lg);
  font-weight: 700;
  color: var(--brand-text-primary-color);
  letter-spacing: -0.3px;
}

.empty-exercises {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  margin-bottom: 16px;
}

.empty-exercises ion-icon {
  font-size: 64px;
  color: var(--brand-gray-40, #9ca3af);
  margin-bottom: 16px;
}

.empty-exercises p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0 0 24px 0;
}

.empty-exercises ion-button {
  --border-radius: var(--brand-button-border-radius, 16px);
  font-family: var(--brand-font-family);
  font-weight: 600;
}

/* Exercises List Container */
.exercises-list {
  margin-bottom: 16px;
}

/* Compact Exercise Cards */
.exercise-card-compact {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  --background: var(--brand-card-background-color, #fff);
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.exercise-card-compact:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.exercise-card-compact:active {
  transform: scale(0.98);
}

.exercise-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 8px 0;
}

.exercise-icon {
  width: 48px;
  height: 48px;
  margin-top: 4px;
  background: var(--brand-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-text-on-primary-color, #fff);
  font-size: 24px;
  flex-shrink: 0;
}

.exercise-info {
  flex: 1;
  min-width: 0; /* Allow text to truncate */
}

.exercise-info h3 {
  margin: 0 0 4px 0;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  font-weight: 700;
  color: var(--brand-text-primary-color);
  line-height: 1.2;
  letter-spacing: -0.2px;
}

.exercise-sets-reps {
  margin: 0 0 6px 0;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-tertiary-color);
  line-height: 1.2;
}

/* Muscle Groups */
.muscle-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.muscle-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: var(--brand-font-family);
  font-size: 11px;
  font-weight: 500;
  background: var(--brand-gray-20, #e5e7eb);
  color: var(--brand-text-secondary-color, #6b7280);
}

.muscle-tag.primary {
  background: var(--brand-primary-light, rgba(249, 115, 22, 0.15));
  color: var(--brand-primary);
  font-weight: 600;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .empty-exercises,
  .exercise-card-compact {
    background: var(--brand-card-background-color, #1f1f1f);
    --background: var(--brand-card-background-color, #1f1f1f);
  }

  .muscle-tag {
    background: var(--brand-gray-70, #374151);
    color: var(--brand-gray-30, #d1d5db);
  }

  .muscle-tag.primary {
    background: var(--brand-primary-light, rgba(249, 115, 22, 0.2));
    color: var(--brand-primary);
  }
}
</style>
