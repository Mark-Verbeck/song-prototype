<template>
    <nav class="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <NuxtLink to="/" class="text-white text-2xl font-bold tracking-tight">
          My Song App
        </NuxtLink>
        <div class="flex items-center space-x-4">
          <button
            v-if="authStore.authenticatedUser"
            @click="handleLogout"
            class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md
                   shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '~/store/authStore'; 
  
  const authStore = useAuthStore();
  const router = useRouter();
  
  const handleLogout = () => {
    authStore.signOut();
  };
  </script>
  