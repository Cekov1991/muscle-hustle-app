<template>
  <div class="exercise-card" :class="{ 'is-completed': isExerciseCompleted }">
    <div class="exercise-header" @click="toggleExpanded">
      <div class="exercise-info">
        <div class="exercise-category">
          {{ exercise.session_exercise?.exercise?.category?.name || 'Exercise' }}
        </div>
        <h3 class="exercise-name">
          {{ exercise.session_exercise?.exercise?.name || 'Unknown Exercise' }}
        </h3>
        <div class="exercise-target">
          {{ targetSets }} sets x {{ targetReps }} reps @ {{ targetWeight }}kg
        </div>
      </div>
      
      <div class="exercise-status">
        <div class="sets-progress" :class="{ 'completed': isExerciseCompleted }">
          {{ loggedSetsCount }}/{{ targetSets }}
        </div>
        <ion-icon 
          :icon="isExerciseCompleted ? checkmarkCircle : chevronDownOutline" 
          :class="{ 'expanded': isExpanded, 'completed-icon': isExerciseCompleted }"
        />
      </div>
    </div>
    
    <div v-show="isExpanded" class="exercise-content">
      <!-- Set Rows -->
      <div class="sets-list">
        <SetInputRow
          v-for="setNum in displayedSets"
          :key="setNum"
          :set-number="setNum"
          :logged-set="getLoggedSet(setNum)"
          :previous-set="getPreviousSet(setNum)"
          :target-weight="targetWeight"
          :target-reps="targetReps"
          :can-delete="canDeleteSet(setNum)"
          :can-edit="true"
          :loading="loadingSetNumber === setNum"
          @log="handleLogSet"
          @update="handleUpdateSet"
          @delete="handleDeleteSet"
        />
      </div>
      
      <!-- Add Extra Set Button -->
      <div v-if="canAddExtraSet" class="add-set-section">
        <button class="add-set-button" @click="addExtraSet">
          <ion-icon :icon="addOutline" />
          <span>Add Set</span>
        </button>
      </div>
      
      <!-- Rest Time Info -->
      <div class="rest-info">
        <ion-icon :icon="timerOutline" />
        <span>Rest: {{ restSeconds }}s between sets</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { 
  checkmarkCircle, 
  chevronDownOutline, 
  addOutline,
  timerOutline 
} from 'ionicons/icons'
import SetInputRow from './SetInputRow.vue'

