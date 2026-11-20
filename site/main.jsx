import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Table } from '@isai_dev/data_table_lib';
import BasicExample from '../examples/BasicExample.jsx';
import EditableExample from '../examples/EditableExample.jsx';
import RemoteExample from '../examples/RemoteExample.jsx';
import PhotoExample from '../examples/PhotoExample.jsx';
import ProductExample from '../examples/ProductExample.jsx';
import ViewsExample from '../examples/ViewsExample.jsx';
import ControlsExample from '../examples/ControlsExample.jsx';
import basicSource from '../examples/BasicExample.jsx?raw';
import editableSource from '../examples/EditableExample.jsx?raw';
import remoteSource from '../examples/RemoteExample.jsx?raw';
import photoSource from '../examples/PhotoExample.jsx?raw';
import productSource from '../examples/ProductExample.jsx?raw';
import viewsSource from '../examples/ViewsExample.jsx?raw';
import controlsSource from '../examples/ControlsExample.jsx?raw';
import anaPhoto from '../examples/assets/ana.jpg';
import luisPhoto from '../examples/assets/luis.jpg';
import martaPhoto from '../examples/assets/marta.jpg';
import '@isai_dev/data_table_lib/style.css';
import './style.css';
import ReadmeDocs from './ReadmeDocs.jsx';

const repository = 'https://github.com/JazielIsai/data_table_lib';

const heroRows = [
  { id: 1, name: 'Ana García', team: 'Diseño', status: 'Activo' },
  { id: 2, name: 'Luis Torres', team: 'Desarrollo', status: 'Activo' },
  { id: 3, name: 'Marta Ruiz', team: 'Producto', status: 'En revisión' }
];

