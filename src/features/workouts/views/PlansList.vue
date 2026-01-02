<template>
  <ion-page class="plans-list-page">
    <ion-header>
      <ion-toolbar>
        <ion-title>Plans</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleAddPlan">
            <ion-icon :icon="addOutline" slot="icon-only" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content fullscreen class="plans-list-content">
      <div class="container">
  
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <!-- Loading State -->
        <div v-if="loading && (!plans || plans.length === 0)" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading plans...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && (!plans || plans.length === 0)" class="empty-state">
          <ion-icon :icon="calendarOutline" class="empty-icon" />
          <h2>No Plans Yet</h2>
          <p>Create your first workout plan to organize your training!</p>
          <ion-button @click="handleAddPlan" color="primary">
            <ion-icon :icon="addOutline" slot="start" />
            <span class="button-text">Create Plan</span>
          </ion-button>
        </div>

        <!-- Plans List -->
        <div v-else-if="plans && plans.length > 0" class="plans-container">
          <!-- Active Plan Section -->
          <div v-if="activePlan" class="plan-section">
            <div class="section-header">
              <span class="section-title">Active Plan</span>
              <ion-icon :icon="informationCircleOutline" class="info-icon" />
            </div>
            
            <div class="plan-card">
              <!-- Plan Header -->
              <div class="plan-header">
                <div class="plan-title-section">
                  <h3 class="plan-name">{{ activePlan.name }}</h3>
                  <p v-if="activePlan.description" class="plan-description">{{ activePlan.description }}</p>
                </div>
                <ion-button 
                  size="small"
                  color="primary"
                  fill="clear"
                  @click="handleShowPlanMenu(activePlan)"
                >
                  <ion-icon :icon="ellipsisHorizontal" slot="icon-only" />
                </ion-button>
              </div>
              
              <!-- Plan Badges -->
              <div class="plan-badges">
                <span class="badge badge-primary">
                  {{ getTemplateCount(activePlan) }} WORKOUTS
                </span>
                <span v-if="activePlan.is_active" class="badge badge-success">
                  ACTIVE
                </span>
              </div>
              
              <!-- Workout Templates List -->
              <div v-if="activePlan.workout_templates && activePlan.workout_templates.length > 0" class="templates-list">
                <div 
                  v-for="template in activePlan.workout_templates" 
                  :key="template.id"
                  class="template-item"
                  @click="handleEditWorkout(template.id)"
                >
                  <span class="template-name">{{ template.name }}</span>
                  <ion-button 
                    size="small"
                    color="primary"
                    fill="clear"
                    @click.stop="handleShowWorkoutMenu(template)"
                  >
                    <ion-icon :icon="ellipsisHorizontal" slot="icon-only" />
                  </ion-button>
                </div>
              </div>
              
              <!-- Empty Templates State -->
              <div v-else class="empty-templates">
                <p>No workout templates in this plan yet.</p>
                <ion-button size="small" fill="outline" @click="handleAddWorkout(activePlan.id)">
                  <ion-icon :icon="addOutline" slot="start" />
                  Add Workout
                </ion-button>
              </div>
            </div>
          </div>

          <!-- All Plans Section -->
          <div class="plan-section">
            <div class="section-header">
              <span class="section-title">All Plans</span>
            </div>
            
            <!-- Other Plans (non-active) -->
            <div 
              v-for="plan in inactivePlans" 
              :key="plan.id"
              class="plan-card"
            >
              <!-- Plan Header -->
              <div class="plan-header">
                <div class="plan-title-section">
                  <h3 class="plan-name">{{ plan.name }}</h3>
                  <p v-if="plan.description" class="plan-description">{{ plan.description }}</p>
                </div>
                <ion-button 
                size="small"
                color="primary"
                fill="clear"
                  @click="handleShowPlanMenu(plan)"
                >
                  <ion-icon :icon="ellipsisHorizontal" slot="icon-only" />
                </ion-button>
              </div>
              
              <!-- Plan Badges -->
              <div class="plan-badges">
                <span class="badge badge-secondary">
                  {{ getTemplateCount(plan) }} WORKOUTS
                </span>
              </div>
              
              <!-- Workout Templates List -->
              <div v-if="plan.workout_templates && plan.workout_templates.length > 0" class="templates-list">
                <div 
                  v-for="template in plan.workout_templates" 
                  :key="template.id"
                  class="template-item"
                  @click="handleEditWorkout(template.id)"
                >
                  <span class="template-name">{{ template.name }}</span>
                  <ion-button 
                    size="small"
                    color="primary"
                    fill="clear"
                    @click.stop="handleShowWorkoutMenu(template)"
                  >
                    <ion-icon :icon="ellipsisHorizontal" slot="icon-only" />
                  </ion-button>
                </div>
              </div>
              
              <!-- Empty Templates State -->
              <div v-else class="empty-templates">
                <p>No workout templates in this plan.</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons-row">
              <ion-button expand="block" fill="outline" @click="handleAddPlan">
                <ion-icon :icon="addOutline" slot="start" />
                <span class="button-text">Create New</span>
              </ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Plan Menu Action Sheet -->
    <ion-action-sheet
      :is-open="showPlanActionSheet"
      header="Plan Actions"
      :buttons="planActionSheetButtons"
      @didDismiss="showPlanActionSheet = false"
    ></ion-action-sheet>

    <!-- Workout Template Menu Action Sheet -->
    <ion-action-sheet
      :is-open="showWorkoutActionSheet"
      header="Workout Actions"
      :buttons="workoutActionSheetButtons"
      @didDismiss="showWorkoutActionSheet = false"
    ></ion-action-sheet>
  </ion-page>
