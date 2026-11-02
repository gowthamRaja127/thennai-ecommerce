import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Serves the storefront API (/api) from the Vite dev and preview servers, so one command runs everything. */
function storefrontApi(): Plugin {
  const mount = async (use: (path: string, handler: never) => void) => {
    const { createApi } = await import('./server/api.ts');
    use('/api', createApi() as never);
  };
  return {
    name: 'storefront-api',
    configureServer: (server) => mount(server.middlewares.use.bind(server.middlewares) as never),
    configurePreviewServer: (server) => mount(server.middlewares.use.bind(server.middlewares) as never),
  };
}

export default defineConfig(({ mode }) => {
  // Make .env values (Razorpay keys etc.) visible to the API running inside Vite.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react(), tailwindcss(), storefrontApi()],
    // Pre-bundle the admin's lazily loaded dependency so dev never re-optimises mid-session.
    optimizeDeps: { include: ['@supabase/supabase-js'] },
  };
});
