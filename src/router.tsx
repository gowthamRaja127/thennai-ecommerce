import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { StoreLayout } from './pages/StoreLayout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteError } from './pages/RouteError';
import { SproutLoader } from './components/Ornaments';

/*
 * The landing page ships in the main bundle; every other page is its own chunk, loaded on
 * first visit (StoreLayout shows the sprout loader meanwhile). The admin pulls in Supabase
 * auth, so shoppers never download it.
 */
const ShopPage = lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const ProductPage = lazy(() => import('./pages/ProductPage').then((m) => ({ default: m.ProductPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderPage = lazy(() => import('./pages/OrderPage').then((m) => ({ default: m.OrderPage })));
const AdminApp = lazy(() => import('./admin/AdminApp'));

export const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:slug', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order/:id', element: <OrderPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'admin/*',
    errorElement: <RouteError />,
    element: (
      <Suspense fallback={<SproutLoader label="Opening the ledger…" className="min-h-svh" />}>
        <AdminApp />
      </Suspense>
    ),
  },
]);
