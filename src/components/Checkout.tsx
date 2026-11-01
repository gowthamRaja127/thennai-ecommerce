import { useState, type FormEvent } from 'react';
import { ArrowLeft, Building2, CheckCircle2, CreditCard, Loader2, Lock, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { placeOrder, type OrderResult, type PaymentMethod, type ShippingDetails } from '../lib/checkout';

const METHODS: { id: PaymentMethod; label: string; sub: string; icon: typeof Smartphone }[] = [
  { id: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm, BHIM', icon: Smartphone },
  { id: 'rupay', label: 'RuPay', sub: 'RuPay debit & credit cards', icon: CreditCard },
  { id: 'card', label: 'Cards', sub: 'Visa, Mastercard, Amex', icon: CreditCard },
  { id: 'netbanking', label: 'NetBanking', sub: 'All major Indian banks', icon: Building2 },
];

const EMPTY: ShippingDetails = { name: '', phone: '', email: '', address: '', pincode: '', city: '' };

function validate(d: ShippingDetails) {
  const e: Partial<Record<keyof ShippingDetails, string>> = {};
  if (d.name.trim().length < 2) e.name = 'Please enter your full name';
  if (!/^[6-9]\d{9}$/.test(d.phone.replace(/\D/g, '').slice(-10))) e.phone = 'Enter a valid 10-digit mobile number';
  if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Enter a valid email';
  if (d.address.trim().length < 8) e.address = 'Flat, building and street please';
  if (!/^[1-9]\d{5}$/.test(d.pincode)) e.pincode = '6-digit PIN code';
  if (d.city.trim().length < 2) e.city = 'City required';
  return e;
}

export function Checkout({ onBack }: { onBack: () => void }) {
  const cart = useCart();
  const { format, currency } = useCurrency();
  const [details, setDetails] = useState<ShippingDetails>(EMPTY);
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [status, setStatus] = useState<'idle' | 'paying' | 'error'>('idle');
  const [result, setResult] = useState<OrderResult | null>(null);

  const set = (k: keyof ShippingDetails) => (v: string) => setDetails((d) => ({ ...d, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(details);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus('paying');
    try {
      const r = await placeOrder({ lines: cart.lines, shipping: details, paymentMethod: method, totalInr: cart.total });
      setResult(r);
      cart.clear();
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  if (result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center animate-fade">
        <CheckCircle2 className="size-14 text-leaf" />
        <h2 className="mt-5 font-serif text-2xl text-espresso">Order confirmed</h2>
        <p className="mt-2 text-sm text-umber">
          Order <strong className="text-espresso">{result.orderId}</strong> is being packed in Arachalur, Erode. Expect it at your door in{' '}
          {result.etaDays} days.
        </p>
        <p className="mt-1 text-xs text-umber">A tracking link will reach you on WhatsApp and email.</p>
        <button type="button" onClick={() => { setResult(null); onBack(); cart.close(); }} className="mt-8 rounded-xl bg-pine px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
          Back to the store
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-line bg-white px-5 py-4">
        <button type="button" onClick={onBack} className="-ml-1 rounded-full p-2 text-umber hover:bg-sand" aria-label="Back to cart">
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="font-serif text-xl text-espresso">Secure Checkout</h2>
        <Lock className="ml-auto size-4 text-leaf" />
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <fieldset className="space-y-3">
          <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-umber">Deliver to</legend>
          <Field label="Full name" value={details.name} onChange={set('name')} error={errors.name} autoComplete="name" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mobile" value={details.phone} onChange={set('phone')} error={errors.phone} autoComplete="tel" inputMode="tel" placeholder="98XXXXXXXX" />
            <Field label="Email" value={details.email} onChange={set('email')} error={errors.email} autoComplete="email" type="email" />
          </div>
          <Field label="Flat, building, street" value={details.address} onChange={set('address')} error={errors.address} autoComplete="street-address" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="PIN code" value={details.pincode} onChange={(v) => set('pincode')(v.replace(/\D/g, '').slice(0, 6))} error={errors.pincode} autoComplete="postal-code" inputMode="numeric" />
            <Field label="City" value={details.city} onChange={set('city')} error={errors.city} autoComplete="address-level2" />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-umber">Pay with</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {METHODS.map(({ id, label, sub, icon: Icon }) => (
              <label
                key={id}
                className={`cursor-pointer rounded-xl border p-3 transition ${method === id ? 'border-pine bg-mint/60 ring-1 ring-pine' : 'border-line bg-white hover:border-pine/40'}`}
              >
                <input type="radio" name="method" value={id} checked={method === id} onChange={() => setMethod(id)} className="sr-only" />
                <span className="flex items-center gap-2 text-sm font-semibold text-espresso">
                  <Icon className="size-4 text-pine" />
                  {label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-umber">{sub}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {currency !== 'INR' && (
          <p className="rounded-xl bg-sand px-3.5 py-2.5 text-xs text-umber">
            Prices are shown in {currency} for reference. You’ll be charged ₹{cart.total.toLocaleString('en-IN')} in INR.
          </p>
        )}
        {status === 'error' && (
          <p role="alert" className="rounded-xl bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
            We couldn’t start the payment. Please try again — your cart is saved.
          </p>
        )}
      </div>

      <div className="border-t border-line bg-white px-5 pb-5 pt-4">
        <div className="mb-3 flex justify-between text-base font-semibold text-espresso">
          <span>Total payable</span>
          <span className="tabular-nums">{format(cart.total)}</span>
        </div>
        <button
          type="submit"
          disabled={status === 'paying' || cart.lines.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-pine py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {status === 'paying' ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          {status === 'paying' ? 'Connecting to secure gateway…' : `Pay ${format(cart.total)} via ${METHODS.find((m) => m.id === method)!.label}`}
        </button>
        <p className="mt-2.5 text-center text-[11px] text-umber">256-bit encrypted • Ships from Erode within 24h via Delhivery & Shiprocket</p>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: 'tel' | 'numeric' | 'email' | 'text';
  placeholder?: string;
}

function Field({ label, value, onChange, error, type = 'text', ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-espresso">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`mt-1 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-espresso placeholder:text-umber/50 focus:outline-none focus:ring-2 ${
          error ? 'border-clay focus:ring-clay/20' : 'border-line focus:border-pine focus:ring-pine/15'
        }`}
        {...rest}
      />
      {error && <span className="mt-1 block text-[11px] text-clay">{error}</span>}
    </label>
  );
}
