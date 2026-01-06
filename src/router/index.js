import { createRouter, createWebHistory } from '@ionic/vue-router'
import { useAuth } from '../features/auth/composables/useAuth'
import { appConfig } from '../config/app'

const routes = [
  {
    path: '/',
    redirect: '/tabs/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../features/auth/views/Login.vue'),
    meta: { 
      requiresGuest: true,
      title: 'Sign In'
    }
  },
  {
    path: '/tabs/',
    component: () => import('../views/TabsLayout.vue'),
    meta: { 
      requiresAuth: true 
    },
    children: [
      {
        path: '',
        redirect: '/tabs/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../features/dashboard/views/Home.vue'),
        meta: { 
          title: 'Dashboard'
        }
      },
      {
        path: 'workouts',
        redirect: '/tabs/plans'
      },
      {
        path: 'workouts/new',
        name: 'WorkoutNew',
        component: () => import('../features/workouts/views/WorkoutForm.vue'),
        meta: { 
          title: 'New Workout'
        }
      },
      {
        path: 'workouts/:id/edit',
        name: 'WorkoutEdit',
        component: () => import('../features/workouts/views/WorkoutForm.vue'),
        meta: { 
          title: 'Edit Workout'
        }
      },
      {
        path: 'plans',
        name: 'Plans',
        component: () => import('../features/workouts/views/PlansList.vue'),
        meta: { 
          title: 'Plans'
        }
      },
      {
        path: 'plans/new',
        name: 'PlanNew',
        component: () => import('../features/workouts/views/PlanForm.vue'),
        meta: { 
          title: 'New Plan'
        }
      },
      {
        path: 'plans/:id/edit',
        name: 'PlanEdit',
        component: () => import('../features/workouts/views/PlanForm.vue'),
        meta: { 
          title: 'Edit Plan'
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../features/profile/views/Profile.vue'),
        meta: { 
          title: 'Profile'
        }
      },
      {
        path: 'workout-session/:id',
        name: 'WorkoutSession',
        component: () => import('../features/workouts/views/WorkoutSession.vue'),
        meta: { 
          title: 'Workout'
        }
      },
      {
        path: 'exercises/:id',
        name: 'ExerciseDetail',
        component: () => import('../features/workouts/views/ExerciseDetail.vue'),
        meta: {
          title: 'Exercise Details'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/tabs/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, isInitialized } = useAuth()
  
  // Wait for auth initialization if needed
  if (!isInitialized.value) {
    // Wait a bit for auth to initialize
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} | ${appConfig.name}`
  }
  
  // Handle authentication requirements
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Route requires authentication but user is not authenticated
    console.log('Route requires auth, redirecting to login')
    next({ name: 'Login', replace: true })
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    // Route requires guest but user is authenticated
    console.log('User is authenticated, redirecting to dashboard')
    next({ path: '/tabs/dashboard', replace: true })
  } else {
    // Route is allowed
    next()
  }
})

// Global error handling for route navigation
router.onError((error) => {
  console.error('Router error:', error)
})

export default router
