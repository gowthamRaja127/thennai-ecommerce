import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowRight, ImagePlus, Trash2, X } from 'lucide-react';
import { supabase, PRODUCT_IMAGE_BUCKET } from '../lib/supabase';
import { productToRow, rowToProduct, type ProductRow } from '../lib/productRow';
import { fieldErrors, productSchema } from '../lib/schemas';
import { CATEGORIES, type Product, type ProductMedia } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { Select } from '../components/Select';
import { usePageTitle } from '../components/PageHeader';
import { SproutLoader } from '../components/Ornaments';

const BLANK: Product = {
  id: '',
  name: '',
  shortName: '',
  category: 'grow-tins',
  badge: '',
  price: 199,
  compareAt: null,
  tagline: '',
  description: '',
  contents: [],
  howTo: [],
  details: [],
  variants: ['Standard'],
  media: [],
  cta: 'Add to Cart',
  active: true,
  sortOrder: 100,
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** Multi-line text <-> string[]: one entry per line, blank lines dropped. */
const toLines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);

export function ProductEditor() {
  const { id } = useParams();
  const isNew = !id;
  usePageTitle(isNew ? 'Admin · New product' : 'Admin · Edit product');
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(isNew ? BLANK : null);
  const [text, setText] = useState({ variants: 'Standard', contents: '', howTo: '', details: '' });
  const [priceText, setPriceText] = useState({ price: '199', compareAt: '', sortOrder: '100' });
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [banner, setBanner] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    supabase!
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return setNotFound(true);
        const p = rowToProduct(data as ProductRow);
        setProduct(p);
        setText({ variants: p.variants.join('\n'), contents: p.contents.join('\n'), howTo: p.howTo.join('\n'), details: p.details.join('\n') });
        setPriceText({ price: String(p.price), compareAt: p.compareAt ? String(p.compareAt) : '', sortOrder: String(p.sortOrder) });
      });
  }, [id, isNew]);

  // The candidate product assembled from the form, validated live.
  const draft = useMemo<Product | null>(() => {
    if (!product) return null;
    const n = (s: string) => (s.trim() === '' ? NaN : Number(s));
    return {
      ...product,
      variants: toLines(text.variants),
      contents: toLines(text.contents),
      howTo: toLines(text.howTo),
      details: toLines(text.details),
      price: n(priceText.price),
      compareAt: priceText.compareAt.trim() ? n(priceText.compareAt) : null,
      sortOrder: n(priceText.sortOrder),
    };
  }, [product, text, priceText]);

  const result = useMemo(() => (draft ? productSchema.safeParse(draft) : null), [draft]);
  const errors = useMemo(() => (result && !result.success ? fieldErrors(result.error) : {}), [result]);
  const err = (key: string) => (submitted ? errors[key] ?? Object.entries(errors).find(([k]) => k.startsWith(`${key}.`))?.[1] : undefined);

  if (notFound)
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-[26px] italic text-espresso">That product does not exist.</p>
        <Link to="/admin/products" className="btn btn-line mt-8">
          Back to products
        </Link>
      </div>
    );
  if (!product || !draft) return <SproutLoader label="Opening the entry…" className="py-32" />;

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setProduct((p) => (p ? { ...p, [key]: value } : p));

  const onName = (name: string) => {
    setProduct((p) => (p ? { ...p, name, id: isNew && !slugEdited ? slugify(name) : p.id, shortName: p.shortName || '' } : p));
  };

  const setMedia = (media: ProductMedia[]) => set('media', media);
  const moveMedia = (i: number, dir: -1 | 1) => {
    const m = [...product.media];
    const j = i + dir;
    if (j < 0 || j >= m.length) return;
    [m[i], m[j]] = [m[j], m[i]];
    setMedia(m);
  };

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id)) {
      setBanner({ tone: 'error', text: 'Set a valid slug before uploading images; images are stored under it.' });
      return;
    }
    const bad = files.find((f) => !IMAGE_TYPES.includes(f.type) || f.size > MAX_IMAGE_BYTES);
    if (bad) {
      setBanner({ tone: 'error', text: `${bad.name}: use JPEG, PNG, WebP or AVIF under 5 MB.` });
      return;
    }
    setUploading(true);
    setBanner(null);
    const added: ProductMedia[] = [];
    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `${product.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase!.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, f, { cacheControl: '31536000', contentType: f.type });
      if (error) {
        setBanner({ tone: 'error', text: `Upload failed: ${error.message}` });
        break;
      }
      const { data } = supabase!.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
      added.push({ kind: 'url', url: data.publicUrl, alt: product.name });
    }
    setUploading(false);
    if (added.length) setMedia([...product.media, ...added].slice(0, 8));
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setBanner(null);
    if (!result?.success) {
      setBanner({ tone: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }
    setSaving(true);
    const row = productToRow(result.data as Product);
    const { error } = isNew
      ? await supabase!.from('products').insert(row)
      : await supabase!.from('products').update(row).eq('id', id!);
    setSaving(false);
    if (error) {
      setBanner({ tone: 'error', text: error.code === '23505' ? `A product with the slug “${row.id}” already exists.` : error.message });
      return;
    }
    if (isNew) navigate(`/admin/products/${row.id}`, { replace: true });
    setBanner({ tone: 'ok', text: 'Saved. The storefront picks up changes within about 30 seconds.' });
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${product.name}” permanently? Past orders keep their details. To take it off sale but keep it, switch it to Hidden instead.`)) return;
    const { error } = await supabase!.from('products').delete().eq('id', id!);
    if (error) return setBanner({ tone: 'error', text: error.message });
    navigate('/admin/products', { replace: true });
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <Link to="/admin/products" className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-umber hover:text-espresso">
        <ArrowLeft className="size-3.5" /> Products
      </Link>
      <h1 className="display mt-4 text-[36px] text-espresso sm:text-[44px]">{isNew ? 'New product' : product.name || 'Untitled'}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <form onSubmit={save} noValidate className="space-y-10 lg:col-span-8">
          {banner && (
            <p role={banner.tone === 'error' ? 'alert' : 'status'} className={`border-l-2 px-4 py-3 text-[13px] text-espresso ${banner.tone === 'error' ? 'border-clay bg-clay-soft/60' : 'border-pine bg-sage'}`}>
              {banner.text}
            </p>
          )}

          <Group title="Basics">
            <Input label="Name" value={product.name} onChange={onName} error={err('name')} className="sm:col-span-2" />
            <Input
              label="URL slug"
              value={product.id}
              onChange={(v) => {
                setSlugEdited(true);
                set('id', v.toLowerCase());
              }}
              disabled={!isNew}
              hint={isNew ? `thennai.in/shop/${product.id || 'your-slug'}` : 'Slugs cannot change after creation (links and past orders use them).'}
              error={err('id')}
            />
            <Input label="Short name" value={product.shortName} onChange={(v) => set('shortName', v)} error={err('shortName')} hint="Used in the cart and mobile bar" />
            <div>
              <span className="mb-2 block text-[10.5px] font-medium uppercase tracking-[0.18em] text-umber">Category</span>
              <Select
                ariaLabel="Category"
                value={product.category}
                onChange={(v) => set('category', v as Product['category'])}
                options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
                invalid={!!err('category')}
              />
            </div>
            <Input label="Badge" value={product.badge} onChange={(v) => set('badge', v)} error={err('badge')} hint="Optional, e.g. “Bestseller”" />
          </Group>

          <Group title="Pricing & display">
            <Input label="Price (₹)" inputMode="numeric" value={priceText.price} onChange={(v) => setPriceText((t) => ({ ...t, price: v.replace(/[^\d]/g, '') }))} error={err('price')} />
            <Input
              label="Compare-at price (₹)"
              inputMode="numeric"
              value={priceText.compareAt}
              onChange={(v) => setPriceText((t) => ({ ...t, compareAt: v.replace(/[^\d]/g, '') }))}
              error={err('compareAt')}
              hint="Optional, shown struck through"
            />
            <Input label="Button label" value={product.cta} onChange={(v) => set('cta', v)} error={err('cta')} />
            <Input label="Sort order" inputMode="numeric" value={priceText.sortOrder} onChange={(v) => setPriceText((t) => ({ ...t, sortOrder: v.replace(/[^\d]/g, '') }))} error={err('sortOrder')} hint="Lower shows first" />
            <label className="flex items-center gap-3 sm:col-span-2">
              <input type="checkbox" checked={product.active} onChange={(e) => set('active', e.target.checked)} className="size-4 accent-[#2E2A26]" />
              <span className="text-[14px] text-espresso">Live in the shop</span>
              <span className="text-[12px] text-umber">(unchecked = hidden, but kept)</span>
            </label>
          </Group>

          <Group title="Copy">
            <Input label="Tagline" value={product.tagline} onChange={(v) => set('tagline', v)} error={err('tagline')} className="sm:col-span-2" hint={`${product.tagline.length}/140`} />
            <TextArea label="Description" rows={5} value={product.description} onChange={(v) => set('description', v)} error={err('description')} className="sm:col-span-2" />
            <TextArea label="Variants" hint="One per line. The first is the default." rows={4} value={text.variants} onChange={(v) => setText((t) => ({ ...t, variants: v }))} error={err('variants')} />
            <TextArea label="In the box" hint="One item per line" rows={4} value={text.contents} onChange={(v) => setText((t) => ({ ...t, contents: v }))} error={err('contents')} />
            <TextArea label="How to grow" hint="One step per line" rows={4} value={text.howTo} onChange={(v) => setText((t) => ({ ...t, howTo: v }))} error={err('howTo')} />
            <TextArea label="Details" hint="One point per line" rows={4} value={text.details} onChange={(v) => setText((t) => ({ ...t, details: v }))} error={err('details')} />
          </Group>

          <Group title="Images" cols={1}>
            {err('media') && <p className="text-[12px] text-clay">{err('media')}</p>}
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {product.media.map((m, i) => (
                <li key={`${i}-${m.kind === 'url' ? m.url : m.name}`} className="group relative aspect-square overflow-hidden rounded-[2px] bg-paper">
                  <ProductImage product={{ name: product.name, media: [m] }} />
                  {i === 0 && <span className="absolute left-1.5 top-1.5 bg-linen/90 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] text-espresso">Cover</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-espresso/70 p-1 text-linen">
                    <button type="button" onClick={() => moveMedia(i, -1)} disabled={i === 0} className="p-1 disabled:opacity-30" aria-label="Move earlier">
                      <ArrowLeft className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => setMedia(product.media.filter((_, j) => j !== i))} className="p-1" aria-label="Remove image">
                      <X className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => moveMedia(i, 1)} disabled={i === product.media.length - 1} className="p-1 disabled:opacity-30" aria-label="Move later">
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
              {product.media.length < 8 && (
                <li>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="grid aspect-square w-full place-items-center rounded-[2px] border border-dashed border-umber/40 text-umber transition hover:border-espresso hover:text-espresso disabled:opacity-60"
                  >
                    <span className="flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.14em]">
                      {uploading ? <span className="size-5 animate-spin rounded-full border border-umber/30 border-t-espresso" /> : <ImagePlus className="size-5" strokeWidth={1.25} />}
                      {uploading ? 'Uploading' : 'Add image'}
                    </span>
                  </button>
                </li>
              )}
            </ul>
            <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(',')} multiple hidden onChange={upload} />
            <p className="text-[12px] text-umber">JPEG, PNG, WebP or AVIF, up to 5 MB each and 8 per product. Portrait 4:5 looks best.</p>
          </Group>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            {!isNew ? (
              <button type="button" onClick={remove} className="inline-flex items-center gap-2 text-[12px] text-clay hover:underline">
                <Trash2 className="size-4" /> Delete product
              </button>
            ) : (
              <span />
            )}
            <button type="submit" disabled={saving || uploading} className="btn btn-solid disabled:opacity-60">
              {saving && <span className="size-4 animate-spin rounded-full border border-linen/40 border-t-linen" aria-hidden />}
              {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
            </button>
          </div>
        </form>

        <aside className="lg:col-span-4" aria-label="Preview">
          <div className="lg:sticky lg:top-8">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-umber">Shop preview</p>
            <div className="pointer-events-none mt-3 border border-line" inert>
              <ProductCard product={{ ...draft, price: Number.isFinite(draft.price) ? draft.price : 0, name: draft.name || 'Product name', tagline: draft.tagline || 'Tagline' }} index={1} source="admin-preview" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inputCls = (error?: string) =>
  `h-11 w-full rounded-[2px] border bg-linen px-3.5 text-[14px] text-espresso focus:outline-none disabled:bg-paper disabled:text-umber ${
    error ? 'border-clay' : 'border-line focus:border-espresso'
  }`;

function Group({ title, children, cols = 2 }: { title: string; children: ReactNode; cols?: 1 | 2 }) {
  return (
    <fieldset className="border-t border-line pt-6">
      <legend className="pr-3 text-[11px] font-medium uppercase tracking-[0.22em] text-espresso">{title}</legend>
      <div className={`mt-4 grid gap-5 ${cols === 2 ? 'sm:grid-cols-2' : ''}`}>{children}</div>
    </fieldset>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
  hint,
  className = '',
  disabled,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
  inputMode?: 'numeric' | 'text';
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[10.5px] font-medium uppercase tracking-[0.18em] text-umber">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} inputMode={inputMode} aria-invalid={!!error} className={inputCls(error)} />
      {error ? <span className="mt-1.5 block text-[12px] text-clay">{error}</span> : hint ? <span className="mt-1.5 block text-[12px] text-umber">{hint}</span> : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  error,
  hint,
  rows = 4,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[10.5px] font-medium uppercase tracking-[0.18em] text-umber">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`w-full rounded-[2px] border bg-linen px-3.5 py-2.5 text-[14px] leading-relaxed text-espresso focus:outline-none ${error ? 'border-clay' : 'border-line focus:border-espresso'}`}
      />
      {error ? <span className="mt-1.5 block text-[12px] text-clay">{error}</span> : hint ? <span className="mt-1.5 block text-[12px] text-umber">{hint}</span> : null}
    </label>
  );
}
