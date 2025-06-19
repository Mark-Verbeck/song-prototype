<template>
    <form @submit.prevent="handleSignIn" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="you@example.com"
        />
      </div>
  
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="••••••••"
        />
      </div>
  
      <!-- Display error message from authStore -->
      <div v-if="authStore.signInError" class="p-3 rounded-md text-sm font-medium text-center bg-red-100 text-red-700">
        {{ authStore.signInError }}
      </div>
  
      <div>
        <button
          type="submit"
          :disabled="signingIn"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          :class="{ 'opacity-50 cursor-not-allowed': signingIn }"
        >
          {{ signingIn ? 'Signing In...' : 'Sign In' }}
        </button>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'; // Only import if direct router use is needed.
  import { useAuthStore } from '~/store/authStore'; // Correct path to 'stores'
  
  // Local reactive states for form inputs and UI feedback
  const email = ref('');
  const password = ref('');
  const signingIn = ref(false); // Manages button loading state
  
  // Pinia store instance
  const authStore = useAuthStore();
  // Note: router is typically used in the parent page or authStore's watcher for redirects after auth.
  // If you need direct router pushes *within* this form, uncomment below:
  // const router = useRouter();
  
  const handleSignIn = async () => {
    signingIn.value = true; // Set loading state for the button
    authStore.signInError = null; // Clear previous error from store
  
    try {
      // Call the authStore action to sign in with email and password
      // authStore.signInWithEmail throws an error on failure, which is caught here.
      await authStore.signInWithEmail(email.value, password.value);
  
      // If sign-in is successful, authStore's watch(user) will handle the router push to dashboard
      // No explicit router.push here if you rely on the authStore's watcher.
  
    } catch (error: any) {
      // Error is already set in authStore.signInError by authStore.signInWithEmail
      console.error('Sign-in process caught in component:', error);
    } finally {
      signingIn.value = false; // Reset loading state
    }
  };
  </script>
  