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
    <ul className="flex shrink-0 items-center gap-14 pr-14" aria-hidden>
      {ITEMS.map((t) => (
        <li key={t} className="flex items-center gap-14 whitespace-nowrap font-serif text-[19px] font-normal italic text-umber sm:text-[21px]">
          {t}
          <span className="pebble block size-1.5 bg-kraft/70" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto max-w-[1280px] px-6 sm:px-10" role="region" aria-label={ITEMS.join(', ')}>
      <div className="overflow-hidden border-y border-line py-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-[marquee_70s_linear_infinite] motion-reduce:animate-none">
          {row}
          {row}
        </div>
      </div>
      <style>{`@keyframes marquee { to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