</template>

<script>
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  alertController,
  IonActionSheet
} from '@ionic/vue'
import { 
  addOutline,
  calendarOutline,
  createOutline,
  trashOutline,
  ellipsisHorizontal,
  checkmarkOutline,
  closeOutline,
  informationCircleOutline
} from 'ionicons/icons'
import { onMounted, watch, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlans } from '../composables/usePlans'
import { useWorkouts } from '../composables/useWorkouts'

export default {
  name: 'PlansList',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonActionSheet
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { plans, loading, fetchPlans, deletePlan, updatePlan } = usePlans()
    const { deleteWorkout } = useWorkouts()
    
    // Plan action sheet state
    const showPlanActionSheet = ref(false)
    const menuPlan = ref(null)
    
    // Workout action sheet state
    const showWorkoutActionSheet = ref(false)
    const menuWorkout = ref(null)
    
    // Computed: Active plan
    const activePlan = computed(() => {
      return plans.value?.find(p => p.is_active) || null
    })
    
    // Computed: Inactive plans
    const inactivePlans = computed(() => {
      return plans.value?.filter(p => !p.is_active) || []
    })
    
    // Handle show plan menu
    const handleShowPlanMenu = (plan) => {
      menuPlan.value = plan
      showPlanActionSheet.value = true
    }
    
    // Handle show workout menu
    const handleShowWorkoutMenu = (workout) => {
      menuWorkout.value = workout
      showWorkoutActionSheet.value = true
    }

    // Plan action sheet buttons
    const planActionSheetButtons = computed(() => {
      const buttons = [
        {
          text: 'Add Workout',
          icon: addOutline,
          handler: () => {
            if (menuPlan.value) {
              handleAddWorkout(menuPlan.value.id)
            }
          }
        },
        {
          text: 'Edit',
          icon: createOutline,
          handler: () => {
            if (menuPlan.value) {
              handleEditPlan(menuPlan.value.id)
            }
          }
        }
      ]
      
      // Add activate/deactivate button
      if (menuPlan.value) {
        if (menuPlan.value.is_active) {
          buttons.push({
            text: 'Deactivate',
            icon: closeOutline,
            handler: async () => {
              if (menuPlan.value) {
                await handleToggleActive(menuPlan.value, false)
              }
            }
          })
        } else {
          buttons.push({
            text: 'Activate',
            icon: checkmarkOutline,
            handler: async () => {
              if (menuPlan.value) {
                await handleToggleActive(menuPlan.value, true)
              }
            }
          })
        }
      }
      
      buttons.push({
        text: 'Delete',
        icon: trashOutline,
        role: 'destructive',
        handler: async () => {
          if (menuPlan.value) {
            await handleDeletePlanClick(menuPlan.value)
          }
        }
      })
      
      buttons.push({
        text: 'Cancel',
        role: 'cancel'
      })
      
      return buttons
    })
    
    // Workout action sheet buttons
    const workoutActionSheetButtons = computed(() => [
      {
        text: 'Edit',
        icon: createOutline,
        handler: () => {
          if (menuWorkout.value) {
            handleEditWorkout(menuWorkout.value.id)
          }
        }
      },
      {
        text: 'Delete',
        icon: trashOutline,
        role: 'destructive',
        handler: async () => {
          if (menuWorkout.value) {
            await handleDeleteWorkoutClick(menuWorkout.value)
          }
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
    ])

    // Fetch plans function
    const loadPlans = async () => {
      try {
        await fetchPlans()
      } catch (error) {
        console.error('PlansList: Error fetching plans:', error)
      }
    }

    // Fetch plans on mount
    onMounted(() => {
      loadPlans()
    })

    // Refetch plans when route changes
    watch(() => route.path, (newPath) => {
      if (newPath === '/tabs/plans') {
        loadPlans()
      }
    })

    // Handle refresh
    const handleRefresh = async (event) => {
      try {
        await fetchPlans()
      } catch (error) {
        // Error already handled in composable
      } finally {
        event.target.complete()
      }
    }

    // Navigate to add plan
    const handleAddPlan = () => {
      router.push('/tabs/plans/new')
    }

    // Navigate to edit plan
    const handleEditPlan = (id) => {
      router.push(`/tabs/plans/${id}/edit`)
    }
    
    // Navigate to edit workout
    const handleEditWorkout = (id) => {
      router.push(`/tabs/workouts/${id}/edit`)
    }
    
    // Navigate to add workout (with pre-selected plan)
    const handleAddWorkout = (planId) => {
      router.push(`/tabs/workouts/new?plan_id=${planId}`)
    }

    // Handle toggle active
    const handleToggleActive = async (plan, isActive) => {
      try {
        await updatePlan(plan.id, { is_active: isActive })
        showPlanActionSheet.value = false
      } catch (error) {
        console.error('Failed to toggle plan active status:', error)
      }
    }

    // Handle delete plan click
    const handleDeletePlanClick = async (plan) => {
      const templateCount = getTemplateCount(plan)
      const alert = await alertController.create({
        header: 'Delete Plan',
        message: templateCount > 0
          ? `Are you sure you want to delete "${plan.name}"? This will also delete all ${templateCount} workout template${templateCount === 1 ? '' : 's'} in this plan. This action cannot be undone.`
          : `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: async () => {
              try {
                await deletePlan(plan.id)
                showPlanActionSheet.value = false
              } catch (error) {
                // Error already handled in composable
              }
            }
          }
        ]
      })

      await alert.present()
    }
    
    // Handle delete workout click
    const handleDeleteWorkoutClick = async (workout) => {
      const alert = await alertController.create({
        header: 'Delete Workout',
        message: `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`,
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: async () => {
              try {
                await deleteWorkout(workout.id)
                showWorkoutActionSheet.value = false
                // Refresh plans to update the list
                await fetchPlans()
              } catch (error) {
                // Error already handled in composable
              }
            }
          }
        ]
      })

      await alert.present()
    }

    // Get template count for a plan
    const getTemplateCount = (plan) => {
      return plan.workout_templates?.length || 0
    }

    return {
      plans,
      loading,
      activePlan,
      inactivePlans,
      handleRefresh,
      handleAddPlan,
      handleEditPlan,
      handleEditWorkout,
      handleAddWorkout,
      handleDeletePlanClick,
      handleDeleteWorkoutClick,
      handleShowPlanMenu,
      handleShowWorkoutMenu,
      handleToggleActive,
      showPlanActionSheet,
      showWorkoutActionSheet,
      planActionSheetButtons,
      workoutActionSheetButtons,
      getTemplateCount,
      // Icons
      addOutline,
      calendarOutline,
      createOutline,
      trashOutline,
      ellipsisHorizontal,
      checkmarkOutline,
      closeOutline,
      informationCircleOutline
    }
  }
}
</script>

<style scoped>
.plans-list-page {
  --background: var(--brand-background-color, #f5f7fa);
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

.plans-list-content {
  --background: var(--brand-background-color, #f5f7fa);
}

.container {
  padding: 16px;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 24px;
}

.loading-container ion-spinner {
  --color: var(--brand-primary);
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
}

.loading-container p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  color: var(--brand-text-secondary-color);
  margin: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 50vh;
  padding: 60px 24px;
  background: var(--brand-card-background-color, #fff);
  border-radius: 20px;
}

.empty-icon {
  font-size: 64px;
  color: var(--brand-gray-40, #9ca3af);
  margin-bottom: 16px;
}

.empty-state h2 {
  font-family: var(--brand-font-family);
  font-weight: 600;
  font-size: var(--brand-font-size-xl);
  color: var(--brand-text-primary-color);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0 0 24px 0;
}

.empty-state ion-button {
  --background: var(--brand-primary);
  --border-radius: var(--brand-button-border-radius, 16px);
  font-family: var(--brand-font-family);
  font-weight: 600;
}

/* Plans Container */
.plans-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Section Styles */
.plan-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-left: 4px;
}

.section-title {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  font-weight: 600;
  color: var(--brand-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-icon {
  font-size: 16px;
  color: var(--brand-gray-40);
}

/* Plan Card */
.plan-card {
  background: var(--brand-card-background-color, #fff);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.plan-title-section {
  flex: 1;
  min-width: 0;
}

.plan-name {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-lg);
  font-weight: 700;
  color: var(--brand-text-primary-color);
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.plan-description {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-secondary-color);
  margin: 0;
}

.plan-header ion-button {
  --color: var(--brand-gray-50);
  margin: -8px -8px 0 0;
}

/* Plan Badges */
.plan-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.badge {
  display: inline-block;
  font-family: var(--brand-font-family);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 6px;
}

.badge-primary {
  background: rgba(249, 115, 22, 0.12);
  color: var(--brand-primary);
}

.badge-secondary {
  background: var(--brand-gray-10, #f3f4f6);
  color: var(--brand-gray-50, #6b7280);
}

.badge-success {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

/* Templates List */
.templates-list {
  border-top: 1px solid var(--brand-gray-20, #e5e7eb);
  padding-top: 8px;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--brand-gray-15, #f0f0f0);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.template-item:last-child {
  border-bottom: none;
}

.template-item:hover {
  background-color: var(--brand-gray-10, #f9fafb);
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 8px;
}

.template-item:active {
  background-color: var(--brand-gray-15, #f3f4f6);
}

.template-name {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-base);
  font-weight: 500;
  color: var(--brand-text-primary-color);
}

.template-item ion-button {
  --color: var(--brand-gray-40);
  margin: -8px -8px -8px 0;
}

/* Empty Templates */
.empty-templates {
  text-align: center;
  padding: 16px 0;
  border-top: 1px solid var(--brand-gray-20, #e5e7eb);
}

.empty-templates p {
  font-family: var(--brand-font-family);
  font-size: var(--brand-font-size-sm);
  color: var(--brand-text-tertiary-color);
  margin: 0 0 12px 0;
}

.empty-templates ion-button {
  --border-radius: 12px;
  font-family: var(--brand-font-family);
  font-weight: 600;
}

/* Action Buttons Row */
.action-buttons-row {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-buttons-row ion-button {
  flex: 1;
  --border-radius: 12px;
  font-family: var(--brand-font-family);
  font-weight: 600;
  --color: var(--brand-primary);
  --border-color: var(--brand-gray-20);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .plans-list-page {
    --background: var(--brand-background-color, #121212);
  }
  
  .plans-list-content {
    --background: var(--brand-background-color, #121212);
  }
  
  .empty-state,
  .plan-card {
    background: var(--brand-card-background-color, #1f1f1f);
  }
  
  .templates-list {
    border-top-color: var(--brand-gray-30, #3f3f3f);
  }
  
  .template-item {
    border-bottom-color: var(--brand-gray-25, #2a2a2a);
  }
  
  .template-item:hover {
    background-color: var(--brand-gray-20, #2a2a2a);
  }
  
  .badge-secondary {
    background: var(--brand-gray-20, #2a2a2a);
    color: var(--brand-gray-60, #9ca3af);
  }
  
  .empty-templates {
    border-top-color: var(--brand-gray-30, #3f3f3f);
  }
}
</style>
