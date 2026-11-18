import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Table } from 'data_table_lib';
import BasicExample from '../examples/BasicExample.jsx';
import EditableExample from '../examples/EditableExample.jsx';
import RemoteExample from '../examples/RemoteExample.jsx';
import 'data_table_lib/style.css';
import './style.css';

const repository = 'https://github.com/JazielIsai/data_table_lib';

const heroRows = [
  { id: 1, name: 'Ana García', team: 'Diseño', status: 'Activo' },
  { id: 2, name: 'Luis Torres', team: 'Desarrollo', status: 'Activo' },
  { id: 3, name: 'Marta Ruiz', team: 'Producto', status: 'En revisión' }
];

const demos = [
  {
    id: 'local',
    label: 'Datos locales',
    title: 'Explora una tabla completa',
    description: 'Prueba la búsqueda, cambia el orden y selecciona filas. Todo ocurre en el navegador.',
    Component: BasicExample,
    code: `import { Table } from 'data_table_lib';
import 'data_table_lib/style.css';

<Table
  columns={columns}
  rows={rows}
  searchable
  paginationEnabled
  selectable
/>`
  },
  {
    id: 'edit',
    label: 'Edición',
    title: 'Edita con confianza',
    description: 'Cada fila tiene un borrador. Los cambios se validan antes de guardar.',
    Component: EditableExample,
    code: `import { TableEdit } from 'data_table_lib';

<TableEdit
  columns={columns}
  rows={rows}
  editMode="save"
  onSave={async (draft, original) => {
    await savePerson(draft, original);
  }}
/>`
  },
  {
    id: 'remote',
    label: 'Datos remotos',
    title: 'Conecta tu propia API',
    description: 'Delega búsqueda, ordenamiento y paginación a tu servidor.',
    Component: RemoteExample,
    code: `<Table
  rows={response.rows}
  rowCount={response.total}
  manualSorting
  manualFiltering
  manualPagination
  sort={sort}
  onSortChange={setSort}
  pagination={pagination}
  onPaginationChange={setPagination}
  loading={loading}
/>`
  }
];

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return <button type="button" className="copy-button" onClick={copy}
    aria-label={copied ? 'Código copiado' : 'Copiar código'}>
    {copied ? 'Copiado' : 'Copiar'}
  </button>;
}

