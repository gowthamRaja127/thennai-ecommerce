import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import express from 'express';
import { createApi } from './api.ts';
import { config } from './config.ts';

/*
 * Production server: the storefront API at /api, plus the built site from dist/
 * with a fallback to index.html so client-side routes (/shop, /checkout…) load directly.
 *   npm run build && npm start
 */
try {
  process.loadEnvFile();
} catch {
  /* no .env file: rely on the host environment */
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use('/api', createApi());

const dist = resolve('dist');
if (existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h', setHeaders: (res, path) => {
    if (path.includes(`${'assets'}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } }));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(resolve(dist, 'index.html')));
}

app.listen(config.port, () => {
  console.log(`thennai storefront on http://localhost:${config.port}`);
  console.log(`  payments: Razorpay ${config.razorpayEnabled ? 'enabled' : 'NOT configured'}, COD ${config.codEnabled ? 'enabled' : 'disabled'}`);
});
