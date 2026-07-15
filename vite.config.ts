import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // On GitHub Pages the app is served from https://<user>.github.io/<repo>/,
  // so production assets need a base path. The CI passes the correct path via
  // VITE_BASE (from actions/configure-pages); local dev stays at root.
  const raw = process.env.VITE_BASE
  const base = raw
    ? raw.endsWith('/')
      ? raw
      : `${raw}/`
    : command === 'build'
      ? '/Visual_Calendar/'
      : '/'

  return {
    base,
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
    },
  }
})
