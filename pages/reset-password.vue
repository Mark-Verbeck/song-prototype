<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Set New Password</h2>
        <p class="text-center text-gray-600 mb-8">
          Please enter and confirm your new password.
        </p>
  
        <form @submit.prevent="handlePasswordUpdate" class="space-y-6">
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              id="new-password"
              type="password"
              v-model="newPassword"
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
            <p class="mt-1 text-xs text-gray-500">
              Minimum 6 characters.
            </p>
          </div>
  
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              v-model="confirmPassword"
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
  
          <div v-if="updateMessage" class="p-3 rounded-md text-sm font-medium text-center"
               :class="{
                 'bg-green-100 text-green-700': isSuccess,
                 'bg-red-100 text-red-700': !isSuccess
               }">
            {{ updateMessage }}
          </div>
  
          <div>
            <button
              type="submit"
              :disabled="updating"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                     bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors duration-200"
              :class="{ 'opacity-50 cursor-not-allowed': updating }"
            >
              {{ updating ? 'Updating Password...' : 'Update Password' }}
            </button>
          </div>
        </form>
  
        <p class="mt-6 text-center text-sm text-gray-600">
          <NuxtLink to="/sign-in" class="font-medium text-blue-600 hover:text-blue-500">
            Return to Sign In
          </NuxtLink>
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useAuthStore } from '~/store/authStore';

  const authStore = useAuthStore()
  const newPassword = ref('');
  const confirmPassword = ref('');
  const updating = ref(false);
  const updateMessage = ref('');
  const isSuccess = ref(true);
  
  
  const handlePasswordUpdate = async () => {
   authStore.resetPassword(newPassword.value)
  };
  </script>