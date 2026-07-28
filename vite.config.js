import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function supabasePreconnect() {
  return {
    name: 'supabase-preconnect',
    transformIndexHtml(_html, ctx) {
      const env = loadEnv(ctx.server?.config?.mode ?? 'production', process.cwd(), 'VITE_')
      const supabaseUrl = env.VITE_SUPABASE_URL
      if (!supabaseUrl) return []
      try {
        const { origin } = new URL(supabaseUrl)
        return [
          {
            tag: 'link',
            attrs: { rel: 'dns-prefetch', href: origin },
            injectTo: 'head',
          },
          {
            tag: 'link',
            attrs: { rel: 'preconnect', href: origin, crossorigin: '' },
            injectTo: 'head',
          },
        ]
      } catch {
        return []
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), supabasePreconnect()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('date-fns')) return 'date-fns'
          if (id.includes('lucide-react')) return 'lucide'
          if (id.includes('react-router')) return 'react-router'
          if (
            id.includes('/react-dom') ||
            id.includes('/react/') ||
            id.endsWith('/react') ||
            id.includes('\\react\\') ||
            id.includes('\\react-dom')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
  },
})
