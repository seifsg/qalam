import { defineConfig } from 'vite'

// Fixed ports so the dev and built previews never collide with sibling apps.
export default defineConfig({
  server: { port: 5187, strictPort: true },
  preview: { port: 5188, strictPort: true },
  build: { target: 'es2022' },
})
