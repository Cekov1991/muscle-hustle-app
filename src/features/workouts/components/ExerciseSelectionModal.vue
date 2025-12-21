<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleClose">
    <ion-header>
      <ion-toolbar>
        <ion-title>Select Exercise</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleClose">
            <ion-icon :icon="closeOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <ion-searchbar
        v-model="searchQuery"
        placeholder="Search exercises..."
        :debounce="300"
      ></ion-searchbar>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading exercises...</p>
      </div>

      <!-- Exercises List -->
      <ion-list v-else>
        <div v-for="category in groupedExercises" :key="category.id">
          <ion-list-header v-if="category.exercises.length > 0">
            <ion-label>
              <h2>{{ category.name }}</h2>
            </ion-label>
          </ion-list-header>
          
          <ion-item
            v-for="exercise in category.exercises"
            :key="exercise.id"
            button
            @click="handleSelectExercise(exercise)"
          >
            <ion-avatar slot="start" v-if="exercise.image_url">
              <img :src="exercise.image_url" :alt="exercise.name" />
            </ion-avatar>
            <ion-icon 
              v-else 
              slot="start" 
              :icon="barbellOutline" 
              color="medium"
              style="font-size: 2rem;"
            />
            
            <ion-label>
              <h3>{{ exercise.name }}</h3>
              <p v-if="exercise.default_rest_sec">
                Rest: {{ formatRestTime(exercise.default_rest_sec) }}
              </p>
            </ion-label>
            
            <ion-icon 
              slot="end" 
              :icon="chevronForwardOutline" 
              color="medium"
            />
          </ion-item>
        </div>

        <!-- No Results -->
        <div v-if="filteredExercises.length === 0" class="empty-state">
          <ion-icon :icon="searchOutline" class="empty-icon" />
          <p>No exercises found</p>
        </div>
      </ion-list>
    </ion-content>
  </ion-modal>
</template>

<script>
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSearchbar,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonAvatar,
  IonSpinner
} from '@ionic/vue'
import {
  closeOutline,
  barbellOutline,
  chevronForwardOutline,
  searchOutline
} from 'ionicons/icons'
import { ref, computed, watch } from 'vue'
import { useWorkouts } from '../composables/useWorkouts'
import { formatRestTime } from '../utils/workoutHelpers'

export default {
  name: 'ExerciseSelectionModal',
  components: {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonSearchbar,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonAvatar,
    IonSpinner
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    excludeExerciseIds: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'select'],
  setup(props, { emit }) {
    const { exercises, loading, fetchExercises } = useWorkouts()
    const searchQuery = ref('')

    // Fetch exercises when modal opens
    watch(() => props.isOpen, async (isOpen) => {
      if (isOpen && (!exercises?.value || exercises.value.length === 0)) {
        console.log('ExerciseSelectionModal: Fetching exercises...')
        try {
          await fetchExercises()
          console.log('ExerciseSelectionModal: Exercises fetched:', exercises?.value?.length || 0)
        } catch (error) {
          // Error already handled in composable
          console.error('ExerciseSelectionModal: Error fetching exercises:', error)
        }
      }
    })

    // Filter exercises based on search query and exclude list
    const filteredExercises = computed(() => {
      if (!exercises?.value || !Array.isArray(exercises.value)) {
        return []
      }
      let filtered = exercises.value.filter(ex => 
        !props.excludeExerciseIds.includes(ex.id)
      )

      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(ex => 
          ex.name.toLowerCase().includes(query) ||
          ex.category?.name.toLowerCase().includes(query)
        )
      }

      return filtered
    })

    // Group exercises by category
    const groupedExercises = computed(() => {
      const groups = {}
      
      if (!filteredExercises.value || filteredExercises.value.length === 0) {
        return []
      }
      
      filteredExercises.value.forEach(exercise => {
        const categoryId = exercise.category?.id || 'uncategorized'
        const categoryName = exercise.category?.name || 'Uncategorized'
        
        if (!groups[categoryId]) {
          groups[categoryId] = {
            id: categoryId,
            name: categoryName,
            exercises: []
          }
        }
        
        groups[categoryId].exercises.push(exercise)
      })

      // Sort categories by display_order if available
      return Object.values(groups).sort((a, b) => {
        const aOrder = filteredExercises.value.find(ex => 
          ex.category?.id === a.id
        )?.category?.display_order || 999
        const bOrder = filteredExercises.value.find(ex => 
          ex.category?.id === b.id
        )?.category?.display_order || 999
        return aOrder - bOrder
      })
    })

    // Handle exercise selection
    const handleSelectExercise = (exercise) => {
      emit('select', exercise)
      handleClose()
    }

    // Handle close
    const handleClose = () => {
      searchQuery.value = ''
      emit('close')
    }

    return {
      exercises,
      loading,
      searchQuery,
      filteredExercises,
      groupedExercises,
      handleSelectExercise,
      handleClose,
      formatRestTime,
      // Icons
      closeOutline,
      barbellOutline,
      chevronForwardOutline,
      searchOutline
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
}

.empty-icon {
  font-size: 3rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--ion-color-medium);
}

ion-list-header {
  background: var(--ion-color-light);
}

ion-item {
  --padding-start: 1rem;
}
</style>

