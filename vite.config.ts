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
          if (!id.includes('node_modules')) return;

          // Match whole package directories, anchored on `node_modules/`.
          // A bare substring like '/react-dom/' also matches
          // '@floating-ui/react-dom', which is what pulled a React *consumer*
          // into the React vendor chunk and split React's CommonJS exports
          // object across two chunks. Those two chunks then imported each
          // other, re-entering a module body before its `var` initializers
          // had run — the deployed blank page with
          // "Cannot set properties of undefined (setting 'Activity')".
          const pkg = (name: string) => id.includes(`/node_modules/${name}/`);

          // --- Core vendor chunk (changes rarely → long cache) ---
          // React and Convex are mutually coupled through React's CommonJS
          // namespace object, so they MUST share one chunk. Splitting any two
          // mutually-dependent packages into different chunks is what makes
          // the emitted graph circular.
          if (
            pkg('react') ||
            pkg('react-dom') ||
            pkg('convex') ||
            pkg('@convex-dev/auth')
          )
            return 'core-vendor';

          // --- One-way consumers of core-vendor: safe to split out ---
          if (pkg('react-router')) return 'react-router';
          if (pkg('@radix-ui')) return 'radix-ui';
          if (pkg('framer-motion')) return 'framer-motion';
          if (pkg('recharts') || id.includes('/node_modules/d3-'))
            return 'charts';
          if (pkg('react-hook-form') || pkg('@hookform') || pkg('zod'))
            return 'forms';
          if (pkg('date-fns')) return 'date-fns';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // ~280 KB minified (~85 KB gzip) — one chunk holding React, react-dom and
    // the Convex client, which have to ship together. Anything well past this
    // is almost certainly a split candidate.
    chunkSizeWarningLimit: 300,
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
