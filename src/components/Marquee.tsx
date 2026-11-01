const ITEMS = [
  'Handcrafted in Erode',
  'Low-EC < 0.5 mS/cm',
  'Zero dirt, zero buckets',
  '100% Germination Guarantee',
  'Single-origin Muthur coir',
  'Free express delivery above ₹499',
];

export function Marquee() {
  const row = (
    <ul className="flex shrink-0 items-center gap-12 pr-12" aria-hidden>
      {ITEMS.map((t) => (
        <li key={t} className="flex items-center gap-12 whitespace-nowrap font-serif text-[22px] italic text-linen/90 sm:text-[26px]">
          {t}
          <span className="text-[14px] not-italic text-kraft">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-forest py-6" role="region" aria-label={ITEMS.join(', ')}>
      <div className="flex w-max animate-[marquee_48s_linear_infinite] motion-reduce:animate-none">
        {row}
        {row}
      </div>
      <style>{`@keyframes marquee { to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
