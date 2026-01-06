<template>
  <ion-page class="exercise-detail-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/plans"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ exercise?.name || 'Exercise' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content fullscreen class="exercise-detail-content">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading exercise...</p>
        </div>

        <!-- Not Found State -->
        <div v-else-if="!exercise" class="not-found-state">
          <ion-icon :icon="alertCircleOutline" />
          <p>Exercise not found</p>
          <ion-button fill="outline" @click="goBack">
            Go Back
          </ion-button>
        </div>

        <!-- Exercise Content -->
        <template v-else>
          <!-- Instructions Card -->
          <div class="info-card">
            <h2 class="card-title">Instructions</h2>
            <p class="card-description">
              {{ exercise.description || getPlaceholderInstructions(exercise) }}
            </p>
          </div>

          <!-- Muscles Involved Card -->
          <div class="info-card">
            <h2 class="card-title">Muscles Involved</h2>
            <p class="card-subtitle">Tap the colored labels to learn more about each muscle group.</p>
            
            <div class="muscles-content">
              <!-- Skeleton Image -->
              <div class="skeleton-container">
                <img 
                  v-if="exercise.image_url" 
                  :src="exercise.image_url" 
                  alt="Muscle groups visualization"
                  class="skeleton-image"
                />
                <div v-else class="skeleton-placeholder">
                  <ion-icon :icon="bodyOutline" />
                </div>
              </div>

              <!-- Muscle Labels -->
              <div class="muscles-section">
                <!-- Primary Muscles -->
                <div v-if="primaryMuscles.length > 0" class="muscle-group-section">
                  <div class="muscle-label">
                    <span class="muscle-dot primary"></span>
                    <span class="muscle-label-text">Primary</span>
                  </div>
                  <div class="muscle-tags">
                    <span 
                      v-for="muscle in primaryMuscles" 
                      :key="muscle.id"
                      class="muscle-tag primary"
                    >
                      {{ muscle.name }}
                    </span>
                  </div>
                </div>

                <!-- Secondary Muscles -->
                <div v-if="secondaryMuscles.length > 0" class="muscle-group-section">
                  <div class="muscle-label">
                    <span class="muscle-dot secondary"></span>
                    <span class="muscle-label-text">Secondary</span>
                  </div>
                  <div class="muscle-tags">
                    <span 
                      v-for="muscle in secondaryMuscles" 
                      :key="muscle.id"
                      class="muscle-tag secondary"
                    >
                      {{ muscle.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
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
  IonButtons,
  IonBackButton,
  IonButton,
  IonSpinner,
  IonIcon
} from '@ionic/vue'
import { alertCircleOutline, bodyOutline } from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkouts } from '../composables/useWorkouts'

