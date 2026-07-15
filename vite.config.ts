import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Use RELATIVE asset paths for production builds ('./' instead of '/Repo/').
  // This makes the built site work no matter what path it is served from on
  // GitHub Pages (e.g. https://user.github.io/Visual_Calendar/), so it can
  // never break due to a base-path or repo-name-casing mismatch. The app has
  // no client-side router, so relative paths are completely safe here.
  return {
    base: command === 'build' ? './' : '/',
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
    },
  }
})
