<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
        <p class="text-center text-gray-600 mb-8">
          Create a new account with your email and password.
        </p>
  
        <form @submit.prevent="handleRegistration" class="space-y-6">
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
            <p class="mt-1 text-xs text-gray-500">
              Min 6 characters.
            </p>
          </div>
  
          <div v-if="registrationMessage" class="p-3 rounded-md text-sm font-medium text-center"
               :class="{
                 'bg-green-100 text-green-700': isSuccess,
                 'bg-red-100 text-red-700': !isSuccess
               }">
            {{ registrationMessage }}
          </div>
  
          <div>
            <button
              type="submit"
              :disabled="registering"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                     bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     transition-colors duration-200"
              :class="{ 'opacity-50 cursor-not-allowed': registering }"
            >
              {{ registering ? 'Registering...' : 'Register' }}
            </button>
          </div>
        </form>
  
        <p class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <NuxtLink to="/sign-in" class="font-medium text-blue-600 hover:text-blue-500">
            Sign In
          </NuxtLink>
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router'; 
  import { useAuthStore } from '~/store/authStore';

  const authStore = useAuthStore();
  
  const email = ref('');
  const password = ref('');
  const registering = ref(false);
  const registrationMessage = ref('');
  const isSuccess = ref(true);
  
  const router = useRouter();
  
  const handleRegistration = async () => {
   authStore.signUpNewUser(email.value, password.value)
  };
  </script>
  
  <style scoped>
  /* No specific scoped styles needed, as Tailwind handles utility classes */
  </style>
  