<template>
  <!-- Exercise Selection Modal -->
  <ExerciseSelectionModal
    :is-open="modals.selection"
    :exclude-exercise-ids="excludeExerciseIds"
    @close="closeModals"
    @select="handleExerciseSelected"
  />

  <!-- Exercise Form Modal -->
  <ExerciseFormModal
    :is-open="modals.form"
    :mode="exerciseFormMode"
    :exercise="selectedExercise"
    :available-exercises="availableExercises"
    @close="closeModals"
    @submit="handleExerciseFormSubmit"
  />

  <!-- Exercise Menu Action Sheet -->
  <ion-action-sheet
    :is-open="showActionSheet"
    header="Exercise Actions"
    :buttons="actionSheetButtons"
    @didDismiss="showActionSheet = false"
  ></ion-action-sheet>
</template>

<script>
import {
  IonActionSheet
} from '@ionic/vue'
import {
  createOutline,
  trashOutline
} from 'ionicons/icons'
import { ref, computed, watch } from 'vue'
import ExerciseSelectionModal from './ExerciseSelectionModal.vue'
import ExerciseFormModal from './ExerciseFormModal.vue'
import { useExerciseModals } from '../composables/useExerciseModals'

export default {
  name: 'ExerciseModals',
  components: {
    IonActionSheet,
    ExerciseSelectionModal,
    ExerciseFormModal
  },
  props: {
    workoutId: {
      type: [Number, String, Object],
      default: null
    },
    currentWorkout: {
      type: Object,
      default: null
    },
    workoutExercises: {
      type: [Array, Object],
      default: () => []
    },
    availableExercises: {
      type: Array,
      default: () => []
    },
    excludeExerciseIds: {
      type: Array,
      default: () => []
    }
  },
  emits: ['exercise-updated'],
  setup(props, { emit }) {
    const {
      modals,
      selectedExercise,
      openExerciseSelection,
      openExerciseForm,
      closeModals,
      handleExerciseSelected,
      handleExerciseFormSubmit,
      handleExerciseRemove
    } = useExerciseModals(props.workoutId, props.workoutExercises)

    // Track form mode explicitly
    const exerciseFormMode = ref('create')

    // Update mode when selectedExercise changes
    watch(selectedExercise, (exercise) => {
      exerciseFormMode.value = exercise && exercise.pivot ? 'edit' : 'create'
    })

    // Action sheet state
    const showActionSheet = ref(false)
    const menuExercise = ref(null)

    // Show exercise menu
    const showExerciseMenu = (exercise) => {
      menuExercise.value = exercise
      showActionSheet.value = true
    }

    // Action sheet buttons
    const actionSheetButtons = computed(() => [
      {
        text: 'Edit',
        icon: createOutline,
        handler: () => {
          if (menuExercise.value) {
            openExerciseForm(menuExercise.value)
          }
        }
      },
      {
        text: 'Remove',
        icon: trashOutline,
        role: 'destructive',
        handler: async () => {
          if (menuExercise.value) {
            try {
              await handleExerciseRemove(menuExercise.value, props.currentWorkout)
              emit('exercise-updated')
            } catch (error) {
              // Error already handled in composable
            }
          }
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ])

    // Handle form submission with emit
    const onExerciseFormSubmit = async (exerciseData) => {
      try {
        await handleExerciseFormSubmit(exerciseData, props.currentWorkout)
        emit('exercise-updated')
      } catch (error) {
        // Error already handled in composable
      }
    }

    // Expose methods for parent component
    const openSelection = () => {
      openExerciseSelection()
    }

    const openForm = (exercise = null) => {
      openExerciseForm(exercise)
    }

    return {
      // State
      modals,
      selectedExercise,
      exerciseFormMode,
      showActionSheet,
      actionSheetButtons,
      
      // Methods for parent
      openSelection,
      openForm,
      showExerciseMenu,
      
      // Internal handlers
      closeModals,
      handleExerciseSelected,
      handleExerciseFormSubmit: onExerciseFormSubmit
    }
  }
}
</script>
