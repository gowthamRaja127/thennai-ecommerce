import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: readonly (string | SelectOption)[];
  /** Accessible name when there is no visible <label htmlFor>. */
  ariaLabel?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  onBlur?: () => void;
  /** 'field' = form-height box; 'compact' = card/toolbar size; 'bare' = text-only trigger (toolbars). */
  size?: 'field' | 'compact' | 'bare';
  align?: 'left' | 'right';
  className?: string;
}

/**
 * The storefront dropdown: a button + listbox in the house style, replacing the browser's
 * native select. Keyboard: ↑/↓ move, Home/End jump, Enter/Space choose, Esc closes,
 * typing letters jumps to the next matching option.
 */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  id,
  name,
  placeholder = 'Select…',
  invalid,
  describedBy,
  onBlur,
  size = 'compact',
  align = 'left',
  className = '',
}: Props) {
  const opts: SelectOption[] = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const autoId = useId();
  const buttonId = id ?? `sel-${autoId}`;
  const listId = `${buttonId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const typed = useRef({ text: '', at: 0 });

  const selectedIndex = opts.findIndex((o) => o.value === value);
  const selected = opts[selectedIndex];

  const openList = () => {
    setActive(Math.max(0, selectedIndex));
    setOpen(true);
  };
  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };
  const choose = (i: number) => {
    const o = opts[i];
    if (o) onChange(o.value);
    close();
  };

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Flip upward when there is not enough room below; keep the active option in view.
  useLayoutEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const needed = Math.min(288, opts.length * 44 + 12);
    setDropUp(window.innerHeight - rect.bottom < needed && rect.top > needed);
  }, [open, opts.length]);
  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const typeahead = (key: string) => {
    const now = Date.now();
    typed.current = { text: now - typed.current.at < 600 ? typed.current.text + key.toLowerCase() : key.toLowerCase(), at: now };
    const start = open ? active : Math.max(0, selectedIndex);
    const order = [...opts.slice(start + 1), ...opts.slice(0, start + 1)];
    const hit = order.find((o) => o.label.toLowerCase().startsWith(typed.current.text));
    if (!hit) return;
    const i = opts.indexOf(hit);
    if (open) setActive(i);
    else onChange(hit.value);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const last = opts.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => Math.min(last, a + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => Math.max(0, a - 1));
        break;
      case 'Home':
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case 'End':
        if (open) {
          e.preventDefault();
          setActive(last);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (open) choose(active);
        else openList();
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      case 'Tab':
        if (open) close(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) typeahead(e.key);
    }
  };

  const trigger =
    size === 'field'
      ? `h-12 px-4 text-[15px] border bg-linen ${invalid ? 'border-clay' : open ? 'border-espresso' : 'border-line hover:border-umber/50'}`
      : size === 'compact'
        ? `h-10 px-3 text-[13px] border bg-linen ${open ? 'border-espresso' : 'border-line hover:border-umber/60'}`
        : 'h-9 px-0 text-[10.5px] font-medium uppercase tracking-[0.2em]';

  return (
    <div ref={rootRef} className={`relative ${className}`} onBlur={(e) => !rootRef.current?.contains(e.relatedTarget as Node) && onBlur?.()}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center justify-between gap-2 rounded-[2px] text-left text-espresso outline-none transition focus-visible:ring-2 focus-visible:ring-kraft/60 ${trigger}`}
      >
        <span className={`truncate ${selected ? '' : 'text-umber/60'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`size-4 shrink-0 text-umber transition-transform duration-300 ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={ariaLabel ? undefined : buttonId}
          aria-label={ariaLabel}
          tabIndex={-1}
          data-lenis-prevent
          className={`absolute z-40 max-h-72 min-w-full animate-fade overflow-y-auto overscroll-contain rounded-[2px] border border-espresso/15 bg-[#FBF8F3] py-1.5 shadow-[0_24px_48px_-20px_rgba(46,42,38,0.45)] ${
            dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${align === 'right' ? 'right-0' : 'left-0'} ${size === 'bare' ? 'w-max' : 'w-full'}`}
        >
          {opts.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                data-index={i}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(i)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-2.5 transition-colors ${i === active ? 'bg-paper' : ''} ${
                  size === 'bare' ? 'text-[13px] normal-case tracking-normal' : ''
                }`}
              >
                <span className={`whitespace-nowrap font-serif text-[16px] ${isSelected ? 'italic text-espresso' : 'text-espresso/85'}`}>{o.label}</span>
                {isSelected && <Check className="size-3.5 shrink-0 text-pine" strokeWidth={2} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
