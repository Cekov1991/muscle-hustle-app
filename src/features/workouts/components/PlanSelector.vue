<template>
  <ion-item>
    <ion-label position="stacked">
      Plan {{ required ? '*' : '' }}
    </ion-label>
    <ion-select
      :model-value="modelValue"
      @ion-change="handleChange"
      :placeholder="placeholder"
      :disabled="loading || disabled"
      :interface="interface"
    >
      <ion-select-option :value="null" v-if="!required">None</ion-select-option>
      <ion-select-option 
        v-for="plan in filteredPlans" 
        :key="plan.id" 
        :value="plan.id"
      >
        {{ plan.name }}{{ plan.is_active ? ' (Active)' : '' }}
      </ion-select-option>
    </ion-select>
  </ion-item>
  
  <!-- Empty State Message -->
  <div v-if="!loading && filteredPlans.length === 0" class="empty-message">
    <p>No plans available. Please create a plan first.</p>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/vue'
import { usePlans } from '../composables/usePlans'

export default {
  name: 'PlanSelector',
  components: {
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption
  },
  props: {
    modelValue: {
      type: Number,
      default: null
    },
    onlyActive: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Select a plan'
    },
    interface: {
      type: String,
      default: 'popover'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { plans, loading, fetchPlans } = usePlans()
    
    const filteredPlans = computed(() => {
      if (props.onlyActive) {
        return plans.value?.filter(p => p.is_active) || []
      }
      return plans.value || []
    })
    
    const handleChange = (event) => {
      emit('update:modelValue', event.detail.value)
    }
    
    onMounted(async () => {
      if (!plans.value?.length) {
        try {
          await fetchPlans()
        } catch (error) {
          console.error('Failed to fetch plans:', error)
        }
      }
    })
    
    return {
      filteredPlans,
      loading,
      handleChange
    }
  }
}
</script>

<style scoped>
ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --background: transparent;
  --border-color: var(--brand-gray-20, #e5e7eb);
  font-family: var(--brand-font-family);
}

ion-label {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  font-weight: 600;
  color: var(--brand-text-primary-color);
}

ion-select {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-primary-color);
}

.empty-message {
  padding: 12px 16px;
  margin-top: -8px;
}

.empty-message p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  ion-item {
    --border-color: var(--brand-gray-30, #3f3f3f);
  }
}
</style>

