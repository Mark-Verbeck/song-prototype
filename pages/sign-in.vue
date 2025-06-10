<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Sign In</h2>
        <p class="text-center text-gray-600 mb-8">
          Enter your credentials to access your account.
        </p>
  
        <form @submit.prevent="handleSignIn" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              id="email"
              type="email"
              v-model="email"
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
  
          <div v-if="authStore.signInError" class="p-3 rounded-md text-sm font-medium text-center" :class="'bg-red-100 text-red-700'">
            {{ authStore.signInError }}
          </div>
          <div>
            <button
              type="submit"
              :disabled="signingIn"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                     bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors duration-200"
              :class="{ 'opacity-50 cursor-not-allowed': signingIn }"
            >
              {{ signingIn ? 'Signing In...' : 'Sign In' }}
            </button>
          </div>
        </form>
  
        <p class="mt-6 text-center text-sm text-gray-600">
          Don't have an account?
          <NuxtLink to="/registration" class="font-medium text-indigo-600 hover:text-indigo-500">
            Register
          </NuxtLink>
          <NuxtLink to="/reset-password-email" class="font-medium text-indigo-600 hover:text-indigo-500 block">
            Reset Password
          </NuxtLink>
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '~/store/authStore'; 
  // Reactive states for form inputs and UI feedback
  const email = ref('');
  const password = ref('');
  const signingIn = ref(false);
  
  // Pinia store and Nuxt router
  const authStore = useAuthStore();
  const handleSignIn = async () => {
    console.log(authStore.signInError)
   authStore.signInWithEmail(email.value, password.value)
  };
  </script>
  