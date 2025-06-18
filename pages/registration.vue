<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
        <p class="text-center text-gray-600 mb-8">
          Create a new account with your email and password.
        </p>
        <RegistrationForm />
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
  import RegistrationForm from '~/components/registration/registrationForm.vue';
  </script>
  