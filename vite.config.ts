
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
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
    //server: {
    //  port: 3000,
    //  open: true,
    //},
  });