<template>
    <form @submit.prevent="handlePasswordUpdate" class="space-y-6">
      <div>
        <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
        <input
          id="new-password"
          type="password"
          v-model="newPassword"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          :class="{ 'opacity-50 cursor-not-allowed': updating }"
        >
          {{ updating ? 'Updating Password...' : 'Update Password' }}
        </button>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useAuthStore } from '~/store/authStore'; // Correct path to 'stores'
  import { useRouter } from 'vue-router'; // Needed for redirection
  
  const authStore = useAuthStore();
  const newPassword = ref('');
  const confirmPassword = ref('');
  const updating = ref(false);
  const updateMessage = ref('');
  const isSuccess = ref(true);
  
  const router = useRouter(); // Initialize router
  
  const handlePasswordUpdate = async () => {
    updating.value = true;
    updateMessage.value = ''; // Clear previous messages
    isSuccess.value = true; // Optimistic success
  
    // Basic client-side validation
    if (newPassword.value.length < 6) {
      updateMessage.value = 'Password must be at least 6 characters long.';
      isSuccess.value = false;
      updating.value = false;
      return;
    }
    if (newPassword.value !== confirmPassword.value) {
      updateMessage.value = 'Passwords do not match.';
      isSuccess.value = false;
      updating.value = false;
      return;
    }
  
    try {
      // Call the authStore action. It will throw an error on failure.
      await authStore.resetPassword(newPassword.value);
  
      updateMessage.value = 'Your password has been successfully updated! Redirecting to sign in...';
      isSuccess.value = true;
      
      // Redirect to sign-in page after a successful update
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
  
    } catch (error: any) {
      console.error('Password update failed:', error.message);
      updateMessage.value = `Error updating password: ${error.message || 'Please try again.'}`;
      isSuccess.value = false;
    } finally {
      updating.value = false;
    }
  };
  </script>
  