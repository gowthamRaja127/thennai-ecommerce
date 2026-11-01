const MARKS = ['UPI', 'GPay', 'PhonePe', 'RuPay', 'Visa', 'Mastercard', 'NetBanking'];

export function PaymentMarks({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Accepted payment methods">
      {MARKS.map((m) => (
        <li
          key={m}
          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide ${
            dark ? 'border-white/15 text-white/70' : 'border-line bg-linen text-umber'
          }`}
        >
          {m}
        </li>
      ))}
    </ul>
  );
}
