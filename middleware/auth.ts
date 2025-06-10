
import { useAuthStore } from '~/store/authStore';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  if (!authStore.authenticatedUser) {
    return navigateTo('/sign-in');
  }
});