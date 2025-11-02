
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      rollupOptions: {
        external: ['@radix-ui/number'],
        onwarn(warning, warn) {
          // Ignorar avisos sobre módulos não resolvidos
          if (warning.code === 'UNRESOLVED_IMPORT') {
            return;
          }
          warn(warning);
        },
      },
    },
    server: {
  // Remova 'port' aqui ou defina para uma porta de desenvolvimento como 3000/5173
  // O Railway usará $PORT do package.json para o ambiente de produção
  port: 3000, // ou 5173 para desenvolvimento local
  open: true,
},
  });