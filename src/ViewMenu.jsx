import { useEffect, useRef, useState } from 'react';

function CopyLink({ onCopyLink, labels }) {
  const [status, setStatus] = useState('');
  const [manualLink, setManualLink] = useState('');
  const manualField = useRef(null);
  useEffect(() => {
    if (manualLink) { manualField.current?.focus(); manualField.current?.select(); }
  }, [manualLink]);

  const copy = async () => {
    setStatus('');
    const fallback = await onCopyLink();
    setManualLink(fallback ?? '');
    setStatus(fallback ? '' : labels.viewLinkCopied);
  };

  return <div className="dt-view-share">
    <button type="button" className="dt-button" onClick={copy}>{labels.copyViewLink}</button>
    <span className="dt-view-status" role="status">{status}</span>
    {manualLink && <label className="dt-view-manual">
      <span>{labels.viewLinkManual}</span>
      <input className="dt-control" type="text" readOnly value={manualLink} ref={manualField} />
    </label>}
  </div>;
}

/** Saved views and the share link. Without saving it renders only the share button. */
export function ViewMenu({ savedViews, currentView, isCurrent, canSave, canShare,
  onSave, onApply, onDelete, onCopyLink, labels }) {
  const [name, setName] = useState('');

  if (!canSave) return canShare ? <CopyLink onCopyLink={onCopyLink} labels={labels} /> : null;

  const save = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSave(name, currentView);
    setName('');
  };

  return <details className="dt-view-menu">
    <summary className="dt-button">{labels.views}</summary>
    <div className="dt-view-panel">
      <strong>{labels.savedViews}</strong>
      {savedViews.length === 0
        ? <p className="dt-view-empty">{labels.noSavedViews}</p>
        : <ul>
          {savedViews.map((saved) => <li key={saved.id}>
            <button type="button" className="dt-view-apply"
              aria-label={labels.applyView(saved.name)}
              aria-current={isCurrent(saved.view) ? 'true' : undefined}
              onClick={() => onApply(saved)}>{saved.name}</button>
            <button type="button" className="dt-button" aria-label={labels.deleteView(saved.name)}
              title={labels.deleteView(saved.name)} onClick={() => onDelete(saved.id)}>×</button>
          </li>)}
        </ul>}
      <form className="dt-view-save" onSubmit={save}>
        <label>
          <span className="dt-visually-hidden">{labels.viewName}</span>
          <input className="dt-control" type="text" value={name} placeholder={labels.viewName}
            onChange={(event) => setName(event.target.value)} />
        </label>
        <button type="submit" className="dt-button" disabled={!name.trim()}>{labels.saveView}</button>
      </form>
      {canShare && <CopyLink onCopyLink={onCopyLink} labels={labels} />}
    </div>
  </details>;
}
