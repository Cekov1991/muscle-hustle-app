<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="homeOutline" />
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>
        
        <ion-tab-button @click="comingSoon" tab="workouts">
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
  --background: var(--ion-color-light);
  --color: var(--ion-color-medium);
  --color-selected: var(--ion-color-primary);
  border-top: 1px solid var(--ion-color-light-shade);
}

ion-tab-button {
  --color: var(--ion-color-medium);
  --color-selected: var(--ion-color-primary);
}
</style>