function App() {
  const [activeId, setActiveId] = useState('local');
  const active = demos.find((demo) => demo.id === activeId);
  const ActiveExample = active.Component;

  return <>
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Data Table Lib, inicio">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
        <span>Data Table Lib</span>
      </a>
      <nav aria-label="Navegación principal">
        <a href="#capacidades">Capacidades</a>
        <a href="#demo">Demo</a>
        <a href="#instalacion">Instalación</a>
        <a className="nav-github" href={repository} target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>

    <main id="inicio">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> Una librería para React</p>
          <h1 id="hero-title">Tus datos, <span>claros desde la primera fila.</span></h1>
          <p className="hero-description">Tablas listas para buscar, ordenar, seleccionar y editar. Usa datos locales o conecta tu API con una interfaz que se adapta a tu aplicación.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#demo">Explorar la demo</a>
            <a className="button button-secondary" href={repository} target="_blank" rel="noreferrer">Ver repositorio</a>
          </div>
          <div className="compatibility" aria-label="Compatibilidad">
            <span>React 18 y 19</span><span>TypeScript</span><span>ESM + CJS</span>
          </div>
        </div>
        <div className="hero-preview" aria-label="Vista previa de la tabla">
          <div className="preview-bar"><span className="preview-dot" /><span className="preview-dot" /><span className="preview-dot" /><strong>Vista previa</strong></div>
          <div className="preview-content">
            <div className="preview-heading"><span>Equipo</span><span>3 registros</span></div>
            <Table
              columns={[
                { field: 'name', headerName: 'Nombre' },
                { field: 'team', headerName: 'Área' },
                { field: 'status', headerName: 'Estado',
                  renderCell: (value) => <span className={value === 'Activo' ? 'status active' : 'status'}>{value}</span> }
              ]}
              rows={heroRows}
            />
          </div>
        </div>
      </section>

      <section className="feature-section" id="capacidades" aria-labelledby="features-title">
        <div className="section-heading">
          <p className="eyebrow">Hecha para trabajo real</p>
          <h2 id="features-title">Lo necesario para pasar de datos a decisiones.</h2>
          <p>Activa sólo las funciones que necesitas; cada una tiene props y callbacks claros.</p>
        </div>
        <div className="feature-grid">
          <article><span className="feature-icon">⌕</span><h3>Encuentra lo importante</h3><p>Búsqueda global, filtros por columna y ordenamiento para recorrer datos sin perder el contexto.</p></article>
          <article><span className="feature-icon">☑</span><h3>Trabaja con varias filas</h3><p>Selección que conserva IDs entre páginas y acciones configurables por fila.</p></article>
          <article><span className="feature-icon">✎</span><h3>Edita con control</h3><p>Borradores, validación y guardar o cancelar. También hay un modo de cambio inmediato.</p></article>
          <article><span className="feature-icon">⛁</span><h3>Escala con tu API</h3><p>Delega búsqueda, filtros, ordenamiento y paginación cuando los datos viven en el servidor.</p></article>
        </div>
      </section>

      <section className="demo-section" id="demo" aria-labelledby="demo-title">
        <div className="section-heading">
          <p className="eyebrow">Pruébala aquí</p>
          <h2 id="demo-title">Una librería, tres formas de usarla.</h2>
          <p>Los ejemplos importan las mismas entradas públicas que usarías en otro proyecto.</p>
        </div>
        <div className="demo-switcher" role="group" aria-label="Tipo de ejemplo">
          {demos.map((demo) => <button key={demo.id} type="button"
            className={activeId === demo.id ? 'selected' : ''}
            aria-pressed={activeId === demo.id}
            onClick={() => setActiveId(demo.id)}>{demo.label}</button>)}
        </div>
        <div className="demo-layout">
          <div className="demo-live">
            <div className="demo-panel-heading"><div><h3>{active.title}</h3><p>{active.description}</p></div><span>Interactiva</span></div>
            <ActiveExample />
          </div>
          <div className="code-panel">
            <div className="code-panel-heading"><span>Ejemplo de código</span><CopyButton value={active.code} /></div>
            <pre><code>{active.code}</code></pre>
            <a href={`${repository}/tree/main/examples`} target="_blank" rel="noreferrer">Ver los ejemplos completos</a>
          </div>
        </div>
      </section>

      <section className="install-section" id="instalacion" aria-labelledby="install-title">
        <div>
          <p className="eyebrow">Empieza en minutos</p>
          <h2 id="install-title">Explora el código y úsalo en tu proyecto.</h2>
          <p>La librería aún no está publicada en npm. Puedes probarla desde este repositorio e instalar el paquete generado localmente.</p>
          <a href={`${repository}#instalar-y-ejecutar`} target="_blank" rel="noreferrer">Leer la documentación completa</a>
        </div>
        <div className="terminal">
          <div className="terminal-heading"><span>Terminal</span><CopyButton value={`git clone ${repository}.git\ncd data_table_lib\nnpm install\nnpm run site`} /></div>
          <pre><code>{`git clone ${repository}.git
cd data_table_lib
npm install
npm run site`}</code></pre>
          <p>Para generar el paquete: <code>npm pack</code></p>
        </div>
      </section>
    </main>
    <footer>
      <span>Data Table Lib</span>
      <span>Creada por <a href="https://isai-dev.com" target="_blank" rel="noreferrer">Jaziel Isaí · isai-dev.com</a></span>
      <a className="footer-repository" href={repository} target="_blank" rel="noreferrer">Código en GitHub</a>
    </footer>
  </>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
