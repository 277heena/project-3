import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: {
      name: 'ArchConnect', short_name: 'ArchConnect',
      description: 'Architecture portfolio and client inquiry app',
      theme_color: '#171714', background_color: '#f3f0e8', display: 'standalone',
      icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
    }
  })],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5001' } }
});
