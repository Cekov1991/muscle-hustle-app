<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>
        <div class="header-content">
          <img 
            v-if="logo" 
            :src="logo" 
            :alt="partnerName + ' Logo'"
            class="gym-logo"
          />
          <span v-else>{{ partnerName }}</span>
        </div>
      </ion-title>
      
      <!-- Optional slot for additional header content -->
      <div slot="end">
        <slot name="end"></slot>
      </div>
    </ion-toolbar>
  </ion-header>
</template>

<script>
import { IonHeader, IonToolbar, IonTitle } from '@ionic/vue'
import { useBranding } from '../composables/useBranding'

export default {
  name: 'AppHeader',
  components: {
    IonHeader,
    IonToolbar,
    IonTitle
  },
  setup() {
    const { logo, partnerName } = useBranding()
    
    return {
      logo,
      partnerName
    }
  }
}
</script>

<style scoped>
.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.gym-logo {
  max-height: 32px;
  width: auto;
  object-fit: contain;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .gym-logo {
    max-height: 28px;
  }
}
</style>