export default {
  name: 'ActiveExerciseCard',
  components: {
    IonIcon,
    SetInputRow
  },
  props: {
    exercise: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['log-set', 'update-set', 'delete-set', 'rest-start'],
  setup(props, { emit }) {
    const isExpanded = ref(true)
    const extraSets = ref(0)
    const loadingSetNumber = ref(null)
    
    // Computed properties
    const sessionExercise = computed(() => props.exercise.session_exercise || {})
    const loggedSets = computed(() => props.exercise.logged_sets || [])
    const previousSets = computed(() => props.exercise.previous_sets || [])
    
    const targetSets = computed(() => sessionExercise.value.target_sets || 3)
    const targetReps = computed(() => sessionExercise.value.target_reps || 10)
    const targetWeight = computed(() => parseFloat(sessionExercise.value.target_weight) || 0)
    const restSeconds = computed(() => sessionExercise.value.rest_seconds || 90)
    
    const exerciseId = computed(() => sessionExercise.value.exercise_id)
    
    const loggedSetsCount = computed(() => loggedSets.value.length)
    
    const isExerciseCompleted = computed(() => {
      return props.exercise.is_completed || loggedSetsCount.value >= targetSets.value
    })
    
    // Number of sets to display (target + any extra sets added)
    const displayedSets = computed(() => {
      const totalSets = Math.max(targetSets.value + extraSets.value, loggedSetsCount.value)
      return Array.from({ length: totalSets }, (_, i) => i + 1)
    })
    
    const canAddExtraSet = computed(() => {
      // Allow adding extra sets if all current sets are logged
      return loggedSetsCount.value >= displayedSets.value.length
    })
    
    // Methods
    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value
    }
    
    const getLoggedSet = (setNumber) => {
      return loggedSets.value.find(s => s.set_number === setNumber) || null
    }
    
    const getPreviousSet = (setNumber) => {
      return previousSets.value.find(s => s.set_number === setNumber) || null
    }
    
    const canDeleteSet = (setNumber) => {
      // Only the last logged set can be deleted
      const logged = loggedSets.value.filter(s => s.set_number <= setNumber)
      const isLastLogged = logged.length > 0 && 
                          logged[logged.length - 1]?.set_number === setNumber
      return isLastLogged && setNumber === loggedSetsCount.value
    }
    
    const addExtraSet = () => {
      extraSets.value++
    }
    
    const handleLogSet = async (setData) => {
      loadingSetNumber.value = setData.set_number
      try {
        await emit('log-set', {
          exerciseId: exerciseId.value,
          ...setData
        })
        
        // Trigger rest timer
        emit('rest-start', {
          exerciseName: sessionExercise.value.exercise?.name || 'Exercise',
          duration: restSeconds.value,
          nextSetNumber: setData.set_number + 1
        })
      } finally {
        loadingSetNumber.value = null
      }
    }
    
    const handleUpdateSet = async (updateData) => {
      loadingSetNumber.value = loggedSets.value.find(s => s.id === updateData.id)?.set_number
      try {
        await emit('update-set', updateData)
      } finally {
        loadingSetNumber.value = null
      }
    }
    
    const handleDeleteSet = async (setId) => {
      const set = loggedSets.value.find(s => s.id === setId)
      loadingSetNumber.value = set?.set_number
      try {
        await emit('delete-set', setId)
        // Reduce extra sets if we had added any
        if (extraSets.value > 0 && loggedSetsCount.value < targetSets.value + extraSets.value) {
          extraSets.value = Math.max(0, extraSets.value - 1)
        }
      } finally {
        loadingSetNumber.value = null
      }
    }
    
    return {
      isExpanded,
      loadingSetNumber,
      targetSets,
      targetReps,
      targetWeight,
      restSeconds,
      loggedSetsCount,
      isExerciseCompleted,
      displayedSets,
      canAddExtraSet,
      toggleExpanded,
      getLoggedSet,
      getPreviousSet,
      canDeleteSet,
      addExtraSet,
      handleLogSet,
      handleUpdateSet,
      handleDeleteSet,
      // Icons
      checkmarkCircle,
      chevronDownOutline,
      addOutline,
      timerOutline
    }
  }
}
</script>

<style scoped>
.exercise-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.exercise-card.is-completed {
  border: 2px solid var(--ion-color-success, #2dd36f);
}

.exercise-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  cursor: pointer;
  user-select: none;
}

.exercise-info {
  flex: 1;
  min-width: 0;
}

.exercise-category {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xs);
  font-weight: 600;
  color: var(--brand-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.exercise-name {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-xl);
  color: var(--brand-text-primary-color);
  margin: 0 0 6px 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.exercise-target {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  letter-spacing: -0.2px;
}

.exercise-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-left: 16px;
}

.sets-progress {
  font-family: var(--brand-font-family);
  font-weight: 700;
  font-size: var(--brand-font-size-xl);
  color: var(--brand-text-primary-color);
}

.sets-progress.completed {
  color: var(--ion-color-success, #2dd36f);
}

.exercise-status ion-icon {
  font-size: 22px;
  color: var(--brand-gray-40);
  transition: transform 0.2s ease;
}

.exercise-status ion-icon.expanded {
  transform: rotate(180deg);
}

.exercise-status ion-icon.completed-icon {
  color: var(--ion-color-success, #2dd36f);
  transform: none;
}

.exercise-content {
  padding: 0 10px 20px 10px;
  border-top: 1px solid var(--brand-gray-10, rgba(0, 0, 0, 0.05));
}

.sets-list {
  margin-top: 16px;
}

.add-set-section {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.add-set-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
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

.add-set-button:hover {
  background: var(--brand-primary-light, rgba(59, 130, 246, 0.08));
  border-color: var(--brand-primary);
}

.add-set-button:active {
  transform: scale(0.98);
}

.add-set-button ion-icon {
  font-size: 20px;
}

.rest-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--brand-gray-10, rgba(0, 0, 0, 0.05));
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-tertiary-color);
  letter-spacing: -0.2px;
}

.rest-info ion-icon {
  font-size: 16px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .exercise-card {
    background: var(--brand-card-background-color, #1f1f1f);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }
  
  .add-set-button {
    border-color: var(--brand-gray-40, #4b5563);
  }
  
  .add-set-button:hover {
    background: var(--brand-primary-light, rgba(59, 130, 246, 0.15));
  }
}
</style>
