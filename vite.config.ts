import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to handle optional peer dependencies
const optionalPeerDepsPlugin = () => {
  return {
    name: 'optional-peer-deps',
    resolveId(id: string) {
      if (id.includes('__vite-optional-peer-dep')) {
        // Extract the actual package name
        const match = id.match(/__vite-optional-peer-dep:([^:]+):/);
        if (match) {
          const pkgName = match[1];
          // Try to resolve the actual package
          try {
            return this.resolve(pkgName, import.meta.url, { skipSelf: true });
          } catch {
            // If it fails, return a stub
            return { id: `virtual:${pkgName}`, external: false };
          }
        }
      }
      return null;
    },
    load(id: string) {
      if (id.startsWith('virtual:')) {
        // Return empty module for optional deps that aren't installed
        return 'export default {};';
      }
      return null;
    }
  };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 2025,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        include: ['gsap', '@appletosolutions/reactbits', 'three', '@react-three/fiber', '@react-three/drei', 'ogl', 'matter-js']
      },
      plugins: [react(), optionalPeerDepsPlugin()],
      build: {
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true
        }
      },
      // Configure for client-side routing
      preview: {
        port: 2025,
        host: '0.0.0.0'
      }
    };
});
