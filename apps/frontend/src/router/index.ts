import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/index';
import HomeView from '../features/home/views/HomeView.vue';
import LoginView from '../features/auth/views/LoginView.vue';
import SignupView from '../features/auth/views/SignupView.vue';
import ForgotPasswordView from '../features/auth/views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
      meta: { requiresGuest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { requiresGuest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: { requiresGuest: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

// Route guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Wait for auth store to be initialized if it hasn't been yet
  if (!authStore.getIsInitialized) {
    await authStore.initializeFromStorage();
  }
  
  const isAuthenticated = authStore.isAuthenticated;

  // Routes that require guest access (not logged in)
  if (to.meta.requiresGuest && isAuthenticated) {
    // If user is logged in and tries to access auth pages, redirect to home
    next('/');
    return;
  }

  // Routes that require authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // If user is not logged in and tries to access protected pages, redirect to login with redirect URL
    const redirectTo = encodeURIComponent(to.fullPath);
    next(`/login?redirectTo=${redirectTo}`);
    return;
  }

  next();
});

export default router;
