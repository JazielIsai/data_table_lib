import { useEffect, useState } from 'react';

export function ImageCell({ value, row, column, view }) {
  const source = typeof value === 'string' ? value : value?.src;
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [source]);

  if (!source || failed) {
    return <span className={`dt-image-placeholder dt-image-${view}`}>
      {column.imageFallback ?? 'Sin foto'}
    </span>;
  }

  const configuredAlt = typeof column.imageAlt === 'function'
    ? column.imageAlt(value, row) : column.imageAlt;
  const alt = configuredAlt ?? value?.alt
    ?? (row?.name ? `Foto de ${row.name}` : column.headerName ?? column.field);

  return <img className={`dt-image dt-image-${view}`} src={source} alt={alt}
    loading="lazy" decoding="async"
    style={{ objectFit: column.imageFit ?? 'cover', objectPosition: column.imagePosition ?? 'center' }}
    onError={() => setFailed(true)} />;
}
