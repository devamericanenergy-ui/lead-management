import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'AE Leads',
        short_name: 'AE Leads',
        description: 'Lead management for American Energy salespeople',
        theme_color: '#0f6e56',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/images.png',
            sizes: 'any',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/images.png',
            sizes: 'any',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // Caches the app shell and assets for offline viewing
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jsx,json}'],
        // Cache strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 }
            }
          }
        ]
      }
    })
  ]
})
