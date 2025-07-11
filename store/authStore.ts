import { defineStore } from 'pinia'
import { ref, watch } from 'vue' 

// Import composables provided by @nuxtjs/supabase and Nuxt itself
import { useSupabaseClient, useSupabaseUser } from '#imports' // Module's composables
import { useRouter } from '#app' // Nuxt's useRouter (from #app)
import { useSongComparisonStore } from './songComparisonStore'
import { useSongStore } from './songStore'


export const useAuthStore = defineStore('authStore', () => {
    // These composables provide the initialized Supabase client and reactive user state
    // from the @nuxtjs/supabase module.
    const supabase = useSupabaseClient()
    const user = useSupabaseUser() // This is a reactive Ref<User | null> managed by the module

    const router = useRouter();
     // Nuxt's useRouter instance

    // Reactive states derived from the module's `user` composable
    // These will now be kept in sync by the watcher below.
    const authenticatedUser = ref(!!user.value) // Initial state based on module's user
    const accessToken = ref<string | null>(user.value?.id || null) // Initial token
    const refreshToken = ref<string | null>(null) // Module handles refresh token internally
    const signInError = ref<string | null>(null)
    // The `userId` ref from your previous version is now implicitly handled by `user.value?.id`
    // which is more robust and directly tied to the module's user state.

    // Watcher to react to changes in the @nuxtjs/supabase user composable
    // This synchronizes your store's `authenticatedUser` and token refs,
    // and handles routing based on authentication state.
    watch(user, (newUser) => {
        console.log("CURRENT ROUTE", router.currentRoute.value.path)

        authenticatedUser.value = !!newUser;
        accessToken.value = newUser?.id || null;
        // user.value = newUser
        // The module handles refreshing tokens behind the scenes.

        // Router pushes based on authentication state
        if (newUser) { // User is authenticated
            if (router.currentRoute.value.path !== '/dashboard/') {
                router.push('/dashboard/');
            }
        } else { // User is not authenticated
            // Only redirect if not already on an auth-related page
            const authPages = ['/sign-in/', '/register/', '/reset-password/', '/update-password/', '/']; // Include '/' if it's the signin/home page
            if (!authPages.includes(router.currentRoute.value.path)) {
                router.push('/sign-in/');
            }
        }
    }, { immediate: true }); // Run immediately on store creation to set initial state


    // --- Authentication Actions (now leverage the module's client) ---

    // `authenticateUser` and `deAuthenticateUser` are mostly redundant for core state changes
    // as `watch(user, ...)` now handles authentication state. They can remain for
    // conceptual clarity or to trigger explicit side effects (e.g., UI updates).
    const authenticateUser = () => {
        console.log('Auth Store: authenticateUser called. State is primarily managed by useSupabaseUser.');
    }
    const deAuthenticateUser = () => {
        console.log('Auth Store: deAuthenticateUser called. State is primarily managed by useSupabaseUser.');
    }

    async function signUpNewUser(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        console.log("DATA", data)
        console.log("ERROR", error)

        if (error) {
            console.error('Auth Store: SignUp error:', error.message);
            // DO NOT router.push here directly on error, let component handle feedback first
            return { data: null, error }; // Return the error
        }

        console.log('Auth Store: SignUp data:', data);
        // Do NOT router.push here directly on success. Let component handle it,
        // especially for email confirmation flows.
        return { data, error: null }; // Return success data
    }
    
    async function signInWithEmail(email: string, password: string) {
        signInError.value = null; // Clear previous errors
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.error('Auth Store: Supabase signInWithEmail error:', error.message);
            signInError.value = error.message;
            throw error;
        }
        
        // The `watch(user, ...)` handler above will automatically update state and redirect
        console.log('Auth Store: Sign-in request sent. Session will be handled by useSupabaseUser watch.');
        return data; // Return data for component to use
    }

    async function sendResetPasswordEmail(email: string) {
        signInError.value = null;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `/song-prototype/reset-password?password=reset`,
        });
        if (error) {
            signInError.value = error.message;
            // Do NOT throw here if you want the component to handle the return value
            return { error }; // Return the error
        }
        console.log('Auth Store: Password reset email request sent.');
        return { error: null }; // Return success (no error)
    }

    async function resetPassword(password: string) {
        supabase.auth.signInWithIdToken
        signInError.value = null;
        const { error } = await supabase.auth.updateUser({ password: password });
        if (error) {
            signInError.value = error.message;
            throw error;
        }
        console.log('Auth Store: Password updated successfully.');
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Auth Store: Error signing out:', error.message);
          throw error;
        } else {
          console.log('Auth Store: User signed out successfully');
        }
    }
      
    return {
        authenticatedUser,
        user, // EXPOSE THE REACTIVE USER OBJECT from @nuxtjs/supabase
        accessToken, // Derived from user.value?.jwt
        refreshToken, // Module handles this internally
        signInError,
        supabase, // EXPOSE THE CLIENT for direct DB operations elsewhere (e.g., uploadStore)
        authenticateUser, // Retained for compatibility/explicit triggers
        deAuthenticateUser, // Retained for compatibility/explicit triggers
        signUpNewUser,
        signInWithEmail,
        signOut,
        sendResetPasswordEmail,
        resetPassword
    }
});
