import type { ImgHTMLAttributes } from 'react';

/** Intrinsic sizes of the bundled product photographs (used to reserve layout space). */
const SIZES = {
  'grow-tin': [1024, 765],
  'expand-in-bag': [1024, 765],
  'coco-peat-pouch': [1024, 765],
  'coin-refill': [1600, 1164],
  'kitchen-trio': [1600, 887],
} as const;

export type PhotoName = keyof typeof SIZES;

/** Product photography served as WebP with a JPEG fallback. */
export function Photo({ name, alt, priority, ...rest }: { name: PhotoName; alt: string; priority?: boolean } & ImgHTMLAttributes<HTMLImageElement>) {
  const [width, height] = SIZES[name];
  return (
    <picture>
      <source srcSet={`/images/${name}.webp`} type="image/webp" />
      <img
        src={`/images/${name}.jpg`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const } : {})}
        {...rest}
      />
    </picture>
  );
}
