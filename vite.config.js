import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AE Leads',
        short_name: 'AE Leads',
        description: 'Lead management for American Energy salespeople',
        theme_color: '#0f6e56',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Push notification handling gets added here later —
        // for now this just caches the app shell for offline viewing.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
