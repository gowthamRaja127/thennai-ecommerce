import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './index.css';
import { router } from './router';
import { CurrencyProvider } from './context/CurrencyContext';
import { CatalogProvider } from './context/CatalogContext';
import { CartProvider } from './context/CartContext';
import { initMotion } from './lib/motion';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CurrencyProvider>
      <CatalogProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </CatalogProvider>
    </CurrencyProvider>
  </StrictMode>,
);

initMotion();
