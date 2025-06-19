<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Sign In</h2>
        <p class="text-center text-gray-600 mb-8">
          Enter your credentials to access your account.
        </p>
        <SignInForm />
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
  import SignInForm from '~/components/signIn/signInForm.vue';
  </script>
  