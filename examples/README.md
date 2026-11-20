# Ejemplos ejecutables

Desde la raíz del repositorio:

```bash
npm install
npm run examples
```

Abre [http://localhost:5173/examples/](http://localhost:5173/examples/). El script compila la librería antes de iniciar Vite; los ejemplos importan `@isai_dev/data_table_lib` y `@isai_dev/data_table_lib/style.css` mediante las entradas públicas del paquete.

| Archivo | Muestra |
| --- | --- |
| [ProductExample.jsx](./ProductExample.jsx) | Catálogo con imágenes, tabla o galería, precio, inventario y CSV. |
| [PhotoExample.jsx](./PhotoExample.jsx) | Directorio con retratos, selección, visor ampliado y acciones. |
| [RemoteExample.jsx](./RemoteExample.jsx) | Panel con estado controlado, paginación y exportación remota de todos los resultados filtrados. |
| [BasicExample.jsx](./BasicExample.jsx) | Búsqueda, filtro, ordenamiento, selección, paginación y acciones con datos locales. |
| [EditableExample.jsx](./EditableExample.jsx) | Borradores por fila, validación, guardar y cancelar. |
| [ViewsExample.jsx](./ViewsExample.jsx) | Vistas con nombre guardadas en el navegador y enlaces que reproducen búsqueda, filtros, columnas y presentación. |

La consulta de `RemoteExample.jsx` usa datos locales y una breve espera para que puedas ejecutarla sin servidor. En una aplicación real, reemplaza `loadPeople` por una petición a tu API que devuelva `{ rows, total }`; conserva `manualSorting`, `manualFiltering`, `manualPagination` y los callbacks de estado. El [README principal](../README.md#datos-del-servidor) incluye un ejemplo con `fetch` y cancelación de peticiones.

Los seis componentes son independientes. Puedes copiar uno a tu aplicación, instalar el paquete y ajustar los datos, columnas y callbacks. La [página pública](https://jazielisai.github.io/data_table_lib/#demo) muestra los tres escenarios principales, las vistas guardadas y otras funciones con una vista interactiva y un botón para copiar el código. El ejemplo de personas inicia en galería y permite ordenar, filtrar, seleccionar varias filas y volver a la tabla. Recuerda la presentación elegida en el navegador.
