<template>
    <form @submit.prevent="handlePasswordReset" class="space-y-6">
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
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          :class="{ 'opacity-50 cursor-not-allowed': resetting }"
        >
          {{ resetting ? 'Sending Link...' : 'Send Reset Email' }}
        </button>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'; 
  import { useAuthStore } from '~/store/authStore'; // Correct path to 'stores'
  
  const authStore = useAuthStore();
  const email = ref('');
  const resetting = ref(false);
  const resetMessage = ref('');
  const isSuccess = ref(true);
  
  const handlePasswordReset = async () => {
    resetting.value = true;
    resetMessage.value = ''; // Clear previous messages
    isSuccess.value = true; // Optimistic success
  
    try {
      // Call the authStore action. It will return the error or success
      const { error } = await authStore.sendResetPasswordEmail(email.value);
  
      if (error) {
        console.error('Password reset failed:', error.message);
        resetMessage.value = error.message;
        isSuccess.value = false;
      } else {
        resetMessage.value = 'Password reset email sent! Please check your inbox.';
        isSuccess.value = true;
        email.value = ''; // Clear the email field on success
      }
    } catch (err: any) {
      console.error('Unexpected password reset error:', err);
      resetMessage.value = `An unexpected error occurred: ${err.message || 'Please try again.'}`;
      isSuccess.value = false;
    } finally {
      resetting.value = false;
    }
  };
  </script>
  