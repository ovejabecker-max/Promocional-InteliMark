import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173,
    // Habilitar HTTPS para permitir el acceso a APIs de audio del navegador
    https: false, // Cambiar a true cuando tengas certificados SSL locales
    // Para desarrollo local sin HTTPS, usaremos HTTP pero con configuraciones adicionales
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
});
