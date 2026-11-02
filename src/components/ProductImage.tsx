import type { Product, ProductMedia } from '../data/products';
import { CoinRefillArt, TrioArt } from './Illustrations';
import { Photo } from './Photo';

interface Props {
  product: Pick<Product, 'name' | 'media'>;
  index?: number;
  className?: string;
  priority?: boolean;
}

/** Renders a product's photo, illustration or uploaded image, filling its container. */
export function ProductImage({ product, index = 0, className = '', priority }: Props) {
  const media: ProductMedia | undefined = product.media[index] ?? product.media[0];
  const alt = media?.kind === 'url' && media.alt ? media.alt : product.name;

  if (!media) return <div className={`h-full w-full bg-paper ${className}`} aria-label={product.name} role="img" />;
  if (media.kind === 'photo' && media.fit === 'contain')
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        {/* A blurred, enlarged copy fills the frame; the full photo sits on top, uncropped. */}
        <Photo name={media.name} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl saturate-[0.9]" />
        {/* The photo at its natural shape, centred, with feathered top and bottom edges so it melts into the fill. */}
        <div className="absolute inset-0 flex items-center">
          <Photo
            name={media.name}
            alt={alt}
            priority={priority}
            className="block h-auto w-full [mask-image:linear-gradient(to_bottom,transparent,#000_16%,#000_84%,transparent)]"
          />
        </div>
      </div>
    );
  if (media.kind === 'photo') return <Photo name={media.name} alt={alt} priority={priority} className={`h-full w-full object-cover ${className}`} />;
  if (media.kind === 'url')
    return (
      <img
        src={media.url}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  return (
    <div className={`flex h-full w-full items-center justify-center bg-butter p-[12%] ${className}`}>
      {media.name === 'trio' ? <TrioArt className="w-full" /> : <CoinRefillArt className="w-2/3" />}
    </div>
  );
}
