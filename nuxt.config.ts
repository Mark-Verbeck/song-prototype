// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"; // Keep this import if you explicitly use it in vite.plugins

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  // Global CSS/TailwindCSS setup
  css: ['~/assets/css/main.css'], // Your main CSS file for Tailwind directives

  vite: {
    plugins: [
      // If you're using @nuxtjs/tailwindcss, this plugin might be redundant
      // as the module usually injects it. Keep if you have specific Vite/Tailwind needs.
      tailwindcss(), 
    ],
    // --- CRITICAL FIX: Explicitly set Vite's base URL ---
    // This ensures all built assets (JS, CSS, static files) correctly
    // resolve their paths relative to the GitHub Pages subpath.
    base: process.env.NUXT_APP_BASE_URL || '/', 
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/supabase',, // Ensure this is also listed as a module for full integration
  ],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000', // Your general app base URL for internal redirects
      NUXT_APP_BASE_URL: process.env.NUXT_APP_BASE_URL || '/', // Make available in client runtime
    }
  },

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: false, // You handle redirects via middleware/auth.ts
    // redirectOptions is removed, as redirect: false disables module's internal redirects.
    clientOptions: {
      db: { schema: 'public' },
    },
  },

  app: {
    // This is the primary base URL for ALL generated assets and internal router paths.
    // It should match your GitHub Pages repository name (e.g., '/song-prototype/').
    baseURL: process.env.NUXT_APP_BASE_URL || '/', 
    buildAssetsDir: '/_nuxt/', // Default Nuxt asset directory
  },
  
  // --- CRITICAL FIX: REMOVE router.options.base ---
  // This property caused a TypeScript error and is not the correct way to set
  // the router's base in Nuxt 3. app.baseURL handles this for routing.
  // router: {
  //   options: {
  //     base: process.env.NUXT_APP_BASE_URL || '/',
  //   },
  // },

  nitro: {
    // Optional: Prerendering can optimize static sites, but can also cause issues if not
    // all dynamic data is handled during build. Keep commented out for now if not needed.
    // prerender: {
    //   crawlLinks: true,
    //   routes: ['/', '/signin', '/register', '/reset-password', '/update-password', '/confirm'],
    // },
  }  
})
