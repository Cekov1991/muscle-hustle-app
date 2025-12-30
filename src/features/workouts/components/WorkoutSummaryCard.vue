<template>
  <div class="workout-summary-card">
    <div class="summary-header">
      <div></div>
      <ion-button 
        size="small"
        color="primary"
        fill="clear" 
        @click="$emit('showMenu')">
        <ion-icon :icon="ellipsisVertical" />
      </ion-button>
    </div>
    <div class="summary-content">
      <h1 class="workout-title">{{ workout?.name || 'New Workout' }}</h1>
      <p class="workout-meta">{{ workoutMeta }}</p>
    </div>
  </div>
</template>

<script>
import {
  IonButton,
  IonIcon
} from '@ionic/vue'
import {
  informationCircleOutline,
  shareOutline,
  ellipsisVertical
} from 'ionicons/icons'
import { computed } from 'vue'

export default {
  name: 'WorkoutSummaryCard',
  components: {
    IonButton,
    IonIcon
  },
  props: {
    workout: {
      type: Object,
      default: null
    }
  },
  emits: ['showMenu'],
  setup(props) {
    // Workout meta info for display
    const workoutMeta = computed(() => {
      return props.workout?.description || 'New Workout'
    })

    return {
      workoutMeta,
      // Icons
      informationCircleOutline,
      shareOutline,
      ellipsisVertical
    }
  }
}
</script>

<style scoped>
/* Workout Summary Card */
.workout-summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.workout-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ion-color-dark);
  line-height: 1.2;
}

.workout-meta {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 1rem;
  line-height: 1.3;
}
</style>
