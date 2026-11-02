import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Banknote, ChevronDown, Lock, Smartphone } from 'lucide-react';
import { Select } from '../components/Select';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { useCurrency } from '../context/CurrencyContext';
import { api, ApiError, type StoreConfig } from '../lib/api';
import { openRazorpay } from '../lib/razorpay';
import { track } from '../lib/analytics';
import { INDIAN_STATES, checkoutSchema, fieldErrors, type PaymentMethod } from '../lib/schemas';
import { OrderTotals } from '../components/CartParts';
import { ProductImage } from '../components/ProductImage';
import { usePageTitle } from '../components/PageHeader';
import { DoubleRule, SproutLoader } from '../components/Ornaments';

interface FormValues {
  contact: { email: string; phone: string };
  shipping: { fullName: string; line1: string; line2: string; landmark: string; city: string; state: string; pincode: string };
  notes: string;
  paymentMethod: PaymentMethod | '';
}

const EMPTY: FormValues = {
  contact: { email: '', phone: '' },
  shipping: { fullName: '', line1: '', line2: '', landmark: '', city: '', state: '', pincode: '' },
  notes: '',
  paymentMethod: '',
};

type Stage = 'idle' | 'creating' | 'paying' | 'verifying';

export function CheckoutPage() {
  usePageTitle('Checkout');
  const cart = useCart();
  const { ready } = useCatalog();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    api
      .config()
      .then((c) => {
        setConfig(c);
        setValues((v) => (v.paymentMethod ? v : { ...v, paymentMethod: c.razorpay ? 'razorpay' : c.cod ? 'cod' : '' }));
      })
      .catch(() => setConfigError(true));
  }, []);

  // Count each product entering checkout once per visit.
  const trackedRef = useRef(false);
  useEffect(() => {
    if (trackedRef.current || !ready || cart.items.length === 0) return;
    trackedRef.current = true;
    cart.items.forEach((i) => track('begin_checkout', i.productId, { variant: i.variant, quantity: i.quantity, source: 'checkout' }));
  }, [ready, cart.items]);

  const payload = useMemo(
    () => ({ ...values, items: cart.items.map(({ productId, variant, quantity }) => ({ productId, variant, quantity })) }),
    [values, cart.items],
  );
  const result = useMemo(() => checkoutSchema.safeParse(payload), [payload]);
  const clientErrors = useMemo(() => (result.success ? {} : fieldErrors(result.error)), [result]);
  const errorFor = (key: string) => serverErrors[key] ?? ((submitted || touched.has(key)) ? clientErrors[key] : undefined);

  const update = (path: string, value: string) => {
    setServerErrors((e) => {
      if (!(path in e)) return e;
      const next = { ...e };
      delete next[path];
      return next;
    });
    setValues((v) => {
      const [group, key] = path.split('.') as [keyof FormValues, string | undefined];
      if (!key) return { ...v, [group]: value };
      return { ...v, [group]: { ...(v[group] as Record<string, string>), [key]: value } };
    });
  };
  const blur = (path: string) => setTouched((t) => (t.has(path) ? t : new Set(t).add(path)));

  const field = (path: string) => {
    const [group, key] = path.split('.');
    const value = key ? (values[group as 'contact' | 'shipping'] as Record<string, string>)[key] : (values[group as 'notes'] as string);
    return { name: path, value, error: errorFor(path), onChange: (v: string) => update(path, v), onBlur: () => blur(path) };
  };

  const focusFirstError = (keys: string[]) => {
    requestAnimationFrame(() => {
      const el = keys.map((k) => formRef.current?.querySelector<HTMLElement>(`[name="${k}"]:not([type=hidden]), #${CSS.escape(k)}`)).find(Boolean);
      el?.focus();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setBanner(null);
    if (!result.success) {
      const keys = Object.keys(clientErrors);
      if (keys.some((k) => k.startsWith('items'))) setBanner('Your cart is empty.');
      focusFirstError(keys);
      return;
    }

    setStage('creating');
    try {
      const created = await api.createOrder(result.data);

      if (created.status === 'cod_confirmed' || !created.razorpay) {
        cart.clear();
        navigate(`/order/${created.orderId}`, { replace: true });
        return;
      }

      setStage('paying');
      const outcome = await openRazorpay({
        keyId: created.razorpay.keyId,
        orderId: created.razorpay.orderId,
        amount: created.razorpay.amount,
        currency: created.razorpay.currency,
        description: `Order ${created.orderId}`,
        prefill: created.prefill!,
      });

      if (outcome.kind === 'success') {
        setStage('verifying');
        try {
          await api.verifyPayment({ orderId: created.orderId, ...outcome.response });
        } catch {
          // The webhook will still confirm it; the order page polls for the final status.
        }
        cart.clear();
        navigate(`/order/${created.orderId}`, { replace: true });
        return;
      }

      api.paymentFailed(created.orderId).catch(() => {});
      setBanner(outcome.kind === 'failed' ? `${outcome.message} Your cart is saved; you can try again.` : 'Payment was cancelled. Your cart is saved; you can try again whenever you are ready.');
      setStage('idle');
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError('Something went wrong. Please try again.', 0);
      setServerErrors(apiErr.fields);
      setBanner(apiErr.message);
      setStage('idle');
      focusFirstError(Object.keys(apiErr.fields));
    }
  };

  if (!ready) return <SproutLoader label="Preparing checkout…" className="min-h-[70svh]" />;

  if (cart.items.length === 0 && stage === 'idle') {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <h1 className="display text-[44px] text-espresso">Your cart is empty.</h1>
        <p className="mt-4 text-umber">Add something to the sill before checking out.</p>
        <Link to="/shop" className="btn btn-solid mt-10">
          Browse the catalogue <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  const busy = stage !== 'idle';
  const method = values.paymentMethod;
  const submitLabel =
    stage === 'creating' ? 'Placing your order…' : stage === 'paying' ? 'Waiting for payment…' : stage === 'verifying' ? 'Confirming payment…' : method === 'cod' ? `Place order · ${format(cart.total)}` : `Pay ${format(cart.total)} securely`;

  return (
    <div className="mx-auto max-w-[1280px] px-6 pb-24 pt-8 sm:px-10 lg:pb-32 lg:pt-12">
      <nav aria-label="Breadcrumb" className="text-[10.5px] uppercase tracking-[0.22em] text-umber">
        <Link to="/cart" className="hover:text-espresso">
          Cart
        </Link>
        <span className="mx-2 text-line">/</span>
        <span className="text-espresso" aria-current="page">
          Checkout
        </span>
      </nav>
      <h1 className="display mt-8 text-[48px] text-espresso sm:text-[64px]">Checkout</h1>
      <DoubleRule className="mt-6" />

      {/* Mobile order summary */}
      <details className="group mt-6 border border-line lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-espresso">
            Order summary <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </span>
          <span className="font-serif text-[22px] tabular-nums text-espresso">{format(cart.total)}</span>
        </summary>
        <div className="border-t border-line px-5 pb-5">
          <SummaryBody />
        </div>
      </details>

      <div className="mt-8 grid gap-12 lg:mt-12 lg:grid-cols-12 lg:gap-16">
        <form ref={formRef} onSubmit={onSubmit} noValidate className="lg:col-span-7" aria-describedby={banner ? 'checkout-banner' : undefined}>
          {banner && (
            <p id="checkout-banner" role="alert" className="mb-8 border-l-2 border-clay bg-clay-soft/60 px-4 py-3 text-[14px] text-espresso">
              {banner}
            </p>
          )}

          <Section n="i" title="Contact">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" {...field('contact.email')} />
              <Field label="Mobile number" type="tel" autoComplete="tel-national" inputMode="tel" placeholder="98765 43210" prefix="+91" {...field('contact.phone')} />
            </div>
          </Section>

          <Section n="ii" title="Delivery address">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field className="sm:col-span-2" label="Full name" autoComplete="name" {...field('shipping.fullName')} />
              <Field className="sm:col-span-2" label="Flat, house no., building" autoComplete="address-line1" {...field('shipping.line1')} />
              <Field className="sm:col-span-2" label="Area, street, sector" optional autoComplete="address-line2" {...field('shipping.line2')} />
              <Field label="Landmark" optional {...field('shipping.landmark')} />
              <Field
                label="PIN code"
                autoComplete="postal-code"
                inputMode="numeric"
                {...field('shipping.pincode')}
                onChange={(v) => update('shipping.pincode', v.replace(/\D/g, '').slice(0, 6))}
              />
              <Field label="City" autoComplete="address-level2" {...field('shipping.city')} />
              <SelectField label="State" autoComplete="address-level1" options={INDIAN_STATES} {...field('shipping.state')} />
              <TextAreaField className="sm:col-span-2" label="Delivery notes" optional placeholder="Gate code, preferred time…" {...field('notes')} />
            </div>
          </Section>

          <Section n="iii" title="Payment">
            {configError ? (
              <p className="text-[14px] text-clay">We could not load payment options. Please refresh the page.</p>
            ) : !config ? (
              <div className="grid gap-3">
                <span className="skeleton h-[74px]" />
                <span className="skeleton h-[74px]" />
              </div>
            ) : !config.razorpay && !config.cod ? (
              <p className="text-[14px] text-espresso">Checkout is paused for a moment. Please try again shortly.</p>
            ) : (
              <fieldset>
                <legend className="sr-only">Payment method</legend>
                <div className="grid gap-3">
                  {config.razorpay && (
                    <PaymentOption
                      checked={method === 'razorpay'}
                      onSelect={() => update('paymentMethod', 'razorpay')}
                      icon={<Smartphone className="size-5" strokeWidth={1.25} />}
                      title="Pay online"
                      body="UPI (GPay, PhonePe, Paytm), RuPay & cards, NetBanking and wallets, secured by Razorpay."
                    />
                  )}
                  {config.cod && (
                    <PaymentOption
                      checked={method === 'cod'}
                      onSelect={() => update('paymentMethod', 'cod')}
                      icon={<Banknote className="size-5" strokeWidth={1.25} />}
                      title="Cash on Delivery"
                      body="Pay in cash or UPI when your order arrives."
                    />
                  )}
                </div>
                {errorFor('paymentMethod') && <p className="mt-2 text-[12px] text-clay">{errorFor('paymentMethod')}</p>}
              </fieldset>
            )}
          </Section>

          <button type="submit" disabled={busy || !config || (!config.razorpay && !config.cod)} className="btn btn-solid mt-10 w-full disabled:opacity-60">
            {busy ? <span className="size-4 animate-spin rounded-full border border-linen/40 border-t-linen" aria-hidden /> : <Lock className="size-4" />}
            {submitLabel}
          </button>
          <p className="mt-4 text-center text-[12px] leading-relaxed text-umber">
            By placing this order you agree to our terms. Prices include GST. Your card and UPI details are handled by Razorpay and never touch our servers.
          </p>
        </form>

        <aside className="hidden lg:col-span-5 lg:block" aria-label="Order summary">
          <div className="sticky top-32 border border-line bg-paper/40 p-8">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.24em] text-espresso">Order summary</h2>
            <SummaryBody />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryBody() {
  const cart = useCart();
  const { format } = useCurrency();
  return (
    <>
      <ul className="mt-4 divide-y divide-line">
        {cart.items.map((i) => (
          <li key={i.key} className="flex items-center gap-4 py-4">
            <div className="relative size-16 shrink-0">
              <div className="size-full overflow-hidden rounded-[2px] bg-paper">
                <ProductImage product={i.product} />
              </div>
              <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-espresso text-[10px] text-linen tabular-nums">{i.quantity}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[17px] leading-snug text-espresso">{i.product.name}</p>
              {i.product.variants.length > 1 && <p className="text-[12px] text-umber">{i.variant}</p>}
            </div>
            <p className="text-[14px] tabular-nums text-espresso">{format(i.lineTotal)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t border-line pt-5">
        <OrderTotals subtotal={cart.subtotal} shipping={cart.shipping} total={cart.total} />
      </div>
    </>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line pb-10 pt-2 [&+&]:pt-10">
      <h2 className="mb-6 flex items-baseline gap-3">
        <span className="font-serif text-[18px] italic text-kraft-deep">{n}.</span>
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-espresso">{title}</span>
      </h2>
      {children}
    </section>
  );
}

interface BaseFieldProps {
  name: string;
  label: string;
  value: string;
  error?: string;
  optional?: boolean;
  className?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}

const inputClass = (error?: string) =>
  `h-12 w-full rounded-[2px] border bg-linen px-4 text-[15px] text-espresso placeholder:text-umber/50 transition focus:outline-none ${
    error ? 'border-clay focus:border-clay' : 'border-line hover:border-umber/50 focus:border-espresso'
  }`;

function FieldShell({ name, label, optional, error, className = '', children }: Pick<BaseFieldProps, 'name' | 'label' | 'optional' | 'error' | 'className'> & { children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 flex items-baseline justify-between text-[10.5px] font-medium uppercase tracking-[0.2em] text-umber">
        {label}
        {optional && <span className="normal-case tracking-normal text-umber/60">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-[12px] text-clay">
          {error}
        </p>
      )}
    </div>
  );
}

function Field({
  name,
  label,
  value,
  error,
  optional,
  className,
  onChange,
  onBlur,
  prefix,
  ...rest
}: BaseFieldProps & { prefix?: string; type?: string; autoComplete?: string; inputMode?: 'email' | 'tel' | 'numeric' | 'text'; placeholder?: string; maxLength?: number }) {
  return (
    <FieldShell name={name} label={label} optional={optional} error={error} className={className}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-umber">{prefix}</span>}
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${inputClass(error)} ${prefix ? 'pl-12' : ''}`}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

function SelectField({ name, label, value, error, className, onChange, onBlur, options }: BaseFieldProps & { options: readonly string[]; autoComplete?: string }) {
  return (
    <FieldShell name={name} label={label} error={error} className={className}>
      <Select
        id={name}
        name={name}
        size="field"
        value={value}
        onChange={(v) => {
          onChange(v);
          onBlur();
        }}
        onBlur={onBlur}
        options={options}
        invalid={!!error}
        describedBy={error ? `${name}-error` : undefined}
      />
    </FieldShell>
  );
}

function TextAreaField({ name, label, value, error, optional, className, onChange, onBlur, placeholder }: BaseFieldProps & { placeholder?: string }) {
  return (
    <FieldShell name={name} label={label} optional={optional} error={error} className={className}>
      <textarea
        id={name}
        name={name}
        value={value}
        rows={3}
        maxLength={300}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className={`${inputClass(error)} h-auto resize-none py-3`}
      />
    </FieldShell>
  );
}

function PaymentOption({ checked, onSelect, icon, title, body }: { checked: boolean; onSelect: () => void; icon: ReactNode; title: string; body: string }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 border p-5 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-kraft ${
        checked ? 'border-espresso bg-paper/50' : 'border-line hover:border-umber/60'
      }`}
    >
      <input type="radio" name="paymentMethod" checked={checked} onChange={onSelect} className="sr-only" />
      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${checked ? 'border-espresso' : 'border-line'}`} aria-hidden>
        {checked && <span className="size-2.5 rounded-full bg-espresso" />}
      </span>
      <span className="flex-1">
        <span className="flex items-center gap-2.5 text-[15px] text-espresso">
          {icon}
          {title}
        </span>
        <span className="mt-1 block text-[13px] leading-relaxed text-umber">{body}</span>
      </span>
    </label>
  );
}
