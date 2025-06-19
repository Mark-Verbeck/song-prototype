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
  import { onMounted } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute
import { useAuthStore } from '~/store/authStore'; 

const route = useRoute(); // Access the current route object
const authStore = useAuthStore(); // Access the auth store

// On mounted, check for access_token and refresh_token in the URL query and try to set the session
onMounted(async () => {
  // Destructure access_token, refresh_token, and type from route.query
  const { access_token, refresh_token, type } = route.query;

  console.log('UpdatePasswordPage: OnMounted - checking URL for session tokens.');
  console.log('UpdatePasswordPage: URL Query - access_token:', access_token, 'refresh_token:', refresh_token, 'type:', type);

  // If access_token and refresh_token are present, and it's a 'recovery' type
  if (access_token && refresh_token && type === 'recovery') {
    console.log('UpdatePasswordPage: Detected recovery flow with access_token and refresh_token. Trying to set session.');
    try {
      // Explicitly set the session using the tokens from the URL
      const { data, error } = await authStore.supabase.auth.setSession({
        access_token: access_token as string,
        refresh_token: refresh_token as string,
      });

      if (error) {
        console.error('UpdatePasswordPage: Error setting session from URL tokens:', error.message);
        // You might want to display an error to the user or redirect if the tokens are invalid
      } else if (data.session) {
        console.log('UpdatePasswordPage: Session successfully set from URL tokens. User ID:', data.session.user?.id);
        // At this point, the user should be authenticated for the PasswordUpdateForm to work
      } else {
        console.warn('UpdatePasswordPage: setSession processed, but no session data returned. User might need to re-request reset.');
      }
    } catch (err) {
      console.error('UpdatePasswordPage: Unexpected error during setSession:', err);
    }
  } else {
    console.log('UpdatePasswordPage: No valid access_token/refresh_token/type=recovery found in URL query.');
    // If no valid tokens are found, the user might need to re-request the password reset.
    // You could redirect them to the /reset-password page or display a message.
  }
});
  </script>