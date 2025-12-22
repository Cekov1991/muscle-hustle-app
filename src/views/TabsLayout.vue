<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="homeOutline" />
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="workouts" href="/tabs/workouts">
          <ion-icon :icon="barbellOutline" />
          <ion-label>Workouts</ion-label>
        </ion-tab-button>
        
        <ion-tab-button @click="comingSoon" tab="progress">
          <ion-icon :icon="statsChartOutline" />
          <ion-label>Progress</ion-label>
        </ion-tab-button>
        
        <ion-tab-button @click="comingSoon" tab="profile">
          <ion-icon :icon="personOutline" />
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script>
import { 
  IonPage, 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel, 
  IonRouterOutlet 
} from '@ionic/vue'
import { 
  homeOutline, 
  barbellOutline, 
  statsChartOutline, 
  personOutline 
} from 'ionicons/icons'
import { useToast } from '../shared/composables/useToast'

export default {
  name: 'TabsLayout',
  components: {
    IonPage,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonRouterOutlet
  },
  setup() {
    const { showInfo } = useToast()
    
    const comingSoon = async () => {
      await showInfo('This feature is coming soon!')
    }
    
    return {
      homeOutline,
      barbellOutline,
      statsChartOutline,
      personOutline,
      comingSoon
    }
  }
}
</script>

<style scoped>
ion-tab-bar {
  --background: var(--brand-background-color);
  --color: var(--brand-gray-40);
  --color-selected: var(--brand-primary);
  border-top: none;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  padding-top: 8px;
  height: 80px;
}

ion-tab-button {
  --color: var(--brand-gray-40);
  --color-selected: var(--brand-primary);
  font-family: var(--brand-font-family);
}

ion-tab-button ion-label {
  font-size: var(--brand-font-size-xs);
  font-weight: 500;
  margin-top: 4px;
}

ion-tab-button ion-icon {
  font-size: var(--brand-font-size-2xl);
}
</style>

