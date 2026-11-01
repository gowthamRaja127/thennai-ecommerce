import type { ImgHTMLAttributes } from 'react';

type PhotoName = 'grow-tin' | 'expand-in-bag' | 'coco-peat-pouch';

/** Product photography served as WebP with a JPEG fallback. All sources are 1024×765. */
export function Photo({ name, alt, priority, ...rest }: { name: PhotoName; alt: string; priority?: boolean } & ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <picture>
      <source srcSet={`/images/${name}.webp`} type="image/webp" />
      <img
        src={`/images/${name}.jpg`}
        alt={alt}
        width={1024}
        height={765}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const } : {})}
        {...rest}
      />
    </picture>
  );
}
