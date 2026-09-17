import { vlyPlugin } from "@vly-ai/integrations";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vlyPlugin(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force a single copy of React across all packages (including vlyPlugin).
    // Without this, @vly-ai/integrations can resolve its own React copy, which
    // triggers "Invalid hook call" errors at runtime.
    dedupe: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // --- Stable vendor chunks (change rarely → long cache) ---
            if (id.includes('/react-dom/') || id.includes('/react/jsx-runtime'))
              return 'react-vendor';
            if (id.includes('/react-router') || id.includes('/react-router/'))
              return 'react-router';

            // --- Convex runtime + auth (separate so index stays lean) ---
            if (id.includes('/convex/') || id.includes('/@convex-dev/auth/'))
              return 'convex-vendor';

            // --- Radix primitives ---
            if (id.includes('/@radix-ui/')) return 'radix-ui';

            // --- Other heavy / rarely-changing libs ---
            if (id.includes('/framer-motion/')) return 'framer-motion';
            if (id.includes('/recharts/') || id.includes('/d3-'))
              return 'charts';
            if (
              id.includes('/react-hook-form/') ||
              id.includes('/@hookform/') ||
              id.includes('/zod/')
            )
              return 'forms';
            if (id.includes('/date-fns/')) return 'date-fns';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 200 KB minified (~60 KB gzip) — covers the Convex runtime + React
    // vendor chunks; anything larger is almost certainly a split candidate.
    chunkSizeWarningLimit: 200,
    target: 'esnext',
    minify: 'esbuild',
  },
  // Optimize dependencies
  optimizeDeps: {
    // Only scan the app entry HTML; avoids crawling unrelated *.html files
    // if a legacy snapshot accidentally contains leaked package folders.
    entries: ['index.html'],
    include: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      'react-router',
      '@convex-dev/auth/react',
      'framer-motion',
    ],
  },
  // Performance hints
  server: {
    // Bind to all interfaces so WebContainer's server-ready event fires.
    host: true,
    port: 5173,
    // Keep HMR on, but disable full-screen error overlay
    hmr: {
      overlay: false,
    },
  },
});
