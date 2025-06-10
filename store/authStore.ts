import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createClient } from '@supabase/supabase-js'

export const useAuthStore = defineStore('authStore', () => {
    const config = useRuntimeConfig()
    const router = useRouter();
    const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
    const authenticatedUser: Ref<boolean> = ref(false)
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const signInError = ref<string | null>(null)

    const authenticateUser = () => {
        authenticatedUser.value = true
    }
    const deAuthenticateUser = () => {
        authenticatedUser.value = false
    }

    async function signUpNewUser(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        })
        router.push("/sign-in")
      }
    
    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            console.error('Supabase signInWithEmail error:', error.message)
            signInError.value = error.message
            throw error 
        }

        
        if (data.session) {
            accessToken.value = data.session.access_token
            refreshToken.value = data.session.refresh_token
            authenticateUser() 
            router.push('/dashboard')
        } else {
            console.warn('Sign-in successful, but no session returned. Might require email confirmation.')
        }
    }

    const sendResetPasswordEmail = async (email: string) => {
        const baseUrl = config.public.baseUrl;
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${baseUrl}/reset-password?password=reset`,
        });
    }

    const resetPassword = async (password: string) => {
        await supabase.auth.updateUser({ password: password })
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out:', error.message);
        } else {
          console.log('User signed out successfully');
        }
    }

    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Supabase auth state changed:', authenticatedUser.value)
        if (session) {
            authenticatedUser.value = true
            accessToken.value = session.access_token
            refreshToken.value = session.refresh_token
            router.push('/dashboard')
        } else {
            authenticatedUser.value = false
            accessToken.value = null
            refreshToken.value = null
            router.push('/sign-in')
        }
    })

      

    return {
        authenticatedUser,
        accessToken,
        refreshToken,
        signInError,
        authenticateUser,
        deAuthenticateUser,
        signUpNewUser,
        signInWithEmail,
        signOut,
        sendResetPasswordEmail,
        resetPassword
        
    }
})