const paths = {
  view: <><path d="M2 12s3.5-5 10-5 10 5 10 5-3.5 5-10 5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" /></>,
  delete: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></>,
  download: <><path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4" /></>,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  check: <path d="m4 12 5 5L20 6" />,
  close: <path d="M5 5 19 19M19 5 5 19" />
};

export const isActionIconName = (name) => Object.hasOwn(paths, name);

export function ActionIcon({ name }) {
  if (!isActionIconName(name)) return null;
  return <svg className="dt-action-icon" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
