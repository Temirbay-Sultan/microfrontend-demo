import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'vueMf',
      filename: 'remoteEntry.js',
      exposes: {
        './Counter': './src/Counter.vue',
        './App': './src/App.vue'
      },
      shared: ['vue']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
