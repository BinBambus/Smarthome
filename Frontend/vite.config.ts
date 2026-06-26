import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: "bun-socket-patcher",
      configureServer(server) {
        // 1. Patch für normale HTTP-Proxy-Anfragen
        server.middlewares.use((req, res, next) => { 
          if (req.socket && !req.socket.destroySoon) {
            req.socket.destroySoon = req.socket.destroy
          }
          next()
        })
        
        // 2. Patch für den Moment, in dem das HTTP-Protokoll auf WebSocket upgradet
        server.httpServer?.on("upgrade", (req, socket) => {
          if (socket && !socket.destroySoon) {
            socket.destroySoon = socket.destroy
          }
        })
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Leitet an Port 5000 weiter
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
