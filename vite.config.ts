import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno (incluyendo las de Vercel)
  // El cast (process as any) evita errores de TypeScript si process no está tipado globalmente
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Esto reemplaza "process.env.API_KEY" en tu código por el valor real de tu clave
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  }
})
