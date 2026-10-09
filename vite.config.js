import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },

      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        importScripts: ['/sw-push.js'],
        navigateFallbackDenylist: [
          /^\/\.well-known\/assetlinks\.json$/
        ]
      },

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "mask-icon.svg"
      ],

      manifest: {
        name: "School of Athens CRM",
        short_name: "School Of Athens",

        description: "School Management System",

        theme_color: "#ffffff",

        background_color: "#ffffff",

        display: "standalone",

        start_url: "/",

        scope: "/",


        orientation: "portrait",

        icons: [
          {
            src: "/icons/launchericon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/launchericon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icons/launchericon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@pages": "/src/pages",
      "@utils": "/src/utils",
      "@components": "/src/components",
      "@stores": "/src/stores",
      "@hooks": "/src/hooks",
      "@services": "/src/services",
      '@': '/src'
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Stable vendor chunks: a deploy that only changes app code leaves these
        // cached in the browser instead of re-downloading the whole bundle.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-antd": ["antd", "@ant-design/icons"],
        },
      },
    },
  },
})
