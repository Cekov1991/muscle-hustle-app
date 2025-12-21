<template>
  <form @submit.prevent="handleSubmit">
    <ion-list>
      <!-- Workout Name -->
      <ion-item>
        <ion-label position="stacked">Workout Name *</ion-label>
        <ion-input
          :model-value="modelValue.name"
          @ion-input="updateField('name', $event.target.value)"
          placeholder="e.g., Push Day"
          :disabled="loading"
          required
        ></ion-input>
      </ion-item>

      <!-- Description -->
      <ion-item>
        <ion-label position="stacked">Description</ion-label>
        <ion-textarea
          :model-value="modelValue.description"
          @ion-input="updateField('description', $event.target.value)"
          placeholder="Optional description"
          rows="3"
          :disabled="loading"
        ></ion-textarea>
      </ion-item>

      <!-- Day of Week -->
      <ion-item>
        <ion-label position="stacked">Day of Week</ion-label>
        <ion-select
          :model-value="modelValue.day_of_week"
          @ion-change="updateField('day_of_week', $event.detail.value)"
          placeholder="Select day (optional)"
          :disabled="loading"
        >
          <ion-select-option :value="null">None</ion-select-option>
          <ion-select-option :value="0">Sunday</ion-select-option>
          <ion-select-option :value="1">Monday</ion-select-option>
          <ion-select-option :value="2">Tuesday</ion-select-option>
          <ion-select-option :value="3">Wednesday</ion-select-option>
          <ion-select-option :value="4">Thursday</ion-select-option>
          <ion-select-option :value="5">Friday</ion-select-option>
          <ion-select-option :value="6">Saturday</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-list>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <ion-button
        expand="block"
        type="submit"
        :disabled="loading || !isValid"
      >
        <ion-spinner v-if="loading" name="crescent" slot="start" />
        <ion-icon v-else :icon="checkmarkOutline" slot="start" />
        {{ isEditMode ? 'Update' : 'Create' }} Workout
      </ion-button>
      
      <ion-button
        expand="block"
        fill="outline"
        @click="$emit('cancel')"
        :disabled="loading"
      >
        Cancel
      </ion-button>
    </div>
  </form>
</template>

<script>
import {
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import {
  checkmarkOutline
} from 'ionicons/icons'

export default {
  name: 'WorkoutDetailsForm',
  components: {
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonSpinner
  },
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    isValid: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'submit', 'cancel'],
  setup(props, { emit }) {
    const updateField = (field, value) => {
      const updatedValue = { ...props.modelValue, [field]: value }
      emit('update:modelValue', updatedValue)
    }

    const handleSubmit = () => {
      if (props.isValid) {
        emit('submit')
      }
    }

    return {
      updateField,
      handleSubmit,
      checkmarkOutline
    }
  }
}
</script>

<style scoped>
ion-item {
  --padding-start: 1rem;
}

.action-buttons {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.action-buttons ion-button {
  margin-bottom: 0.5rem;
}
</style>
