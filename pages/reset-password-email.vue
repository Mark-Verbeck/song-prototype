<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
        <p class="text-center text-gray-600 mb-8">
          Enter your email address to receive a password reset link.
        </p>
  
        <form @submit.prevent="handlePasswordReset" class="space-y-6">
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
  
          <div v-if="resetMessage" class="p-3 rounded-md text-sm font-medium text-center"
               :class="{
                 'bg-green-100 text-green-700': isSuccess,
                 'bg-red-100 text-red-700': !isSuccess
               }">
            {{ resetMessage }}
          </div>
  
          <div>
            <button
              type="submit"
              :disabled="resetting"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                     bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                     transition-colors duration-200"
              :class="{ 'opacity-50 cursor-not-allowed': resetting }"
            >
              {{ resetting ? 'Sending Link...' : 'Send Reset Email' }}
            </button>
          </div>
        </form>
  
        <p class="mt-6 text-center text-sm text-gray-600">
          Remembered your password?
          <NuxtLink to="/sign-in" class="font-medium text-blue-600 hover:text-blue-500">
            Sign In
          </NuxtLink>
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'; 
  import { useAuthStore } from '~/store/authStore';

  const authStore = useAuthStore();
  const email = ref('');
  const resetting = ref(false);
  const resetMessage = ref('');
  const isSuccess = ref(true);
  
  const handlePasswordReset = async () => {
    authStore.sendResetPasswordEmail(email.value)
  };
  </script>