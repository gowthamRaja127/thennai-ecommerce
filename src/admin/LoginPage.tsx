import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fieldErrors } from '../lib/schemas';
import { Logomark } from '../components/Header';
import { DoubleRule } from '../components/Ornaments';
import { useAdminAuth } from './AdminApp';

const loginSchema = z.object({
  email: z.email('Enter the email you sign in with'),
  password: z.string().min(8, 'Passwords are at least 8 characters'),
});

export function LoginPage() {
  const auth = useAdminAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (auth.status === 'admin') return <Navigate to={from} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase!.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      setFormError(error.message === 'Invalid login credentials' ? 'That email and password do not match an account.' : error.message);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="grid min-h-svh place-items-center px-6 py-16">
      <form onSubmit={submit} noValidate className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5">
          <Logomark className="size-7 text-pine" />
          <span className="font-serif text-[30px] italic leading-none text-espresso">Thennai</span>
        </div>
        <DoubleRule className="mt-8" />
        <h1 className="display mt-8 text-center text-[38px] text-espresso">Admin sign in</h1>

        {(formError || auth.status === 'not-admin') && (
          <p role="alert" className="mt-6 border-l-2 border-clay bg-clay-soft/60 px-4 py-3 text-[13px] text-espresso">
            {formError || 'This account does not have admin access.'}
          </p>
        )}

        <label htmlFor="email" className="mt-8 block text-[10.5px] font-medium uppercase tracking-[0.2em] text-umber">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          className={`mt-2 h-12 w-full rounded-[2px] border bg-linen px-4 text-[15px] focus:outline-none ${errors.email ? 'border-clay' : 'border-line focus:border-espresso'}`}
        />
        {errors.email && <p className="mt-1.5 text-[12px] text-clay">{errors.email}</p>}

        <label htmlFor="password" className="mt-5 block text-[10.5px] font-medium uppercase tracking-[0.2em] text-umber">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!errors.password}
          className={`mt-2 h-12 w-full rounded-[2px] border bg-linen px-4 text-[15px] focus:outline-none ${errors.password ? 'border-clay' : 'border-line focus:border-espresso'}`}
        />
        {errors.password && <p className="mt-1.5 text-[12px] text-clay">{errors.password}</p>}

        <button type="submit" disabled={busy} className="btn btn-solid mt-8 w-full disabled:opacity-60">
          {busy ? <span className="size-4 animate-spin rounded-full border border-linen/40 border-t-linen" aria-hidden /> : <Lock className="size-4" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
