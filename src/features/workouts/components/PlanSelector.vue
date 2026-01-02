<template>
  <ion-item lines="none" class="plan-selector-item">
    <ion-label position="stacked">
      Plan {{ required ? '*' : '' }}
    </ion-label>
    <ion-select
      :model-value="modelValue"
      @ion-change="handleChange"
      :placeholder="placeholder"
      :disabled="loading || disabled"
      :interface="selectInterface"
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
    selectInterface: {
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
.plan-selector-item {
  --background: transparent;
  --border-color: transparent;
  --inner-padding-start: 6px;
  --inner-padding-end: 16px;
  --inner-padding-top: 6px;
  --inner-padding-bottom: 6px;
  --min-height: auto;
}

.plan-selector-item ion-label {
  font-family: var(--brand-font-family);
  color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-weight: 600;
  font-size: var(--brand-font-size-sm);
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}

.plan-selector-item ion-select {
  font-family: var(--brand-font-family);
  --color: var(--brand-text-primary-color);
  --placeholder-color: var(--brand-gray-50, var(--brand-text-secondary-color));
  font-size: var(--brand-font-size-base);
  font-weight: 600;
}

.empty-message {
  padding: 0 16px 12px 16px;
}

.empty-message p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0;
}
</style>

