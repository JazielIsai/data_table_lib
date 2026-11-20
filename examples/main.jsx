import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import BasicExample from './BasicExample.jsx';
import EditableExample from './EditableExample.jsx';
import RemoteExample from './RemoteExample.jsx';
import PhotoExample from './PhotoExample.jsx';
import ProductExample from './ProductExample.jsx';
import '@isai_dev/data_table_lib/style.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <main>
      <p className="eyebrow">Data Table Lib</p>
      <h1>Ejemplos</h1>
      <p>Componentes independientes que importan el paquete como lo haría otra aplicación.</p>
      <section><h2>1. Catálogo de productos</h2><ProductExample /></section>
      <section><h2>2. Directorio de personas</h2><PhotoExample /></section>
      <section><h2>3. Panel de datos remotos</h2><RemoteExample /></section>
      <section><h2>4. Tabla local</h2><BasicExample /></section>
      <section><h2>5. Edición con validación</h2><EditableExample /></section>
    </main>
  </StrictMode>
);