export default {
  name: 'ExerciseDetail',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonSpinner,
    IonIcon
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { exercises, fetchExercises } = useWorkouts()
    
    const loading = ref(true)
    const exerciseId = computed(() => route.params.id ? parseInt(route.params.id) : null)
    
    // Find exercise from the already-fetched exercises list
    const exercise = computed(() => {
      if (!exercises.value || !exerciseId.value) return null
      return exercises.value.find(ex => ex.id === exerciseId.value)
    })

    // Split muscles into primary and secondary
    const primaryMuscles = computed(() => {
      if (!exercise.value?.muscle_groups) return []
      return exercise.value.muscle_groups.filter(m => m.is_primary)
    })

    const secondaryMuscles = computed(() => {
      if (!exercise.value?.muscle_groups) return []
      return exercise.value.muscle_groups.filter(m => !m.is_primary)
    })

    // Placeholder instructions based on exercise type
    const getPlaceholderInstructions = (ex) => {
      if (!ex) return 'No instructions available.'
      
      // Generate contextual placeholder based on exercise category
      const category = ex.category?.name?.toLowerCase() || ''
      const name = ex.name || 'this exercise'
      
      if (category === 'compound') {
        return `${name} is a compound movement that engages multiple muscle groups simultaneously. Focus on proper form, maintain a controlled tempo throughout the movement, and ensure full range of motion. Start with a weight that allows you to complete the desired reps with good technique.`
      } else if (category === 'isolation') {
        return `${name} is an isolation exercise targeting specific muscle groups. Concentrate on the mind-muscle connection, use controlled movements, and avoid using momentum. Focus on squeezing the target muscle at the peak of the contraction.`
      } else if (category === 'cardio') {
        return `${name} is a cardiovascular exercise that improves endurance and burns calories. Maintain a steady pace, focus on your breathing rhythm, and gradually increase intensity as your fitness improves.`
      } else if (category === 'plyometrics') {
        return `${name} is a plyometric exercise designed to build explosive power. Focus on landing softly, maintain proper alignment, and ensure adequate rest between sets to maintain quality of movement.`
      }
      
      return `Perform ${name} with proper form and controlled movement. Focus on engaging the target muscles throughout the full range of motion.`
    }

    // Go back
    const goBack = () => {
      router.back()
    }

    // Initialize
    const initialize = async () => {
      loading.value = true
      try {
        // Ensure exercises are loaded
        if (!exercises.value || exercises.value.length === 0) {
          await fetchExercises()
        }
      } catch (error) {
        console.error('Error loading exercise:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      initialize()
    })

    return {
      loading,
      exercise,
      primaryMuscles,
      secondaryMuscles,
      getPlaceholderInstructions,
      goBack,
      alertCircleOutline,
      bodyOutline
    }
  }
}
</script>

<style scoped>
.exercise-detail-page {
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

.exercise-detail-content {
  --background: var(--brand-background-color, #fafafa);
}

.container {
  max-width: 500px;
  margin: 0 auto;
  padding: 16px;
}

/* Loading State */
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

/* Not Found State */
.not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 24px;
}

.not-found-state ion-icon {
  font-size: 64px;
  color: var(--brand-gray-40, #9ca3af);
  margin-bottom: 16px;
}

.not-found-state p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-secondary-color);
  margin: 0 0 24px 0;
}

/* Info Cards */
.info-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-title {
  margin: 0 0 12px 0;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-lg);
  font-weight: 700;
  color: var(--brand-text-primary-color);
  letter-spacing: -0.3px;
}

.card-subtitle {
  margin: 0 0 16px 0;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-tertiary-color);
  line-height: 1.4;
}

.card-description {
  margin: 0;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-primary-color);
  line-height: 1.6;
}

/* Muscles Content Layout */
.muscles-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* Skeleton Image Container */
.skeleton-container {
  flex-shrink: 0;
  width: 140px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-image {
  width: 100%;
  height: auto;
  max-height: 280px;
  object-fit: contain;
}

.skeleton-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 200px;
  background: var(--brand-gray-10, #f3f4f6);
  border-radius: 12px;
}

.skeleton-placeholder ion-icon {
  font-size: 64px;
  color: var(--brand-gray-30, #d1d5db);
}

/* Muscles Section */
.muscles-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.muscle-group-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.muscle-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.muscle-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.muscle-dot.primary {
  background-color: #ef4444;
}

.muscle-dot.secondary {
  background-color: #f59e0b;
}

.muscle-label-text {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  font-weight: 600;
  color: var(--brand-text-primary-color);
}

.muscle-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.muscle-tag {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 8px;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.muscle-tag:hover {
  transform: scale(1.02);
}

.muscle-tag:active {
  transform: scale(0.98);
}

.muscle-tag.primary {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.muscle-tag.secondary {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .exercise-detail-page {
    --background: var(--brand-background-color, #121212);
  }
  
  .exercise-detail-content {
    --background: var(--brand-background-color, #121212);
  }

  .info-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }

  .skeleton-placeholder {
    background: var(--brand-gray-70, #374151);
  }

  .skeleton-placeholder ion-icon {
    color: var(--brand-gray-50, #6b7280);
  }

  .muscle-tag.primary {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }

  .muscle-tag.secondary {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
  }
}
</style>

