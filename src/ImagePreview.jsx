import { useEffect, useRef } from 'react';

export function ImagePreview({ entry, previous, next, onPrevious, onNext, onClose, labels }) {
  const dialogRef = useRef(null);
  const close = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
    onClose();
  };

  useEffect(() => {
    if (!entry || !dialogRef.current || dialogRef.current.open) return;
    dialogRef.current.showModal?.();
  }, [entry]);

  if (!entry) return null;

  return <dialog ref={dialogRef} className="dt-image-dialog" aria-label={labels.imagePreview}
    onClose={onClose}>
    <div className="dt-image-dialog-header">
      <strong>{entry.alt}</strong>
      <button type="button" className="dt-button" onClick={close}
        aria-label={labels.imageClose}>×</button>
    </div>
    <img src={entry.source} alt={entry.alt} />
    <div className="dt-image-dialog-actions">
      <button type="button" className="dt-button" disabled={!previous}
        onClick={onPrevious}>{labels.imagePrevious}</button>
      <button type="button" className="dt-button" disabled={!next}
        onClick={onNext}>{labels.imageNext}</button>
    </div>
  </dialog>;
}
