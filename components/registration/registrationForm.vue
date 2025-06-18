<template>
    <form @submit.prevent="handleRegistration" class="space-y-6">
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
  
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="••••••••"
        />
        <p class="mt-1 text-xs text-gray-500">
          Minimum 6 characters.
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
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          :class="{ 'opacity-50 cursor-not-allowed': registering }"
        >
          {{ registering ? 'Registering...' : 'Register' }}
        </button>
      </div>
    </form>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useAuthStore } from '~/store/authStore'; // Correct path to 'stores'
  
  const authStore = useAuthStore();
  
  const email = ref('');
  const password = ref('');
  const registering = ref(false);
  const registrationMessage = ref('');
  const isSuccess = ref(true);
  
  // Define emits for the parent component to react to registration success
  const emit = defineEmits(['registered-success', 'registered-failure']);
  
  const handleRegistration = async () => {
    registering.value = true;
    registrationMessage.value = ''; // Clear previous messages
    isSuccess.value = true; // Optimistic success
  
    try {
      const { data, error } = await authStore.signUpNewUser(email.value, password.value);
      
      if (error) {
        console.error('Registration failed:', error.message);
        registrationMessage.value = error.message;
        if (error.message.includes('User already registered')) {
          registrationMessage.value = 'This email is already registered. Please sign in or use a different email.';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          registrationMessage.value = 'Password must be at least 6 characters long.';
        }
        isSuccess.value = false;
        emit('registered-failure', error); // Emit failure event
      } else if (data && data.user) {
        // Successful registration, user might be signed in directly or needs email confirmation
        registrationMessage.value = 'Registration successful! Please check your email to confirm your account.';
        if (data.user.identities?.length === 0) { // Using optional chaining for safety
          registrationMessage.value = 'Account already exists! Please sign in!';
        }
        isSuccess.value = true;
        // Clear fields on success
        email.value = '';
        password.value = '';
        emit('registered-success', data); // Emit success event with data
      } else if (data && !data.user && !data.session) {
        // This case typically means email confirmation is required, and no session is returned immediately
        registrationMessage.value = 'Registration successful! A confirmation email has been sent. Please verify your email to sign in.';
        isSuccess.value = true;
        email.value = '';
        password.value = '';
        emit('registered-success', data); // Emit success event
      } else {
        registrationMessage.value = 'Registration completed, but no user or session data returned. This might require email confirmation.';
        isSuccess.value = false; // Treat as a warning/error for user
        emit('registered-failure', new Error(registrationMessage.value)); // Emit failure
      }
    } catch (err: any) {
      console.error('Unexpected registration error:', err);
      registrationMessage.value = `An unexpected error occurred during registration: ${err.message || 'Please try again.'}`;
      isSuccess.value = false;
      emit('registered-failure', err); // Emit unexpected error
    } finally {
      registering.value = false;
    }
  };
  </script>
  
  <style scoped>
  /* No specific scoped styles needed, as Tailwind handles utility classes */
  </style>
  