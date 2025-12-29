<template>
  <div class="workout-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-button"
      :class="{ 'active': activeTab === tab.id }"
      @click="selectTab(tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'WorkoutTabs',
  props: {
    modelValue: {
      type: String,
      default: 'track'
    },
    tabs: {
      type: Array,
      default: () => [
        { id: 'track', label: 'Track' },
        { id: 'overview', label: 'Overview' },
        { id: 'history', label: 'History' },
        { id: 'notes', label: 'Notes' }
      ]
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const activeTab = computed(() => props.modelValue)
    
    const selectTab = (tabId) => {
      emit('update:modelValue', tabId)
      emit('change', tabId)
    }
    
    return {
      activeTab,
      selectTab
    }
  }
}
</script>

<style scoped>
.workout-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: var(--brand-card-background-color, #f0f0f0);
  border-radius: 16px;
  margin-bottom: 20px;
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  transition: all 0.2s ease;
  position: relative;
}

.tab-button:hover {
  color: var(--brand-text-primary-color);
}

.tab-button.active {
  background: var(--brand-background-color, #fff);
  color: var(--brand-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: var(--brand-primary);
  border-radius: 2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .workout-tabs {
    background: var(--brand-card-background-color, #1f1f1f);
  }
  
  .tab-button.active {
    background: var(--brand-gray-20, #2d2d2d);
  }
}
</style>

