import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 7722,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return

          if (id.includes("@reduxjs/toolkit") || id.includes("react-redux")) {
            return "redux-vendor"
          }

          if (id.includes("react-router") || id.includes("@remix-run")) {
            return "router-vendor"
          }

          if (id.includes("recharts")) return "charts"

          if (id.includes("react-quill-new") || id.includes("/quill/")) {
            return "editor"
          }

          if (id.includes("react-i18next") || id.includes("/i18next/")) {
            return "i18n-vendor"
          }
        },
      },
    },
  },
})
