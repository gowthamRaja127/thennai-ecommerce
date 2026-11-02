import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router';
import type { Session } from '@supabase/supabase-js';
import { BarChart3, ExternalLink, LogOut, Package, Receipt } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Logomark } from '../components/Header';
import { SproutLoader } from '../components/Ornaments';
import { LoginPage } from './LoginPage';
import { DashboardPage } from './DashboardPage';
import { ProductsPage } from './ProductsPage';
import { ProductEditor } from './ProductEditor';
import { OrdersPage } from './OrdersPage';

type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'not-admin'; session: Session }
  | { status: 'admin'; session: Session };

const AuthContext = createContext<AuthState>({ status: 'loading' });
export const useAdminAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    const sb = supabase!;
    const resolve = async (session: Session | null) => {
      if (!session) return setState({ status: 'signed-out' });
      // RLS lets a signed-in user read only their own row in `admins`.
      const { data } = await sb.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
      setState(data ? { status: 'admin', session } : { status: 'not-admin', session });
    };
    sb.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      // Defer: calling Supabase inside this callback can deadlock the auth client.
      setTimeout(() => resolve(session), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const auth = useAdminAuth();
  const location = useLocation();
  if (auth.status === 'loading') return <SproutLoader label="Opening the ledger…" className="min-h-svh" />;
  if (auth.status === 'signed-out') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (auth.status === 'not-admin')
    return (
      <div className="grid min-h-svh place-items-center px-6 text-center">
        <div>
          <h1 className="display text-[40px] text-espresso">Not an admin account</h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-umber">
            {auth.session.user.email} is signed in but has not been granted admin access. Add it to the <code>admins</code> table (see the README).
          </p>
          <button type="button" onClick={() => supabase!.auth.signOut()} className="btn btn-line mt-8">
            Sign out
          </button>
        </div>
      </div>
    );
  return <>{children}</>;
}

const NAV = [
  { to: '/admin', label: 'Engagement', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: Receipt, end: false },
];

function AdminLayout() {
  const auth = useAdminAuth();
  const email = auth.status === 'admin' ? auth.session.user.email : '';
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-line bg-linen/95 backdrop-blur lg:h-svh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:px-6 lg:py-8">
          <div className="flex items-center gap-2.5">
            <Logomark className="size-6 text-pine" />
            <span className="font-serif text-[24px] italic leading-none text-espresso">Thennai</span>
            <span className="ml-1 text-[9px] font-medium uppercase tracking-[0.24em] text-kraft-deep">Admin</span>
          </div>
          <button type="button" onClick={() => supabase!.auth.signOut()} className="p-2 text-umber hover:text-espresso lg:hidden" aria-label="Sign out">
            <LogOut className="size-4" />
          </button>
        </div>
        <nav aria-label="Admin" className="-mt-1 flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-4 lg:flex-col lg:px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 whitespace-nowrap rounded-[2px] px-3 py-2.5 text-[12px] font-medium uppercase tracking-[0.16em] transition ${
                  isActive ? 'bg-espresso text-linen' : 'text-umber hover:bg-paper hover:text-espresso'
                }`
              }
            >
              <Icon className="size-4" strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-6 lg:absolute lg:bottom-6 lg:block lg:w-[240px]">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[12px] text-umber hover:text-espresso">
            <ExternalLink className="size-3.5" /> View storefront
          </a>
          <p className="mt-4 truncate text-[12px] text-umber" title={email}>
            {email}
          </p>
          <button type="button" onClick={() => supabase!.auth.signOut()} className="mt-2 flex items-center gap-2 text-[12px] text-espresso hover:text-clay">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <Outlet />
      </main>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.3em] text-kraft-deep">Admin</p>
      <h1 className="display mt-4 text-[44px] text-espresso">Connect Supabase to enable the admin.</h1>
      <ol className="mt-8 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-umber">
        <li>Create a free project at supabase.com.</li>
        <li>
          Run <code>supabase/migrations/0001_storefront.sql</code>, then <code>supabase/seed.sql</code>, in the SQL editor.
        </li>
        <li>
          Copy <code>.env.example</code> to <code>.env</code> and fill in <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code> and{' '}
          <code>SUPABASE_SERVICE_ROLE_KEY</code>. Restart <code>npm run dev</code>.
        </li>
        <li>Create your admin user and grant access as described in the README.</li>
      </ol>
    </div>
  );
}

export default function AdminApp() {
  if (!supabase) return <SetupNotice />;
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/:id" element={<ProductEditor />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
