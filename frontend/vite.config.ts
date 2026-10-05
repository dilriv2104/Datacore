import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Configuración estándar de Vite + React.
// La URL del backend se define en el archivo .env del frontend
// con la variable VITE_API_URL (ver services/api.ts).
export default defineConfig({
  plugins: [react()],
});
