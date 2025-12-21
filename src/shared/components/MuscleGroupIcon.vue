<template>
  <div class="muscle-group-icon">
    <ion-icon :icon="getIconForCategory(category)" />
  </div>
</template>

<script>
import { IonIcon } from '@ionic/vue'
import {
  bodyOutline,
  fitnessOutline,
  barbellOutline,
  walkOutline
} from 'ionicons/icons'

export default {
  name: 'MuscleGroupIcon',
  components: {
    IonIcon
  },
  props: {
    category: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const getIconForCategory = (category) => {
      if (!category?.name) return fitnessOutline
      
      const categoryName = category.name.toLowerCase()
      
      // Map categories to appropriate icons
      if (categoryName.includes('chest')) return bodyOutline
      if (categoryName.includes('back')) return bodyOutline
      if (categoryName.includes('leg') || categoryName.includes('quadriceps') || categoryName.includes('hamstring') || categoryName.includes('calf')) return walkOutline
      if (categoryName.includes('shoulder') || categoryName.includes('arm') || categoryName.includes('bicep') || categoryName.includes('tricep')) return barbellOutline
      if (categoryName.includes('core') || categoryName.includes('ab')) return bodyOutline
      
      // Default icon
      return fitnessOutline
    }

    return {
      getIconForCategory,
      // Export icons for template
      bodyOutline,
      fitnessOutline,
      barbellOutline,
      walkOutline
    }
  }
}
</script>

<style scoped>
.muscle-group-icon {
  width: 48px;
  height: 48px;
  background: var(--ion-color-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-primary-contrast);
  font-size: 1.5rem;
  flex-shrink: 0;
}
</style>