const demos = [
  { id: 'products', label: 'Catálogo', title: 'Productos en tabla o galería',
    description: 'Compara precio e inventario en la tabla, o explora las fotos en la galería.',
    Component: ProductExample, code: productSource, file: 'ProductExample.jsx' },
  { id: 'photos', label: 'Directorio', title: 'Fotos de todas las proporciones',
    description: 'Explora retratos cuadrados, verticales y horizontales completos. Selecciona perfiles y cambia a tabla.',
    Component: PhotoExample, code: photoSource, file: 'PhotoExample.jsx' },
  { id: 'remote', label: 'Panel remoto', title: 'Un panel conectado a tu API',
    description: 'La tabla muestra una página; la exportación solicita todos los resultados filtrados al servidor.',
    Component: RemoteExample, code: remoteSource, file: 'RemoteExample.jsx' },
  { id: 'views', label: 'Vistas', title: 'Guarda una vista y compártela',
    description: 'Configura la tabla o galería, guarda la vista con un nombre y comparte un enlace que la reproduce.',
    Component: ViewsExample, code: viewsSource, file: 'ViewsExample.jsx' },
  { id: 'controls', label: 'Inputs', title: 'Casillas y campos a tu medida',
    description: 'Prueba casillas, interruptores, opciones únicas y múltiples, y alterna entre lectura y edición.',
    Component: ControlsExample, code: controlsSource, file: 'ControlsExample.jsx' },
  { id: 'local', label: 'Datos locales', title: 'Explora una tabla completa',
    description: 'Busca, fija columnas, cambia su ancho y exporta el resultado a CSV.',
    Component: BasicExample, code: basicSource, file: 'BasicExample.jsx' },
  { id: 'edit', label: 'Edición', title: 'Edita con confianza',
    description: 'Cada fila tiene un borrador. Los cambios se validan antes de guardar.',
    Component: EditableExample, code: editableSource, file: 'EditableExample.jsx' }
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
  const docsPage = new URLSearchParams(window.location.search).get('page') === 'docs'
    || (window.location.hash && !['#inicio', '#capacidades', '#demo', '#instalacion'].includes(window.location.hash));
  const [activeId, setActiveId] = useState(() =>
    new URLSearchParams(window.location.search).has('view') ? 'views' : 'products');
  const active = demos.find((demo) => demo.id === activeId);
  const ActiveExample = active.Component;

  return <>
    <header className="site-header">
      <a className="brand" href="./#inicio" aria-label="Data Table Lib, inicio">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
        <span>Data Table Lib</span>
      </a>
      <nav aria-label="Navegación principal">
        <a href="./#inicio">Inicio</a>
        <a href="./#demo">Demo</a>
        <a href="./#instalacion">Instalación</a>
        <a href="?page=docs#instalar-y-ejecutar" aria-current={docsPage ? 'page' : undefined}>Documentación</a>
        <a className="nav-github" href={repository} target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>

    <main id="inicio">
      {!docsPage && <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> Una librería para React</p>
          <h1 id="hero-title">De tabla a galería, <span>sin cambiar tus datos.</span></h1>
          <p className="hero-description">Tablas React que también se convierten en galerías de fotos, con edición y preferencias listas para usar.</p>
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
            <div className="preview-gallery-heading"><span>Los mismos datos, en galería</span><span>Vista visual</span></div>
            <div className="preview-gallery" aria-label="Vista de galería del equipo">
              {[
                { name: 'Ana García', photo: anaPhoto },
                { name: 'Luis Torres', photo: luisPhoto },
                { name: 'Marta Ruiz', photo: martaPhoto }
              ].map((person) => <div key={person.name} className="preview-person">
                <img src={person.photo} alt={`Retrato de ${person.name}`} />
                <span>{person.name}</span>
              </div>)}
            </div>
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
          <h2 id="demo-title">Tres escenarios reales, más funciones para explorar.</h2>
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
            <div className="code-panel-heading"><span>Código real · {active.file}</span><CopyButton value={active.code} /></div>
            <pre><code>{active.code}</code></pre>
            <p className="code-source-note">Si el archivo importa <code>./assets</code> o <code>./data.js</code>, copia también esos recursos del repositorio.</p>
            <a href={`${repository}/blob/main/examples/${active.file}`} target="_blank" rel="noreferrer">Ver archivo y recursos en GitHub</a>
          </div>
        </div>
      </section>

      <section className="install-section" id="instalacion" aria-labelledby="install-title">
        <div>
          <p className="eyebrow">Empieza en minutos</p>
          <h2 id="install-title">Instálala y úsala en tu proyecto.</h2>
          <p>Disponible en npm como <code>@isai_dev/data_table_lib</code>. Añade los componentes y estilos a tu aplicación con React 18 o 19.</p>
          <p>La demo usa el código de desarrollo de v2. La etiqueta <code>next</code> instala la última versión preliminar publicada en npm; puede ir detrás de esta demo hasta la próxima publicación. La versión estable sigue en <code>latest</code>.</p>
          <a href="?page=docs#instalar-y-ejecutar">Leer la documentación completa</a>
        </div>
        <div className="terminal">
          <div className="terminal-heading"><span>Versión estable</span><CopyButton value="npm install @isai_dev/data_table_lib" /></div>
          <pre><code>npm install @isai_dev/data_table_lib</code></pre>
          <div className="terminal-heading"><span>Vista previa v2</span><CopyButton value="npm install @isai_dev/data_table_lib@next" /></div>
          <pre><code>npm install @isai_dev/data_table_lib@next</code></pre>
          <p>Importa también <code>@isai_dev/data_table_lib/style.css</code>.</p>
        </div>
      </section>
      </>}
      {docsPage && <ReadmeDocs />}
    </main>
    <footer>
      <span>Data Table Lib</span>
      <span>Creada por <a href="https://isai-dev.com" target="_blank" rel="noreferrer">Jaziel Isaí · isai-dev.com</a></span>
      <a href={`${repository}/blob/main/LICENSE`} target="_blank" rel="noreferrer">Licencia MIT</a>
      <a className="footer-repository" href={repository} target="_blank" rel="noreferrer">Código en GitHub</a>
    </footer>
  </>;
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
