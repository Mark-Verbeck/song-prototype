// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['@pinia/nuxt', '@nuxtjs/supabase'],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }
  },
  supabase: {
    // The module will automatically pick up `supabaseUrl` and `supabaseKey`
    // from `runtimeConfig.public` if they are named this way.
    // However, you can explicitly define them here for clarity or custom names:
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,

    // Configure authentication redirects
    // This makes the module redirect users automatically after login/logout, etc.
    // Crucially, set `redirect` to `false` if you want to manually handle redirects
    // in your authStore's onAuthStateChange or component logic.
    // If you enable this to `true`, the module will handle the /confirm flow.
    redirect: false,
    // Set to true if you want the module to automatically redirect
    // users to `redirect.login` when not authenticated.
    // If set to false, you'll manage authentication checks and redirects yourself (e.g., via middleware).
    // For your current setup with auth middleware, you might set this to false,
    // but enabling it can simplify things. Let's start with false for now, aligning with your middleware.
    // If you switch `redirect: true` here, you might adjust/remove your custom middleware/redirects.
    // example: redirect: true, 

    // You can also add client options here, e.g., for custom headers or schema
    clientOptions: {
      db: { schema: 'public' },
    },
  },
  app: {
    // This tells Nuxt where your app is hosted relative to the domain root.
    // For GitHub Pages, it's typically `/repository-name/`.
    // Ensure `NUXT_APP_BASE_URL` env variable is set in GitHub Actions.
    // Use an environment variable here, so it's flexible for dev/prod.
    baseURL: process.env.NUXT_APP_BASE_URL || '/', 
    buildAssetsDir: '/_nuxt/', // Default, but ensure it's here
  }  
})