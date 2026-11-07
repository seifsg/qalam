import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const PAPER = '#fff6e3'

/** Only this site's own files may load or run: no trackers, ads or third-party calls by design. */
const CSP = "default-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'"

/** Adds the CSP to the built page only; the dev server needs Vite's inline style injection. */
const csp = (): Plugin => ({
  name: 'qalam-csp',
  apply: 'build',
  transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' }],
})

// Fixed ports so the dev and built previews never collide with sibling apps.
// The PWA plugin precaches every built file, so the app installs and works offline after one visit.
export default defineConfig({
  server: { port: 5187, strictPort: true },
  preview: { port: 5188, strictPort: true },
  build: { target: 'es2022' },
  plugins: [
    csp(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Qalam: trace Arabic and English letters',
        short_name: 'Qalam',
        description: 'Kids trace Arabic and English letters with a finger or mouse. Free, offline, no ads, no accounts, no tracking.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: PAPER,
        background_color: PAPER,
        categories: ['education', 'kids'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
  ],
})
