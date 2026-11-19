import { useEffect, useState } from 'react';

export function imageDetails(value, row, column) {
  const source = typeof value === 'string' ? value : value?.src;
  const configuredAlt = typeof column.imageAlt === 'function'
    ? column.imageAlt(value, row) : column.imageAlt;
  const alt = configuredAlt ?? value?.alt
    ?? (row?.name ? `Foto de ${row.name}` : column.headerName ?? column.field);
  return { source, alt,
    srcSet: typeof value === 'string' ? undefined : value?.srcSet,
    sizes: typeof value === 'string' ? undefined : value?.sizes,
    width: typeof value === 'string' ? undefined : value?.width,
    height: typeof value === 'string' ? undefined : value?.height };
}

export function ImageCell({ value, row, column, view, onOpen, openLabel }) {
  const { source, alt, srcSet, sizes, width, height } = imageDetails(value, row, column);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [source, srcSet]);

  if (!source || failed) {
    return <span className={`dt-image-placeholder dt-image-${view}`}>
      {column.imageFallback ?? 'Sin foto'}
    </span>;
  }

  const photo = <img className={`dt-image dt-image-${view}`} src={source} alt={alt}
    srcSet={srcSet} sizes={srcSet ? sizes ?? (view === 'gallery'
      ? '(max-width: 640px) 100vw, 33vw'
      : view === 'avatar' ? '42px' : view === 'thumbnail' ? '64px' : '96px') : undefined}
    width={width} height={height}
    loading="lazy" decoding="async"
    style={{ objectFit: column.imageFit ?? 'cover', objectPosition: column.imagePosition ?? 'center' }}
    onError={() => setFailed(true)} />;
  return onOpen
    ? <button type="button" className="dt-image-trigger" aria-label={openLabel(alt)}
        onClick={onOpen}>{photo}</button>
    : photo;
}
