import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { Marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import mainReadme from '../README.md?raw';
import examplesReadme from '../examples/README.md?raw';
import publishingGuide from '../docs/PUBLICACION.md?raw';

const repository = 'https://github.com/JazielIsai/data_table_lib';
const documents = [
  { id: 'main', label: 'Guía principal', markdown: mainReadme, path: 'README.md' },
  { id: 'examples', label: 'Ejemplos', markdown: examplesReadme, path: 'examples/README.md' },
  { id: 'publishing', label: 'Publicación', markdown: publishingGuide, path: 'docs/PUBLICACION.md' }
];
const markdownRenderer = new Marked(gfmHeadingId());

function renderDocument(document) {
  const template = window.document.createElement('template');
  template.innerHTML = DOMPurify.sanitize(markdownRenderer.parse(document.markdown));

  for (const heading of template.content.querySelectorAll('h1, h2, h3, h4, h5')) {
    const nextLevel = Math.min(Number(heading.tagName.slice(1)) + 1, 6);
    const replacement = window.document.createElement(`h${nextLevel}`);
    for (const attribute of heading.attributes) replacement.setAttribute(attribute.name, attribute.value);
    replacement.innerHTML = heading.innerHTML;
    heading.replaceWith(replacement);
  }

  for (const element of template.content.querySelectorAll('a[href], img[src]')) {
    const attribute = element.tagName === 'IMG' ? 'src' : 'href';
    const value = element.getAttribute(attribute);
    if (!value || value.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//')) continue;
    const target = new URL(value, `${repository}/blob/main/${document.path}`);
    const targetDocument = documents.find((candidate) =>
      target.pathname === new URL(`${repository}/blob/main/${candidate.path}`).pathname);
    if (element.tagName === 'A' && targetDocument) {
      const docParam = targetDocument.id === 'main' ? '' : `&doc=${targetDocument.id}`;
      element.setAttribute('href', `?page=docs${docParam}${target.hash}`);
    } else {
      element.setAttribute(attribute, target.href);
      if (element.tagName === 'A') {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }

  const sections = [];
  let current = { id: `${document.id}-introduccion`, label: 'Introducción', html: '' };
  for (const node of template.content.childNodes) {
    if (node.nodeType === 1 && node.tagName === 'H3') {
      if (current.html.trim()) sections.push(current);
      current = { id: node.id, label: node.textContent, html: '' };
    }
    current.html += node.outerHTML ?? node.textContent;
  }
  if (current.html.trim()) sections.push(current);
  return sections;
}

function readLocation() {
  const params = new URLSearchParams(window.location.search);
  return {
    doc: documents.some((document) => document.id === params.get('doc')) ? params.get('doc') : 'main',
    section: decodeURIComponent(window.location.hash.slice(1))
  };
}

export default function ReadmeDocs() {
  const initial = readLocation();
  const [activeId, setActiveId] = useState(initial.doc);
  const [sectionId, setSectionId] = useState(initial.section);
  const active = documents.find((document) => document.id === activeId);
  const sections = useMemo(() => renderDocument(active), [active]);
  const selected = sections.find((section) => section.id === sectionId) ?? sections[0];

  useEffect(() => {
    const sync = () => {
      const location = readLocation();
      setActiveId(location.doc);
      setSectionId(location.section);
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const show = (docId, id) => {
    setActiveId(docId);
    setSectionId(id);
    const params = new URLSearchParams({ page: 'docs' });
    if (docId !== 'main') params.set('doc', docId);
    window.history.pushState(null, '', `?${params}#${encodeURIComponent(id)}`);
    window.scrollTo(0, 0);
  };

  return <section className="docs-section" id="documentacion" aria-labelledby="docs-title">
    <div className="section-heading">
      <p className="eyebrow">Guías de Data Table Lib</p>
      <h1 id="docs-title">Documentación.</h1>
      <p>Elige una guía y una sección. El contenido se publica directamente desde los archivos Markdown del repositorio.</p>
    </div>
    <div className="docs-layout">
      <aside className="docs-toc" aria-label="Navegación de documentación">
        <strong>Guías</strong>
        <div className="docs-guide-list">
          {documents.map((document) => <button key={document.id} type="button"
            className={document.id === activeId ? 'selected' : ''}
            aria-current={document.id === activeId ? 'page' : undefined}
            onClick={() => show(document.id, renderDocument(document)[0].id)}>
            {document.label}
          </button>)}
        </div>
        <strong>Secciones</strong>
        <nav>{sections.map((section) => <a key={section.id}
          href={`?page=docs${activeId === 'main' ? '' : `&doc=${activeId}`}#${encodeURIComponent(section.id)}`}
          aria-current={section.id === selected.id ? 'location' : undefined}
          onClick={(event) => { event.preventDefault(); show(activeId, section.id); }}>
          {section.label}
        </a>)}</nav>
      </aside>
      <article className="docs-content" aria-label={`${active.label}: ${selected.label}`}
        dangerouslySetInnerHTML={{ __html: selected.html }} />
    </div>
  </section>;
}
