<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Set New Password</h2>
        <p class="text-center text-gray-600 mb-8">
          Please enter and confirm your new password.
        </p>
        <PasswordResetForm />
        <p class="mt-6 text-center text-sm text-gray-600">
          <NuxtLink to="/sign-in" class="font-medium text-blue-600 hover:text-blue-500">
            Return to Sign In
          </NuxtLink>
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import PasswordResetForm from '~/components/resetPassword/passwordResetForm.vue';
  </script>