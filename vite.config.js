import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],

  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@__mock__': path.resolve(__dirname, 'src/__mock__'),
      '@helpers': path.resolve(__dirname, 'src/helpers'),
      '@logic': path.resolve(__dirname, 'src/logic'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@modules': path.resolve(__dirname, 'src/modules'),
    },
  },
});
