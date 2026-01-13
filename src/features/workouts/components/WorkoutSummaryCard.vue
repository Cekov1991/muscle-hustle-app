<template>
  <div class="workout-summary-card">
    <div class="summary-content">
      <h1 class="workout-title">{{ workout?.name || 'New Workout' }}</h1>
      <p class="workout-meta">{{ workoutMeta }}</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'WorkoutSummaryCard',
  props: {
    workout: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    // Workout meta info for display
    const workoutMeta = computed(() => {
      return props.workout?.description || 'New Workout'
    })

    return {
      workoutMeta
    }
  }
}
</script>

<style scoped>
/* Workout Summary Card */
.workout-summary-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.workout-summary-card:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.workout-title {
  margin: 0 0 8px 0;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-xl);
  font-weight: 700;
  color: var(--brand-text-primary-color);
  line-height: 1.2;
  letter-spacing: -0.3px;
}

.workout-meta {
  margin: 0;
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-tertiary-color);
  line-height: 1.3;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .workout-summary-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }
}
</style>
